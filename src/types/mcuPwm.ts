export type PwmTimerId = 'TIMER0_8BIT' | 'TIMER1_16BIT' | 'TIMER2_8BIT';

export type PwmMode = 'FAST_PWM' | 'PHASE_CORRECT' | 'PHASE_FREQ_CORRECT' | 'CTC' | 'NORMAL';

export type PwmPin = 'D3' | 'D5' | 'D6' | 'D9' | 'D10' | 'D11';

export type PwmPrescaler = 1 | 8 | 64 | 256 | 1024;

export type PwmOutputMode = 'NON_INVERTING' | 'INVERTING' | 'DISCONNECTED';

export type PwmTargetActuator =
  | 'LED_DIMMER'
  | 'DC_MOTOR'
  | 'SERVO'
  | 'BUZZER_TONE'
  | 'RC_FILTER';

export interface PwmSamplePoint {
  timeUs: number;
  tcnt: number;
  ocr: number;
  top: number;
  pwmSignal: number; // 0 or 5V
  rcFilteredVoltage: number;
  isMatch: boolean;
  isOverflow: boolean;
}

export interface PwmSimulationConfig {
  timer: PwmTimerId;
  mode: PwmMode;
  prescaler: PwmPrescaler;
  ocrValue: number; // 0..255 or 0..65535
  topValue: number; // e.g. 255 for 8-bit, custom for CTC or Timer1 ICR1
  outputMode: PwmOutputMode;
  targetActuator: PwmTargetActuator;
  pin: PwmPin;
  fCpuHz: number; // default 16,000,000 Hz
  motorLoadPct: number; // 0..100%
  rcResistanceKohm: number; // default 10 kohm
  rcCapacitanceUf: number; // default 10 uF
  toneFreqHz: number; // default 440 Hz
  servoAngleDeg: number; // 0..180 deg
}

export interface PwmLiveState {
  dutyCyclePercent: number; // 0.0 .. 100.0%
  effectiveVoltage: number; // 0.0 .. 5.0 V
  calculatedFrequencyHz: number;
  periodMicroseconds: number;
  tHighUs: number;
  tLowUs: number;
  
  // Real-time stepping state
  tcntCurrent: number;
  tcntDirection: 'UP' | 'DOWN';
  comparatorOutput: boolean;
  pinVoltage: number; // 0.0 or 5.0 V
  
  // Actuator dynamics
  motorRpm: number; // 0 .. 3000 RPM
  servoPulseWidthUs: number; // 1000 .. 2000 us
  opticalPerceivedBrightnessPct: number; // CIE 1931 / Gamma 2.2 corrected perceived brightness
  rcFilteredVoltage: number;
  rippleVoltageMv: number;
  
  // Hardware Registers
  registers: {
    TCCRA: number;
    TCCRB: number;
    TCNT: number;
    OCRA: number;
    OCRB: number;
    TIMSK: number;
    TIFR: number;
  };

  // Waveform buffer for oscilloscope
  samples: PwmSamplePoint[];
}
