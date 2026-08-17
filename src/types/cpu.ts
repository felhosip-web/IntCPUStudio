import {
  AudioPsgState,
  CpuCoreConfig,
  CpuCoreType,
  DmaState,
  HardwareSetupConfig,
  MathCoprocessorState,
  PicState,
  TimerRtcState,
  UartState,
} from './hardware';

export type RegisterName = 'A' | 'B' | 'C' | 'D' | 'PC' | 'SP' | 'IR' | 'MAR' | 'MBR' | 'X' | 'Y' | 'H' | 'L';

export interface CpuFlags {
  Z: boolean; // Zero flag
  C: boolean; // Carry flag
  N: boolean; // Negative / Sign flag (bit 7)
  V: boolean; // Signed Overflow flag
  E: boolean; // Equal flag (from CMP)
  G: boolean; // Greater flag (from CMP)
  L: boolean; // Less flag (from CMP)
  I?: boolean; // Interrupt Disable flag (for 6502/Z80)
  D?: boolean; // Decimal BCD mode flag
}

export type MicroStepPhase =
  | 'FETCH_MAR'
  | 'FETCH_IR'
  | 'DECODE'
  | 'EXECUTE_OPERANDS'
  | 'EXECUTE_ALU'
  | 'WRITEBACK';

export interface BusSignalState {
  dataBus: number; // 8-bit value (0-255)
  addressBus: number; // 8-bit address (0-255)
  controlLines: string[]; // Active control signal names
  activeSource: string; // Component sending data onto bus
  activeDestination: string; // Component reading data from bus
  lastActivityTime: number;
}

export interface AluState {
  operandA: number;
  operandB: number;
  operation: AluOperation;
  result: number;
  flags: CpuFlags;
  isActive: boolean;
}

export type AluOperation =
  | 'NOP'
  | 'ADD'
  | 'ADC'
  | 'SUB'
  | 'SBB'
  | 'INC'
  | 'DEC'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NOT'
  | 'SHL'
  | 'SHR'
  | 'CMP'
  | 'PASS_A'
  | 'PASS_B';

export interface PeripheralsState {
  leds: number; // 8-bit (Port 1 output)
  sevenSegment: number; // 16-bit / 4-digit (Port 3 output)
  terminalOutput: string; // ASCII terminal (Port 2 output)
  dipSwitches: number; // 8-bit (Port 0 input)
  keypadValue: number; // 8-bit (Port 1 input)
  beeperActive: boolean; // Beeper (Port 4 output)
  matrixLeds: number[]; // 8x8 bitmap array for graphical display (Port 5 output)
}

export interface CpuRegisters {
  A: number; // Accumulator
  B: number; // General purpose B
  C: number; // General purpose C / Counter
  D: number; // General purpose D / Data
  PC: number; // Program Counter
  SP: number; // Stack Pointer
  IR: number; // Instruction Register
  MAR: number; // Memory Address Register
  MBR: number; // Memory Buffer Register
  // Extended core registers (for 6502, Z80)
  X?: number; // 6502 X Index register
  Y?: number; // 6502 Y Index register
  H?: number; // Z80 High byte of address pointer (HL)
  L?: number; // Z80 Low byte of address pointer (HL)
}

export interface CpuState {
  coreType: CpuCoreType;
  coreConfig: CpuCoreConfig;
  hardwareConfig: HardwareSetupConfig;
  registers: CpuRegisters;
  flags: CpuFlags;
  memory: Uint8Array; // 256 bytes (or expanded)
  codeMemory?: Uint8Array; // Separate ROM in Harvard mode
  alu: AluState;
  bus: BusSignalState;
  peripherals: PeripheralsState;
  timerState: TimerRtcState;
  audioPsgState: AudioPsgState;
  uartState: UartState;
  picState: PicState;
  mathState: MathCoprocessorState;
  dmaState: DmaState;
  microStep: MicroStepPhase;
  microStepIndex: number;
  isHalted: boolean;
  cycleCount: number;
  instructionCount: number;
  currentInstructionName: string;
  currentInstructionExplanation: string;
  currentInstructionExplanationHu: string;
  lastChangedRegister: RegisterName | null;
  lastChangedMemoryAddress: number | null;
}

export interface InstructionDef {
  opcode: number;
  mnemonic: string;
  operands: number; // byte length of instruction (1, 2, or 3 bytes)
  description: string;
  descriptionHu: string;
  category: 'DATA' | 'ALU' | 'FLOW' | 'IO' | 'STACK' | 'SYSTEM';
}

export interface AssemblyLineInfo {
  lineNumber: number;
  rawText: string;
  address?: number;
  byteCount: number;
  bytes: number[];
  mnemonic?: string;
  operands?: string[];
  isLabel?: boolean;
  labelName?: string;
  isComment?: boolean;
  error?: string;
}

export interface AssembledProgram {
  machineCode: Uint8Array;
  lineMapping: Record<number, number>; // address -> source line number
  addressMapping: Record<number, number>; // source line number -> address
  symbolTable: Record<string, number>; // label name -> address
  lines: AssemblyLineInfo[];
  errors: Array<{ line: number; message: string; messageHu: string }>;
  codeSize: number;
}

export interface SampleProgram {
  id: string;
  title: string;
  titleHu: string;
  category: 'Kezdő' | 'Aritmetika' | 'I/O és Kijelző' | 'Haladó & Algoritmusok';
  description: string;
  descriptionHu: string;
  code: string;
  expectedOutcome: string;
  expectedOutcomeHu: string;
}

export type ModuleType =
  | 'REGISTERS'
  | 'ALU'
  | 'MEMORY'
  | 'CONTROL_UNIT'
  | 'BUS_MONITOR'
  | 'TIMING_DIAGRAM'
  | 'IO_PERIPHERALS'
  | 'CODE_EDITOR'
  | 'PIPELINE_FLOW'
  | 'MATRIX_DISPLAY'
  | 'STACK_VIEW'
  | 'HARDWARE_CONFIG'
  | 'TIMER_RTC'
  | 'AUDIO_DAC_PSG'
  | 'UART_SERIAL'
  | 'INTERRUPT_CONTROLLER'
  | 'MATH_COPROCESSOR'
  | 'DMA_CONTROLLER';

export * from './timing';

export interface BoardModule {
  id: string;
  type: ModuleType;
  title: string;
  titleHu: string;
  x: number;
  y: number;
  width: number; // in pixels or grid units
  height: number;
  isMinimized: boolean;
  isVisible: boolean;
  zIndex: number;
}

export interface LessonStep {
  id: string;
  title: string;
  titleHu: string;
  concept: string;
  conceptHu: string;
  explanation: string;
  explanationHu: string;
  suggestedCode?: string;
  tasks: Array<{ text: string; textHu: string; check: (cpu: CpuState) => boolean }>;
}
