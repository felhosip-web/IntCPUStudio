import React from 'react';
import {
  DualShiftRegisterState,
  ShiftOutputDeviceType,
} from '../../../types/mcuShiftRegister';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  Flame,
  Gauge,
  Layers,
  Power,
  Sliders,
  Tv,
  Zap,
} from 'lucide-react';

interface ShiftRegisterOutputDevicesProps {
  state: DualShiftRegisterState;
  deviceType: ShiftOutputDeviceType;
  onChangeDeviceType: (dt: ShiftOutputDeviceType) => void;
  ledColor: 'EMERALD' | 'RUBY' | 'AMBER' | 'CYAN' | 'PURPLE';
  onChangeLedColor: (color: 'EMERALD' | 'RUBY' | 'AMBER' | 'CYAN' | 'PURPLE') => void;
}

export const ShiftRegisterOutputDevices: React.FC<ShiftRegisterOutputDevicesProps> = ({
  state,
  deviceType,
  onChangeDeviceType,
  ledColor,
  onChangeLedColor,
}) => {
  const { language } = useI18n();
  const { chip1, chip2, isCascaded } = state;

  const colorStyles = {
    EMERALD: {
      on: 'bg-emerald-400 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.9)] text-emerald-950',
      badge: 'text-emerald-400',
    },
    RUBY: {
      on: 'bg-rose-500 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.9)] text-rose-950',
      badge: 'text-rose-400',
    },
    AMBER: {
      on: 'bg-amber-400 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.9)] text-amber-950',
      badge: 'text-amber-400',
    },
    CYAN: {
      on: 'bg-cyan-400 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.9)] text-cyan-950',
      badge: 'text-cyan-400',
    },
    PURPLE: {
      on: 'bg-purple-500 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.9)] text-purple-950',
      badge: 'text-purple-400',
    },
  };

  const curStyle = colorStyles[ledColor];

  // Combined 16 outputs if cascaded
  const allOutputs = isCascaded
    ? [...chip1.qOutputs, ...chip2.qOutputs]
    : chip1.qOutputs;

  // 7-segment segment states mapped to QA..QH (a, b, c, d, e, f, g, dp)
  const [segA, segB, segC, segD, segE, segF, segG, segDP] = chip1.qOutputs;

  // Active relay count
  const activeRelayCount = chip1.qOutputs.filter(Boolean).length;

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header & Device Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Power className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? 'KIMENETI TERHELÉS & VIZUÁLIS MEGJELENÍTŐ' : 'OUTPUT LOADS & ACTUATOR DISPLAY'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {isCascaded ? '16x Kaszkádolt Kimenet' : '8x Párhuzamos Kimenet (QA..QH)'}
            </span>
          </div>
        </div>

        {/* Device selector tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeDeviceType('LEDS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              deviceType === 'LEDS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? '💡 LED Sor' : '💡 LED Bar'}
          </button>
          <button
            onClick={() => onChangeDeviceType('SEVEN_SEGMENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              deviceType === 'SEVEN_SEGMENT'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? '🔢 7-Szegmens' : '🔢 7-Segment'}
          </button>
          <button
            onClick={() => onChangeDeviceType('RELAYS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              deviceType === 'RELAYS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? '🔌 8x Relé Modul' : '🔌 8x Relays'}
          </button>
          <button
            onClick={() => onChangeDeviceType('BARGRAPH')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              deviceType === 'BARGRAPH'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? '📊 Oszlopdiagram' : '📊 Bargraph'}
          </button>
        </div>
      </div>

      {/* 1. LED BAR DISPLAY */}
      {deviceType === 'LEDS' && (
        <div className="p-4 bg-black/60 rounded-2xl border border-slate-900 flex flex-col gap-3">
          {/* LED Color Picker */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">LED Fényszín Választó:</span>
            <div className="flex items-center gap-1.5">
              {(['EMERALD', 'RUBY', 'AMBER', 'CYAN', 'PURPLE'] as const).map((col) => (
                <button
                  key={col}
                  onClick={() => onChangeLedColor(col)}
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${
                    col === 'EMERALD'
                      ? 'bg-emerald-500'
                      : col === 'RUBY'
                      ? 'bg-rose-500'
                      : col === 'AMBER'
                      ? 'bg-amber-500'
                      : col === 'CYAN'
                      ? 'bg-cyan-500'
                      : 'bg-purple-500'
                  } ${ledColor === col ? 'border-white scale-125 ring-2 ring-white/30' : 'border-transparent opacity-60'}`}
                />
              ))}
            </div>
          </div>

          {/* LED Outputs Row */}
          <div className={`grid ${isCascaded ? 'grid-cols-16 gap-1.5' : 'grid-cols-8 gap-3'} py-2`}>
            {allOutputs.map((isOn, idx) => {
              const chipNum = idx < 8 ? 'C1' : 'C2';
              const pinLetter = ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'][idx % 8];

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isOn && !chip1.isHighZ
                        ? curStyle.on
                        : 'bg-slate-950 border-slate-800 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-extrabold">
                      {isOn ? '1' : '0'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                    {isCascaded ? `${chipNum}.${pinLetter}` : pinLetter}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 7-SEGMENT DISPLAY */}
      {deviceType === 'SEVEN_SEGMENT' && (
        <div className="p-5 bg-black/60 rounded-2xl border border-slate-900 flex flex-col md:flex-row items-center justify-around gap-6">
          {/* Real SVG 7-Segment Digit */}
          <div className="p-4 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl flex flex-col items-center">
            <svg viewBox="0 0 120 180" className="w-28 h-40">
              {/* Segment a (Top) */}
              <polygon
                points="25,18 35,8 85,8 95,18 85,28 35,28"
                className={`transition-all duration-150 ${
                  segA ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment b (Top-Right) */}
              <polygon
                points="97,20 107,30 107,80 97,90 87,80 87,30"
                className={`transition-all duration-150 ${
                  segB ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment c (Bottom-Right) */}
              <polygon
                points="97,92 107,102 107,152 97,162 87,152 87,102"
                className={`transition-all duration-150 ${
                  segC ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment d (Bottom) */}
              <polygon
                points="25,164 35,154 85,154 95,164 85,174 35,174"
                className={`transition-all duration-150 ${
                  segD ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment e (Bottom-Left) */}
              <polygon
                points="23,92 33,102 33,152 23,162 13,152 13,102"
                className={`transition-all duration-150 ${
                  segE ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment f (Top-Left) */}
              <polygon
                points="23,20 33,30 33,80 23,90 13,80 13,30"
                className={`transition-all duration-150 ${
                  segF ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Segment g (Middle) */}
              <polygon
                points="25,91 35,81 85,81 95,91 85,101 35,101"
                className={`transition-all duration-150 ${
                  segG ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
              {/* Decimal Point (dp) */}
              <circle
                cx="110"
                cy="165"
                r="6"
                className={`transition-all duration-150 ${
                  segDP ? 'fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]' : 'fill-slate-900'
                }`}
              />
            </svg>
            <span className="text-[10px] font-mono text-slate-500 mt-2">
              Common Cathode 7-Seg
            </span>
          </div>

          {/* Segment Mapping Table */}
          <div className="flex flex-col gap-1.5 font-mono text-xs max-w-sm">
            <span className="text-slate-400 font-bold mb-1">
              {language === 'hu' ? '74HC595 Lábkiosztás a szegmensekhez:' : '74HC595 Pin Mapping to Segments:'}
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-[11px]">
              <span className={`p-1 rounded border text-center ${segA ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QA → Seg A</span>
              <span className={`p-1 rounded border text-center ${segB ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QB → Seg B</span>
              <span className={`p-1 rounded border text-center ${segC ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QC → Seg C</span>
              <span className={`p-1 rounded border text-center ${segD ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QD → Seg D</span>
              <span className={`p-1 rounded border text-center ${segE ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QE → Seg E</span>
              <span className={`p-1 rounded border text-center ${segF ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QF → Seg F</span>
              <span className={`p-1 rounded border text-center ${segG ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QG → Seg G</span>
              <span className={`p-1 rounded border text-center ${segDP ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>QH → Seg DP</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. 8-CHANNEL RELAY BOARD */}
      {deviceType === 'RELAYS' && (
        <div className="p-4 bg-black/60 rounded-2xl border border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              8-Csatornás Szilárdtest / Elektromechanikus Relé Modul (Galvanikus leválasztás):
            </span>
            <span className="text-amber-400 font-bold">
              {activeRelayCount} / 8 Relé Bekapcsolva
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {chip1.qOutputs.map((isActive, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-950/50'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  RELÉ {idx + 1}
                </span>

                {/* Relay Cube */}
                <div
                  className={`w-10 h-8 rounded-lg border-2 flex items-center justify-center font-mono text-[9px] font-extrabold ${
                    isActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                      : 'bg-slate-950 border-slate-700 text-slate-500'
                  }`}
                >
                  {isActive ? 'CLOSED' : 'OPEN'}
                </div>

                <div className="flex items-center gap-1 text-[9px] font-mono">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                  <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BARGRAPH METER */}
      {deviceType === 'BARGRAPH' && (
        <div className="p-4 bg-black/60 rounded-2xl border border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">8-Szegmenses Analóg LED Oszlopdiagram:</span>
            <span className="text-cyan-400 font-bold">
              {chip1.qOutputs.filter(Boolean).length} / 8 Bar Aktív
            </span>
          </div>

          <div className="flex items-end justify-center gap-2 h-28 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {chip1.qOutputs.map((isActive, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end h-full items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isActive
                      ? idx < 5
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] h-full'
                        : idx < 7
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] h-full'
                        : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] h-full'
                      : 'bg-slate-900 border border-slate-800 h-2'
                  }`}
                />
                <span className="text-[9px] font-mono text-slate-500">{idx}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
