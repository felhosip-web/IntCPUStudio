export type C64ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface C64PaletteEntry {
  index: number;
  name: string;
  nameHu: string;
  hex: string;
}

export const C64_PALETTE: C64PaletteEntry[] = [
  { index: 0, name: 'Black', nameHu: 'Fekete', hex: '#000000' },
  { index: 1, name: 'White', nameHu: 'Fehér', hex: '#FFFFFF' },
  { index: 2, name: 'Red', nameHu: 'Piros', hex: '#880000' },
  { index: 3, name: 'Cyan', nameHu: 'Ciánkék', hex: '#AAFFEE' },
  { index: 4, name: 'Purple', nameHu: 'Lila', hex: '#CC44CC' },
  { index: 5, name: 'Green', nameHu: 'Zöld', hex: '#00CC55' },
  { index: 6, name: 'Blue', nameHu: 'Kék', hex: '#0000AA' },
  { index: 7, name: 'Yellow', nameHu: 'Sárga', hex: '#EEEE77' },
  { index: 8, name: 'Orange', nameHu: 'Narancs', hex: '#DD8855' },
  { index: 9, name: 'Brown', nameHu: 'Barna', hex: '#664400' },
  { index: 10, name: 'Light Red', nameHu: 'Világospiros', hex: '#FF7777' },
  { index: 11, name: 'Dark Grey', nameHu: 'Sötétszürke', hex: '#333333' },
  { index: 12, name: 'Grey', nameHu: 'Szürke', hex: '#777777' },
  { index: 13, name: 'Light Green', nameHu: 'Világoszöld', hex: '#AAFF66' },
  { index: 14, name: 'Light Blue', nameHu: 'Világoskék', hex: '#0088FF' },
  { index: 15, name: 'Light Grey', nameHu: 'Világosszürke', hex: '#BBBBBB' },
];

export interface Mos6502Registers {
  A: number;   // Accumulator (8-bit)
  X: number;   // Index Register X (8-bit)
  Y: number;   // Index Register Y (8-bit)
  PC: number;  // Program Counter (16-bit, 0x0000 - 0xFFFF)
  SP: number;  // Stack Pointer (8-bit, 0x00 - 0xFF, maps to 0x0100 - 0x01FF)
  // Flags: N V - B D I Z C
  flags: {
    N: boolean; // Negative
    V: boolean; // Overflow
    B: boolean; // Break
    D: boolean; // Decimal mode
    I: boolean; // Interrupt Disable
    Z: boolean; // Zero
    C: boolean; // Carry
  };
}

export interface BasicLine {
  lineNumber: number;
  code: string;
}

export type InterpreterStatus = 'IDLE' | 'RUNNING' | 'WAITING_INPUT' | 'PAUSED' | 'HALTED';

export interface C64TerminalLine {
  text: string;
  textColor?: number; // C64 color index (default: 14)
}

export interface SidVoiceConfig {
  voiceIndex: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
  frequency: number;
  pulseWidth: number; // 0..1
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  enabled: boolean;
}

export interface C64State {
  memory: Uint8Array; // 64KB RAM
  cpu: Mos6502Registers;
  borderColor: number;     // 0..15 (Standard: 14 Light Blue)
  backgroundColor: number; // 0..15 (Standard: 6 Blue)
  textColor: number;       // 0..15 (Standard: 14 Light Blue)
  cursorX: number;         // 0..39
  cursorY: number;         // 0..24
  cursorVisible: boolean;
  basicProgram: Map<number, string>;
  programList: BasicLine[];
  interpreterStatus: InterpreterStatus;
  currentRunningLine: number | null;
  outputBuffer: string[];
  terminalHistory: C64TerminalLine[];
  commandHistory: string[];
  historyIndex: number;
  variables: Map<string, number | string>;
  forLoops: Map<string, { startVal: number; endVal: number; stepVal: number; targetLine: number }>;
  gosubStack: number[];
  cycleCount: number;
}

export interface C64SampleProgram {
  id: string;
  title: string;
  titleHu: string;
  category: string;
  description: string;
  descriptionHu: string;
  basicCode: string;
}
