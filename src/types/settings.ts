export type ThemeMode = 'dark' | 'system' | 'light' | 'hacker';
export type Language = 'hu' | 'en';
export type NumberFormat = 'HEX' | 'DEC' | 'BIN' | 'SIGNED';
export type FontSize = 'compact' | 'normal' | 'large';
export type AccentTheme = 'cyan' | 'emerald' | 'amber' | 'purple' | 'matrix';
export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface SimulatorSettings {
  // Theme & Appearance
  themeMode: ThemeMode;

  // Localization & Interface
  language: Language;
  numberFormat: NumberFormat;
  fontSize: FontSize;
  accentTheme: AccentTheme;
  gridIntensity: 'none' | 'subtle' | 'high';
  showStatusFooter: boolean;

  // CPU & Execution Tuning
  clockSpeedHz: number; // 0.1 - 100 Hz
  microStepDelayMs: number; // 0 - 300 ms
  historyLimit: number; // 50 - 2000 states
  watchdogCycleLimit: number; // 1000 - 50000
  stopOnBreakpoint: boolean;
  autoHaltOnOverflow: boolean;

  // Memory & Architecture Tuning
  resetPcVector: number; // 0x00 - 0xFF
  resetSpBase: number; // 0x00 - 0xFF
  clearMemoryOnReset: boolean;
  allowSelfModifyingCode: boolean;
  matrixPersistence: boolean;

  // Audio & Sound FX Tuning
  masterVolume: number; // 0 - 100
  enableClockTickSound: boolean;
  tickWaveform: WaveformType;
  enableAluChimeSound: boolean;
  enableHaltSound: boolean;
  beeperBaseFreq: number; // Hz (e.g., 440)
}

export const DEFAULT_SETTINGS: SimulatorSettings = {
  themeMode: 'dark', // 'dark' (alapértelmezett), 'system', 'light', 'hacker'
  language: 'hu', // Fully Hungarian by default!
  numberFormat: 'HEX',
  fontSize: 'normal',
  accentTheme: 'cyan',
  gridIntensity: 'subtle',
  showStatusFooter: true,

  clockSpeedHz: 2,
  microStepDelayMs: 40,
  historyLimit: 500,
  watchdogCycleLimit: 10000,
  stopOnBreakpoint: true,
  autoHaltOnOverflow: false,

  resetPcVector: 0x00,
  resetSpBase: 0xff,
  clearMemoryOnReset: false,
  allowSelfModifyingCode: true,
  matrixPersistence: true,

  masterVolume: 60,
  enableClockTickSound: true,
  tickWaveform: 'sine',
  enableAluChimeSound: true,
  enableHaltSound: true,
  beeperBaseFreq: 440,
};
