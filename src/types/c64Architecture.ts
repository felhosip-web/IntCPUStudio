export type C64IcId =
  | 'MOS_6510'
  | 'MOS_6569_VIC2'
  | 'MOS_6581_SID'
  | 'MOS_82S100_PLA'
  | 'MOS_6526_CIA1'
  | 'MOS_6526_CIA2'
  | 'SRAM_2114_COLOR'
  | 'DRAM_64K'
  | 'ROM_BASIC'
  | 'ROM_KERNAL'
  | 'ROM_CHARGEN'
  | 'PORT_IEC'
  | 'PORT_CARTRIDGE'
  | 'PORT_USER'
  | 'PORT_JOYSTICK';

export type C64BusType = 'ADDRESS' | 'DATA' | 'CONTROL' | 'IEC' | 'VIDEO_OUT' | 'AUDIO_OUT';

export interface C64PinDefinition {
  pinNumber: number;
  name: string;
  type: 'IN' | 'OUT' | 'INOUT' | 'POWER' | 'CLOCK' | 'ANALOG';
  description: string;
  descriptionHu: string;
}

export interface C64RegisterDefinition {
  address: string;
  name: string;
  bits: string;
  description: string;
  descriptionHu: string;
}

export interface C64IcSpec {
  id: C64IcId;
  chipDesignator: string; // e.g. "U7", "U19", "U18"
  partNumber: string;    // e.g. "MOS 6510", "MOS 6569 (PAL) / 6567 (NTSC)"
  name: string;
  nameHu: string;
  packageType: 'DIP-40' | 'DIP-28' | 'DIP-24' | 'DIP-18' | 'DIP-16' | 'EXPANSION';
  category: 'CPU' | 'GRAPHICS' | 'SOUND' | 'LOGIC' | 'INTERFACE' | 'MEMORY' | 'PORT';
  designer?: string;
  clockSpeed?: string;
  summary: string;
  summaryHu: string;
  detailedDescription: string;
  detailedDescriptionHu: string;
  pins: C64PinDefinition[];
  registers?: C64RegisterDefinition[];
  internalBlocks: {
    title: string;
    titleHu: string;
    description: string;
    descriptionHu: string;
  }[];
  trivia?: {
    en: string;
    hu: string;
  };
}

export type C64ScenarioId =
  | 'PHASE_INTERLEAVING'
  | 'BAD_LINE_DMA'
  | 'KEYBOARD_SCAN'
  | 'SID_SOUND_SYNTH'
  | 'IEC_FLOPPY_TRANSFER'
  | 'RASTER_IRQ'
  | 'PLA_BANK_SWITCHING';

export interface C64ScenarioStep {
  stepIndex: number;
  title: string;
  titleHu: string;
  description: string;
  descriptionHu: string;
  activeChips: C64IcId[];
  activeBuses: {
    bus: C64BusType;
    from: C64IcId;
    to: C64IcId;
    signalName: string;
    valueHex?: string;
  }[];
  phase: 'PHI_1' | 'PHI_2' | 'BAD_LINE_STOLEN';
  statusBadges?: {
    label: string;
    color: 'red' | 'blue' | 'green' | 'amber' | 'purple' | 'cyan';
  }[];
}

export interface C64Scenario {
  id: C64ScenarioId;
  title: string;
  titleHu: string;
  summary: string;
  summaryHu: string;
  badge: string;
  steps: C64ScenarioStep[];
}

export interface PlaInputState {
  loram: boolean;   // CPU Port $01 Bit 0 (default: 1)
  hiram: boolean;   // CPU Port $01 Bit 1 (default: 1)
  charen: boolean;  // CPU Port $01 Bit 2 (default: 1)
  game: boolean;    // Cartridge GAME line (active low, 1 = ungrounded)
  exrom: boolean;   // Cartridge EXROM line (active low, 1 = ungrounded)
  ba: boolean;      // Bus Available from VIC-II (1 = normal, 0 = Bad Line)
  aec: boolean;     // Address Enable Control (1 = CPU master, 0 = VIC-II master)
}

export interface PlaMemorySlice {
  range: string;
  startAddr: number;
  endAddr: number;
  sizeKb: number;
  currentMapping: 'RAM' | 'BASIC_ROM' | 'KERNAL_ROM' | 'CHARGEN_ROM' | 'IO_SPACE' | 'CARTRIDGE_ROML' | 'CARTRIDGE_ROMH';
  currentMappingHu: string;
  description: string;
  descriptionHu: string;
  color: string;
}
