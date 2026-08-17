import React from 'react';
import { Ds18b20State } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, AlertTriangle, Cpu, Flame, RefreshCw, Snowflake, Thermometer } from 'lucide-react';

interface McuDs18b20ModuleProps {
  state: Ds18b20State;
  onChange: (updater: (prev: Ds18b20State) => Ds18b20State) => void;
}

export const McuDs18b20Module: React.FC<McuDs18b20ModuleProps> = ({ state, onChange }) => {
  const { language } = useI18n();

  const handleTempSlider = (val: number) => {
    onChange((prev) => ({
      ...prev,
      celsius: parseFloat(val.toFixed(2)),
    }));
  };

  const handlePreset = (deg: number) => {
    onChange((prev) => ({
      ...prev,
      celsius: deg,
    }));
  };

  const isAlarm = state.celsius >= state.alarmHigh || state.celsius <= state.alarmLow;

  // Calculate 12-bit raw integer (1/16 °C = 0.0625)
  const raw12bit = Math.round(state.celsius * 16) & 0xffff;
  const lsb = raw12bit & 0xff;
  const msb = (raw12bit >> 8) & 0xff;

  return (
    <div className="bg-[#0D131F] rounded-xl border border-cyan-500/30 p-3.5 flex flex-col gap-3 shadow-lg hover:border-cyan-500/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-xs font-bold text-cyan-300">DS18B20</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                1-Wire (Pin {state.pin})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {language === 'hu' ? 'Digitális Precíziós Hőmérő (9-12 bit)' : 'High-Precision Digital Thermometer'}
            </p>
          </div>
        </div>

        {/* Alarm LED */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className={`w-2.5 h-2.5 rounded-full border transition-all ${
              isAlarm
                ? 'bg-rose-500 border-rose-300 animate-pulse shadow-md shadow-rose-500/50'
                : 'bg-emerald-500/80 border-emerald-400 shadow-sm shadow-emerald-500/30'
            }`}
          />
          <span className={isAlarm ? 'text-rose-400 font-bold' : 'text-slate-400'}>
            {isAlarm ? (language === 'hu' ? 'RIASZTÁS!' : 'ALARM!') : 'NORMAL'}
          </span>
        </div>
      </div>

      {/* Main Temperature Display & Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#080B10] p-3 rounded-lg border border-cyan-950">
        {/* Left: Value readout */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {language === 'hu' ? 'Mért Hőmérséklet' : 'Measured Temperature'}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-2xl font-black text-cyan-200">
              {state.celsius > 0 ? `+${state.celsius.toFixed(2)}` : state.celsius.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-cyan-400 font-bold">°C</span>
            <span className="text-[11px] font-mono text-slate-500 ml-2">
              ({((state.celsius * 9) / 5 + 32).toFixed(1)} °F)
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
            <span>Felbontás:</span>
            <select
              value={state.resolutionBits}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  resolutionBits: parseInt(e.target.value, 10) as any,
                }))
              }
              className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
            >
              <option value={9}>9-bit (0.5 °C / 93ms)</option>
              <option value={10}>10-bit (0.25 °C / 187ms)</option>
              <option value={11}>11-bit (0.125 °C / 375ms)</option>
              <option value={12}>12-bit (0.0625 °C / 750ms)</option>
            </select>
          </div>
        </div>

        {/* Right: Quick Presets */}
        <div className="flex flex-col justify-between gap-1.5">
          <span className="text-[10px] font-mono text-slate-400">
            {language === 'hu' ? 'Gyors tesztértékek:' : 'Quick Presets:'}
          </span>
          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
            <button
              onClick={() => handlePreset(-15)}
              className="px-1.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-900 flex items-center justify-center gap-0.5 cursor-pointer"
              title="Fagyasztó (-15°C)"
            >
              <Snowflake className="w-2.5 h-2.5" /> -15°
            </button>
            <button
              onClick={() => handlePreset(0)}
              className="px-1.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-900 flex items-center justify-center cursor-pointer"
              title="Olvadó jég (0°C)"
            >
              0°C
            </button>
            <button
              onClick={() => handlePreset(25)}
              className="px-1.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-900 flex items-center justify-center cursor-pointer"
              title="Szobahő (25°C)"
            >
              25°C
            </button>
            <button
              onClick={() => handlePreset(85)}
              className="px-1.5 py-1 rounded bg-slate-900 hover:bg-rose-950 text-rose-300 border border-rose-900 flex items-center justify-center gap-0.5 cursor-pointer"
              title="Power-on reset érték (85°C)"
            >
              <Flame className="w-2.5 h-2.5" /> 85°
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">Riasztási határok:</span>
            <span className="text-[10px] font-mono text-slate-400">
              TL: <strong className="text-cyan-400">{state.alarmLow}°C</strong> | TH:{' '}
              <strong className="text-rose-400">{state.alarmHigh}°C</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Temperature Slider */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>-55 °C</span>
          <span className="text-cyan-400">Interaktív Hőmérséklet Beállítás</span>
          <span>+125 °C</span>
        </div>
        <input
          type="range"
          min={-55}
          max={125}
          step={0.25}
          value={state.celsius}
          onChange={(e) => handleTempSlider(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* 1-Wire ROM & Scratchpad Register Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-500">64-Bit 1-Wire ROM:</span>
          <p className="text-cyan-300 font-mono tracking-wider text-[11px] truncate">
            {state.romCode}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-slate-500">Scratchpad (LSB / MSB):</span>
            <p className="text-slate-300">
              0x{lsb.toString(16).padStart(2, '0').toUpperCase()} 0x
              {msb.toString(16).padStart(2, '0').toUpperCase()}{' '}
              <span className="text-slate-500">({raw12bit})</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Protokoll:</span>
            <p className="text-emerald-400 font-bold">1-Wire CRC OK</p>
          </div>
        </div>
      </div>
    </div>
  );
};
