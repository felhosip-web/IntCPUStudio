import React, { useEffect, useRef, useState } from 'react';
import { PROTOCOL_SPECS } from '../../../core/mcuProtocolData';
import { ProtocolType } from '../../../types/mcuProtocols';
import { McuProtocolWaveform } from './McuProtocolWaveform';
import { McuProtocolCircuit } from './McuProtocolCircuit';
import { McuProtocolComparisonTable } from './McuProtocolComparisonTable';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  FastForward,
  Info,
  Layers,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

export const McuProtocolLab: React.FC = () => {
  const { language } = useI18n();
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>('I2C');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepDurationMs, setStepDurationMs] = useState<number>(1200); // 1.2s per step
  const [activeSubTab, setActiveSubTab] = useState<'SIMULATION' | 'COMPARISON' | 'CODE'>('SIMULATION');

  const spec = PROTOCOL_SPECS[selectedProtocol];
  const preset = spec.presets[0];
  const steps = preset?.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch protocol reset
  const handleSelectProtocol = (prot: ProtocolType) => {
    setSelectedProtocol(prot);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            return 0; // Loop back to start
          }
          return prev + 1;
        });
      }, stepDurationMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, stepDurationMs]);

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Top Protocol Selector Tabs */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ONE_WIRE', label: '1-Wire', color: '#06B6D4' },
              { id: 'I2C', label: 'I2C (TWI)', color: '#8B5CF6' },
              { id: 'SPI', label: 'SPI', color: '#10B981' },
              { id: 'CAN', label: 'CAN Bus', color: '#F59E0B' },
              { id: 'RS485', label: 'RS-485', color: '#EC4899' },
              { id: 'RS422', label: 'RS-422', color: '#3B82F6' },
              { id: 'RS232', label: 'RS-232', color: '#6366F1' },
            ] as const
          ).map((item) => {
            const isSelected = selectedProtocol === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectProtocol(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white border shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-transparent'
                }`}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                  boxShadow: isSelected ? `0 0 15px ${item.color}25` : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-view View Switcher */}
        <div className="flex items-center gap-1 bg-[#05070A] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('SIMULATION')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'SIMULATION'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Szimuláció & Oszcilloszkóp' : 'Simulation & Scope'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'COMPARISON'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Összehasonlítás' : 'Comparison'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'COMPARISON' ? (
        <McuProtocolComparisonTable
          selectedProtocol={selectedProtocol}
          onSelectProtocol={handleSelectProtocol}
        />
      ) : (
        <>
          {/* Main Simulation View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Protocol Overview & Step-by-Step Educational Inspector (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Protocol Header Card */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2.5 rounded-xl border"
                      style={{
                        backgroundColor: `${spec.color}15`,
                        borderColor: `${spec.color}40`,
                        color: spec.color,
                      }}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">
                        {language === 'hu' ? spec.nameHu : spec.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {spec.inventor} ({spec.year})
                      </p>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border"
                    style={{
                      backgroundColor: `${spec.color}15`,
                      borderColor: `${spec.color}40`,
                      color: spec.color,
                    }}
                  >
                    {spec.duplexMode}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-300 font-mono leading-relaxed bg-[#05070A] p-2.5 rounded-xl border border-slate-800/80">
                  {language === 'hu' ? spec.shortDescriptionHu : spec.shortDescription}
                </p>

                {/* Preset Scenario Badge */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-[11px] text-slate-500 font-bold">
                    {language === 'hu' ? 'Aktuális Teszt Szcenárió:' : 'Active Test Scenario:'}
                  </span>
                  <span className="text-slate-200 font-semibold text-right truncate max-w-[240px]">
                    {language === 'hu' ? preset.titleHu : preset.title}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Educational Explanation Card */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-mono text-white">
                      {language === 'hu' ? 'Fázis & Működési Magyarázat' : 'Phase & Operation Analysis'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    Lépés {currentStepIndex + 1} / {steps.length}
                  </span>
                </div>

                {/* Current Phase Title & Category */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold font-mono text-amber-300">
                    {language === 'hu' ? currentStep.phaseNameHu : currentStep.phaseName}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                    T+{currentStep.timeUs} µs
                  </span>
                </div>

                {/* Deep Educational Explanation Text */}
                <div className="bg-[#05070A] p-3 rounded-xl border border-slate-800/90 text-xs font-mono text-slate-200 leading-relaxed">
                  {language === 'hu' ? currentStep.explanationHu : currentStep.explanation}
                </div>

                {/* Dual Node Action Breakdown (Master vs Slave) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {/* Master MCU Box */}
                  <div className="bg-cyan-950/20 border border-cyan-900/40 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-cyan-400 block mb-1">
                      Master MCU {language === 'hu' ? 'Tevékenység:' : 'Action:'}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {language === 'hu' ? currentStep.masterActionHu : currentStep.masterAction}
                    </p>
                  </div>

                  {/* Slave Node Box */}
                  <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-purple-400 block mb-1">
                      Slave {language === 'hu' ? 'Válasz / Tevékenység:' : 'Response:'}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {language === 'hu' ? currentStep.slaveActionHu : currentStep.slaveAction}
                    </p>
                  </div>
                </div>

                {/* Interactive Player Controls */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Previous Step */}
                    <button
                      onClick={handleStepPrev}
                      disabled={currentStepIndex === 0}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 cursor-pointer transition-all"
                      title="Előző lépés"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Play / Pause */}
                    <button
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className={`px-4 py-2 rounded-xl font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                        isPlaying
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-white" />
                          <span>{language === 'hu' ? 'Szünet' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>{language === 'hu' ? 'Lejátszás' : 'Play'}</span>
                        </>
                      )}
                    </button>

                    {/* Next Step */}
                    <button
                      onClick={handleStepNext}
                      disabled={currentStepIndex === steps.length - 1}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 cursor-pointer transition-all"
                      title="Következő lépés"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Reset */}
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-all"
                      title="Visszaállítás az elejére"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Playback Speed Slider */}
                  <div className="flex items-center gap-2 bg-[#05070A] px-2.5 py-1.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-500">{language === 'hu' ? 'Időzítés:' : 'Speed:'}</span>
                    <select
                      value={stepDurationMs}
                      onChange={(e) => setStepDurationMs(Number(e.target.value))}
                      className="bg-slate-900 text-cyan-300 font-bold rounded px-1.5 py-0.5 border border-slate-700 outline-none cursor-pointer"
                    >
                      <option value={2000}>0.5x (2.0s)</option>
                      <option value={1200}>1.0x (1.2s)</option>
                      <option value={600}>2.0x (0.6s)</option>
                      <option value={300}>4.0x (0.3s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Circuit & Logic Analyzer Waveforms (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Physical Circuit Diagram */}
              <McuProtocolCircuit spec={spec} currentStep={currentStep} />

              {/* Logic Analyzer Waveform Timing Chart */}
              <McuProtocolWaveform
                spec={spec}
                currentStepIndex={currentStepIndex}
                onSelectStep={(idx) => {
                  setIsPlaying(false);
                  setCurrentStepIndex(idx);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
