export type McuModel = 'ATmega328p' | '8051' | 'PIC16F84';

export type PinDirection = 'INPUT' | 'INPUT_PULLUP' | 'OUTPUT';

export interface McuPin {
  pinNumber: number;
  name: string; // e.g. "PB5 (D13 / SCK)", "PC0 (A0)", "PD2 (INT0)"
  port: 'B' | 'C' | 'D' | 'VCC' | 'GND' | 'AREF' | 'RESET' | 'XTAL';
  bitIndex: number;
  direction: PinDirection;
  digitalState: boolean;
  analogVoltage: number; // 0.0 to 5.0 V
  isPwmCapable: boolean;
  pwmDuty: number; // 0 to 255
  specialFunctions: string[];
}

export interface McuRegisters {
  // General Purpose Registers (R0 - R31 for AVR)
  r: number[]; // Uint8Array 32 elements
  
  // Status Register (SREG: I T H S V N Z C)
  sreg: {
    I: boolean; // Global Interrupt Enable
    T: boolean; // Bit Copy Storage
    H: boolean; // Half Carry
    S: boolean; // Sign Bit (N ⊕ V)
    V: boolean; // Two's Complement Overflow
    N: boolean; // Negative
    Z: boolean; // Zero
    C: boolean; // Carry
  };

  // Pointers & Program Counters
  pc: number; // Program Counter (word or byte address)
  sp: number; // Stack Pointer (16-bit)
  x: number;  // R27:R26
  y: number;  // R29:R28
  z: number;  // R31:R30

  // I/O Registers (ATmega328p mapping)
  // Port B
  PINB: number;
  DDRB: number;
  PORTB: number;

  // Port C
  PINC: number;
  DDRC: number;
  PORTC: number;

  // Port D
  PIND: number;
  DDRD: number;
  PORTD: number;

  // 10-bit ADC Registers
  ADMUX: number;  // REFS1, REFS0, ADLAR, MUX3..MUX0
  ADCSRA: number; // ADEN, ADSC, ADATE, ADIF, ADIE, ADPS2..ADPS0
  ADCSRB: number;
  ADCL: number;
  ADCH: number;
  adcValue: number; // Combined 10-bit value (0..1023)
  adcChannel: number; // 0..7

  // Timer/Counter 0 (8-bit)
  TCCR0A: number;
  TCCR0B: number;
  TCNT0: number;
  OCR0A: number;
  OCR0B: number;

  // Timer/Counter 1 (16-bit)
  TCCR1A: number;
  TCCR1B: number;
  TCNT1: number;
  OCR1A: number;
  OCR1B: number;
  ICR1: number;

  // Timer/Counter 2 (8-bit)
  TCCR2A: number;
  TCCR2B: number;
  TCNT2: number;
  OCR2A: number;
  OCR2B: number;

  // USART0
  UCSR0A: number;
  UCSR0B: number;
  UCSR0C: number;
  UBRR0: number;
  UDR0: number;

  // External Interrupts
  EICRA: number;
  EIMSK: number;
  EIFR: number;

  // Watchdog
  WDTCSR: number;
  watchdogCounter: number;

  // EEPROM
  EEAR: number;
  EEDR: number;
  EECR: number;

  // Sleep & Power
  SMCR: number;
  sleepMode: 'IDLE' | 'ADC_NR' | 'POWER_DOWN' | 'POWER_SAVE' | 'STANDBY' | 'NONE';
}

export interface Ds18b20State {
  celsius: number; // -55 to 125 °C
  resolutionBits: 9 | 10 | 11 | 12;
  romCode: string; // "28-FF-4A-12-88-16-04-A1"
  alarmHigh: number;
  alarmLow: number;
  isConverting: boolean;
  pin: string; // "PD4" (D4)
}

export interface Ds3231RtcState {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  hours: number;
  minutes: number;
  seconds: number;
  temperature: number; // 24.5 °C internal TCXO sensor
  batteryVolts: number; // 3.15 V CR2032
  sqwFrequency: '1Hz' | '1024Hz' | '4096Hz' | '8192Hz' | 'OFF';
  alarm1: { hours: number; minutes: number; enabled: boolean; triggered: boolean };
  i2cAddress: string; // "0x68"
}

export interface RotaryEncoderState {
  position: number; // -1000 to +1000
  lastDirection: 'CW' | 'CCW' | 'NONE';
  pinA: string; // "PD2" (INT0)
  pinB: string; // "PD4"
  pinSw: string; // "PD7"
  isSwPressed: boolean;
  stepsPerDetent: number;
  phaseA: boolean;
  phaseB: boolean;
}

export interface Nrf24State {
  channel: number; // 0..125 (e.g. 76 -> 2.476 GHz)
  payloadSize: number; // 1..32 bytes
  powerDbm: 0 | -6 | -12 | -18;
  dataRate: '250kbps' | '1Mbps' | '2Mbps';
  txAddress: string; // "0xE8E8F0F0E1"
  rxAddress: string; // "0xE8E8F0F0E1"
  cePin: string; // "PB0" (D8)
  csnPin: string; // "PB2" (D10)
  irqPin: string; // "PD2" (D2 / INT0)
  lastTxPayload: string;
  lastRxPayload: string;
  packetsSent: number;
  packetsReceived: number;
  lastAckReceived: boolean;
  isTransmitting: boolean;
  packetLossRate: number; // 0..100%
}

export type McuHardwareModuleId =
  | 'basic_sensors'
  | 'rgb_servo_lcd'
  | 'ds18b20'
  | 'ds3231_rtc'
  | 'rotary_encoder'
  | 'nrf24l01';

export interface McuHardwareModuleMeta {
  id: McuHardwareModuleId;
  name: string;
  nameHu: string;
  category: 'Sensors' | 'Clocks' | 'Inputs' | 'Wireless' | 'Displays';
  categoryHu: 'Szenzorok' | 'Órák' | 'Bemenetek' | 'Vezeték nélküli' | 'Kijelzők';
  description: string;
  descriptionHu: string;
  interfaceType: '1-Wire' | 'I2C' | 'SPI' | 'GPIO' | 'ADC' | 'PWM';
  connectedPins: string[];
  color: string;
}

export interface BreadboardState {
  // Enabled dynamic modular hardware
  activeModules: McuHardwareModuleId[];

  // Sensors
  potentiometer: {
    voltage: number; // 0.0 to 5.0
    value: number;   // 0 to 1023
    targetPin: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
  };
  tempSensor: {
    celsius: number; // -20 to 100 °C
    voltage: number; // 0.0 to 5.0
    targetPin: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
  };
  lightSensorLdr: {
    lux: number;     // 0 to 1000 lux
    voltage: number; // 0.0 to 5.0
    targetPin: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
  };

  // Modular Peripherals
  ds18b20: Ds18b20State;
  ds3231: Ds3231RtcState;
  rotaryEncoder: RotaryEncoderState;
  nrf24: Nrf24State;

  // Actuators & Outputs
  ledPin13: boolean; // Onboard LED connected to PB5
  rgbLed: {
    rPin: string;
    gPin: string;
    bPin: string;
    rDuty: number;
    gDuty: number;
    bDuty: number;
  };
  servoMotor: {
    angle: number; // 0 to 180 degrees
    pin: string;
  };
  buzzer: {
    enabled: boolean;
    frequency: number;
    pin: string;
  };
  lcd16x2: {
    lines: [string, string];
    cursorRow: number;
    cursorCol: number;
    backlight: boolean;
  };

  // Inputs
  button1: {
    isPressed: boolean;
    pin: 'PD2'; // INT0
  };
  button2: {
    isPressed: boolean;
    pin: 'PD7';
  };
  dipSwitches: boolean[]; // 4 switches for PB0..PB3
}

export interface LogicChannel {
  name: string;
  pin: string;
  history: number[]; // 0, 1 or duty cycle (0..1)
  color: string;
}

export interface SerialMessage {
  id: string;
  type: 'TX' | 'RX' | 'SYS';
  text: string;
  timestamp: string;
}

export interface SerialPlotPoint {
  time: number;
  val1: number;
  val2?: number;
  val3?: number;
}

export interface McuSampleProgram {
  id: string;
  title: string;
  titleHu: string;
  category: 'Basics' | 'Sensors' | 'Actuators' | 'Interrupts' | 'Communication' | 'Advanced';
  categoryHu: 'Alapok' | 'Szenzorok' | 'Beavatkozók' | 'Megszakítások' | 'Kommunikáció' | 'Haladó';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  descriptionHu: string;
  code: string;
  language: 'AVR-ASM' | 'ARDUINO-C';
}

export interface McuState {
  mcuModel: McuModel;
  clockHz: number;
  isRunning: boolean;
  isHalted: boolean;
  cycleCount: number;
  instructionCount: number;
  
  registers: McuRegisters;
  pins: McuPin[];
  flashMemory: string[]; // Assembly lines or tokens
  sram: Uint8Array;      // 2048 bytes
  eeprom: Uint8Array;    // 1024 bytes

  breadboard: BreadboardState;
  
  // Logic Analyzer
  logicChannels: LogicChannel[];
  
  // Serial Console & Plotter
  serialLogs: SerialMessage[];
  serialPlotData: SerialPlotPoint[];
  rxBuffer: string;

  // Diagnostics & Status
  currentInstructionName: string;
  currentExplanation: string;
  currentExplanationHu: string;
  lastResetCause: 'POWER_ON' | 'EXTERNAL_RESET' | 'WATCHDOG' | 'BROWN_OUT';
}

export interface McuStackItem {
  address: number;
  offset: number; // 0 for top of stack, 1, 2...
  value: number;
  type: 'RET_ADDR_LOW' | 'RET_ADDR_HIGH' | 'PUSH_REG' | 'SAVED_SREG' | 'LOCAL_VAR' | 'INTERRUPT_FRAME' | 'DATA';
  label: string;
  description: string;
  descriptionHu: string;
}

export interface McuInterruptVector {
  vectorNum: number;
  address: string;
  symbol: string;
  name: string;
  nameHu: string;
  source: string;
  trigger: string;
  triggerHu: string;
  priority: number;
  maskRegister: string;
  maskBit: string;
  flagRegister: string;
  flagBit: string;
  category: 'EXTERNAL' | 'TIMER' | 'ANALOG' | 'COMMUNICATION' | 'SYSTEM';
  description: string;
  descriptionHu: string;
  exampleCode: string;
}

export interface CodeSyncLineMapping {
  cLineIndex: number;
  cCode: string;
  asmLineIndices: number[];
  asmCodes: string[];
  explanation: string;
  explanationHu: string;
}
