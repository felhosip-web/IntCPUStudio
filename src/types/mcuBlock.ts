export type BlockCategory =
  | 'CONTROL'
  | 'VARIABLES'
  | 'ARRAYS'
  | 'IO'
  | 'ADC'
  | 'PWM'
  | 'SHIFT_REGISTER'
  | 'PROTOCOLS'
  | 'ACTUATORS'
  | 'LOGIC';

export type McuDataType = 'byte' | 'int' | 'float' | 'bool' | 'char' | 'long';

export interface McuMemoryItem {
  id: string;
  name: string;
  kind: 'variable' | 'array';
  dataType: McuDataType;
  elementSize: number; // in bytes (e.g. 1, 2, 4)
  arrayLength?: number;
  totalSizeBytes: number;
  baseAddress: number; // e.g. 0x0100
  scope: 'global' | 'local';
  location: 'SRAM' | 'PROGMEM' | 'STACK';
  currentValues: any[]; // values for array or [singleValue] for var
  rawBytes: number[]; // e.g. [0x00, 0x2A] in little-endian
  comment?: string;
  commentHu?: string;
}

export interface BlockDefinition {
  id: string;
  type: string;
  category: BlockCategory;
  name: string;
  nameHu: string;
  description: string;
  descriptionHu: string;
  color: string;
  accentColor: string;
  iconName: string;
  hasChildren?: boolean;
  defaultParams: Record<string, any>;
  paramSchema: {
    key: string;
    label: string;
    labelHu: string;
    type: 'select' | 'number' | 'text' | 'boolean' | 'slider';
    options?: { label: string; labelHu: string; value: any }[];
    min?: number;
    max?: number;
    step?: number;
  }[];
}

export interface PlacedBlock {
  instanceId: string;
  blockType: string;
  params: Record<string, any>;
  children?: PlacedBlock[];
}

export interface BlockProgramPreset {
  id: string;
  title: string;
  titleHu: string;
  category: string;
  categoryHu: string;
  description: string;
  descriptionHu: string;
  targetMcu: 'MCU_A' | 'MCU_B' | 'BREADBOARD';
  blocks: PlacedBlock[];
}

