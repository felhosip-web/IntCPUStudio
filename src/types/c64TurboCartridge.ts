export type TurboCartridgeType = 'FINAL_CARTRIDGE_3' | 'ACTION_REPLAY_6' | 'EPYX_FASTLOAD' | 'SUPER_CPU_20MHZ';

export interface TurboCartridgeModel {
  id: TurboCartridgeType;
  name: string;
  nameHu: string;
  manufacturer: string;
  year: number;
  romSizeKb: number;
  ramSizeKb?: number;
  cpuSpeedMhz: number; // e.g. 0.985 / 1.0 / 20.0
  fastloadSpeedFactor: number; // e.g. 10x, 15x, 25x
  description: string;
  descriptionHu: string;
  hardwareFeatures: string[];
  hardwareFeaturesHu: string[];
  fastloadTechnology: string;
  fastloadTechnologyHu: string;
  freezeFeatures: string[];
  freezeFeaturesHu: string[];
  bezelColor: string;
  badgeColor: string;
}

export interface TurboCartridgeState {
  isEnabled: boolean;
  activeModel: TurboCartridgeType;
  isFrozen: boolean;
  cpuSpeedMultiplier: number; // 1 = 1.0 MHz, 2 = 2 MHz, 4 = 4 MHz, 20 = 20 MHz
  fastloaderActive: boolean;
  dosWedgeActive: boolean;
  freezeTab: 'monitor' | 'cheats' | 'sprites' | 'sid' | 'backup';
  activePokes: { id: string; address: number; value: number; description: string; enabled: boolean }[];
  snapshotName: string;
}

export interface TurboCheatPreset {
  id: string;
  gameTitle: string;
  gameTitleHu: string;
  pokes: { address: number; value: number; label: string; labelHu: string }[];
  description: string;
  descriptionHu: string;
}

export interface TurboProtocolComparison {
  title: string;
  titleHu: string;
  stockIec: {
    speedBps: number;
    cyclesPerByte: number;
    protocol: string;
    protocolHu: string;
    handshake: string;
    handshakeHu: string;
    sampleLoadTime10KbSec: number;
  };
  turboFastload: {
    speedBps: number;
    cyclesPerByte: number;
    protocol: string;
    protocolHu: string;
    handshake: string;
    handshakeHu: string;
    sampleLoadTime10KbSec: number;
  };
}
