import React from 'react';
import { AdcLiveState, SarStepDetail } from '../../../types/mcuAdc';
import { useI18n } from '../../../i18n/I18nContext';
import { ArrowRight, CheckCircle2, ChevronRight, Cpu, Gauge, Layers, ShieldAlert, Zap } from 'lucide-react';

interface AdcSarVisualizerProps {
  liveState: AdcLiveState;
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  vRef: number;
}

export const AdcSarVisualizer: React.FC<AdcSarVisualizerProps> = ({
  liveState,
  currentStepIndex,
  onSelectStep,
  vRef,
}) => {
  const { language } = useI18n();
  const currentStep: SarStepDetail =
    liveState.steps[currentStepIndex] || liveState.steps[liveState.steps.length - 1];

  const isSamplePhase = currentStep.stepIndex <= 1;
  const isCompletePhase = currentStep.stepIndex === liveState.steps.length - 1;
  const isSarComparison = !isSamplePhase && !isCompletePhase;

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span>
                {language === 'hu'
                  ? 'SAR (Successive Approximation Register) Belső Áramkör'
                  : 'SAR (Successive Approximation Register) Internal Architecture'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                10-Bit Binary Search
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Bináris közelítés: Mintavételezés -> Komparálás (Bit 9 -> Bit 0) -> ADCL/ADCH Regiszter tárolás'
                : 'Binary search: Sample & Hold -> SAR Bit 9..0 DAC comparison -> ADCL/ADCH latch'}
            </p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {language === 'hu' ? 'Fázis:' : 'Phase:'}
          </span>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              isSamplePhase
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : isCompletePhase
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {language === 'hu' ? currentStep.phaseNameHu : currentStep.phaseName}
          </span>
        </div>
      </div>

      {/* Interactive Circuit Schematic SVG / Flex Diagram */}
      <div className="bg-[#05070A] rounded-2xl border border-slate-800/80 p-4 relative overflow-hidden">
        {/* Visual Flow: Vin -> MUX -> Sample/Hold -> Comparator (+/-) -> SAR Logic & DAC -> Registers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Block 1: Analog Input Multiplexer */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
              <span>{language === 'hu' ? '1. ANALÓG MULTIPLEXER' : '1. ANALOG MUX'}</span>
              <span className="text-emerald-400">MUX3..0</span>
            </div>
            <div className="p-2 bg-black/50 rounded-lg border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Input (Vin):</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {currentStep.inputVoltage.toFixed(4)} V
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>Reference (VREF):</span>
                <span className="text-slate-300">{vRef.toFixed(3)} V</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
              <span>{language === 'hu' ? 'Kiválasztott: ADC0 (A0)' : 'Selected: ADC0 (A0)'}</span>
            </div>
          </div>

          {/* Block 2: Sample & Hold Circuit */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
              <span>{language === 'hu' ? '2. MINTAVÉTEL & TARTÁS' : '2. SAMPLE & HOLD'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  currentStep.stepIndex === 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep.stepIndex === 0 ? 'SWITCH CLOSED (CHARGE)' : 'SWITCH OPEN (HOLD)'}
              </span>
            </div>

            <div className="p-2 bg-black/50 rounded-lg border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Holding Cap (Cs):</span>
                <span className="text-cyan-300 font-bold">14 pF</span>
              </div>
              {/* Capacitor Charge Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (currentStep.inputVoltage / vRef) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>Sampled Vhold:</span>
                <span className="text-cyan-300 font-bold">
                  {currentStep.inputVoltage.toFixed(4)} V
                </span>
              </div>
            </div>
          </div>

          {/* Block 3: Analog Voltage Comparator */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
              <span>{language === 'hu' ? '3. ANALÓG KOMPARÁTOR' : '3. COMPARATOR'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  currentStep.comparatorOutput
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                OUT: {currentStep.comparatorOutput ? '1 (HIGH)' : '0 (LOW)'}
              </span>
            </div>

            <div className="p-2 bg-black/50 rounded-lg border border-slate-800 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">+ Vin (Sample):</span>
                <span className="text-emerald-300 font-bold">
                  {currentStep.inputVoltage.toFixed(4)} V
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">- Vdac (Testing):</span>
                <span className="text-amber-300 font-bold">
                  {currentStep.dacVoltage.toFixed(4)} V
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Decision:</span>
                <span
                  className={`font-bold ${
                    currentStep.comparatorOutput ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentStep.inputVoltage >= currentStep.dacVoltage
                    ? 'Vin >= Vdac -> KEEP 1'
                    : 'Vin < Vdac -> CLEAR 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Block 4: SAR Logic & Internal R-2R DAC */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
              <span>{language === 'hu' ? '4. SAR REGISZTER & DAC' : '4. SAR & R-2R DAC'}</span>
              <span className="text-amber-400 font-bold">
                {currentStep.testBit !== null ? `Testing Bit ${currentStep.testBit}` : 'Done'}
              </span>
            </div>

            <div className="p-2 bg-black/50 rounded-lg border border-slate-800 flex flex-col gap-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SAR Code:</span>
                <span className="text-cyan-300 font-bold">
                  {currentStep.accumulatedCode} / 1023
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Hex / Binary:</span>
                <span className="text-slate-300">
                  0x{currentStep.accumulatedCode.toString(16).toUpperCase().padStart(3, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Clock Cycle:</span>
                <span className="text-purple-300 font-bold">T{currentStep.clockCycle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Bit Register Visualizer (Bits 9 down to 0) */}
      <div className="flex flex-col gap-2 bg-[#05070A] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'hu'
                ? 'SAR 10-Bites Bináris Regiszter Állapota (B9 .. B0)'
                : 'SAR 10-Bit Binary Register State (B9 .. B0)'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500">
            {language === 'hu'
              ? 'Kattints bármelyik bitre vagy fázisra az időbeli visszaugráshoz'
              : 'Click any step below to time-travel'}
          </span>
        </div>

        {/* 10 Bits Graphical Display */}
        <div className="grid grid-cols-10 gap-1.5 font-mono">
          {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
            const decision = currentStep.bitDecisions[9 - bitIdx];
            const isCurrentlyTested = currentStep.testBit === bitIdx;
            const weight = 1 << bitIdx;
            const weightMv = (weight / 1024) * vRef * 1000;

            let bgColor = 'bg-slate-900/80 border-slate-800 text-slate-500';
            if (isCurrentlyTested) {
              bgColor = 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-400/50 shadow-lg animate-pulse';
            } else if (decision === '1') {
              bgColor = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm';
            } else if (decision === '0') {
              bgColor = 'bg-rose-950/40 border-rose-800/60 text-rose-400';
            }

            return (
              <div
                key={bitIdx}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${bgColor}`}
              >
                <div className="text-[9px] font-bold text-slate-400">Bit {bitIdx}</div>
                <div className="text-base font-bold">
                  {decision === '-' ? '?' : decision}
                </div>
                <div className="text-[8px] text-slate-400 truncate max-w-full">
                  +{weight}
                </div>
                <div className="text-[7px] text-slate-500 truncate max-w-full">
                  {weightMv.toFixed(0)}mV
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Sequence Scroller & Description */}
      <div className="bg-[#0F172A]/70 rounded-2xl border border-slate-800 p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'hu'
                ? `Lépés ${currentStep.stepIndex + 1} / ${liveState.steps.length}: ${currentStep.phaseNameHu}`
                : `Step ${currentStep.stepIndex + 1} / ${liveState.steps.length}: ${currentStep.phaseName}`}
            </span>
          </span>
          <span className="text-[11px] text-slate-400">
            Clock Cycle: <strong className="text-purple-300">T{currentStep.clockCycle}</strong>
          </span>
        </div>

        <p className="text-xs font-mono text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-slate-800/80">
          {language === 'hu' ? currentStep.descriptionHu : currentStep.description}
        </p>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {liveState.steps.map((s, idx) => {
            const isSelected = idx === currentStepIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectStep(idx)}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {idx === 0
                  ? 'S/H Cap'
                  : idx === 1
                  ? 'Hold'
                  : idx === liveState.steps.length - 1
                  ? 'Done'
                  : `B${s.testBit}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
