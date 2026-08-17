export type BridgeProtocol =
  | 'I2C'
  | 'SPI'
  | 'UART'
  | 'RS485'
  | 'CAN'
  | 'NRF24';

export interface BridgeWire {
  id: string;
  name: string; // e.g. "SCL (A5)", "SDA (A4)", "MOSI (D11)", "TX -> RX", "CAN_H"
  pinMcuA: string;
  pinMcuB: string;
  logicA: number; // 0 or 1
  logicB: number; // 0 or 1
  busVoltage: number; // e.g. 5.0, 3.5, 1.5, 0.0, -12.0
  active: boolean;
  color: string;
  description: string;
  descriptionHu: string;
}

export interface BridgeNodePeripherals {
  // Inputs (MCU A typically controller, or B can have too)
  potentiometer: number; // 0..1023 (analog value)
  button1: boolean;      // push button state
  button2: boolean;
  sliderVal: number;     // 0..255 (e.g. setpoint, speed)
  sensorTemp: number;    // -20..85 °C
  sensorLux: number;     // 0..1000 lux
  gyroX: number;         // -90..+90 deg tilt

  // Outputs (Actuators, Displays)
  ledD13: boolean;
  rgbColor: { r: number; g: number; b: number };
  servoAngle: number;    // 0..180 deg
  stepperSteps: number;  // 0..1000 pos
  buzzerTone: number;    // 0 = off, 440 = A4, etc.
  lcdText: [string, string];
  oledLines: [string, string, string, string];
  relayActive: boolean;
}

export interface BridgeNodeState {
  id: 'MCU_A' | 'MCU_B';
  role: 'MASTER' | 'SLAVE' | 'PEER';
  name: string;
  nameHu: string;
  model: 'ATmega328p' | '8051' | 'PIC16F84';
  clockHz: number;
  isRunning: boolean;
  pc: number;
  code: string;
  flashMemory: string[];
  
  // High-level simulated variables / registers
  registers: {
    r0: number;
    r16: number;
    r17: number;
    r18: number;
    r24: number;
    r25: number;
    portB: number;
    portC: number;
    portD: number;
  };

  peripherals: BridgeNodePeripherals;

  // Communication I/O Buffers
  txBuffer: number[];
  rxBuffer: number[];
  lastTxMsg: string;
  lastRxMsg: string;
  packetsSent: number;
  packetsReceived: number;
  lastPacketTime: string;
  statusMessage: string;
  statusMessageHu: string;
}

export interface BridgeTrafficPacket {
  id: string;
  timestamp: string;
  protocol: BridgeProtocol;
  source: 'MCU_A' | 'MCU_B';
  target: 'MCU_A' | 'MCU_B' | 'BROADCAST';
  rawBytes: number[];
  hexDump: string;
  decodedMessage: string;
  dissection: {
    address?: string;
    command?: string;
    payload?: string;
    crc?: string;
    ack?: boolean;
    status: 'OK' | 'CRC_ERROR' | 'NACK' | 'TIMEOUT' | 'COLLISION' | 'NOISE';
  };
}

export interface BridgeFaultInjection {
  noiseEnabled: boolean;
  noiseLevelPercent: number; // 0..100%
  disconnectedWires: Record<string, boolean>; // wire id -> boolean
  forceBitFlip: boolean;
  forceNack: boolean;
  packetDropRate: number; // 0..100%
  rfDistanceMeters: number; // for nRF24 (0.5 to 100m)
  rs485Terminated: boolean; // 120 ohm
}

export interface BridgeScenarioPreset {
  id: string;
  protocol: BridgeProtocol;
  title: string;
  titleHu: string;
  subtitle: string;
  subtitleHu: string;
  description: string;
  descriptionHu: string;
  codeMcuA: string;
  codeMcuB: string;
  initialA?: Partial<BridgeNodePeripherals>;
  initialB?: Partial<BridgeNodePeripherals>;
  baudRateOrSpeed: string;
  category: 'Telemetry' | 'Industrial' | 'Automotive' | 'Wireless' | 'Sensors';
  categoryHu: string;
}

export interface DualMcuBridgeState {
  protocol: BridgeProtocol;
  isSyncRunning: boolean;
  masterClockHz: number;
  stepCount: number;
  cycleTimeMs: number;

  mcuA: BridgeNodeState;
  mcuB: BridgeNodeState;

  wires: BridgeWire[];
  trafficHistory: BridgeTrafficPacket[];
  faults: BridgeFaultInjection;

  // Real-time bus metrics
  busUtilizationPercent: number;
  currentBps: number;
  errorCount: number;
  lastExchangeSummary: string;
  lastExchangeSummaryHu: string;
}
