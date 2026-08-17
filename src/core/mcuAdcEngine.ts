import {
  AdcAlignment,
  AdcChannel,
  AdcInputSignalType,
  AdcLiveState,
  AdcPrescaler,
  AdcReference,
  AdcSimulationConfig,
  AdcTimingSample,
  SarStepDetail,
} from '../types/mcuAdc';

export function getVRefValue(ref: AdcReference, customVRef = 5.0): number {
  switch (ref) {
    case 'AVCC_5V':
      return 5.0;
    case 'INTERNAL_1V1':
      return 1.1;
    case 'INTERNAL_2V56':
      return 2.56;
    case 'AREF_EXTERNAL':
      return customVRef > 0 ? customVRef : 3.3;
  }
}

export function calculateAdcClock(fCpuHz: number, prescaler: AdcPrescaler): number {
  return fCpuHz / prescaler;
}

/**
 * Generate instantaneous analog input voltage given selected signal source and time
 */
export function sampleInputSignal(
  type: AdcInputSignalType,
  timeSec: number,
  config: AdcSimulationConfig,
  potVoltage = 2.5,
  tempCelsius = 25,
  ldrLux = 500
): number {
  let baseVoltage = 0.0;

  switch (type) {
    case 'POTENTIOMETER':
      baseVoltage = potVoltage;
      break;
    case 'TEMP_LM35':
      // LM35 outputs 10mV / °C -> e.g. 25°C = 0.25V, 100°C = 1.00V
      baseVoltage = Math.max(0.0, Math.min(5.0, (tempCelsius * 0.01)));
      break;
    case 'LDR_LIGHT':
      // LDR voltage divider simulation (0 lux = 0.1V, 1000 lux = 4.8V)
      baseVoltage = Math.min(5.0, 0.1 + (ldrLux / 1000) * 4.7);
      break;
    case 'DC_SLIDER':
      baseVoltage = config.manualVoltage;
      break;
    case 'SINE_WAVE': {
      const f = config.sineFreqHz || 10;
      const amp = config.sineAmplitudeV || 2.0;
      const offset = config.sineOffsetV || 2.5;
      baseVoltage = offset + amp * Math.sin(2 * Math.PI * f * timeSec);
      break;
    }
    case 'TRIANGLE_WAVE': {
      const f = config.sineFreqHz || 10;
      const period = 1 / f;
      const t = timeSec % period;
      const norm = t / period;
      const tri = norm < 0.5 ? norm * 2 : (1 - norm) * 2;
      const amp = config.sineAmplitudeV || 2.0;
      const offset = config.sineOffsetV || 2.5;
      baseVoltage = (offset - amp / 2) + tri * amp;
      break;
    }
    case 'NOISY_SENSOR':
      baseVoltage = config.manualVoltage;
      break;
  }

  // Inject Gaussian/Thermal noise if configured
  if (config.noiseMilliVolts > 0) {
    const noiseV = ((Math.random() - 0.5) * 2 * (config.noiseMilliVolts / 1000));
    baseVoltage += noiseV;
  }

  return Math.max(0.0, Math.min(5.0, baseVoltage));
}

/**
 * Execute the 10-bit Successive Approximation Register (SAR) binary search
 * and produce comprehensive step-by-step educational records.
 */
export function generateSarSteps(
  vin: number,
  vref: number,
  isFirstConversion = false,
  adlar: AdcAlignment = 'RIGHT_10BIT'
): SarStepDetail[] {
  const steps: SarStepDetail[] = [];
  const totalBits = 10;
  const lsbMv = (vref / 1024) * 1000;

  // Clamped input to reference range
  const clampedVin = Math.max(0.0, Math.min(vref, vin));

  // Current binary decisions [Bit 9, Bit 8, ..., Bit 0]
  const bitDecisions: ('1' | '0' | '?' | '-')[] = new Array(10).fill('-');

  // Step 0: Sample & Hold Capacitor Charging
  const shCycle = isFirstConversion ? 12 : 2;
  steps.push({
    stepIndex: 0,
    clockCycle: 1,
    phaseName: 'Sample & Hold (Charging)',
    phaseNameHu: 'Mintavételezés & Tartás (Kondenzátor Töltés)',
    testBit: null,
    dacCode: 0,
    dacVoltage: 0.0,
    inputVoltage: vin,
    comparatorOutput: false,
    accumulatedCode: 0,
    bitDecisions: [...bitDecisions],
    description: `Analog Multiplexer connects Vin (${vin.toFixed(4)}V) to internal 14pF Sample/Hold capacitor for ${shCycle} ADC clock cycles.`,
    descriptionHu: `Az analóg multiplexer rákapcsolja a mérendő bemenetet (${vin.toFixed(4)}V) a belső 14pF mintavevő kondenzátorra ${shCycle} ADC órajel cikluson át.`,
  });

  // Step 1: Hold (Disconnect Input)
  steps.push({
    stepIndex: 1,
    clockCycle: isFirstConversion ? 13 : 3,
    phaseName: 'Sample & Hold (Hold / Disconnected)',
    phaseNameHu: 'Mintavétel lezárva (Analóg Tartás)',
    testBit: null,
    dacCode: 0,
    dacVoltage: 0.0,
    inputVoltage: clampedVin,
    comparatorOutput: false,
    accumulatedCode: 0,
    bitDecisions: [...bitDecisions],
    description: `Sample/Hold switch opens. The sampled voltage (${clampedVin.toFixed(4)}V) is securely stored on internal holding capacitor for SAR conversion.`,
    descriptionHu: `A mintavevő kapcsoló kinyit. A mért analóg feszültség (${clampedVin.toFixed(4)}V) lebegve tárolódik a kondenzátoron a SAR komparáláshoz.`,
  });

  let accumulatedCode = 0;
  let currentCycle = isFirstConversion ? 14 : 4;

  // Step 2 to 11: Binary Search for Bit 9 down to Bit 0
  for (let bit = 9; bit >= 0; bit--) {
    const bitWeight = 1 << bit; // e.g. 512, 256, 128, 64, 32, 16, 8, 4, 2, 1
    const testCode = accumulatedCode | bitWeight;
    const testVdac = (testCode / 1024) * vref;
    const compResult = clampedVin >= testVdac;

    // Set testing indicator
    const currentDecisions = [...bitDecisions];
    currentDecisions[9 - bit] = compResult ? '1' : '0';

    if (compResult) {
      accumulatedCode = testCode; // Keep bit
    }

    bitDecisions[9 - bit] = compResult ? '1' : '0';

    const bitWeightMv = (bitWeight / 1024) * vref * 1000;

    steps.push({
      stepIndex: steps.length,
      clockCycle: currentCycle,
      phaseName: `SAR Test Bit ${bit} (Weight: ${bitWeight})`,
      phaseNameHu: `SAR Komparálás: Bit ${bit} (Súly: ${bitWeight} = ${bitWeightMv.toFixed(1)}mV)`,
      testBit: bit,
      dacCode: testCode,
      dacVoltage: testVdac,
      inputVoltage: clampedVin,
      comparatorOutput: compResult,
      accumulatedCode: accumulatedCode,
      bitDecisions: [...bitDecisions],
      description: `Testing Bit ${bit}: Internal DAC outputs ${testVdac.toFixed(4)}V. Vin (${clampedVin.toFixed(4)}V) ${compResult ? '≥' : '<'} Vdac. Comparator = ${compResult ? 'HIGH (Bit=1 kept)' : 'LOW (Bit=0 cleared)'}. SAR Code so far: ${accumulatedCode} (0x${accumulatedCode.toString(16).toUpperCase()}).`,
      descriptionHu: `Bit ${bit} tesztelése: Belső DAC feszültség = ${testVdac.toFixed(4)}V. Mivel Vin (${clampedVin.toFixed(4)}V) ${compResult ? '≥' : '<'} Vdac, a komparátor kimenete ${compResult ? '1 (Bit 1 marad)' : '0 (Bit 0-ra állítva)'}. Jelenlegi SAR érték: ${accumulatedCode}.`,
    });

    currentCycle++;
  }

  // Step 12: Latch Result & Trigger ADIF Interrupt
  const finalCode = accumulatedCode;
  const convertedVoltage = (finalCode / 1024) * vref;
  const quantErrorMv = (clampedVin - convertedVoltage) * 1000;
  const quantErrorLsb = clampedVin > 0 ? (clampedVin - convertedVoltage) / (vref / 1024) : 0;

  const adcl = adlar === 'LEFT_8BIT' ? (finalCode & 0x03) << 6 : finalCode & 0xff;
  const adch = adlar === 'LEFT_8BIT' ? (finalCode >> 2) & 0xff : (finalCode >> 8) & 0x03;

  steps.push({
    stepIndex: steps.length,
    clockCycle: currentCycle,
    phaseName: 'Conversion Complete (Data Latched & ADIF Set)',
    phaseNameHu: 'Átalakítás Befejezve (Adatmentés ADCL:ADCH & ADIF Megszakítás)',
    testBit: null,
    dacCode: finalCode,
    dacVoltage: convertedVoltage,
    inputVoltage: clampedVin,
    comparatorOutput: true,
    accumulatedCode: finalCode,
    bitDecisions: [...bitDecisions],
    description: `Conversion finished in ${currentCycle} ADC cycles! Result: 10-bit raw = ${finalCode} (0x${finalCode.toString(16).toUpperCase()}), Voltage = ${convertedVoltage.toFixed(4)}V. ADCL=0x${adcl.toString(16).padStart(2, '0').toUpperCase()}, ADCH=0x${adch.toString(16).padStart(2, '0').toUpperCase()}. ADSC cleared, ADIF interrupt flag set.`,
    descriptionHu: `Átalakítás sikeresen befejeződött ${currentCycle} órajel ciklus alatt! 10 bites digitális eredmény: ${finalCode} (${convertedVoltage.toFixed(4)}V). Eltérés (kvantálási hiba): ${quantErrorMv >= 0 ? '+' : ''}${quantErrorMv.toFixed(2)}mV (${quantErrorLsb.toFixed(2)} LSB).`,
  });

  return steps;
}

/**
 * Generate full timing waveforms for logic analyzer and timing diagram views
 */
export function generateAdcTimingWaveforms(
  config: AdcSimulationConfig,
  steps: SarStepDetail[],
  vref: number,
  vin: number,
  isFirstConversion = false
): AdcTimingSample[] {
  const totalCycles = isFirstConversion ? 25 : 13;
  const samples: AdcTimingSample[] = [];
  const tAdcUs = (1 / calculateAdcClock(config.fCpuHz, config.prescaler)) * 1e6;

  for (let cycle = 1; cycle <= totalCycles + 2; cycle++) {
    const isConverting = cycle >= 1 && cycle <= totalCycles;
    const isSamplePhase = isFirstConversion ? cycle <= 12 : cycle <= 2;
    const isHoldPhase = isFirstConversion ? cycle === 13 : cycle === 3;
    const isSarPhase = isFirstConversion
      ? cycle >= 14 && cycle <= 23
      : cycle >= 4 && cycle <= 13;
    const isDone = cycle >= totalCycles;

    // Find matching step
    let matchedStep = steps.find((s) => s.clockCycle === cycle);
    if (!matchedStep) {
      matchedStep = steps[steps.length - 1];
    }

    const activeBit = matchedStep.testBit;
    const dacVoltage = isSarPhase || isDone ? matchedStep.dacVoltage : 0.0;
    const compOut = matchedStep.comparatorOutput ? 1 : 0;

    let phaseLabel = 'IDLE';
    if (isSamplePhase) phaseLabel = 'SAMPLE (CAP CHARGE)';
    else if (isHoldPhase) phaseLabel = 'HOLD (DISCONNECT)';
    else if (isSarPhase) phaseLabel = activeBit !== null ? `SAR BIT ${activeBit}` : 'SAR CONVERT';
    else if (isDone) phaseLabel = 'LATCH & ADIF';

    // Sub-sample 2 points per ADC clock cycle for crisp square edges
    samples.push({
      cycle: cycle - 0.5,
      cpuTimeUs: (cycle - 0.5) * tAdcUs,
      clkCpu: 1,
      clkAdc: 1,
      sampleHoldSwitch: isSamplePhase ? 1 : 0,
      activeBit: activeBit,
      dacVoltage: dacVoltage,
      inputVoltage: vin,
      comparatorOut: compOut,
      adsc: isConverting ? 1 : 0,
      adif: isDone ? 1 : 0,
      dataLatch: isDone ? 1 : 0,
      phaseLabel: phaseLabel,
    });

    samples.push({
      cycle: cycle,
      cpuTimeUs: cycle * tAdcUs,
      clkCpu: 0,
      clkAdc: 0,
      sampleHoldSwitch: isSamplePhase ? 1 : 0,
      activeBit: activeBit,
      dacVoltage: dacVoltage,
      inputVoltage: vin,
      comparatorOut: compOut,
      adsc: isConverting ? 1 : 0,
      adif: isDone ? 1 : 0,
      dataLatch: isDone ? 1 : 0,
      phaseLabel: phaseLabel,
    });
  }

  return samples;
}

/**
 * Calculate register values based on config
 */
export function buildAdcRegisters(
  config: AdcSimulationConfig,
  rawValue10Bit: number,
  isConverting: boolean,
  adifSet: boolean
): {
  ADMUX: number;
  ADCSRA: number;
  ADCSRB: number;
  ADCL: number;
  ADCH: number;
  DIDR0: number;
} {
  // ADMUX: REFS1, REFS0, ADLAR, MUX4..0
  let admux = 0;
  if (config.reference === 'AVCC_5V') admux |= 0x40; // REFS0 = 1
  else if (config.reference === 'INTERNAL_1V1' || config.reference === 'INTERNAL_2V56') admux |= 0xc0; // REFS1=1, REFS0=1
  else if (config.reference === 'AREF_EXTERNAL') admux |= 0x00;

  if (config.alignment === 'LEFT_8BIT') admux |= 0x20; // ADLAR = 1

  // Channel MUX (0..7, 8=temp, 14=1.1V bandgap, 15=GND)
  if (typeof config.channel === 'number') {
    admux |= config.channel & 0x07;
  } else if (config.channel === 'TEMP') {
    admux |= 0x08;
  } else if (config.channel === 'BANDGAP_1V1') {
    admux |= 0x0e;
  } else if (config.channel === 'GND') {
    admux |= 0x0f;
  }

  // ADCSRA: ADEN, ADSC, ADATE, ADIF, ADIE, ADPS2..0
  let adcsra = 0x80; // ADEN = 1
  if (isConverting) adcsra |= 0x40; // ADSC = 1
  if (config.triggerSource !== 'FREE_RUNNING') adcsra |= 0x20; // ADATE
  if (adifSet) adcsra |= 0x10; // ADIF
  if (config.interruptEnabled) adcsra |= 0x08; // ADIE

  // Prescaler bits ADPS2..0
  switch (config.prescaler) {
    case 2:
      adcsra |= 0x01;
      break;
    case 4:
      adcsra |= 0x02;
      break;
    case 8:
      adcsra |= 0x03;
      break;
    case 16:
      adcsra |= 0x04;
      break;
    case 32:
      adcsra |= 0x05;
      break;
    case 64:
      adcsra |= 0x06;
      break;
    case 128:
      adcsra |= 0x07;
      break;
  }

  // ADCSRB: -, ACME, -, -, -, ADTS2..0
  let adcsrb = 0;
  switch (config.triggerSource) {
    case 'FREE_RUNNING':
      adcsrb |= 0x00;
      break;
    case 'ANALOG_COMP':
      adcsrb |= 0x01;
      break;
    case 'EXT_INT0':
      adcsrb |= 0x02;
      break;
    case 'TIMER0_COMPA':
      adcsrb |= 0x03;
      break;
    case 'TIMER0_OVF':
      adcsrb |= 0x04;
      break;
    case 'TIMER1_COMPB':
      adcsrb |= 0x05;
      break;
    case 'TIMER1_OVF':
      adcsrb |= 0x06;
      break;
    case 'TIMER1_CAPT':
      adcsrb |= 0x07;
      break;
  }

  // ADCL and ADCH split
  let adcl = 0;
  let adch = 0;
  if (config.alignment === 'LEFT_8BIT') {
    adch = (rawValue10Bit >> 2) & 0xff;
    adcl = (rawValue10Bit & 0x03) << 6;
  } else {
    adcl = rawValue10Bit & 0xff;
    adch = (rawValue10Bit >> 8) & 0x03;
  }

  return {
    ADMUX: admux,
    ADCSRA: adcsra,
    ADCSRB: adcsrb,
    ADCL: adcl,
    ADCH: adch,
    DIDR0: config.didr0Mask,
  };
}

export function createDefaultAdcConfig(): AdcSimulationConfig {
  return {
    fCpuHz: 16000000,
    prescaler: 128,
    reference: 'AVCC_5V',
    vRefCustom: 5.0,
    channel: 0,
    alignment: 'RIGHT_10BIT',
    triggerSource: 'FREE_RUNNING',
    interruptEnabled: false,
    inputSignalType: 'POTENTIOMETER',
    manualVoltage: 2.500,
    noiseMilliVolts: 0,
    sineFreqHz: 10,
    sineAmplitudeV: 2.0,
    sineOffsetV: 2.5,
    didr0Mask: 0x01, // A0 digital input disabled
  };
}

export function computeLiveAdcState(
  config: AdcSimulationConfig,
  timeSec = 0,
  potVoltage = 2.5,
  tempCelsius = 25,
  ldrLux = 500,
  isFirstConversion = false
): AdcLiveState {
  const vref = getVRefValue(config.reference, config.vRefCustom);
  const vin = sampleInputSignal(
    config.inputSignalType,
    timeSec,
    config,
    potVoltage,
    tempCelsius,
    ldrLux
  );

  const steps = generateSarSteps(vin, vref, isFirstConversion, config.alignment);
  const lastStep = steps[steps.length - 1];
  const finalCode = lastStep.accumulatedCode;
  const convertedV = (finalCode / 1024) * vref;
  const lsbMv = (vref / 1024) * 1000;
  const qErrMv = (vin - convertedV) * 1000;
  const qErrLsb = (vin - convertedV) / (vref / 1024);

  const fAdc = calculateAdcClock(config.fCpuHz, config.prescaler);
  const tAdcUs = (1 / fAdc) * 1e6;
  const totalCycles = isFirstConversion ? 25 : 13;
  const convTimeUs = totalCycles * tAdcUs;
  const sampTimeUs = (isFirstConversion ? 12 : 1.5) * tAdcUs;

  const timingSamples = generateAdcTimingWaveforms(config, steps, vref, vin, isFirstConversion);

  const regs = buildAdcRegisters(config, finalCode, false, true);

  return {
    enabled: true,
    isConverting: false,
    isFirstConversion: isFirstConversion,
    currentCycle: totalCycles,
    totalCyclesRequired: totalCycles,
    sarStepIndex: steps.length - 1,
    currentSarValue: finalCode,
    sampleAndHoldVoltage: vin,
    currentDacVoltage: convertedV,
    currentComparatorResult: true,

    ADMUX: regs.ADMUX,
    ADCSRA: regs.ADCSRA,
    ADCSRB: regs.ADCSRB,
    ADCL: regs.ADCL,
    ADCH: regs.ADCH,
    DIDR0: regs.DIDR0,

    rawResult10Bit: finalCode,
    voltageResult: convertedV,
    lsbStepMilliVolts: lsbMv,
    quantizationErrorMv: qErrMv,
    quantizationErrorLsb: qErrLsb,
    signalToNoiseRatioDb: 6.02 * 10 + 1.76, // 61.96 dB

    steps: steps,
    timingHistory: timingSamples,

    fAdcActualHz: fAdc,
    conversionTimeUs: convTimeUs,
    samplingTimeUs: sampTimeUs,
  };
}
