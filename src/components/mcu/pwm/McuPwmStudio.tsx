import React, { useEffect, useState } from 'react';
import {
  PwmMode,
  PwmOutputMode,
  PwmPin,
  PwmPrescaler,
  PwmSimulationConfig,
  PwmTargetActuator,
  PwmTimerId,
} from '../../../types/mcuPwm';
import {
  computePwmLiveState,
  createDefaultPwmConfig,
} from '../../../core/mcuPwmEngine';
import { PwmOscilloscope } from './PwmOscilloscope';
import { PwmActuatorsView } from './PwmActuatorsView';
import { PwmRegistersView } from './PwmRegistersView';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Code2,
  Compass,
  Cpu,
  FastForward,
  Flame,
  Gauge,
  Info,
  Layers,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  Waves,
  Zap,
} from 'lucide-react';

interface McuPwmStudioProps {
  initialOcr?: number;
}

export const McuPwmStudio: React.FC<McuPwmStudioProps> = ({
  initialOcr = 128,
}) => {
  const { language } = useI18n();

  const [config, setConfig] = useState<PwmSimulationConfig>(() => {
    const def = createDefaultPwmConfig();
    def.ocrValue = initialOcr;
    return def;
  });

  const [activeTab, setActiveTab] = useState<'OSCILLOSCOPE' | 'ACTUATORS' | 'REGISTERS' | 'CODE'>('OSCILLOSCOPE');

  // Step-by-step TCNT Clock Counter state
  const [currentTcnt, setCurrentTcnt] = useState<number>(0);
  const [tcntDir, setTcntDir] = useState<'UP' | 'DOWN'>('UP');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [clockSpeedMs, setClockSpeedMs] = useState<number>(40);

  const liveState = computePwmLiveState(config, currentTcnt, tcntDir);

  // Auto-run TCNT simulation timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTcnt((prev) => {
        const top = config.topValue || 255;
        if (config.mode === 'FAST_PWM') {
          return prev >= top ? 0 : prev + 4;
        } else if (config.mode === 'PHASE_CORRECT') {
          if (tcntDir === 'UP') {
            if (prev >= top) {
              setTcntDir('DOWN');
              return top - 4;
            }
            return prev + 4;
          } else {
            if (prev <= 0) {
              setTcntDir('UP');
              return 4;
            }
            return prev - 4;
          }
        } else {
          return prev >= (config.ocrValue || 255) ? 0 : prev + 4;
        }
      });
    }, clockSpeedMs);

    return () => clearInterval(interval);
  }, [isPlaying, clockSpeedMs, config.mode, config.topValue, config.ocrValue, tcntDir]);

  const handleStepClock = () => {
    setIsPlaying(false);
    setCurrentTcnt((prev) => {
      const top = config.topValue || 255;
      return (prev + 4) % (top + 1);
    });
  };

  const handleResetClock = () => {
    setIsPlaying(false);
    setCurrentTcnt(0);
    setTcntDir('UP');
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none font-sans pb-10">
      {/* Top Hero Banner */}
      <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-950/50">
            <Waves className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">
                {language === 'hu'
                  ? 'MCU PWM & Hardveres Időzítő Stúdió'
                  : 'MCU PWM & Hardware Timer Studio'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 border border-purple-700 text-purple-300">
                Timer0 / Timer1 / Timer2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Impulzusszélesség Moduláció (PWM), Időzítő Módok (Fast PWM, Phase Correct), Kitöltés és Aktuátorok'
                : 'Pulse Width Modulation (PWM), Timer Modes (Fast PWM, Phase Correct), Duty & Actuators'}
            </p>
          </div>
        </div>

        {/* Live Calculation Metric Badges */}
        <div className="flex items-center gap-3 bg-[#05070A] p-2.5 px-4 rounded-2xl border border-slate-800 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold">Frekvencia (fPWM):</span>
            <span className="text-purple-400 font-bold text-base">
              {liveState.calculatedFrequencyHz >= 1000
                ? `${(liveState.calculatedFrequencyHz / 1000).toFixed(2)} kHz`
                : `${liveState.calculatedFrequencyHz.toFixed(1)} Hz`}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold">Kitöltési Tényező:</span>
            <span className="text-emerald-400 font-bold text-base">
              {liveState.dutyCyclePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold">Veff Analóg Átlag:</span>
            <span className="text-cyan-400 font-bold text-base">
              {liveState.effectiveVoltage.toFixed(2)} V
            </span>
          </div>
        </div>
      </div>

      {/* Main Hardware Configuration Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Duty Cycle Sliders (Col 1-7) */}
        <div className="lg:col-span-7 bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>{language === 'hu' ? 'Kitöltési Tényező (OCR Küszöb)' : 'Duty Cycle (OCR Threshold)'}</span>
            </span>
            <span className="text-purple-400 font-bold">
              OCR = {config.ocrValue} / {config.topValue} ({liveState.dutyCyclePercent.toFixed(1)}%)
            </span>
          </div>

          {/* OCR Range Slider */}
          <div className="flex flex-col gap-1.5 pt-1">
            <input
              type="range"
              min="0"
              max={config.topValue}
              value={config.ocrValue}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  ocrValue: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (0.00V)</span>
              <span>25% (1.25V)</span>
              <span>50% (2.50V)</span>
              <span>75% (3.75V)</span>
              <span>100% (5.00V)</span>
            </div>
          </div>

          {/* Quick Duty Presets */}
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
            <span className="text-slate-500">Gyors gombok:</span>
            {[0, 64, 128, 192, 255].map((val) => (
              <button
                key={val}
                onClick={() => setConfig((prev) => ({ ...prev, ocrValue: val }))}
                className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                  config.ocrValue === val
                    ? 'bg-purple-600 border-purple-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {Math.round((val / 255) * 100)}%
              </button>
            ))}
          </div>
        </div>

        {/* Right: Timer Mode & Hardware Prescaler (Col 8-12) */}
        <div className="lg:col-span-5 bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{language === 'hu' ? 'Hardveres Időzítő Mód' : 'Hardware Timer Mode'}</span>
            </span>
            <span className="text-[10px] text-slate-500">{config.timer}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Timer Unit */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Időzítő Egység:</label>
              <select
                value={config.timer}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    timer: e.target.value as PwmTimerId,
                    topValue: e.target.value === 'TIMER1_16BIT' ? 1023 : 255,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="TIMER0_8BIT">Timer0 (8-bit: D5, D6)</option>
                <option value="TIMER1_16BIT">Timer1 (16-bit: D9, D10)</option>
                <option value="TIMER2_8BIT">Timer2 (8-bit: D3, D11)</option>
              </select>
            </div>

            {/* Mode */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Működési Mód (WGM):</label>
              <select
                value={config.mode}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    mode: e.target.value as PwmMode,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="FAST_PWM">Fast PWM (Single-slope)</option>
                <option value="PHASE_CORRECT">Phase Correct (Dual-slope)</option>
                <option value="CTC">CTC (Compare Match)</option>
              </select>
            </div>

            {/* Prescaler */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Előosztó (CS):</label>
              <select
                value={config.prescaler.toString()}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    prescaler: parseInt(e.target.value, 10) as PwmPrescaler,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="1">/1 (62.5 kHz)</option>
                <option value="8">/8 (7.8 kHz)</option>
                <option value="64">/64 (976 Hz Standard)</option>
                <option value="256">/256 (244 Hz)</option>
                <option value="1024">/1024 (61 Hz)</option>
              </select>
            </div>

            {/* Inverting / Non-Inverting */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Kimeneti Polaritás (COM):</label>
              <select
                value={config.outputMode}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    outputMode: e.target.value as PwmOutputMode,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="NON_INVERTING">Non-Inverting (Alapértelmezett)</option>
                <option value="INVERTING">Inverting (Fordított)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TCNT Counter Simulation & Stepping Controls */}
      <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: TCNT live value */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-[#05070A] p-2 px-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px]">TCNT0 Számláló:</span>
            <span className="text-amber-400 font-bold text-sm">
              {currentTcnt} <span className="text-[10px] text-slate-500">/ {config.topValue}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#05070A] p-2 px-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px]">Komparátor Kimenet:</span>
            <span
              className={`font-bold text-xs ${
                liveState.comparatorOutput ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {liveState.comparatorOutput ? 'HIGH (5V)' : 'LOW (0V)'}
            </span>
          </div>
        </div>

        {/* Center: Play / Pause / Step */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleResetClock}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Reset Counter TCNT=0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-amber-900/50'
                : 'bg-purple-600 text-white shadow-purple-900/50 hover:bg-purple-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{language === 'hu' ? 'Szünet' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{language === 'hu' ? 'Órajel Futás' : 'Run Clock'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepClock}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {language === 'hu' ? 'Léptetés (Step Tick)' : 'Step Tick'}
          </button>
        </div>

        {/* Right: Clock speed */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>{language === 'hu' ? 'Órajel Sebesség:' : 'Clock Speed:'}</span>
          <select
            value={clockSpeedMs}
            onChange={(e) => setClockSpeedMs(parseInt(e.target.value, 10))}
            className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 outline-none"
          >
            <option value="100">Lassú (100 ms / tick)</option>
            <option value="40">Normál (40 ms / tick)</option>
            <option value="10">Gyors (10 ms / tick)</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('OSCILLOSCOPE')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'OSCILLOSCOPE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>{language === 'hu' ? '1. Oszcilloszkóp & Hullámformák' : '1. Oscilloscope & Waveforms'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTUATORS')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'ACTUATORS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>{language === 'hu' ? '2. Fizikai Aktuátorok (Motor, LED, Szervó)' : '2. Physical Actuators (Motor, LED, Servo)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTERS')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'REGISTERS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'hu' ? '3. Hardver Regiszterek' : '3. Hardware Registers'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'OSCILLOSCOPE' && (
        <PwmOscilloscope liveState={liveState} config={config} />
      )}

      {activeTab === 'ACTUATORS' && (
        <PwmActuatorsView
          liveState={liveState}
          config={config}
          onChangeActuator={(act) => setConfig((prev) => ({ ...prev, targetActuator: act }))}
          onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        />
      )}

      {activeTab === 'REGISTERS' && (
        <PwmRegistersView
          liveState={liveState}
          config={config}
          onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        />
      )}
    </div>
  );
};
