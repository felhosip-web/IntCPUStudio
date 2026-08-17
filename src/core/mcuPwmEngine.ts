import {
  PwmMode,
  PwmOutputMode,
  PwmPin,
  PwmPrescaler,
  PwmSamplePoint,
  PwmSimulationConfig,
  PwmTargetActuator,
  PwmTimerId,
  PwmLiveState,
} from '../types/mcuPwm';

export function calculatePwmFrequency(
  fCpuHz: number,
  prescaler: PwmPrescaler,
  mode: PwmMode,
  topValue: number,
  ocrValue: number
): number {
  if (mode === 'FAST_PWM') {
    return fCpuHz / (prescaler * (topValue + 1));
  } else if (mode === 'PHASE_CORRECT' || mode === 'PHASE_FREQ_CORRECT') {
    return fCpuHz / (2 * prescaler * (topValue || 1));
  } else if (mode === 'CTC') {
    return fCpuHz / (2 * prescaler * (ocrValue + 1 || 1));
  } else {
    // Normal overflow
    return fCpuHz / (prescaler * (topValue + 1));
  }
}

export function calculateDutyCycle(
  ocrValue: number,
  topValue: number,
  mode: PwmMode,
  outputMode: PwmOutputMode
): number {
  if (outputMode === 'DISCONNECTED') return 0;
  if (ocrValue <= 0) return outputMode === 'INVERTING' ? 100 : 0;
  if (ocrValue >= topValue) return outputMode === 'INVERTING' ? 0 : 100;

  let duty = (ocrValue / topValue) * 100;
  if (mode === 'FAST_PWM') {
    duty = ((ocrValue + 1) / (topValue + 1)) * 100;
  }

  if (outputMode === 'INVERTING') {
    duty = 100 - duty;
  }

  return Math.max(0, Math.min(100, duty));
}

/**
 * CIE 1931 / Gamma 2.2 perceived brightness curve for human eye
 */
export function calculatePerceivedBrightness(dutyPercent: number): number {
  const linear = Math.max(0, Math.min(1, dutyPercent / 100));
  // Human vision perceives brightness non-linearly: Perceived = (Linear)^(1 / 2.2)
  return Math.pow(linear, 1 / 2.2) * 100;
}

/**
 * Generate discrete waveform samples across 2-3 PWM periods
 */
export function generatePwmWaveformSamples(
  config: PwmSimulationConfig,
  fPwmHz: number,
  dutyPercent: number,
  totalPeriods = 3,
  numPoints = 200
): PwmSamplePoint[] {
  const samples: PwmSamplePoint[] = [];
  const periodUs = (1 / fPwmHz) * 1e6;
  const totalDurationUs = periodUs * totalPeriods;
  const dtUs = totalDurationUs / numPoints;

  const tauUs = config.rcResistanceKohm * config.rcCapacitanceUf * 1000; // R(kOhm) * C(uF) * 1000 = us
  const alpha = dtUs / (tauUs + dtUs);
  let vRc = (dutyPercent / 100) * 5.0; // Initialize near steady-state

  const top = config.topValue || 255;
  const ocr = config.ocrValue;

  for (let i = 0; i <= numPoints; i++) {
    const timeUs = i * dtUs;
    const tInPeriod = timeUs % periodUs;
    const normT = tInPeriod / periodUs;

    let tcnt = 0;
    let isMatch = false;
    let isOverflow = false;
    let pwmHigh = false;

    if (config.mode === 'FAST_PWM') {
      // Single slope ramp 0 -> TOP
      tcnt = Math.floor(normT * (top + 1));
      isMatch = tcnt === ocr;
      isOverflow = tcnt === 0;

      if (config.outputMode === 'NON_INVERTING') {
        pwmHigh = tcnt <= ocr;
      } else {
        pwmHigh = tcnt > ocr;
      }
    } else if (config.mode === 'PHASE_CORRECT' || config.mode === 'PHASE_FREQ_CORRECT') {
      // Dual slope triangle 0 -> TOP -> 0
      if (normT < 0.5) {
        tcnt = Math.floor((normT * 2) * top);
      } else {
        tcnt = Math.floor((2 - normT * 2) * top);
      }
      isMatch = tcnt === ocr;
      isOverflow = tcnt === 0 || tcnt === top;

      if (config.outputMode === 'NON_INVERTING') {
        pwmHigh = tcnt <= ocr;
      } else {
        pwmHigh = tcnt > ocr;
      }
    } else if (config.mode === 'CTC') {
      // CTC toggle mode
      tcnt = Math.floor((normT * (ocr + 1)) % (ocr + 1));
      isMatch = tcnt === ocr;
      pwmHigh = Math.floor((timeUs / (periodUs / 2))) % 2 === 0;
    }

    const pwmVolt = pwmHigh ? 5.0 : 0.0;
    // RC Low-pass filter IIR step
    vRc = vRc + alpha * (pwmVolt - vRc);

    samples.push({
      timeUs: timeUs,
      tcnt: tcnt,
      ocr: ocr,
      top: top,
      pwmSignal: pwmVolt,
      rcFilteredVoltage: Math.max(0, Math.min(5.0, vRc)),
      isMatch: isMatch,
      isOverflow: isOverflow,
    });
  }

  return samples;
}

export function buildPwmRegisters(config: PwmSimulationConfig): {
  TCCRA: number;
  TCCRB: number;
  TCNT: number;
  OCRA: number;
  OCRB: number;
  TIMSK: number;
  TIFR: number;
} {
  let tccra = 0;
  let tccrb = 0;

  // COM bits for Output Compare A (Bits 7:6 in TCCRxA)
  if (config.outputMode === 'NON_INVERTING') {
    tccra |= 0x80; // COM0A1 = 1, COM0A0 = 0
  } else if (config.outputMode === 'INVERTING') {
    tccra |= 0xc0; // COM0A1 = 1, COM0A0 = 1
  }

  // WGM bits for Waveform Generation Mode
  if (config.mode === 'FAST_PWM') {
    tccra |= 0x03; // WGM01=1, WGM00=1
    // WGM02=0
  } else if (config.mode === 'PHASE_CORRECT') {
    tccra |= 0x01; // WGM00=1
  } else if (config.mode === 'CTC') {
    tccra |= 0x02; // WGM01=1
  }

  // Prescaler bits CS02..0 in TCCRxB
  switch (config.prescaler) {
    case 1:
      tccrb |= 0x01;
      break;
    case 8:
      tccrb |= 0x02;
      break;
    case 64:
      tccrb |= 0x03;
      break;
    case 256:
      tccrb |= 0x04;
      break;
    case 1024:
      tccrb |= 0x05;
      break;
  }

  return {
    TCCRA: tccra,
    TCCRB: tccrb,
    TCNT: 0,
    OCRA: config.ocrValue & 0xff,
    OCRB: (config.ocrValue >> 1) & 0xff,
    TIMSK: 0x02, // OCIE0A enabled
    TIFR: 0x00,
  };
}

export function createDefaultPwmConfig(): PwmSimulationConfig {
  return {
    timer: 'TIMER0_8BIT',
    mode: 'FAST_PWM',
    prescaler: 64,
    ocrValue: 128, // 50% duty cycle
    topValue: 255,
    outputMode: 'NON_INVERTING',
    targetActuator: 'LED_DIMMER',
    pin: 'D6',
    fCpuHz: 16000000,
    motorLoadPct: 20,
    rcResistanceKohm: 10,
    rcCapacitanceUf: 10,
    toneFreqHz: 440,
    servoAngleDeg: 90,
  };
}

export function computePwmLiveState(
  config: PwmSimulationConfig,
  currentTcnt = 0,
  tcntDir: 'UP' | 'DOWN' = 'UP'
): PwmLiveState {
  const fPwm = calculatePwmFrequency(
    config.fCpuHz,
    config.prescaler,
    config.mode,
    config.topValue,
    config.ocrValue
  );

  const dutyPct = calculateDutyCycle(
    config.ocrValue,
    config.topValue,
    config.mode,
    config.outputMode
  );

  const effV = (dutyPct / 100) * 5.0;
  const periodUs = (1 / fPwm) * 1e6;
  const tHighUs = (dutyPct / 100) * periodUs;
  const tLowUs = periodUs - tHighUs;

  const samples = generatePwmWaveformSamples(config, fPwm, dutyPct);

  const regs = buildPwmRegisters(config);

  // Actuator dynamics
  const opticalBrightness = calculatePerceivedBrightness(dutyPct);

  // Motor RPM with load
  const noLoadRpm = (dutyPct / 100) * 3000;
  const actualMotorRpm = Math.max(0, Math.round(noLoadRpm * (1 - (config.motorLoadPct / 100) * 0.3)));

  // Servo pulse (1000us - 2000us)
  const servoPulseUs = 1000 + (config.servoAngleDeg / 180) * 1000;

  // RC ripple voltage approximation
  const tauSec = (config.rcResistanceKohm * 1e3) * (config.rcCapacitanceUf * 1e-6);
  const rippleMv =
    fPwm > 0 && tauSec > 0
      ? Math.min(5000, ((5.0 * (dutyPct / 100) * (1 - dutyPct / 100)) / (fPwm * tauSec)) * 1000)
      : 0;

  const pinVolt = currentTcnt <= config.ocrValue ? 5.0 : 0.0;

  return {
    dutyCyclePercent: dutyPct,
    effectiveVoltage: effV,
    calculatedFrequencyHz: fPwm,
    periodMicroseconds: periodUs,
    tHighUs: tHighUs,
    tLowUs: tLowUs,
    tcntCurrent: currentTcnt,
    tcntDirection: tcntDir,
    comparatorOutput: currentTcnt <= config.ocrValue,
    pinVoltage: pinVolt,
    motorRpm: actualMotorRpm,
    servoPulseWidthUs: servoPulseUs,
    opticalPerceivedBrightnessPct: opticalBrightness,
    rcFilteredVoltage: effV,
    rippleVoltageMv: rippleMv,
    registers: regs,
    samples: samples,
  };
}
