import React from 'react';
import {
  PwmLiveState,
  PwmSimulationConfig,
  PwmTargetActuator,
} from '../../../types/mcuPwm';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  Compass,
  Cpu,
  Eye,
  Flame,
  Gauge,
  Layers,
  Lightbulb,
  Radio,
  RotateCcw,
  Sliders,
  Sun,
  Volume2,
  Waves,
  Zap,
} from 'lucide-react';

interface PwmActuatorsViewProps {
  liveState: PwmLiveState;
  config: PwmSimulationConfig;
  onChangeActuator: (actuator: PwmTargetActuator) => void;
  onUpdateConfig: (updates: Partial<PwmSimulationConfig>) => void;
}

export const PwmActuatorsView: React.FC<PwmActuatorsViewProps> = ({
  liveState,
  config,
  onChangeActuator,
  onUpdateConfig,
}) => {
  const { language } = useI18n();

  const actuatorTabs: { id: PwmTargetActuator; label: string; labelHu: string; icon: any }[] = [
    { id: 'LED_DIMMER', label: 'LED Dimmer (Gamma 2.2)', labelHu: 'LED Fényerőszabályzó (Gamma)', icon: Lightbulb },
    { id: 'DC_MOTOR', label: 'DC Motor & H-Bridge', labelHu: 'DC Motor & H-Híd', icon: RotateCcw },
    { id: 'SERVO', label: 'SG90 Servo Positioner', labelHu: 'SG90 Szervó Pozicionáló', icon: Compass },
    { id: 'BUZZER_TONE', label: 'Piezo Buzzer (Tone)', labelHu: 'Piezo Csipogó (CTC Hang)', icon: Volume2 },
    { id: 'RC_FILTER', label: 'RC Low-Pass DAC', labelHu: 'RC Aluláteresztő DAC Szűrő', icon: Waves },
  ];

  return (
    <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-5 font-sans">
      {/* Header & Actuator Selector Tabs */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white">
                {language === 'hu'
                  ? 'Fizikai Aktuátorok & Valós Idejű Terheléses Dinamika'
                  : 'Physical Actuators & Real-Time Dynamics'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {language === 'hu'
                  ? 'Hogyan alakítja át a mechanika, optika és analóg áramkör a diszkrét PWM négyszögjelet?'
                  : 'How do optics, mechanics, and analog filters translate discrete PWM pulses?'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          {actuatorTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = config.targetActuator === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeActuator(tab.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 font-bold shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] text-center">
                  {language === 'hu' ? tab.labelHu : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actuator Display Panes */}
      {config.targetActuator === 'LED_DIMMER' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* LED Visual Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#05070A] p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-100 shadow-2xl"
              style={{
                backgroundColor: `rgba(245, 158, 11, ${liveState.dutyCyclePercent / 100})`,
                borderColor: liveState.dutyCyclePercent > 10 ? '#FBBF24' : '#78350F',
                boxShadow: `0 0 ${liveState.opticalPerceivedBrightnessPct * 0.8}px rgba(245, 158, 11, ${liveState.opticalPerceivedBrightnessPct / 100})`,
              }}
            >
              <Lightbulb
                className="w-10 h-10 transition-colors"
                style={{
                  color: liveState.dutyCyclePercent > 5 ? '#FFFBEB' : '#64748B',
                }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white mt-4">
              5mm Szuperfényes Amber LED (D6)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Veff = {liveState.effectiveVoltage.toFixed(2)}V • Iavg = {((liveState.effectiveVoltage / 220) * 1000).toFixed(1)} mA
            </span>
          </div>

          {/* Gamma Perception Math vs Linear Duty */}
          <div className="md:col-span-7 flex flex-col gap-3 font-mono text-xs">
            <div className="bg-[#05070A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Lineáris PWM Kitöltés:</span>
                </span>
                <span className="text-purple-300 font-bold">{liveState.dutyCyclePercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-purple-500 h-full transition-all duration-100"
                  style={{ width: `${liveState.dutyCyclePercent}%` }}
                />
              </div>
            </div>

            <div className="bg-[#05070A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emberi Szem Által Érzékelt Fényerő (Gamma 2.2):</span>
                </span>
                <span className="text-amber-400 font-bold">{liveState.opticalPerceivedBrightnessPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full transition-all duration-100"
                  style={{ width: `${liveState.opticalPerceivedBrightnessPct}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'hu'
                ? '💡 A Weber-Fechner törvény értelmében az emberi szem nem lineárisan, hanem logaritmikusan érzékeli a fényintenzitást. Ezért az 50%-os PWM kitöltés látszólag ~73%-os maximális fényerőnek tűnik!'
                : '💡 According to the Weber-Fechner law, the human eye perceives brightness logarithmically. A 50% PWM duty cycle optically appears as ~73% full brightness!'}
            </p>
          </div>
        </div>
      )}

      {config.targetActuator === 'DC_MOTOR' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Motor Spinning Propeller Visual */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#05070A] p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning Rotor Fan Blades */}
              <div
                className="w-24 h-24 border-4 border-dashed border-cyan-400 rounded-full flex items-center justify-center"
                style={{
                  animation: liveState.motorRpm > 50 ? `spin ${Math.max(0.08, 60 / liveState.motorRpm)}s linear infinite` : 'none',
                }}
              >
                <div className="w-20 h-2 bg-slate-700 rounded-full absolute" />
                <div className="w-2 h-20 bg-slate-700 rounded-full absolute" />
                <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white z-10" />
              </div>
            </div>
            <span className="font-mono text-base font-bold text-cyan-300 mt-4">
              {liveState.motorRpm} RPM
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              L298N H-Híd Meghajtó • {liveState.effectiveVoltage.toFixed(2)}V effektív
            </span>
          </div>

          {/* Motor Load & Dynamics */}
          <div className="md:col-span-7 flex flex-col gap-3 font-mono text-xs">
            <div className="bg-[#05070A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-slate-300">
                <span>Mechanikai Tengelyterhelés:</span>
                <span className="text-amber-400 font-bold">{config.motorLoadPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.motorLoadPct}
                onChange={(e) => onUpdateConfig({ motorLoadPct: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">Nyomaték (Torque):</span>
                <span className="text-white font-bold text-sm">
                  {((liveState.effectiveVoltage * 0.4) * (1 + config.motorLoadPct / 100)).toFixed(2)} mN·m
                </span>
              </div>
              <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">Visszatermelt BEMF:</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {(liveState.effectiveVoltage * 0.82).toFixed(2)} V
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {config.targetActuator === 'SERVO' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Servo Gauge Dial */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#05070A] p-6 rounded-2xl border border-slate-800">
            <div className="relative w-32 h-20 flex items-end justify-center overflow-hidden">
              {/* Semi-circle arc */}
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-purple-500 absolute top-0" />
              {/* Pointer Needle */}
              <div
                className="w-1.5 h-16 bg-rose-500 origin-bottom rounded-full transition-transform duration-200"
                style={{
                  transform: `rotate(${config.servoAngleDeg - 90}deg)`,
                }}
              />
              <div className="w-4 h-4 rounded-full bg-white z-10" />
            </div>
            <span className="font-mono text-lg font-bold text-purple-300 mt-3">
              {config.servoAngleDeg}°
            </span>
            <span className="font-mono text-xs text-slate-400">
              Impulzusszélesség: {liveState.servoPulseWidthUs.toFixed(0)} μs
            </span>
          </div>

          {/* Servo Angle Slider */}
          <div className="md:col-span-7 flex flex-col gap-3 font-mono text-xs">
            <div className="bg-[#05070A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-slate-300">
                <span>Szervó Pozíció Beállítása (0°..180°):</span>
                <span className="text-purple-400 font-bold">{config.servoAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={config.servoAngleDeg}
                onChange={(e) => onUpdateConfig({ servoAngleDeg: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'hu'
                ? '⚙️ A szabványos RC szervómotorok (pl. SG90, MG996R) 50 Hz-es (20 ms periódusú) PWM jelet igényelnek. 1.0 ms impulzus = 0°, 1.5 ms = 90° (középállás), 2.0 ms = 180°.'
                : '⚙️ Standard RC servos (like SG90) require 50 Hz (20 ms period) PWM control. 1.0 ms pulse = 0°, 1.5 ms = 90° (center), 2.0 ms = 180°.'}
            </p>
          </div>
        </div>
      )}

      {config.targetActuator === 'RC_FILTER' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#05070A] p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col items-center gap-2">
              <Waves className="w-10 h-10 text-emerald-400 animate-pulse" />
              <span className="text-xl font-bold text-emerald-300 font-mono">
                {liveState.effectiveVoltage.toFixed(3)} V
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Hullámosság (Ripple): ±{(liveState.rippleVoltageMv).toFixed(1)} mV
              </span>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col gap-3 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">Soros Ellenállás (R):</span>
                <span className="text-white font-bold">{config.rcResistanceKohm} kΩ</span>
              </div>
              <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">Szűrő Kondenzátor (C):</span>
                <span className="text-white font-bold">{config.rcCapacitanceUf} μF</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'hu'
                ? `🔌 Időállandó: τ = R × C = ${(config.rcResistanceKohm * config.rcCapacitanceUf).toFixed(1)} ms. A PWM jel egy passzív RC aluláteresztő szűrőn átvezetve folytonos analóg egyenfeszültséggé (DAC) alakul!`
                : `🔌 Time constant: τ = R × C = ${(config.rcResistanceKohm * config.rcCapacitanceUf).toFixed(1)} ms. Passing the PWM square wave through a passive RC low-pass filter produces smooth analog DC (DAC)!`}
            </p>
          </div>
        </div>
      )}

      {config.targetActuator === 'BUZZER_TONE' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#05070A] p-6 rounded-2xl border border-slate-800">
            <Volume2 className="w-12 h-12 text-purple-400 animate-bounce" />
            <span className="text-xl font-bold text-white font-mono mt-3">
              {config.toneFreqHz} Hz
            </span>
            <span className="text-xs text-purple-300 font-mono">
              Zenei Hang: {config.toneFreqHz === 440 ? 'A4 (Kamarahang)' : config.toneFreqHz === 523 ? 'C5' : `${config.toneFreqHz} Hz`}
            </span>
          </div>

          <div className="md:col-span-7 flex flex-col gap-3 font-mono text-xs">
            <div className="bg-[#05070A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-slate-300">
                <span>Hangfrekvencia Beállítása:</span>
                <span className="text-purple-400 font-bold">{config.toneFreqHz} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="10"
                value={config.toneFreqHz}
                onChange={(e) => onUpdateConfig({ toneFreqHz: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              {[261, 329, 392, 440, 523].map((f) => (
                <button
                  key={f}
                  onClick={() => onUpdateConfig({ toneFreqHz: f })}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  {f === 440 ? 'A4 (440Hz)' : f === 523 ? 'C5 (523Hz)' : `${f}Hz`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
