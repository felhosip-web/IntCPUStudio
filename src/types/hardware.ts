export type CpuCoreType = 'EDU8' | 'MOS6502' | 'Z80' | 'SAP1' | 'HARVARD8';

export interface CpuCoreInfo {
  type: CpuCoreType;
  name: string;
  nameHu: string;
  shortDesc: string;
  shortDescHu: string;
  architecture: 'VON_NEUMANN' | 'HARVARD';
  isaType: 'CISC' | 'RISC' | 'ACCUMULATOR';
  dataBusWidth: number; // 8 bits
  addressBusWidth: number; // 8 or 16 bits
  registers: string[];
  flags: string[];
  maxMemory: number;
  featuresHu: string[];
  featuresEn: string[];
  suitableForHu: string;
  suitableForEn: string;
}

export interface CpuCoreConfig {
  coreType: CpuCoreType;
  addressBusBits: 8 | 16;
  allowZeroPage: boolean;
  interruptsEnabled: boolean;
  busGrantSupported: boolean;
  stackSize: number; // 16, 64, or 256 bytes
  clockPrescaler: number;
}

export interface HardwarePortMapping {
  port: number;
  device: string;
  deviceHu: string;
  direction: 'IN' | 'OUT' | 'IN_OUT';
  descriptionHu: string;
  descriptionEn: string;
}

export interface TimerRtcState {
  enabled: boolean;
  counter: number; // 16-bit
  reloadValue: number;
  prescaler: number; // 1, 8, 64, 256
  interruptOnOverflow: boolean;
  irqPending: boolean;
  realTimeSeconds: number;
  ticks: number;
}

export interface AudioPsgState {
  enabled: boolean;
  channel1Freq: number; // Hz
  channel1Wave: 'SQUARE' | 'TRIANGLE' | 'SAWTOOTH' | 'NOISE';
  channel1Vol: number; // 0-15
  channel2Freq: number;
  channel2Wave: 'SQUARE' | 'TRIANGLE' | 'SAWTOOTH' | 'NOISE';
  channel2Vol: number;
  noiseFreq: number;
  masterVolume: number; // 0-100
  lastPlayedTime: number;
}

export interface UartState {
  enabled: boolean;
  baudRate: number; // 300, 1200, 9600, 115200
  loopback: boolean;
  txBuffer: number[];
  rxBuffer: number[];
  txBusy: boolean;
  rxReady: boolean;
  dataBits: 8;
  parity: 'NONE' | 'EVEN' | 'ODD';
  historyLog: string[];
}

export interface PicInterruptLine {
  irq: number; // 0-3
  source: string;
  sourceHu: string;
  vectorAddress: number;
  priority: number;
  isMasked: boolean;
  isPending: boolean;
  isActive: boolean;
}

export interface PicState {
  enabled: boolean;
  masterMask: boolean;
  inServiceRegister: number; // ISR bitmask
  interruptRequestRegister: number; // IRR bitmask
  interruptMaskRegister: number; // IMR bitmask
  lines: PicInterruptLine[];
}

export interface MathCoprocessorState {
  enabled: boolean;
  operandA: number; // 8-bit
  operandB: number; // 8-bit
  resultProduct: number; // 16-bit
  resultQuotient: number; // 8-bit
  resultRemainder: number; // 8-bit
  operation: 'MUL' | 'DIV' | 'MAC' | 'SQRT';
  accumulator16: number; // 16-bit MAC accumulator
  cycleCost: number;
}

export interface DmaChannel {
  channelId: number;
  enabled: boolean;
  sourceAddress: number;
  destAddress: number;
  transferLength: number;
  transferredBytes: number;
  direction: 'MEM_TO_MEM' | 'IO_TO_MEM' | 'MEM_TO_IO';
  port: number;
  isBusy: boolean;
  autoIncrement: boolean;
}

export interface DmaState {
  enabled: boolean;
  isBusMaster: boolean;
  channels: DmaChannel[];
  lastTransferTime: number;
}

export interface HardwareSetupConfig {
  coreConfig: CpuCoreConfig;
  portMappings: Record<number, string>; // port number -> device identifier
  memoryProtection: {
    romStart: number;
    romEnd: number;
    isRomProtected: boolean;
  };
  customModules: string[];
}

export interface HardwareConflict {
  id: string;
  severity: 'WARNING' | 'INCOMPATIBLE' | 'ERROR';
  titleHu: string;
  titleEn: string;
  descriptionHu: string;
  descriptionEn: string;
  affectedComponents: string[];
  suggestedFix?: {
    actionLabelHu: string;
    actionLabelEn: string;
    descriptionHu: string;
    descriptionEn: string;
    apply: () => void;
  };
}
