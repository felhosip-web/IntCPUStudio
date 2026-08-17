/**
 * AVR8js Hardware Emulation Engine Service
 * High-performance cycle-accurate 16 MHz AVR CPU execution with full peripheral stack
 */

import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRUSART,
  usart0Config,
  AVREEPROM,
  eepromConfig,
  AVRADC,
  adcConfig,
  PinState,
} from 'avr8js';

import { parseIntelHexToBuffer, bytesToWordFlash, HexParseResult } from './intelHexParser';

export interface Avr8jsLiveState {
  cycles: number;
  pc: number;
  sp: number;
  sreg: number;
  running: boolean;
  frequencyHz: number; // calculated speed
  
  // Pin states
  portB: number; // 0..255 (DDRB & PORTB effective output or pullup)
  portC: number; // A0..A5
  portD: number; // D0..D7
  
  pin13Led: boolean; // PB5
  
  // Per-pin detailed states
  pins: {
    pin: string;
    label: string;
    state: 'LOW' | 'HIGH' | 'INPUT' | 'INPUT_PULLUP';
    isOutput: boolean;
    val: boolean;
  }[];

  // UART buffer
  serialOutput: string;
  
  // Timers OCR registers
  ocr0a: number;
  ocr0b: number;
  ocr1a: number;
  ocr2a: number;
}

export class Avr8jsRunner {
  public cpu: CPU;
  public portB: AVRIOPort;
  public portC: AVRIOPort;
  public portD: AVRIOPort;
  public timer0: AVRTimer;
  public timer1: AVRTimer;
  public timer2: AVRTimer;
  public usart: AVRUSART;
  public eeprom: AVREEPROM;
  public eepromMemory: Uint8Array;
  public adc: AVRADC;

  private flashWords: Uint16Array;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastCycleCount: number = 0;
  private lastTimestamp: number = 0;
  private calculatedFrequency: number = 0;
  
  // Serial output buffer accumulator
  private serialOutputBuffer: string = '';
  private onSerialCharCallback: ((char: string) => void) | null = null;
  private onStateUpdateCallback: ((state: Avr8jsLiveState) => void) | null = null;

  // Clock cycles per animation batch (default 16MHz scaled ~ 250,000 cycles per 16ms frame)
  public speedMultiplier: number = 1.0; // 1.0 = ~16MHz real-time
  public clockSpeed: number = 16_000_000;

  constructor(hexCodeOrFlash?: string | Uint16Array) {
    this.flashWords = new Uint16Array(16384); // 32KB ATmega328P Flash (16K 16-bit words)
    this.eepromMemory = new Uint8Array(1024);
    this.eepromMemory.fill(0xff); // Standard unprogrammed AVR EEPROM default
    
    if (typeof hexCodeOrFlash === 'string') {
      const parsed = parseIntelHexToBuffer(hexCodeOrFlash);
      if (parsed.success) {
        this.flashWords = bytesToWordFlash(parsed.data);
      }
    } else if (hexCodeOrFlash instanceof Uint16Array) {
      this.flashWords = hexCodeOrFlash;
    }

    const eepromBackend = {
      readMemory: (addr: number) => this.eepromMemory[addr] || 0xff,
      writeMemory: (addr: number, value: number) => {
        if (addr < this.eepromMemory.length) {
          this.eepromMemory[addr] = value;
        }
      },
      eraseMemory: () => {
        this.eepromMemory.fill(0xff);
      },
    };

    this.cpu = new CPU(this.flashWords);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, this.clockSpeed);
    this.eeprom = new AVREEPROM(this.cpu, eepromBackend, eepromConfig);
    this.adc = new AVRADC(this.cpu, adcConfig);

    this.setupPeripherals();
  }

  private setupPeripherals() {
    // Listen for Serial output from ATmega328P TX
    this.usart.onByteTransmit = (byte: number) => {
      const char = String.fromCharCode(byte);
      this.serialOutputBuffer += char;
      if (this.onSerialCharCallback) {
        this.onSerialCharCallback(char);
      }
    };
  }

  public loadHex(hexString: string): HexParseResult {
    const parseResult = parseIntelHexToBuffer(hexString);
    if (parseResult.success) {
      this.flashWords = bytesToWordFlash(parseResult.data);
      this.reset();
    }
    return parseResult;
  }

  public reset() {
    this.stop();
    const eepromBackend = {
      readMemory: (addr: number) => this.eepromMemory[addr] || 0xff,
      writeMemory: (addr: number, value: number) => {
        if (addr < this.eepromMemory.length) {
          this.eepromMemory[addr] = value;
        }
      },
      eraseMemory: () => {
        this.eepromMemory.fill(0xff);
      },
    };

    this.cpu = new CPU(this.flashWords);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, this.clockSpeed);
    this.eeprom = new AVREEPROM(this.cpu, eepromBackend, eepromConfig);
    this.adc = new AVRADC(this.cpu, adcConfig);

    this.setupPeripherals();
    this.lastCycleCount = 0;
    this.lastTimestamp = performance.now();
    this.calculatedFrequency = 0;
    this.notifyState();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.lastCycleCount = this.cpu.cycles;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.notifyState();
  }

  public toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  public stepInstruction(): void {
    if (this.isRunning) this.stop();
    avrInstruction(this.cpu);
    this.cpu.tick();
    this.notifyState();
  }

  public stepCycles(count: number): void {
    if (this.isRunning) this.stop();
    const targetCycles = this.cpu.cycles + count;
    while (this.cpu.cycles < targetCycles) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    this.notifyState();
  }

  public sendSerialInput(text: string) {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      this.usart.writeByte(code);
    }
  }

  public setAnalogVoltage(channel: number, millivolts: number) {
    // 0 to 5000 mV converted to ADC channel voltage (0.0 to 5.0 V)
    const volts = Math.max(0, Math.min(5.0, millivolts / 1000));
    if (this.adc && this.adc.channelValues) {
      this.adc.channelValues[channel] = volts;
    }
  }

  public setDigitalInput(port: 'B' | 'C' | 'D', pinIndex: number, high: boolean) {
    if (port === 'B') this.portB.setPin(pinIndex, high);
    if (port === 'C') this.portC.setPin(pinIndex, high);
    if (port === 'D') this.portD.setPin(pinIndex, high);
  }

  public clearSerialBuffer() {
    this.serialOutputBuffer = '';
  }

  public onSerialChar(cb: (char: string) => void) {
    this.onSerialCharCallback = cb;
  }

  public onStateUpdate(cb: (state: Avr8jsLiveState) => void) {
    this.onStateUpdateCallback = cb;
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaSec = (now - this.lastTimestamp) / 1000;
    
    // Target cycles for this frame slice (e.g. 16,000,000 * 0.016s = 256,000 cycles)
    const targetCycles = Math.min(
      Math.floor(deltaSec * this.clockSpeed * this.speedMultiplier),
      500000 // Cap to prevent browser lockup on tab lag
    );

    const startCycles = this.cpu.cycles;
    const endCycles = startCycles + targetCycles;

    while (this.cpu.cycles < endCycles) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }

    if (deltaSec > 0.25) {
      const cyclesRan = this.cpu.cycles - this.lastCycleCount;
      this.calculatedFrequency = cyclesRan / deltaSec;
      this.lastTimestamp = now;
      this.lastCycleCount = this.cpu.cycles;
    }

    this.notifyState();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private getPinStateDescriptor(pinState: PinState): 'LOW' | 'HIGH' | 'INPUT' | 'INPUT_PULLUP' {
    switch (pinState) {
      case PinState.Low:
        return 'LOW';
      case PinState.High:
        return 'HIGH';
      case PinState.Input:
        return 'INPUT';
      case PinState.InputPullUp:
        return 'INPUT_PULLUP';
      default:
        return 'LOW';
    }
  }

  public getLiveState(): Avr8jsLiveState {
    const pb5State = this.portB.pinState(5);
    const pin13IsHigh = pb5State === PinState.High;

    // Collect pin descriptions
    const pins = [
      // Port D (D0 - D7)
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const pState = this.portD.pinState(i);
        const desc = this.getPinStateDescriptor(pState);
        return {
          pin: `PD${i}`,
          label: i === 0 ? 'RX (D0)' : i === 1 ? 'TX (D1)' : i === 3 ? 'PWM (D3)' : i === 5 ? 'PWM (D5)' : i === 6 ? 'PWM (D6)' : `D${i}`,
          state: desc,
          isOutput: pState === PinState.Low || pState === PinState.High,
          val: pState === PinState.High,
        };
      }),
      // Port B (D8 - D13)
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const pState = this.portB.pinState(i);
        const desc = this.getPinStateDescriptor(pState);
        return {
          pin: `PB${i}`,
          label: i === 5 ? 'LED (D13/SCK)' : i === 4 ? 'MISO (D12)' : i === 3 ? 'MOSI/PWM (D11)' : i === 2 ? 'SS/PWM (D10)' : i === 1 ? 'PWM (D9)' : 'D8',
          state: desc,
          isOutput: pState === PinState.Low || pState === PinState.High,
          val: pState === PinState.High,
        };
      }),
      // Port C (A0 - A5)
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const pState = this.portC.pinState(i);
        const desc = this.getPinStateDescriptor(pState);
        return {
          pin: `PC${i}`,
          label: i === 4 ? 'SDA (A4)' : i === 5 ? 'SCL (A5)' : `A${i}`,
          state: desc,
          isOutput: pState === PinState.Low || pState === PinState.High,
          val: pState === PinState.High,
        };
      }),
    ];

    // Data registers
    const dataRegs = this.cpu.data;
    // OCR0A is at 0x47, OCR0B is at 0x48 in ATmega328P SRAM map
    const ocr0a = dataRegs[0x47] || 0;
    const ocr0b = dataRegs[0x48] || 0;
    const ocr1a = (dataRegs[0x89] << 8) | (dataRegs[0x88] || 0);
    const ocr2a = dataRegs[0xb3] || 0;

    return {
      cycles: this.cpu.cycles,
      pc: this.cpu.pc,
      sp: (dataRegs[0x5e] << 8) | (dataRegs[0x5d] || 0), // SPH:SPL
      sreg: dataRegs[0x5f] || 0,
      running: this.isRunning,
      frequencyHz: this.calculatedFrequency,
      portB: this.cpu.data[0x25] || 0, // PORTB
      portC: this.cpu.data[0x28] || 0, // PORTC
      portD: this.cpu.data[0x2b] || 0, // PORTD
      pin13Led: pin13IsHigh,
      pins,
      serialOutput: this.serialOutputBuffer,
      ocr0a,
      ocr0b,
      ocr1a,
      ocr2a,
    };
  }

  private notifyState() {
    if (this.onStateUpdateCallback) {
      this.onStateUpdateCallback(this.getLiveState());
    }
  }

  public destroy() {
    this.stop();
  }
}
