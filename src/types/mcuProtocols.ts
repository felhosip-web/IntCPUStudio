export type ProtocolType =
  | 'ONE_WIRE'
  | 'I2C'
  | 'SPI'
  | 'CAN'
  | 'RS485'
  | 'RS422'
  | 'RS232';

export interface ProtocolSignalSample {
  name: string; // e.g. "SCL", "SDA", "MOSI", "CAN_H", "CAN_L", "A (+)", "B (-)", "TXD"
  level: number; // 0, 1, or analog float voltage (e.g. 2.5V, 3.5V, +12V, -12V)
  stateDescription?: string; // "High-Z (Pull-up)", "Driven Low (ACK)", "Dominant", "Recessive"
  color?: string;
}

export interface ProtocolStep {
  stepIndex: number;
  timeUs: number; // Time in microseconds
  phaseName: string; // e.g. "START Condition", "Address Bit 6 (0)", "Slave ACK", "Data Byte 0x44", "CRC Check"
  phaseNameHu: string;
  category: 'START' | 'ADDRESS' | 'READ_WRITE' | 'ACK' | 'DATA' | 'CRC' | 'STOP' | 'IDLE' | 'ARBITRATION' | 'RESET' | 'PRESENCE' | 'STUFFING';
  signals: Record<string, number>; // key = signal name, value = logic/voltage level
  busVoltages?: Record<string, number>; // Actual analog voltages e.g. { "CAN_H": 3.5, "CAN_L": 1.5, "Diff": 2.0 }
  explanation: string;
  explanationHu: string;
  masterAction: string;
  masterActionHu: string;
  slaveAction: string;
  slaveActionHu: string;
  activeBytes?: {
    txByte?: number;
    rxByte?: number;
    bitIndex?: number;
    byteName?: string;
  };
  highlightNode?: 'MASTER' | 'SLAVE_1' | 'SLAVE_2' | 'BUS' | 'TRANSCEIVER';
}

export interface ProtocolPreset {
  id: string;
  title: string;
  titleHu: string;
  description: string;
  descriptionHu: string;
  defaultPayload: string;
  addressHex?: string;
  steps: ProtocolStep[];
  baudRateKbps: number;
}

export interface ProtocolSpec {
  id: ProtocolType;
  name: string;
  nameHu: string;
  shortDescription: string;
  shortDescriptionHu: string;
  inventor: string;
  year: number;
  physicalLines: string[];
  topology: 'Single-Ended Master-Slave' | 'Open-Drain Multi-Master' | 'Full-Duplex Master-Slave' | 'Differential Multi-Master' | 'Differential Half-Duplex' | 'Differential Full-Duplex' | 'Single-Ended Bipolar Point-to-Point';
  topologyHu: string;
  signalingType: 'Single-Ended Open-Drain (Pull-Up)' | 'Single-Ended CMOS / TTL' | 'Differential Voltage (CAN_H - CAN_L)' | 'Differential Voltage (A - B)' | 'Single-Ended Inverted Bipolar (±12V)';
  signalingTypeHu: string;
  wireCount: number;
  maxSpeed: string;
  maxDistance: string;
  duplexMode: 'Half-Duplex' | 'Full-Duplex' | 'Simplex';
  multiMaster: boolean;
  typicalTransceiver: string;
  typicalApplications: string[];
  typicalApplicationsHu: string[];
  color: string;
  presets: ProtocolPreset[];
}
