export type AdcReference = 'AREF_EXTERNAL' | 'AVCC_5V' | 'INTERNAL_1V1' | 'INTERNAL_2V56';

export type AdcPrescaler = 2 | 4 | 8 | 16 | 32 | 64 | 128;

export type AdcChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'TEMP' | 'BANDGAP_1V1' | 'GND';

export type AdcTriggerSource =
  | 'FREE_RUNNING'
  | 'ANALOG_COMP'
  | 'EXT_INT0'
  | 'TIMER0_COMPA'
  | 'TIMER0_OVF'
  | 'TIMER1_COMPB'
  | 'TIMER1_OVF'
  | 'TIMER1_CAPT';

export type AdcAlignment = 'RIGHT_10BIT' | 'LEFT_8BIT'; // ADLAR=0 or ADLAR=1

export type AdcInputSignalType =
  | 'POTENTIOMETER'
  | 'TEMP_LM35'
  | 'LDR_LIGHT'
  | 'DC_SLIDER'
  | 'SINE_WAVE'
  | 'TRIANGLE_WAVE'
  | 'NOISY_SENSOR';

export interface SarStepDetail {
  stepIndex: number;
  clockCycle: number;
  phaseName: string;
  phaseNameHu: string;
  testBit: number | null; // 9 down to 0, or null for Sample/Hold or Latch
  dacCode: number; // 0..1023 tested
  dacVoltage: number; // in Volts
  inputVoltage: number; // in Volts
  comparatorOutput: boolean; // true if Vin >= Vdac (Bit is kept as 1)
  accumulatedCode: number; // Current value in SAR register
  bitDecisions: ('1' | '0' | '?' | '-')[]; // 10 elements: Bit 9..0
  description: string;
  descriptionHu: string;
}

export interface AdcTimingSample {
  cycle: number;
  cpuTimeUs: number;
  clkCpu: number; // 1 or 0
  clkAdc: number; // 1 or 0
  sampleHoldSwitch: number; // 1 = closed/charging, 0 = open/hold
  activeBit: number | null; // 9..0
  dacVoltage: number;
  inputVoltage: number;
  comparatorOut: number; // 1 or 0
  adsc: number; // 1 or 0
  adif: number; // 1 or 0
  dataLatch: number; // 1 or 0
  phaseLabel: string;
}

export interface AdcSimulationConfig {
  fCpuHz: number; // Default 16,000,000 Hz (16 MHz)
  prescaler: AdcPrescaler; // Default 128 (125 kHz)
  reference: AdcReference; // Default AVCC_5V
  vRefCustom: number; // 5.0 V
  channel: AdcChannel; // Default 0 (A0)
  alignment: AdcAlignment; // Default RIGHT_10BIT (ADLAR=0)
  triggerSource: AdcTriggerSource; // Default FREE_RUNNING
  interruptEnabled: boolean; // ADIE
  inputSignalType: AdcInputSignalType;
  manualVoltage: number; // 0.000 to 5.000 V
  noiseMilliVolts: number; // 0 to 50 mV
  sineFreqHz: number; // 1 to 1000 Hz
  sineAmplitudeV: number; // 0 to 5.0 V
  sineOffsetV: number; // 0 to 5.0 V
  didr0Mask: number; // Digital Input Disable Register 0
}

export interface AdcLiveState {
  enabled: boolean; // ADEN (ADCSRA bit 7)
  isConverting: boolean; // ADSC (ADCSRA bit 6)
  isFirstConversion: boolean; // 25 cycles vs 13 cycles
  currentCycle: number; // 1..13 or 1..25
  totalCyclesRequired: number; // 13 or 25
  sarStepIndex: number; // 0..12
  currentSarValue: number; // 0..1023
  sampleAndHoldVoltage: number; // Sampled voltage locked in capacitor
  currentDacVoltage: number;
  currentComparatorResult: boolean;
  
  // Register bytes
  ADMUX: number;
  ADCSRA: number;
  ADCSRB: number;
  ADCL: number;
  ADCH: number;
  DIDR0: number;

  // Measurement results
  rawResult10Bit: number; // 0..1023
  voltageResult: number; // V
  lsbStepMilliVolts: number; // mV (e.g. 4.8828 mV)
  quantizationErrorMv: number;
  quantizationErrorLsb: number;
  signalToNoiseRatioDb: number;

  // History & Step details for interactive playback
  steps: SarStepDetail[];
  timingHistory: AdcTimingSample[];

  // Calculation metadata
  fAdcActualHz: number;
  conversionTimeUs: number;
  samplingTimeUs: number;
}
