export type C64FileType = 'PRG' | 'SEQ' | 'USR' | 'REL' | 'DEL';

export interface C64DiskFile {
  id: string;
  name: string; // Up to 16 characters PETSCII/ASCII
  type: C64FileType;
  sizeBlocks: number; // 1 block = 254 bytes
  data: Uint8Array;
  loadAddress?: number; // Usually 0x0801 for BASIC or other 16-bit address
  basicCode?: string; // If decodable as C64 BASIC program
  isLocked?: boolean; // Write-protected file
  track?: number;
  sector?: number;
}

export interface C64DiskImage {
  id: string;
  title: string; // e.g. "GAMES DISK"
  diskId: string; // 2 characters e.g. "2A" or "64"
  dosType: string; // e.g. "2A"
  files: C64DiskFile[];
  freeBlocks: number; // Default: 664 for standard 35-track 1541 disk
  isWriteProtected: boolean;
  rawD64?: Uint8Array;
  category?: 'games' | 'demos' | 'utilities' | 'user' | 'custom';
  description?: string;
  descriptionHu?: string;
}

export interface C64DriveState {
  driveNumber: number; // Typically 8 (default), 9, 10, or 11
  isInserted: boolean;
  disk: C64DiskImage | null;
  isMotorRunning: boolean;
  isLedGreen: boolean; // Power ON
  isLedRed: boolean; // Active / Error
  currentTrack: number; // 1 to 35
  currentSector: number; // 0 to 20
  statusMessage: string; // e.g. "00, OK,00,00" or "74, DRIVE NOT READY,00,00"
  statusCode: number;
  isSoundEnabled: boolean;
  lastOperation: string;
}

export interface PrgParseResult {
  loadAddress: number;
  isBasic: boolean;
  basicCode?: string;
  rawData: Uint8Array;
  sizeBytes: number;
  entryPoint?: number;
  warnings: string[];
}
