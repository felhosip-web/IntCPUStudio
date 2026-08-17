export type CpuBlockCategory =
  | 'DATA'
  | 'ALU'
  | 'FLOW'
  | 'STACK'
  | 'IO'
  | 'HIGH_LEVEL'
  | 'SYSTEM';

export interface CpuBlockParamOption {
  label: string;
  labelHu: string;
  value: any;
}

export interface CpuBlockParamField {
  key: string;
  label: string;
  labelHu: string;
  type: 'select' | 'number' | 'text' | 'slider';
  options?: CpuBlockParamOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  unit?: string;
}

export interface CpuBlockDefinition {
  id: string;
  type: string;
  category: CpuBlockCategory;
  mnemonic?: string;
  name: string;
  nameHu: string;
  description: string;
  descriptionHu: string;
  color: string;
  accentColor: string;
  iconName: string;
  hasChildren?: boolean;
  defaultParams: Record<string, any>;
  paramSchema: CpuBlockParamField[];
}

export interface CpuPlacedBlock {
  instanceId: string;
  blockType: string;
  params: Record<string, any>;
  children?: CpuPlacedBlock[];
}

export interface CpuBlockPreset {
  id: string;
  title: string;
  titleHu: string;
  category: string;
  categoryHu: string;
  description: string;
  descriptionHu: string;
  blocks: CpuPlacedBlock[];
}
