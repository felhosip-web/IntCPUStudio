export type EndianMode = 'LITTLE' | 'BIG';

export type HexDisplayMode = 'HEX_ASCII' | 'HEX_ONLY' | 'ASCII_ONLY' | 'BINARY_MATRIX';

export type ByteHighlightCategory =
  | 'zero' // 0x00
  | 'ascii' // 0x20..0x7E printable
  | 'control' // 0x01..0x1F control codes
  | 'high' // 0x80..0xFF high bit set
  | 'pc' // Program counter
  | 'sp' // Stack pointer
  | 'mar' // Memory address register
  | 'modified' // Edited in this session
  | 'match'; // Search match

export interface HexPreset {
  id: string;
  title: string;
  titleHu: string;
  category: 'code' | 'graphics' | 'text' | 'security' | 'magic';
  description: string;
  descriptionHu: string;
  baseAddress: number;
  data: number[];
  highlights?: { start: number; length: number; label: string; labelHu: string; color: string }[];
}

export interface HexSearchQuery {
  term: string;
  isHex: boolean;
  matchCase: boolean;
}

export interface HexEditEntry {
  address: number;
  oldValue: number;
  newValue: number;
  timestamp: number;
}
