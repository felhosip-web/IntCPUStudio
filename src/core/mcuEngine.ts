import {
  BreadboardState,
  LogicChannel,
  McuModel,
  McuPin,
  McuRegisters,
  McuState,
  SerialMessage,
} from '../types/mcu';

// Standard 28-Pin DIP Pinout for ATmega328p
export function createDefaultPins(): McuPin[] {
  return [
    { pinNumber: 1, name: 'PC6 (/RESET)', port: 'RESET', bitIndex: 6, direction: 'INPUT_PULLUP', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT14', 'RESET'] },
    { pinNumber: 2, name: 'PD0 (D0 / RXD)', port: 'D', bitIndex: 0, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT16', 'RXD'] },
    { pinNumber: 3, name: 'PD1 (D1 / TXD)', port: 'D', bitIndex: 1, direction: 'OUTPUT', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT17', 'TXD'] },
    { pinNumber: 4, name: 'PD2 (D2 / INT0)', port: 'D', bitIndex: 2, direction: 'INPUT_PULLUP', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT18', 'INT0'] },
    { pinNumber: 5, name: 'PD3 (D3 / INT1 / PWM)', port: 'D', bitIndex: 3, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT19', 'INT1', 'OC2B'] },
    { pinNumber: 6, name: 'PD4 (D4 / T0 / XCK)', port: 'D', bitIndex: 4, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT20', 'T0'] },
    { pinNumber: 7, name: 'VCC (+5V Power)', port: 'VCC', bitIndex: 0, direction: 'INPUT', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['POWER'] },
    { pinNumber: 8, name: 'GND (Ground)', port: 'GND', bitIndex: 0, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['GROUND'] },
    { pinNumber: 9, name: 'PB6 (XTAL1 / TOSC1)', port: 'B', bitIndex: 6, direction: 'INPUT', digitalState: true, analogVoltage: 2.5, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT6', 'XTAL1'] },
    { pinNumber: 10, name: 'PB7 (XTAL2 / TOSC2)', port: 'B', bitIndex: 7, direction: 'OUTPUT', digitalState: true, analogVoltage: 2.5, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT7', 'XTAL2'] },
    { pinNumber: 11, name: 'PD5 (D5 / T1 / PWM)', port: 'D', bitIndex: 5, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT21', 'OC0B', 'T1'] },
    { pinNumber: 12, name: 'PD6 (D6 / AIN0 / PWM)', port: 'D', bitIndex: 6, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT22', 'OC0A', 'AIN0'] },
    { pinNumber: 13, name: 'PD7 (D7 / AIN1)', port: 'D', bitIndex: 7, direction: 'INPUT_PULLUP', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT23', 'AIN1'] },
    { pinNumber: 14, name: 'PB0 (D8 / ICP1 / CLKO)', port: 'B', bitIndex: 0, direction: 'INPUT_PULLUP', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT0', 'ICP1'] },
    
    // Right side (Pins 15 to 28)
    { pinNumber: 15, name: 'PB1 (D9 / OC1A / Servo)', port: 'B', bitIndex: 1, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT1', 'OC1A'] },
    { pinNumber: 16, name: 'PB2 (D10 / SS / OC1B)', port: 'B', bitIndex: 2, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT2', 'SS', 'OC1B'] },
    { pinNumber: 17, name: 'PB3 (D11 / MOSI / OC2A)', port: 'B', bitIndex: 3, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: true, pwmDuty: 0, specialFunctions: ['PCINT3', 'MOSI', 'OC2A'] },
    { pinNumber: 18, name: 'PB4 (D12 / MISO)', port: 'B', bitIndex: 4, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT4', 'MISO'] },
    { pinNumber: 19, name: 'PB5 (D13 / SCK / LED)', port: 'B', bitIndex: 5, direction: 'OUTPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT5', 'SCK', 'LED'] },
    { pinNumber: 20, name: 'AVCC (Analog Supply)', port: 'VCC', bitIndex: 1, direction: 'INPUT', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['POWER_ANALOG'] },
    { pinNumber: 21, name: 'AREF (Analog Ref)', port: 'AREF', bitIndex: 0, direction: 'INPUT', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['AREF'] },
    { pinNumber: 22, name: 'GND (Analog Ground)', port: 'GND', bitIndex: 1, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['GROUND'] },
    { pinNumber: 23, name: 'PC0 (A0 / ADC0)', port: 'C', bitIndex: 0, direction: 'INPUT', digitalState: false, analogVoltage: 2.5, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT8', 'ADC0'] },
    { pinNumber: 24, name: 'PC1 (A1 / ADC1)', port: 'C', bitIndex: 1, direction: 'INPUT', digitalState: false, analogVoltage: 1.25, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT9', 'ADC1'] },
    { pinNumber: 25, name: 'PC2 (A2 / ADC2)', port: 'C', bitIndex: 2, direction: 'INPUT', digitalState: false, analogVoltage: 0.8, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT10', 'ADC2'] },
    { pinNumber: 26, name: 'PC3 (A3 / ADC3)', port: 'C', bitIndex: 3, direction: 'INPUT', digitalState: false, analogVoltage: 0.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT11', 'ADC3'] },
    { pinNumber: 27, name: 'PC4 (A4 / SDA / ADC4)', port: 'C', bitIndex: 4, direction: 'INPUT_PULLUP', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT12', 'SDA', 'ADC4'] },
    { pinNumber: 28, name: 'PC5 (A5 / SCL / ADC5)', port: 'C', bitIndex: 5, direction: 'INPUT_PULLUP', digitalState: true, analogVoltage: 5.0, isPwmCapable: false, pwmDuty: 0, specialFunctions: ['PCINT13', 'SCL', 'ADC5'] },
  ];
}

export function createDefaultRegisters(): McuRegisters {
  return {
    r: new Array(32).fill(0),
    sreg: {
      I: true,
      T: false,
      H: false,
      S: false,
      V: false,
      N: false,
      Z: false,
      C: false,
    },
    pc: 0,
    sp: 0x08ff, // RAMEND on ATmega328p (2KB SRAM)
    x: 0,
    y: 0,
    z: 0,

    PINB: 0x00,
    DDRB: 0x20, // PB5 (D13 LED) output by default
    PORTB: 0x00,

    PINC: 0x00,
    DDRC: 0x00, // Inputs for A0..A5
    PORTC: 0x30, // Pull-up for PC4, PC5 (I2C SDA/SCL)

    PIND: 0x84, // INT0, D7 pullups
    DDRD: 0x6a, // D1(TX), D3(PWM), D5(PWM), D6(PWM) outputs
    PORTD: 0x84,

    ADMUX: 0x40,  // AVCC with external capacitor at AREF, Channel 0 (ADC0/A0)
    ADCSRA: 0x87, // ADEN = 1, Prescaler = 128
    ADCSRB: 0x00,
    ADCL: 0x00,
    ADCH: 0x02,
    adcValue: 512,
    adcChannel: 0,

    TCCR0A: 0x03, // Fast PWM mode
    TCCR0B: 0x03, // Prescaler /64
    TCNT0: 0,
    OCR0A: 128,
    OCR0B: 64,

    TCCR1A: 0x82, // Fast PWM 16-bit, ICR1 top
    TCCR1B: 0x1a, // Prescaler /8
    TCNT1: 0,
    OCR1A: 1500,  // 1.5ms pulse = 90 deg neutral servo
    OCR1B: 1000,
    ICR1: 20000,  // 20ms period (50Hz RC servo)

    TCCR2A: 0x00,
    TCCR2B: 0x00,
    TCNT2: 0,
    OCR2A: 0,
    OCR2B: 0,

    UCSR0A: 0x20, // UDRE0 = 1 (Data register empty, ready to transmit)
    UCSR0B: 0x98, // RXEN, TXEN, RXCIE
    UCSR0C: 0x06, // 8-bit, 1 stop bit, no parity
    UBRR0: 103,   // 9600 baud @ 16MHz
    UDR0: 0x00,

    EICRA: 0x02, // INT0 falling edge
    EIMSK: 0x01, // INT0 enabled
    EIFR: 0x00,

    WDTCSR: 0x00,
    watchdogCounter: 0,

    EEAR: 0x00,
    EEDR: 0x00,
    EECR: 0x00,

    SMCR: 0x00,
    sleepMode: 'NONE',
  };
}

export function createDefaultBreadboard(): BreadboardState {
  return {
    activeModules: ['basic_sensors', 'rgb_servo_lcd', 'ds18b20', 'ds3231_rtc', 'rotary_encoder', 'nrf24l01'],
    potentiometer: {
      voltage: 2.5,
      value: 512,
      targetPin: 'A0',
    },
    tempSensor: {
      celsius: 24.5,
      voltage: 0.745, // 10mV/°C + 500mV offset (TMP36)
      targetPin: 'A1',
    },
    lightSensorLdr: {
      lux: 450,
      voltage: 2.1,
      targetPin: 'A2',
    },
    ds18b20: {
      celsius: 28.625,
      resolutionBits: 12,
      romCode: '28-FF-4A-12-88-16-04-A1',
      alarmHigh: 50,
      alarmLow: 10,
      isConverting: false,
      pin: 'PD4',
    },
    ds3231: {
      year: 2026,
      month: 8,
      day: 15,
      dayOfWeek: 6,
      hours: 14,
      minutes: 32,
      seconds: 50,
      temperature: 24.75,
      batteryVolts: 3.18,
      sqwFrequency: '1Hz',
      alarm1: { hours: 7, minutes: 0, enabled: false, triggered: false },
      i2cAddress: '0x68',
    },
    rotaryEncoder: {
      position: 24,
      lastDirection: 'CW',
      pinA: 'PD2',
      pinB: 'PD4',
      pinSw: 'PD7',
      isSwPressed: false,
      stepsPerDetent: 4,
      phaseA: false,
      phaseB: true,
    },
    nrf24: {
      channel: 76,
      payloadSize: 16,
      powerDbm: 0,
      dataRate: '1Mbps',
      txAddress: '0xE8E8F0F0E1',
      rxAddress: '0xE8E8F0F0E1',
      cePin: 'PB0',
      csnPin: 'PB2',
      irqPin: 'PD2',
      lastTxPayload: 'PING_#42:24.5C',
      lastRxPayload: 'ACK_NODE_B_OK',
      packetsSent: 18,
      packetsReceived: 18,
      lastAckReceived: true,
      isTransmitting: false,
      packetLossRate: 0,
    },
    ledPin13: false,
    rgbLed: {
      rPin: 'PD6',
      gPin: 'PD5',
      bPin: 'PD3',
      rDuty: 0,
      gDuty: 0,
      bDuty: 0,
    },
    servoMotor: {
      angle: 90,
      pin: 'PB1',
    },
    buzzer: {
      enabled: false,
      frequency: 440,
      pin: 'PD3',
    },
    lcd16x2: {
      lines: ['MCU ATmega328P', 'System Online!'],
      cursorRow: 0,
      cursorCol: 0,
      backlight: true,
    },
    button1: {
      isPressed: false,
      pin: 'PD2',
    },
    button2: {
      isPressed: false,
      pin: 'PD7',
    },
    dipSwitches: [false, true, false, true],
  };
}

export function createDefaultLogicChannels(): LogicChannel[] {
  return [
    { name: 'CH0: PB5 (D13 LED)', pin: 'PB5', history: new Array(60).fill(0), color: '#38bdf8' },
    { name: 'CH1: PD3 (PWM / INT1)', pin: 'PD3', history: new Array(60).fill(0), color: '#f59e0b' },
    { name: 'CH2: PD2 (INT0 Btn)', pin: 'PD2', history: new Array(60).fill(1), color: '#34d399' },
    { name: 'CH3: PD1 (UART TXD)', pin: 'PD1', history: new Array(60).fill(1), color: '#ec4899' },
  ];
}

export function createInitialMcuState(model: McuModel = 'ATmega328p'): McuState {
  return {
    mcuModel: model,
    clockHz: 10, // Default 10 Hz for visible stepping, adjustable up to 16 MHz
    isRunning: false,
    isHalted: false,
    cycleCount: 0,
    instructionCount: 0,

    registers: createDefaultRegisters(),
    pins: createDefaultPins(),
    flashMemory: [
      '; --- ATmega328P Default Arduino Blink & Sensor Demo ---',
      '.org 0x0000',
      '  sbi DDRB, 5        ; Set PB5 (D13 LED) as OUTPUT',
      'loop:',
      '  sbi PORTB, 5       ; Turn LED ON (HIGH)',
      '  rcall delay_ms     ; Wait delay loop',
      '  cbi PORTB, 5       ; Turn LED OFF (LOW)',
      '  rcall delay_ms     ; Wait delay loop',
      '  rjmp loop          ; Repeat endlessly',
      '',
      'delay_ms:',
      '  ldi r16, 10',
      'delay_inner:',
      '  dec r16',
      '  brne delay_inner',
      '  ret',
    ],
    sram: new Uint8Array(2048),
    eeprom: new Uint8Array(1024),

    breadboard: createDefaultBreadboard(),
    logicChannels: createDefaultLogicChannels(),
    serialLogs: [
      {
        id: 'msg-0',
        type: 'SYS',
        text: 'ATmega328P 8-Bit RISC MCU initialized @ 16.00 MHz (VCC: 5.0V, Flash: 32KB, SRAM: 2KB)',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: 'msg-1',
        type: 'TX',
        text: 'Serial UART Baud: 9600 [8N1] Ready.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ],
    serialPlotData: [
      { time: 0, val1: 512, val2: 245, val3: 450 },
      { time: 1, val1: 515, val2: 246, val3: 452 },
      { time: 2, val1: 518, val2: 248, val3: 448 },
    ],
    rxBuffer: '',

    currentInstructionName: 'SBI',
    currentExplanation: 'SBI DDRB, 5: Sets bit 5 in Data Direction Register B (Pin 13 becomes OUTPUT).',
    currentExplanationHu: 'SBI DDRB, 5: Beállítja a DDRB 5. bitjét (a 13-as digitális láb KIMENET lesz).',
    lastResetCause: 'POWER_ON',
  };
}

export function cloneMcuState(state: McuState): McuState {
  return {
    ...state,
    registers: {
      ...state.registers,
      r: [...state.registers.r],
      sreg: { ...state.registers.sreg },
    },
    pins: state.pins.map((p) => ({ ...p, specialFunctions: [...p.specialFunctions] })),
    flashMemory: [...state.flashMemory],
    sram: new Uint8Array(state.sram),
    eeprom: new Uint8Array(state.eeprom),
    breadboard: {
      ...state.breadboard,
      potentiometer: { ...state.breadboard.potentiometer },
      tempSensor: { ...state.breadboard.tempSensor },
      lightSensorLdr: { ...state.breadboard.lightSensorLdr },
      rgbLed: { ...state.breadboard.rgbLed },
      servoMotor: { ...state.breadboard.servoMotor },
      buzzer: { ...state.breadboard.buzzer },
      lcd16x2: {
        ...state.breadboard.lcd16x2,
        lines: [state.breadboard.lcd16x2.lines[0], state.breadboard.lcd16x2.lines[1]],
      },
      button1: { ...state.breadboard.button1 },
      button2: { ...state.breadboard.button2 },
      dipSwitches: [...state.breadboard.dipSwitches],
    },
    logicChannels: state.logicChannels.map((ch) => ({ ...ch, history: [...ch.history] })),
    serialLogs: [...state.serialLogs],
    serialPlotData: [...state.serialPlotData],
  };
}

/**
 * Step a single instruction or macro execution on the virtual MCU
 */
export function stepMcu(state: McuState): McuState {
  const next = cloneMcuState(state);
  if (next.isHalted) return next;

  next.cycleCount += 1;
  next.instructionCount += 1;

  // 1. Fetch current instruction
  const flash = next.flashMemory;
  if (!flash || flash.length === 0) return next;

  let lineIdx = next.registers.pc % flash.length;
  let rawLine = flash[lineIdx] || '';
  let line = rawLine.trim();

  // Skip comments or empty lines
  let attempts = 0;
  while ((line.startsWith(';') || line.startsWith('//') || line === '' || line.endsWith(':')) && attempts < flash.length) {
    next.registers.pc = (next.registers.pc + 1) % flash.length;
    lineIdx = next.registers.pc;
    rawLine = flash[lineIdx] || '';
    line = rawLine.trim();
    attempts++;
  }

  if (attempts >= flash.length) {
    next.registers.pc = 0;
    return next;
  }

  // Parse instruction token
  const commentIdx = line.indexOf(';');
  const slashIdx = line.indexOf('//');
  let cleanLine = line;
  if (commentIdx >= 0) cleanLine = cleanLine.substring(0, commentIdx).trim();
  if (slashIdx >= 0) cleanLine = cleanLine.substring(0, slashIdx).trim();

  const parts = cleanLine.split(/[\s,]+/);
  const op = parts[0]?.toUpperCase() || 'NOP';
  const arg1 = parts[1] || '';
  const arg2 = parts[2] || '';
  const arg3 = parts[3] || '';

  next.currentInstructionName = op;

  // 2. Execute Instruction
  switch (op) {
    case 'SBI': {
      // Set Bit in I/O Register: SBI DDRB, 5 or SBI PORTB, 5
      const regName = arg1.toUpperCase();
      const bit = parseInt(arg2, 10) || 0;
      if (regName === 'DDRB') next.registers.DDRB |= (1 << bit);
      else if (regName === 'PORTB') next.registers.PORTB |= (1 << bit);
      else if (regName === 'DDRC') next.registers.DDRC |= (1 << bit);
      else if (regName === 'PORTC') next.registers.PORTC |= (1 << bit);
      else if (regName === 'DDRD') next.registers.DDRD |= (1 << bit);
      else if (regName === 'PORTD') next.registers.PORTD |= (1 << bit);
      else if (regName === 'EECR') {
        next.registers.EECR |= (1 << bit);
        // Bit 0 = EERE (EEPROM Read Enable)
        if (bit === 0) {
          const addr = next.registers.EEAR & 0x03ff;
          next.registers.EEDR = next.eeprom[addr] || 0;
        }
        // Bit 1 = EEPE (EEPROM Write Strobe)
        if (bit === 1) {
          const addr = next.registers.EEAR & 0x03ff;
          next.eeprom[addr] = next.registers.EEDR;
        }
      }

      next.currentExplanation = `SBI ${regName}, ${bit}: Set bit ${bit} in register ${regName} to 1 (HIGH).`;
      next.currentExplanationHu = `SBI ${regName}, ${bit}: Beállította az 1-es értéket a(z) ${regName} regiszter ${bit}. bitjére.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'CBI': {
      // Clear Bit in I/O Register: CBI PORTB, 5
      const regName = arg1.toUpperCase();
      const bit = parseInt(arg2, 10) || 0;
      if (regName === 'DDRB') next.registers.DDRB &= ~(1 << bit);
      else if (regName === 'PORTB') next.registers.PORTB &= ~(1 << bit);
      else if (regName === 'DDRC') next.registers.DDRC &= ~(1 << bit);
      else if (regName === 'PORTC') next.registers.PORTC &= ~(1 << bit);
      else if (regName === 'DDRD') next.registers.DDRD &= ~(1 << bit);
      else if (regName === 'PORTD') next.registers.PORTD &= ~(1 << bit);

      next.currentExplanation = `CBI ${regName}, ${bit}: Cleared bit ${bit} in register ${regName} to 0 (LOW).`;
      next.currentExplanationHu = `CBI ${regName}, ${bit}: Törölte a(z) ${regName} regiszter ${bit}. bitjét (0 / LOW).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'LDI': {
      // Load Immediate: LDI r16, 0xFF
      const regNum = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      let val = parseValue(arg2);
      if (regNum >= 0 && regNum < 32) {
        next.registers.r[regNum] = val & 0xff;
      }
      next.currentExplanation = `LDI R${regNum}, ${val}: Loaded immediate value 0x${val.toString(16).toUpperCase()} (${val}) into register R${regNum}.`;
      next.currentExplanationHu = `LDI R${regNum}, ${val}: Közvetlen érték (0x${val.toString(16).toUpperCase()}) betöltve a(z) R${regNum} regiszterbe.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'OUT': {
      // OUT PORTB, r16
      const regName = arg1.toUpperCase();
      const srcRegNum = parseInt(arg2.replace(/r/i, ''), 10) || 16;
      const val = next.registers.r[srcRegNum] || 0;

      if (regName === 'PORTB') next.registers.PORTB = val;
      else if (regName === 'DDRB') next.registers.DDRB = val;
      else if (regName === 'PORTC') next.registers.PORTC = val;
      else if (regName === 'DDRC') next.registers.DDRC = val;
      else if (regName === 'PORTD') next.registers.PORTD = val;
      else if (regName === 'DDRD') next.registers.DDRD = val;
      else if (regName === 'OCR0A') next.registers.OCR0A = val;
      else if (regName === 'OCR0B') next.registers.OCR0B = val;
      else if (regName === 'OCR1AL' || regName === 'OCR1A') next.registers.OCR1A = val;
      else if (regName === 'ADMUX') next.registers.ADMUX = val;
      else if (regName === 'ADCSRA') next.registers.ADCSRA = val;
      else if (regName === 'EEAR' || regName === 'EEARL') next.registers.EEAR = (next.registers.EEAR & 0x0300) | (val & 0xff);
      else if (regName === 'EEARH') next.registers.EEAR = ((val & 0x03) << 8) | (next.registers.EEAR & 0x00ff);
      else if (regName === 'EEDR') next.registers.EEDR = val & 0xff;
      else if (regName === 'EECR') next.registers.EECR = val & 0xff;
      else if (regName === 'UDR0') {
        next.registers.UDR0 = val;
        // Append char to serial log
        const char = String.fromCharCode(val);
        const logMsg = `[TX] Byte 0x${val.toString(16).padStart(2, '0').toUpperCase()} ('${char}')`;
        appendSerialTx(next, char);
      }

      next.currentExplanation = `OUT ${regName}, R${srcRegNum}: Wrote value 0x${val.toString(16).toUpperCase()} (${val}) to I/O register ${regName}.`;
      next.currentExplanationHu = `OUT ${regName}, R${srcRegNum}: 0x${val.toString(16).toUpperCase()} érték kiírva a(z) ${regName} I/O regiszterbe.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'IN': {
      // IN r16, PINB
      const dstRegNum = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      const regName = arg2.toUpperCase();
      let val = 0;

      if (regName === 'PINB') val = next.registers.PINB;
      else if (regName === 'PINC') val = next.registers.PINC;
      else if (regName === 'PIND') val = next.registers.PIND;
      else if (regName === 'ADCH') val = next.registers.ADCH;
      else if (regName === 'ADCL') val = next.registers.ADCL;
      else if (regName === 'EEDR') val = next.registers.EEDR;
      else if (regName === 'EECR') val = next.registers.EECR;
      else if (regName === 'EEAR' || regName === 'EEARL') val = next.registers.EEAR & 0xff;
      else if (regName === 'EEARH') val = (next.registers.EEAR >> 8) & 0x03;
      else if (regName === 'UDR0') val = next.registers.UDR0;

      next.registers.r[dstRegNum] = val & 0xff;
      next.currentExplanation = `IN R${dstRegNum}, ${regName}: Read 0x${val.toString(16).toUpperCase()} from ${regName} into R${dstRegNum}.`;
      next.currentExplanationHu = `IN R${dstRegNum}, ${regName}: 0x${val.toString(16).toUpperCase()} beolvasva a(z) ${regName} regiszterből R${dstRegNum}-be.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'MOV': {
      const dst = parseInt(arg1.replace(/r/i, ''), 10) || 0;
      const src = parseInt(arg2.replace(/r/i, ''), 10) || 0;
      next.registers.r[dst] = next.registers.r[src];
      next.currentExplanation = `MOV R${dst}, R${src}: Copied value from R${src} to R${dst}.`;
      next.currentExplanationHu = `MOV R${dst}, R${src}: R${src} értéke átmásolva R${dst}-be.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'ADD': {
      const dst = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      const src = parseInt(arg2.replace(/r/i, ''), 10) || 17;
      const sum = next.registers.r[dst] + next.registers.r[src];
      next.registers.r[dst] = sum & 0xff;
      updateSregFlags(next, sum, next.registers.r[dst]);
      next.currentExplanation = `ADD R${dst}, R${src}: Added R${src} to R${dst} = ${next.registers.r[dst]}.`;
      next.currentExplanationHu = `ADD R${dst}, R${src}: R${dst} = R${dst} + R${src} = ${next.registers.r[dst]}.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SUB': {
      const dst = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      const src = parseInt(arg2.replace(/r/i, ''), 10) || 17;
      const diff = next.registers.r[dst] - next.registers.r[src];
      next.registers.r[dst] = (diff + 256) & 0xff;
      updateSregFlags(next, diff, next.registers.r[dst]);
      next.currentExplanation = `SUB R${dst}, R${src}: Subtracted R${src} from R${dst} = ${next.registers.r[dst]}.`;
      next.currentExplanationHu = `SUB R${dst}, R${src}: R${dst} = R${dst} - R${src} = ${next.registers.r[dst]}.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'INC': {
      const reg = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      next.registers.r[reg] = (next.registers.r[reg] + 1) & 0xff;
      updateSregFlags(next, next.registers.r[reg], next.registers.r[reg]);
      next.currentExplanation = `INC R${reg}: Incremented R${reg} to ${next.registers.r[reg]}.`;
      next.currentExplanationHu = `INC R${reg}: R${reg} növelve 1-gyel = ${next.registers.r[reg]}.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'DEC': {
      const reg = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      next.registers.r[reg] = (next.registers.r[reg] - 1 + 256) & 0xff;
      updateSregFlags(next, next.registers.r[reg], next.registers.r[reg]);
      next.currentExplanation = `DEC R${reg}: Decremented R${reg} to ${next.registers.r[reg]}.`;
      next.currentExplanationHu = `DEC R${reg}: R${reg} csökkentve 1-gyel = ${next.registers.r[reg]}.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'CPI': {
      const reg = parseInt(arg1.replace(/r/i, ''), 10) || 16;
      const imm = parseValue(arg2);
      const diff = next.registers.r[reg] - imm;
      updateSregFlags(next, diff, (diff + 256) & 0xff);
      next.currentExplanation = `CPI R${reg}, ${imm}: Compared R${reg} (${next.registers.r[reg]}) with ${imm}.`;
      next.currentExplanationHu = `CPI R${reg}, ${imm}: R${reg} (${next.registers.r[reg]}) összehasonlítva ${imm}-mel.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'BREQ': {
      const label = arg1;
      if (next.registers.sreg.Z) {
        next.registers.pc = findLabelIndex(flash, label);
        next.currentExplanation = `BREQ ${label}: Branch taken (Z flag is 1). Jumped to ${label}.`;
        next.currentExplanationHu = `BREQ ${label}: Feltételes ugrás végrehajtva (Z = 1). Ugrás: ${label}.`;
      } else {
        next.registers.pc = (next.registers.pc + 1) % flash.length;
        next.currentExplanation = `BREQ ${label}: Branch not taken (Z flag is 0).`;
        next.currentExplanationHu = `BREQ ${label}: Feltétel nem teljesült (Z = 0), folytatás a következő soron.`;
      }
      break;
    }

    case 'BRNE': {
      const label = arg1;
      if (!next.registers.sreg.Z) {
        next.registers.pc = findLabelIndex(flash, label);
        next.currentExplanation = `BRNE ${label}: Branch taken (Z flag is 0). Jumped to ${label}.`;
        next.currentExplanationHu = `BRNE ${label}: Feltételes ugrás végrehajtva (Z = 0). Ugrás: ${label}.`;
      } else {
        next.registers.pc = (next.registers.pc + 1) % flash.length;
        next.currentExplanation = `BRNE ${label}: Branch not taken (Z flag is 1).`;
        next.currentExplanationHu = `BRNE ${label}: Feltétel nem teljesült (Z = 1), folytatás.`;
      }
      break;
    }

    case 'RJMP':
    case 'JMP': {
      const label = arg1;
      next.registers.pc = findLabelIndex(flash, label);
      next.currentExplanation = `${op} ${label}: Jumped to label ${label}.`;
      next.currentExplanationHu = `${op} ${label}: Feltétel nélküli ugrás a(z) ${label} címkére.`;
      break;
    }

    case 'RCALL':
    case 'CALL': {
      const label = arg1;
      // Push return PC to SP
      const returnAddr = (next.registers.pc + 1) % flash.length;
      if (next.registers.sp >= 2) {
        next.sram[next.registers.sp] = returnAddr & 0xff;
        next.sram[next.registers.sp - 1] = (returnAddr >> 8) & 0xff;
        next.registers.sp -= 2;
      }
      next.registers.pc = findLabelIndex(flash, label);
      next.currentExplanation = `${op} ${label}: Subroutine call to ${label}. Saved return address to Stack (SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      next.currentExplanationHu = `${op} ${label}: Alprogram hívás: ${label}. Visszatérési cím elmentve a verembe (SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      break;
    }

    case 'RET': {
      if (next.registers.sp <= 0x08fd) {
        next.registers.sp += 2;
        const returnAddr = (next.sram[next.registers.sp - 1] << 8) | next.sram[next.registers.sp];
        next.registers.pc = returnAddr % flash.length;
      } else {
        next.registers.pc = 0;
      }
      next.currentExplanation = `RET: Returned from subroutine to line ${next.registers.pc} (SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      next.currentExplanationHu = `RET: Visszatérés az alprogramból a(z) ${next.registers.pc}. sorra (SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      break;
    }

    case 'RETI': {
      if (next.registers.sp <= 0x08fd) {
        next.registers.sp += 2;
        const returnAddr = (next.sram[next.registers.sp - 1] << 8) | next.sram[next.registers.sp];
        next.registers.pc = returnAddr % flash.length;
      } else {
        next.registers.pc = 0;
      }
      next.registers.sreg.I = true; // Auto re-enable interrupts on RETI
      next.currentExplanation = `RETI: Return from Interrupt to line ${next.registers.pc}. Global Interrupts re-enabled (SREG I = 1, SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      next.currentExplanationHu = `RETI: Visszatérés a megszakításból a(z) ${next.registers.pc}. sorra. Globális megszakítások újra engedélyezve (SREG I = 1, SP: 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      break;
    }

    case 'PUSH': {
      const reg = parseInt(arg1.replace(/r/i, ''), 10) || 0;
      const val = next.registers.r[reg] & 0xff;
      if (next.registers.sp >= 1) {
        next.sram[next.registers.sp] = val;
        next.registers.sp -= 1;
      }
      next.currentExplanation = `PUSH R${reg}: Pushed 0x${val.toString(16).toUpperCase()} onto stack (SP: 0x${(next.registers.sp + 1).toString(16).toUpperCase()} -> 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      next.currentExplanationHu = `PUSH R${reg}: 0x${val.toString(16).toUpperCase()} elmentve a verembe (SP: 0x${(next.registers.sp + 1).toString(16).toUpperCase()} -> 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'POP': {
      const reg = parseInt(arg1.replace(/r/i, ''), 10) || 0;
      if (next.registers.sp < 0x08ff) {
        next.registers.sp += 1;
        const val = next.sram[next.registers.sp];
        next.registers.r[reg] = val;
        next.currentExplanation = `POP R${reg}: Popped 0x${val.toString(16).toUpperCase()} from stack into R${reg} (SP: 0x${(next.registers.sp - 1).toString(16).toUpperCase()} -> 0x${next.registers.sp.toString(16).toUpperCase()}).`;
        next.currentExplanationHu = `POP R${reg}: 0x${val.toString(16).toUpperCase()} visszatöltve a veremből R${reg}-be (SP: 0x${(next.registers.sp - 1).toString(16).toUpperCase()} -> 0x${next.registers.sp.toString(16).toUpperCase()}).`;
      } else {
        next.currentExplanation = `POP R${reg}: Stack underflow! (SP at RAMEND 0x08FF).`;
        next.currentExplanationHu = `POP R${reg}: Verem alulcsordulás! (SP a RAMEND 0x08FF-en áll).`;
      }
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SEI': {
      next.registers.sreg.I = true;
      next.currentExplanation = 'SEI: Set Global Interrupt Enable flag (SREG I = 1). Interrupts enabled.';
      next.currentExplanationHu = 'SEI: Globális megszakítás engedélyezése (SREG I = 1). Megszakítások aktívak.';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'CLI': {
      next.registers.sreg.I = false;
      next.currentExplanation = 'CLI: Clear Global Interrupt Enable flag (SREG I = 0). Interrupts disabled.';
      next.currentExplanationHu = 'CLI: Globális megszakítás tiltása (SREG I = 0). Megszakítások inaktívak.';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'NOP': {
      next.currentExplanation = 'NOP: No Operation (1 cycle elapsed).';
      next.currentExplanationHu = 'NOP: Nincs művelet (1 órajel ciklus eltelt).';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SLEEP': {
      next.currentExplanation = 'SLEEP: MCU entered low-power sleep mode (wakes on INT0/Timer).';
      next.currentExplanationHu = 'SLEEP: Az MCU alacsony fogyasztású alvó módba lépett.';
      next.registers.sleepMode = 'IDLE';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'WDR': {
      next.registers.watchdogCounter = 0;
      next.currentExplanation = 'WDR: Watchdog Reset (cleared WDT timeout timer).';
      next.currentExplanationHu = 'WDR: Watchdog időzítő nullázva.';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    // High-Level Arduino-C Style Macros Support
    case 'DIGITALWRITE': {
      const pinNum = parseInt(arg1, 10);
      const state = arg2.toUpperCase() === 'HIGH' || arg2 === '1' || arg2 === 'TRUE';
      applyArduinoDigitalWrite(next, pinNum, state);
      next.currentExplanation = `digitalWrite(${pinNum}, ${state ? 'HIGH' : 'LOW'}): Set pin ${pinNum} output.`;
      next.currentExplanationHu = `digitalWrite(${pinNum}, ${state ? 'HIGH' : 'LOW'}): ${pinNum}. láb kimenet beállítva.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'ANALOGWRITE': {
      const pinNum = parseInt(arg1, 10);
      const val = parseValue(arg2);
      applyArduinoAnalogWrite(next, pinNum, val);
      next.currentExplanation = `analogWrite(${pinNum}, ${val}): Set hardware PWM duty cycle on pin ${pinNum} to ${val}/255.`;
      next.currentExplanationHu = `analogWrite(${pinNum}, ${val}): Hardveres PWM kitöltés (${val}/255) beállítva a(z) ${pinNum}. lábon.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SERVO.WRITE': {
      const angle = Math.min(180, Math.max(0, parseInt(arg1, 10) || 0));
      next.breadboard.servoMotor.angle = angle;
      next.registers.OCR1A = 1000 + Math.round((angle / 180) * 1000); // 1ms - 2ms
      next.currentExplanation = `servo.write(${angle}°): Positioned servo motor arm to ${angle} degrees (OCR1A = ${next.registers.OCR1A} µs).`;
      next.currentExplanationHu = `servo.write(${angle}°): Szervómotor beállítva ${angle}° szögre (OCR1A = ${next.registers.OCR1A} µs).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'LCD.PRINT': {
      const text = cleanLine.substring(cleanLine.indexOf('(') + 1, cleanLine.lastIndexOf(')')).replace(/["']/g, '');
      const row = next.breadboard.lcd16x2.cursorRow;
      next.breadboard.lcd16x2.lines[row] = (text + '                ').substring(0, 16);
      next.currentExplanation = `lcd.print("${text}"): Displayed text on 16x2 LCD line ${row + 1}.`;
      next.currentExplanationHu = `lcd.print("${text}"): Szöveg kiírva a 16x2 LCD ${row + 1}. sorára.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'LCD.SETCURSOR': {
      const col = parseInt(arg1, 10) || 0;
      const row = Math.min(1, Math.max(0, parseInt(arg2, 10) || 0));
      next.breadboard.lcd16x2.cursorRow = row;
      next.breadboard.lcd16x2.cursorCol = col;
      next.currentExplanation = `lcd.setCursor(${col}, ${row}): Moved LCD cursor.`;
      next.currentExplanationHu = `lcd.setCursor(${col}, ${row}): LCD kurzor pozícionálva (${col}, ${row}).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SERIAL.PRINT':
    case 'SERIAL.PRINTLN': {
      let rawText = cleanLine.substring(cleanLine.indexOf('(') + 1, cleanLine.lastIndexOf(')')).replace(/["']/g, '');
      if (rawText.toUpperCase() === 'ANALOGREAD(A0)') rawText = next.breadboard.potentiometer.value.toString();
      else if (rawText.toUpperCase() === 'TEMP' || rawText.toUpperCase() === 'SENSORS.GETTEMPCBYINDEX(0)') rawText = `${next.breadboard.ds18b20.celsius.toFixed(2)} C`;
      else if (rawText.toUpperCase() === 'LUX') rawText = `${next.breadboard.lightSensorLdr.lux} lux`;
      else if (rawText.toUpperCase() === 'RTC.NOW()' || rawText.toUpperCase() === 'TIME') rawText = `${String(next.breadboard.ds3231.hours).padStart(2, '0')}:${String(next.breadboard.ds3231.minutes).padStart(2, '0')}:${String(next.breadboard.ds3231.seconds).padStart(2, '0')}`;
      else if (rawText.toUpperCase() === 'MYENC.READ()' || rawText.toUpperCase() === 'ENCODER.GETVALUE()') rawText = `Pos: ${next.breadboard.rotaryEncoder.position}`;
      else if (rawText.toUpperCase() === 'RADIO.WRITE()' || rawText.toUpperCase() === 'PAYLOAD') rawText = `[nRF24] TX -> "${next.breadboard.nrf24.lastTxPayload}" (ACK OK)`;

      const isLn = op.includes('LN');
      const formatted = isLn ? rawText + '\n' : rawText;
      appendSerialTx(next, formatted);

      next.currentExplanation = `Serial.print${isLn ? 'ln' : ''}("${rawText}"): Sent ASCII over UART TX line.`;
      next.currentExplanationHu = `Serial.print${isLn ? 'ln' : ''}("${rawText}"): ASCII adat elküldve a soros porton (TX).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'SENSORS.REQUESTTEMPERATURES':
    case 'DS18B20.REQUEST': {
      next.breadboard.ds18b20.isConverting = true;
      next.currentExplanation = 'DS18B20: Issued 1-Wire Convert T command (0x44). 12-bit conversion complete.';
      next.currentExplanationHu = 'DS18B20: 1-Wire Convert T parancs (0x44) kiadva. 12 bites digitális átalakítás kész.';
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'RTC.ADJUST': {
      next.currentExplanation = `DS3231: RTC clock synchronized over I2C (0x68).`;
      next.currentExplanationHu = `DS3231: RTC óra szinkronizálva I2C buszon (0x68).`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'RADIO.WRITE': {
      next.breadboard.nrf24.packetsSent += 1;
      next.breadboard.nrf24.lastAckReceived = true;
      next.breadboard.nrf24.isTransmitting = true;
      next.currentExplanation = `nRF24L01: Transmitted RF packet on CH${next.breadboard.nrf24.channel} (2.4${next.breadboard.nrf24.channel}GHz). ACK received.`;
      next.currentExplanationHu = `nRF24L01: RF adatcsomag elküldve a CH${next.breadboard.nrf24.channel} csatornán (2.4${next.breadboard.nrf24.channel}GHz). Hardveres ACK visszaérkezett.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'EEPROM.WRITE':
    case 'EEPROM.UPDATE': {
      const addr = parseValue(arg1) & 0x03ff;
      const val = parseValue(arg2) & 0xff;
      const oldVal = next.eeprom[addr];
      const isUpdate = op.includes('UPDATE');
      
      if (!isUpdate || oldVal !== val) {
        next.eeprom[addr] = val;
        next.registers.EEAR = addr;
        next.registers.EEDR = val;
      }

      next.currentExplanation = `EEPROM.${isUpdate ? 'update' : 'write'}(0x${addr.toString(16).toUpperCase()}, 0x${val.toString(16).toUpperCase()}): Stored byte in non-volatile EEPROM.`;
      next.currentExplanationHu = `EEPROM.${isUpdate ? 'update' : 'write'}(0x${addr.toString(16).toUpperCase()}, 0x${val.toString(16).toUpperCase()}): Bájt tartósan mentve az EEPROM-ba.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    case 'EEPROM.READ': {
      const addr = parseValue(arg1) & 0x03ff;
      const val = next.eeprom[addr] || 0;
      next.registers.EEAR = addr;
      next.registers.EEDR = val;
      next.registers.r[16] = val;

      next.currentExplanation = `EEPROM.read(0x${addr.toString(16).toUpperCase()}): Read 0x${val.toString(16).toUpperCase()} (${val}) from EEPROM.`;
      next.currentExplanationHu = `EEPROM.read(0x${addr.toString(16).toUpperCase()}): 0x${val.toString(16).toUpperCase()} (${val}) beolvasva az EEPROM-ból.`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
    }

    default:
      next.currentExplanation = `Executed: ${cleanLine}`;
      next.currentExplanationHu = `Végrehajtva: ${cleanLine}`;
      next.registers.pc = (next.registers.pc + 1) % flash.length;
      break;
  }

  // 3. Synchronize Pin States & Peripherals with Registers
  updatePeripheralsAndPins(next);

  return next;
}

/**
 * Synchronize MCU physical pins, PWM generators, ADC, and breadboard visual components
 */
export function updatePeripheralsAndPins(state: McuState): void {
  // Update Port B pins (Pins PB0..PB5)
  // Pin 19 is PB5 (D13 Onboard LED)
  const isPb5High = (state.registers.PORTB & (1 << 5)) !== 0;
  state.breadboard.ledPin13 = isPb5High;

  // Update Pin Objects
  state.pins.forEach((pin) => {
    if (pin.port === 'B') {
      const bit = pin.bitIndex;
      const isOut = (state.registers.DDRB & (1 << bit)) !== 0;
      pin.direction = isOut ? 'OUTPUT' : 'INPUT_PULLUP';
      pin.digitalState = isOut
        ? (state.registers.PORTB & (1 << bit)) !== 0
        : (state.registers.PINB & (1 << bit)) !== 0;
      pin.analogVoltage = pin.digitalState ? 5.0 : 0.0;

      // PWM on PB1 (OC1A - Servo) or PB2 (OC1B) or PB3 (OC2A)
      if (pin.bitIndex === 1) {
        pin.pwmDuty = Math.round((state.registers.OCR1A / 20000) * 255);
      }
    } else if (pin.port === 'C') {
      // Analog Port A0..A5
      const bit = pin.bitIndex;
      const isOut = (state.registers.DDRC & (1 << bit)) !== 0;
      pin.direction = isOut ? 'OUTPUT' : 'INPUT';
      if (!isOut) {
        // Connected to sensors
        if (bit === 0) pin.analogVoltage = state.breadboard.potentiometer.voltage;
        else if (bit === 1) pin.analogVoltage = state.breadboard.tempSensor.voltage;
        else if (bit === 2) pin.analogVoltage = state.breadboard.lightSensorLdr.voltage;
      }
      pin.digitalState = pin.analogVoltage >= 2.5;
    } else if (pin.port === 'D') {
      const bit = pin.bitIndex;
      const isOut = (state.registers.DDRD & (1 << bit)) !== 0;
      pin.direction = isOut ? 'OUTPUT' : 'INPUT_PULLUP';
      pin.digitalState = isOut
        ? (state.registers.PORTD & (1 << bit)) !== 0
        : (state.registers.PIND & (1 << bit)) !== 0;
      pin.analogVoltage = pin.digitalState ? 5.0 : 0.0;

      // PWM on PD6 (OC0A - Red LED), PD5 (OC0B - Green LED), PD3 (OC2B - Blue LED)
      if (bit === 6) pin.pwmDuty = state.registers.OCR0A;
      else if (bit === 5) pin.pwmDuty = state.registers.OCR0B;
      else if (bit === 3) pin.pwmDuty = state.registers.OCR2B;
    }
  });

  // RGB LED Duties
  state.breadboard.rgbLed.rDuty = state.registers.OCR0A;
  state.breadboard.rgbLed.gDuty = state.registers.OCR0B;
  state.breadboard.rgbLed.bDuty = state.registers.OCR2B;

  // Update ADC Conversion Value
  const channel = state.registers.ADMUX & 0x07;
  state.registers.adcChannel = channel;
  if (channel === 0) {
    state.registers.adcValue = state.breadboard.potentiometer.value;
  } else if (channel === 1) {
    state.registers.adcValue = Math.round((state.breadboard.tempSensor.voltage / 5.0) * 1023);
  } else if (channel === 2) {
    state.registers.adcValue = Math.round((state.breadboard.lightSensorLdr.voltage / 5.0) * 1023);
  }
  state.registers.ADCL = state.registers.adcValue & 0xff;
  state.registers.ADCH = (state.registers.adcValue >> 8) & 0x03;

  // Update Logic Analyzer Sampling
  state.logicChannels.forEach((ch) => {
    let currentVal = 0;
    if (ch.pin === 'PB5') currentVal = state.breadboard.ledPin13 ? 1 : 0;
    else if (ch.pin === 'PD3') currentVal = (state.registers.OCR2B / 255);
    else if (ch.pin === 'PD2') currentVal = state.breadboard.button1.isPressed ? 0 : 1;
    else if (ch.pin === 'PD1') currentVal = (state.registers.PORTD & 0x02) ? 1 : 0;
    
    ch.history.push(currentVal);
    if (ch.history.length > 80) ch.history.shift();
  });

  // Advance DS3231 RTC seconds occasionally during execution
  if (state.cycleCount % 20 === 0) {
    state.breadboard.ds3231.seconds = (state.breadboard.ds3231.seconds + 1) % 60;
    if (state.breadboard.ds3231.seconds === 0) {
      state.breadboard.ds3231.minutes = (state.breadboard.ds3231.minutes + 1) % 60;
      if (state.breadboard.ds3231.minutes === 0) {
        state.breadboard.ds3231.hours = (state.breadboard.ds3231.hours + 1) % 24;
      }
    }
  }

  // Update Serial Plotter with live values
  if (state.cycleCount % 5 === 0) {
    const pt = {
      time: state.cycleCount,
      val1: state.breadboard.potentiometer.value,
      val2: Math.round(state.breadboard.ds18b20.celsius * 10),
      val3: state.breadboard.lightSensorLdr.lux,
    };
    state.serialPlotData.push(pt);
    if (state.serialPlotData.length > 50) state.serialPlotData.shift();
  }
}

// Helper Functions
function parseValue(str: string): number {
  if (!str) return 0;
  if (str.startsWith('0x') || str.startsWith('0X')) return parseInt(str.substring(2), 16) || 0;
  if (str.startsWith('0b') || str.startsWith('0B')) return parseInt(str.substring(2), 2) || 0;
  if (str.startsWith('$')) return parseInt(str.substring(1), 16) || 0;
  return parseInt(str, 10) || 0;
}

function findLabelIndex(flash: string[], label: string): number {
  const cleanLabel = label.trim().replace(':', '').toUpperCase();
  for (let i = 0; i < flash.length; i++) {
    const line = flash[i].trim();
    if (line.toUpperCase().startsWith(cleanLabel + ':') || line.toUpperCase() === cleanLabel + ':') {
      return i;
    }
  }
  return 0;
}

function updateSregFlags(state: McuState, rawResult: number, u8Result: number): void {
  state.registers.sreg.Z = u8Result === 0;
  state.registers.sreg.N = (u8Result & 0x80) !== 0;
  state.registers.sreg.C = rawResult > 255 || rawResult < 0;
  state.registers.sreg.V = rawResult > 127 || rawResult < -128;
  state.registers.sreg.S = state.registers.sreg.N !== state.registers.sreg.V;
}

function applyArduinoDigitalWrite(state: McuState, pin: number, high: boolean): void {
  if (pin >= 8 && pin <= 13) {
    const bit = pin - 8;
    state.registers.DDRB |= (1 << bit);
    if (high) state.registers.PORTB |= (1 << bit);
    else state.registers.PORTB &= ~(1 << bit);
  } else if (pin >= 0 && pin <= 7) {
    state.registers.DDRD |= (1 << pin);
    if (high) state.registers.PORTD |= (1 << pin);
    else state.registers.PORTD &= ~(1 << pin);
  }
}

function applyArduinoAnalogWrite(state: McuState, pin: number, duty: number): void {
  duty = Math.min(255, Math.max(0, duty));
  if (pin === 6) { // PD6 / OC0A
    state.registers.DDRD |= (1 << 6);
    state.registers.OCR0A = duty;
  } else if (pin === 5) { // PD5 / OC0B
    state.registers.DDRD |= (1 << 5);
    state.registers.OCR0B = duty;
  } else if (pin === 3) { // PD3 / OC2B
    state.registers.DDRD |= (1 << 3);
    state.registers.OCR2B = duty;
  } else if (pin === 9) { // PB1 / OC1A
    state.registers.DDRB |= (1 << 1);
    state.registers.OCR1A = duty;
  }
}

function appendSerialTx(state: McuState, text: string): void {
  const lastLog = state.serialLogs[state.serialLogs.length - 1];
  if (lastLog && lastLog.type === 'TX' && !lastLog.text.endsWith('\n')) {
    lastLog.text += text;
  } else {
    state.serialLogs.push({
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: 'TX',
      text: text,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
  if (state.serialLogs.length > 100) state.serialLogs.shift();
}
