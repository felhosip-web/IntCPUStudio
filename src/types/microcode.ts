export type MicroStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type HardwareControlSignal =
  // Bus & PC
  | 'PC_OUT'
  | 'PC_INC'
  | 'PC_LD'
  | 'MAR_IN'
  | 'MEM_RD'
  | 'MEM_WR'
  | 'MBR_IN'
  | 'MBR_OUT'
  | 'IR_IN'
  // General Registers
  | 'REG_A_IN'
  | 'REG_A_OUT'
  | 'REG_B_IN'
  | 'REG_B_OUT'
  | 'REG_C_IN'
  | 'REG_C_OUT'
  | 'REG_D_IN'
  | 'REG_D_OUT'
  // ALU Unit
  | 'ALU_ADD'
  | 'ALU_SUB'
  | 'ALU_AND'
  | 'ALU_OR'
  | 'ALU_XOR'
  | 'ALU_NOT'
  | 'ALU_SHL'
  | 'ALU_SHR'
  | 'ALU_CMP'
  | 'ALU_OUT'
  | 'FLAGS_EN'
  // Stack
  | 'SP_INC'
  | 'SP_DEC'
  | 'SP_OUT'
  // I/O & Misc
  | 'IO_RD'
  | 'IO_WR'
  | 'HLT'
  | 'STEP_RST';

export interface ControlSignalMeta {
  id: HardwareControlSignal;
  name: string;
  category: 'BUS' | 'REGISTERS' | 'ALU' | 'STACK' | 'IO_CTRL';
  descriptionHu: string;
  descriptionEn: string;
  color: string;
}

export interface MicroInstructionStep {
  step: MicroStepIndex;
  stepNameHu: string;
  stepNameEn: string;
  activeSignals: HardwareControlSignal[];
  descriptionHu: string;
  descriptionEn: string;
}

export interface OpcodeMicrocodeEntry {
  opcode: number; // e.g. 0x01
  mnemonic: string; // e.g. "ADD A, B"
  isStandard: boolean;
  isCustom: boolean;
  category: 'ARITHMETIC' | 'DATA_TRANSFER' | 'LOGIC' | 'BRANCH' | 'STACK' | 'IO' | 'CUSTOM';
  operandsDesc: string;
  steps: MicroInstructionStep[];
}

export interface CustomInstructionDraft {
  mnemonic: string;
  opcode: number;
  operandsType: 'NONE' | 'REG_REG' | 'REG_IMM' | 'REG_MEM' | 'SINGLE_REG';
  category: 'ARITHMETIC' | 'LOGIC' | 'DATA_TRANSFER' | 'CUSTOM';
  descriptionHu: string;
  descriptionEn: string;
  steps: {
    step: MicroStepIndex;
    activeSignals: HardwareControlSignal[];
    noteHu: string;
    noteEn: string;
  }[];
}

export interface MicrocodeSimulationState {
  selectedOpcode: number;
  currentStep: MicroStepIndex;
  activeSignals: HardwareControlSignal[];
  registers: {
    A: number;
    B: number;
    C: number;
    D: number;
    PC: number;
    SP: number;
    MAR: number;
    MBR: number;
    IR: number;
    FLAGS: { Z: boolean; C: boolean; N: boolean; V: boolean };
  };
  memory: Uint8Array;
  busData: number;
  busAddress: number;
  isSimulating: boolean;
}
