export type IoDeviceType =
  | 'LED_BAR_8BIT'
  | 'SEVEN_SEG_SINGLE'
  | 'SEVEN_SEG_DUAL'
  | 'PUSH_BUTTONS_4BIT'
  | 'DIP_SWITCH_8BIT'
  | 'MATRIX_KEYPAD_4X4'
  | 'CHARACTER_LCD_16X2'
  | 'PIEZO_BUZZER'
  | 'ADC_POTENTIOMETER'
  | 'DAC_VOLTMETER';

export type IoMappingMode = 'MMIO' | 'PMIO'; // Memory-Mapped I/O vs Port-Mapped I/O
export type IoAccessMode = 'READ_ONLY' | 'WRITE_ONLY' | 'READ_WRITE';
export type AddressDecodingMode = 'FULL_DECODING' | 'PARTIAL_DECODING' | 'PORT_MAPPED';

export interface IoLedBarState {
  value: number; // 8-bit (0-255)
  color: 'emerald' | 'rose' | 'amber' | 'cyan' | 'blue';
  activeLow: boolean;
}

export interface IoSevenSegState {
  mode: 'BCD_DECODER' | 'RAW_SEGMENTS'; // 74LS47 BCD vs direct bits a,b,c,d,e,f,g,dp
  digit1: number; // 8-bit
  digit2: number; // 8-bit (for dual display)
  commonAnode: boolean;
}

export interface IoPushButtonsState {
  buttonStates: [boolean, boolean, boolean, boolean]; // 4 buttons (true = pressed)
  pullUp: boolean; // true = 1 when unpressed, 0 when pressed
  latchMode: boolean; // toggle vs momentary
}

export interface IoDipSwitchState {
  value: number; // 8-bit (0-255)
}

export interface IoMatrixKeypadState {
  activeColumnLatch: number; // 4-bit column drive (0-15)
  pressedKeys: Record<string, boolean>; // e.g. '0,0': true
}

export interface IoCharacterLcdState {
  ddram: string[]; // 32 characters (16 per line)
  cursorPos: number; // 0-31
  displayOn: boolean;
  cursorOn: boolean;
  blinkOn: boolean;
  lastCommand: number;
}

export interface IoPiezoBuzzerState {
  frequencyHz: number;
  isActive: boolean;
  volume: number;
}

export interface IoAdcPotState {
  analogVoltage: number; // 0.0 - 5.0 V
  quantizedValue: number; // 8-bit (0 - 255)
}

export interface IoDacVoltmeterState {
  latchedValue: number; // 8-bit (0 - 255)
  outputVoltage: number; // 0.0 - 5.0 V
}

export interface IoDeviceMapping {
  id: string;
  name: string;
  nameHu: string;
  type: IoDeviceType;
  baseAddress: number; // e.g. 0xE000 or 0x01
  addressLength: number; // e.g. 1 or 2 bytes
  accessMode: IoAccessMode;
  isEnabled: boolean;
  chipSelectLabel: string; // e.g. "/CS0", "/CS1", "/Y0"
  description: string;
  descriptionHu: string;
  // Specific device states:
  ledState?: IoLedBarState;
  sevenSegState?: IoSevenSegState;
  buttonState?: IoPushButtonsState;
  dipState?: IoDipSwitchState;
  keypadState?: IoMatrixKeypadState;
  lcdState?: IoCharacterLcdState;
  buzzerState?: IoPiezoBuzzerState;
  adcPotState?: IoAdcPotState;
  dacVoltState?: IoDacVoltmeterState;
}

export interface IoBusTransaction {
  id: string;
  timestamp: number;
  type: 'READ' | 'WRITE';
  address: number;
  data: number;
  mode: IoMappingMode;
  targetDeviceId?: string;
  targetDeviceName?: string;
  chipSelect?: string;
  signals: {
    mreq: boolean; // Memory Request (/MREQ)
    iorq: boolean; // I/O Request (/IORQ)
    rd: boolean;   // Read Active (/RD)
    wr: boolean;   // Write Active (/WR)
    cs: boolean;   // Chip Select (/CS)
  };
  status: 'ACK' | 'NO_DEVICE' | 'CONFLICT';
}

export interface AddressDecoderState {
  decodingMode: AddressDecodingMode;
  highAddressBitsMask: number; // e.g. 0xF000 (Top 4 bits decoded: 0xE000-0xEFFF)
  enableG1: boolean;   // 74LS138 Active-HIGH enable (tied to VCC or MREQ/IORQ)
  enableG2A: boolean;  // 74LS138 Active-LOW enable
  enableG2B: boolean;  // 74LS138 Active-LOW enable
  foldbackMirrors: { mirrorAddress: number; originalAddress: number }[];
}

export interface IoEmulatorConfig {
  mappingMode: IoMappingMode;
  memoryBaseAddress: number; // Default 0xE000
  addressDecoding: AddressDecoderState;
  clockSyncWithCpu: boolean;
  autoLogTransactions: boolean;
}

export interface IoPresetExperiment {
  id: string;
  title: string;
  titleHu: string;
  category: string;
  categoryHu: string;
  description: string;
  descriptionHu: string;
  theoryHu: string;
  theoryEn: string;
  assemblyCode: string;
  sampleProgramId?: string;
  devices: IoDeviceMapping[];
  defaultConfig: Partial<IoEmulatorConfig>;
}
