import React, { useEffect, useState } from 'react';
import {
  AdcAlignment,
  AdcChannel,
  AdcInputSignalType,
  AdcLiveState,
  AdcPrescaler,
  AdcReference,
  AdcSimulationConfig,
} from '../../../types/mcuAdc';
import {
  computeLiveAdcState,
  createDefaultAdcConfig,
  getVRefValue,
} from '../../../core/mcuAdcEngine';
import { AdcSarVisualizer } from './AdcSarVisualizer';
import { AdcTimingDiagram } from './AdcTimingDiagram';
import { AdcRegistersView } from './AdcRegistersView';
import { AdcTransferCurve } from './AdcTransferCurve';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  FastForward,
  Flame,
  Gauge,
  Info,
  Layers,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sun,
  Waves,
  Zap,
} from 'lucide-react';

interface McuAdcStudioProps {
  potVoltage?: number;
  tempCelsius?: number;
  ldrLux?: number;
}

export const McuAdcStudio: React.FC<McuAdcStudioProps> = ({
  potVoltage = 2.5,
  tempCelsius = 25,
  ldrLux = 500,
}) => {
  const { language } = useI18n();

  const [config, setConfig] = useState<AdcSimulationConfig>(createDefaultAdcConfig());
  const [activeTab, setActiveTab] = useState<'SAR_ARCH' | 'TIMING' | 'REGISTERS' | 'QUANTIZATION' | 'CODE'>('SAR_ARCH');

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(400);

  // Time ticker for dynamic signal generation (sine wave, etc.)
  const [timeSec, setTimeSec] = useState<number>(0);

  // Compute live state
  const liveState: AdcLiveState = computeLiveAdcState(
    config,
    timeSec,
    potVoltage,
    tempCelsius,
    ldrLux
  );

  const vRef = getVRefValue(config.reference, config.vRefCustom);

  // Auto-play interval for stepping through SAR
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= liveState.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeedMs);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeedMs, liveState.steps.length]);

  // Dynamic signal timer
  useEffect(() => {
    if (config.inputSignalType === 'SINE_WAVE' || config.inputSignalType === 'TRIANGLE_WAVE') {
      const timer = setInterval(() => {
        setTimeSec((t) => t + 0.05);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [config.inputSignalType]);

  const handleStartConversion = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(liveState.steps.length - 1, prev + 1));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(liveState.steps.length - 1);
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none font-sans pb-10">
      {/* Top Banner / Hero */}
      <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/50">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">
                {language === 'hu'
                  ? 'MCU ADC Stúdió & Időzítés Vizualizáció'
                  : 'MCU ADC Studio & Timing Visualizer'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                10-Bit SAR ADC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Analóg-Digitális Átalakító (SAR), Mintavételezés & Tartás, Órajel-Időzítés és Regiszterek'
                : 'Analog-to-Digital Converter (SAR), Sample & Hold, Clock Timing & Register Architecture'}
            </p>
          </div>
        </div>

        {/* Quick Result Badge */}
        <div className="flex items-center gap-3 bg-[#05070A] p-2.5 px-4 rounded-2xl border border-slate-800 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold">Mért Feszültség:</span>
            <span className="text-emerald-300 font-bold text-base">
              {liveState.voltageResult.toFixed(4)} V
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold">10-bit Nyers Kód:</span>
            <span className="text-cyan-400 font-bold text-base">
              {liveState.rawResult10Bit} <span className="text-[10px] text-slate-500">/ 1023</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Signal Generator & Hardware Config Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Signal Source Selector (Col 1-7) */}
        <div className="lg:col-span-7 bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between font-mono text-xs text-slate-300">
            <span className="font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hu' ? 'Analóg Bemeneti Forrás' : 'Analog Input Signal'}</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              Vin = {liveState.sampleAndHoldVoltage.toFixed(4)} V
            </span>
          </div>

          {/* Signal Source Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono text-[10px]">
            {[
              { id: 'POTENTIOMETER', label: 'Potméter', icon: Gauge },
              { id: 'TEMP_LM35', label: 'LM35 Hőmérő', icon: Flame },
              { id: 'LDR_LIGHT', label: 'LDR Fény', icon: Sun },
              { id: 'DC_SLIDER', label: 'DC Feszültség', icon: Sliders },
              { id: 'SINE_WAVE', label: 'Szinusz', icon: Waves },
              { id: 'NOISY_SENSOR', label: 'Zajos Szenzor', icon: Activity },
            ].map((src) => {
              const Icon = src.icon;
              const isSelected = config.inputSignalType === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      inputSignalType: src.id as AdcInputSignalType,
                    }))
                  }
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold shadow-md'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-full">{src.label}</span>
                </button>
              );
            })}
          </div>

          {/* DC Voltage Slider or Noise Slider Controls */}
          {config.inputSignalType === 'DC_SLIDER' && (
            <div className="flex flex-col gap-1 pt-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>DC Bemenet Beállítása:</span>
                <span className="text-emerald-400 font-bold">
                  {config.manualVoltage.toFixed(3)} V
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max={vRef}
                step="0.005"
                value={config.manualVoltage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    manualVoltage: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {config.inputSignalType === 'NOISY_SENSOR' && (
            <div className="flex flex-col gap-1 pt-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Analóg Termikus Zaj (mV RMS):</span>
                <span className="text-amber-400 font-bold">{config.noiseMilliVolts} mV</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={config.noiseMilliVolts}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    noiseMilliVolts: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Hardware Configuration (Prescaler, Reference, ADLAR) (Col 8-12) */}
        <div className="lg:col-span-5 bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{language === 'hu' ? 'ADC Konfiguráció' : 'ADC Config'}</span>
            </span>
            <span className="text-[10px] text-slate-500">ADMUX / ADCSRA</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Reference */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Referencia (VREF):</label>
              <select
                value={config.reference}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    reference: e.target.value as AdcReference,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="AVCC_5V">AVCC (5.00V)</option>
                <option value="INTERNAL_1V1">Internal (1.10V)</option>
                <option value="AREF_EXTERNAL">AREF (3.30V)</option>
              </select>
            </div>

            {/* Prescaler */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">Órajel Előosztó:</label>
              <select
                value={config.prescaler}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    prescaler: parseInt(e.target.value, 10) as AdcPrescaler,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="128">/128 (125 kHz - Standard)</option>
                <option value="64">/64 (250 kHz)</option>
                <option value="32">/32 (500 kHz)</option>
                <option value="16">/16 (1 MHz)</option>
              </select>
            </div>

            {/* Alignment ADLAR */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">ADLAR Igazítás:</label>
              <select
                value={config.alignment}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    alignment: e.target.value as AdcAlignment,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="RIGHT_10BIT">Jobbra zárt (10-bit)</option>
                <option value="LEFT_8BIT">Balra zárt (8-bit ADCH)</option>
              </select>
            </div>

            {/* Channel */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400">MUX Csatorna:</label>
              <select
                value={config.channel.toString()}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    channel: parseInt(e.target.value, 10) as AdcChannel,
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="0">ADC0 (A0 Potméter)</option>
                <option value="1">ADC1 (A1 Joystick Y)</option>
                <option value="2">ADC2 (A2 LM35)</option>
                <option value="3">ADC3 (A3 LDR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stepping & Playback Control Bar */}
      <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Playback buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Reset to Sample/Hold start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBackward}
            disabled={currentStepIndex === 0}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            {language === 'hu' ? '◀ Előző Lépés' : '◀ Prev Step'}
          </button>
          <button
            onClick={() => {
              if (currentStepIndex >= liveState.steps.length - 1) {
                setCurrentStepIndex(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-amber-900/50'
                : 'bg-emerald-600 text-white shadow-emerald-900/50 hover:bg-emerald-500'
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
                <span>{language === 'hu' ? 'Átalakítás Indítása (ADSC)' : 'Start ADC (ADSC)'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= liveState.steps.length - 1}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            {language === 'hu' ? 'Következő Lépés ▶' : 'Next Step ▶'}
          </button>
          <button
            onClick={handleJumpToEnd}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Jump to final latched result"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Step Speed Selector */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>{language === 'hu' ? 'Animációs Sebesség:' : 'Animation Speed:'}</span>
          <select
            value={playSpeedMs}
            onChange={(e) => setPlaySpeedMs(parseInt(e.target.value, 10))}
            className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 outline-none"
          >
            <option value="800">Lassú (800 ms / bit)</option>
            <option value="400">Normál (400 ms / bit)</option>
            <option value="150">Gyors (150 ms / bit)</option>
          </select>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('SAR_ARCH')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'SAR_ARCH'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{language === 'hu' ? '1. SAR Belső Működés' : '1. SAR Architecture'}</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMING')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'TIMING'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'hu' ? '2. Időzítési Hullámformák' : '2. Timing Waveforms'}</span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTERS')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'REGISTERS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'hu' ? '3. Hardver Regiszterek' : '3. Hardware Registers'}</span>
        </button>

        <button
          onClick={() => setActiveTab('QUANTIZATION')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'QUANTIZATION'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{language === 'hu' ? '4. Kvantálás & SNR' : '4. Quantization & Math'}</span>
        </button>
      </div>

      {/* Active Tab View Rendering */}
      {activeTab === 'SAR_ARCH' && (
        <AdcSarVisualizer
          liveState={liveState}
          currentStepIndex={currentStepIndex}
          onSelectStep={setCurrentStepIndex}
          vRef={vRef}
        />
      )}

      {activeTab === 'TIMING' && (
        <AdcTimingDiagram
          liveState={liveState}
          config={config}
          currentStepIndex={currentStepIndex}
          onSelectStep={setCurrentStepIndex}
          vRef={vRef}
        />
      )}

      {activeTab === 'REGISTERS' && (
        <AdcRegistersView
          liveState={liveState}
          config={config}
          onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
          vRef={vRef}
        />
      )}

      {activeTab === 'QUANTIZATION' && (
        <AdcTransferCurve
          liveState={liveState}
          config={config}
          vRef={vRef}
        />
      )}
    </div>
  );
};
