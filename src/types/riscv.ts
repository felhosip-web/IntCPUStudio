export type RiscvRegisterName =
  | 'x0' | 'x1' | 'x2' | 'x3' | 'x4' | 'x5' | 'x6' | 'x7'
  | 'x8' | 'x9' | 'x10' | 'x11' | 'x12' | 'x13' | 'x14' | 'x15'
  | 'x16' | 'x17' | 'x18' | 'x19' | 'x20' | 'x21' | 'x22' | 'x23'
  | 'x24' | 'x25' | 'x26' | 'x27' | 'x28' | 'x29' | 'x30' | 'x31';

export type RiscvAbiName =
  | 'zero' | 'ra' | 'sp' | 'gp' | 'tp' | 't0' | 't1' | 't2'
  | 's0/fp' | 's1' | 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5'
  | 'a6' | 'a7' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7'
  | 's8' | 's9' | 's10' | 's11' | 't3' | 't4' | 't5' | 't6';

export interface RiscvRegisterInfo {
  index: number;
  name: RiscvRegisterName;
  abi: RiscvAbiName;
  value: number; // 32-bit unsigned
  descriptionHu: string;
  descriptionEn: string;
}

export type RiscvInstructionType = 'R' | 'I' | 'S' | 'B' | 'U' | 'J';

export interface RiscvInstruction {
  address: number;
  raw: number; // 32-bit machine code
  mnemonic: string;
  operands: string;
  type: RiscvInstructionType;
  rd?: number;
  rs1?: number;
  rs2?: number;
  imm?: number;
  funct3?: number;
  funct7?: number;
  opcode: number;
  comment?: string;
}

export interface IfStageState {
  pc: number;
  nextPc: number;
  instruction: RiscvInstruction | null;
  isStalled: boolean;
  isFlushed: boolean;
}

export interface IdStageState {
  pc: number;
  instruction: RiscvInstruction | null;
  rs1Val: number;
  rs2Val: number;
  immVal: number;
  isStalled: boolean;
  isFlushed: boolean;
}

export interface ExStageState {
  pc: number;
  instruction: RiscvInstruction | null;
  aluResult: number;
  branchTaken: boolean;
  branchTarget: number;
  forwardA: 'NONE' | 'EX_MEM' | 'MEM_WB';
  forwardB: 'NONE' | 'EX_MEM' | 'MEM_WB';
  forwardValA: number;
  forwardValB: number;
  isStalled: boolean;
  isFlushed: boolean;
}

export interface MemStageState {
  pc: number;
  instruction: RiscvInstruction | null;
  aluResult: number;
  readData: number;
  writeData: number;
  memRead: boolean;
  memWrite: boolean;
}

export interface WbStageState {
  pc: number;
  instruction: RiscvInstruction | null;
  destReg: number;
  destVal: number;
  regWrite: boolean;
}

export interface PipelineHazardState {
  dataHazardDetected: boolean;
  hazardRegister?: number;
  hazardSource?: 'EX_MEM' | 'MEM_WB';
  loadUseHazard: boolean;
  controlHazard: boolean;
  branchMispredicted: boolean;
  forwardAppliedA: boolean;
  forwardAppliedB: boolean;
  descriptionHu: string;
  descriptionEn: string;
}

export interface PipelineCycleRecord {
  cycle: number;
  ifInst: string;
  idInst: string;
  exInst: string;
  memInst: string;
  wbInst: string;
}

export interface RiscvPipelineState {
  cycle: number;
  pc: number;
  registers: number[]; // 32 registers
  memory: Uint32Array; // Word-addressed or byte-addressed RAM
  ifStage: IfStageState;
  idStage: IdStageState;
  exStage: ExStageState;
  memStage: MemStageState;
  wbStage: WbStageState;
  hazard: PipelineHazardState;
  enableForwarding: boolean;
  enableBranchPrediction: boolean;
  history: PipelineCycleRecord[];
  instructionsExecuted: number;
  stallsCount: number;
  flushesCount: number;
  isRunning: boolean;
  isHalted: boolean;
}

export interface RiscvSampleProgram {
  id: string;
  titleHu: string;
  titleEn: string;
  descHu: string;
  descEn: string;
  code: string;
}
