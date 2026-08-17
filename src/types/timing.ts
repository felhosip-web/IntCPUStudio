import { MicroStepPhase } from './cpu';

export type BusCycleClassification =
  | 'FETCH'     // M1 Opcode Fetch (M1=1, MREQ=1, RD=1)
  | 'MEM_RD'    // Memory Read (MREQ=1, RD=1, WR=0)
  | 'MEM_WR'    // Memory Write (MREQ=1, WR=1, RD=0)
  | 'IO_RD'     // I/O Port Read (IORQ=1, RD=1)
  | 'IO_WR'     // I/O Port Write (IORQ=1, WR=1)
  | 'INT_ACK'   // Interrupt Acknowledge (IORQ=1, M1=1)
  | 'DMA_XFER'  // DMA autonomous bus transfer
  | 'IDLE';     // Internal computation / ALU execution

export interface TimingSample {
  cycle: number;              // Monotonic clock cycle index (e.g. 1, 2, 3...)
  timestamp: number;          // Wall-clock ms
  instructionName: string;    // e.g. "LDA", "ADD", "OUT", "NOP"
  microStep: MicroStepPhase;  // FETCH_MAR, FETCH_IR, DECODE, EXECUTE_OPERANDS, EXECUTE_ALU, WRITEBACK
  microStepIndex: number;     // 0..5 (T1..T6)

  // Individual Hardware Digital Control Signals (true = logically asserted)
  clk: boolean;               // Master Clock phase (1=High, 0=Low)
  mreq: boolean;              // Memory Request (/MREQ)
  iorq: boolean;              // I/O Request (/IORQ)
  rd: boolean;                // Read Strobe (/RD)
  wr: boolean;                // Write Strobe (/WR)
  m1: boolean;                // Opcode Fetch Machine Cycle 1 (/M1)
  ale: boolean;               // Address Latch Enable (ALE)
  wait: boolean;              // Wait-state injection (/WAIT)
  busreq: boolean;            // DMA Bus Request / Grant (/BUSREQ)
  int: boolean;               // Interrupt Request (/INT or /IRQ)
  aluActive: boolean;         // ALU computing state

  // Multi-bit buses
  addressBus: number;         // 8-bit or 16-bit address
  dataBus: number;            // 8-bit data value
  isDataBusTriStated: boolean;// True if data bus is floating/tri-stated (Hi-Z)

  // High-level protocol decoding
  busCycleType: BusCycleClassification;
  activeSource: string;
  activeDestination: string;
  explanation: string;
  explanationHu: string;
}

export type TimingChannelId =
  | 'CLK'
  | 'MREQ'
  | 'IORQ'
  | 'RD'
  | 'WR'
  | 'M1'
  | 'ALE'
  | 'WAIT'
  | 'BUSREQ'
  | 'INT'
  | 'ALU_ACT'
  | 'ADDR_BUS'
  | 'DATA_BUS';

export interface LogicAnalyzerChannel {
  id: TimingChannelId;
  label: string;
  activeLowLabel: string;
  color: string;
  type: 'DIGITAL' | 'BUS';
  category: 'CONTROL' | 'BUS' | 'SYSTEM';
  visible: boolean;
  descriptionEn: string;
  descriptionHu: string;
}

export type TimingTriggerType =
  | 'FREE_RUN'
  | 'MEM_RD'
  | 'MEM_WR'
  | 'IO_RD'
  | 'IO_WR'
  | 'M1_FETCH'
  | 'INTERRUPT'
  | 'ADDR_MATCH'
  | 'DATA_MATCH';

export interface TimingTriggerConfig {
  type: TimingTriggerType;
  enabled: boolean;
  targetAddress: number;
  targetData: number;
  hasTriggered: boolean;
  triggeredCycleIndex?: number;
}

export interface TimingPresetTrace {
  id: string;
  titleEn: string;
  titleHu: string;
  descriptionEn: string;
  descriptionHu: string;
  targetCore: string;
  samples: TimingSample[];
}
