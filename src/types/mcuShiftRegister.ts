export type ShiftBitOrder = 'MSBFIRST' | 'LSBFIRST';

export type ShiftOutputDeviceType = 'LEDS' | 'SEVEN_SEGMENT' | 'RELAYS' | 'BARGRAPH' | 'CASCADE_16_LEDS';

export interface ShiftRegisterPinState {
  ds: boolean; // Serial Data In (Pin 14 - SER / DS)
  shcp: boolean; // Shift Register Clock (Pin 11 - SRCLK / SH_CP)
  stcp: boolean; // Storage Register Clock / Latch (Pin 12 - RCLK / ST_CP)
  oe_n: boolean; // Output Enable, Active LOW (Pin 13 - /OE)
  mr_n: boolean; // Master Reset / Clear, Active LOW (Pin 10 - /MR or /SRCLR)
  q7s: boolean; // Serial Output for Cascading (Pin 9 - QH' / Q7S / SQH)
}

export interface ShiftRegisterChipState {
  id: string;
  name: string;
  nameHu: string;
  pins: ShiftRegisterPinState;
  shiftBuffer: number[]; // 8 elements [S0, S1, S2, S3, S4, S5, S6, S7], where S0 is input stage
  storageLatch: number[]; // 8 elements [L0, L1, L2, L3, L4, L5, L6, L7]
  qOutputs: boolean[]; // 8 outputs [QA, QB, QC, QD, QE, QF, QG, QH]
  oeBrightness: number; // 0..255 PWM dimming via /OE
  isHighZ: boolean; // when /OE is HIGH, outputs are float/disabled
}

export interface DualShiftRegisterState {
  chip1: ShiftRegisterChipState;
  chip2: ShiftRegisterChipState;
  isCascaded: boolean;
  activeBitIndex: number;
  totalShiftSteps: number;
}

export interface ShiftWaveformSample {
  timeIndex: number;
  ds: number; // 0 or 1
  shcp: number; // 0 or 1
  stcp: number; // 0 or 1
  oe_n: number; // 0 or 1
  qOutputsByte1: number; // 0..255
  qOutputsByte2?: number; // 0..255
  q7s: number; // 0 or 1
  eventLabel?: string;
  eventLabelHu?: string;
}

export interface ShiftRegisterPreset {
  id: string;
  title: string;
  titleHu: string;
  category: string;
  categoryHu: string;
  description: string;
  descriptionHu: string;
  explanation: string;
  explanationHu: string;
  outputDevice: ShiftOutputDeviceType;
  isCascaded: boolean;
  defaultData: number[];
  bitOrder: ShiftBitOrder;
  animationDelayMs: number;
  arduinoCode: string;
  avrCode: string;
}
