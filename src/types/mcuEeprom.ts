export type EepromTabMode =
  | 'MEMORY_GRID'
  | 'HARDWARE_SEQUENCE'
  | 'WEAR_LEVELING'
  | 'PRESETS_CRC'
  | 'CODE_GENERATOR';

export interface EepromWriteSequenceState {
  step: 'IDLE' | 'WAIT_READY' | 'LOAD_REGISTERS' | 'ENABLE_MASTER' | 'STROBE_WRITE' | 'TUNNELING_PROGRAM' | 'COMPLETE';
  stepIndex: number;
  clockCyclesRemaining: number;
  progressPercent: number;
  targetAddress: number;
  targetData: number;
  isWriting: boolean;
  statusMessage: string;
  statusMessageHu: string;
}

export interface EepromCellMetadata {
  address: number;
  value: number;
  writeCount: number;
  label?: string;
  category?: 'CONFIG' | 'CALIBRATION' | 'HIGHSCORE' | 'LOG' | 'SECURITY' | 'UNALLOCATED';
  isDirty?: boolean;
  isLocked?: boolean;
}

export interface EepromPreset {
  id: string;
  title: string;
  titleHu: string;
  category: 'CONFIG' | 'GAMING' | 'SENSORS' | 'SECURITY' | 'DIAGNOSTICS';
  categoryHu: 'Konfiguráció' | 'Játék' | 'Szenzorok' | 'Biztonság' | 'Diagnosztika';
  description: string;
  descriptionHu: string;
  data: { address: number; value: number; label?: string }[];
  arduinoCode: string;
  avrAsmCode: string;
}

export interface EepromWearStats {
  totalWrites: number;
  maxWritesOnSingleCell: number;
  hottestAddress: number;
  deadCellsCount: number;
  wearLevelingActive: boolean;
  estimatedLifespanYears: number;
}
