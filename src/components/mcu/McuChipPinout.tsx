import React, { useState } from 'react';
import { McuPin, McuState } from '../../types/mcu';
import { useI18n } from '../../i18n/I18nContext';
import { Cpu, Info, Zap } from 'lucide-react';

interface McuChipPinoutProps {
  pins: McuPin[];
  mcuModel: string;
}

export const McuChipPinout: React.FC<McuChipPinoutProps> = ({ pins, mcuModel }) => {
  const { language } = useI18n();
  const [hoveredPin, setHoveredPin] = useState<McuPin | null>(null);

  // Left pins: 1 to 14, Right pins: 28 down to 15 (Standard DIP-28 layout)
  const leftPins = pins.filter((p) => p.pinNumber <= 14).sort((a, b) => a.pinNumber - b.pinNumber);
  const rightPins = pins.filter((p) => p.pinNumber >= 15).sort((a, b) => b.pinNumber - a.pinNumber);

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-4 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200">
              {mcuModel} DIP-28 {language === 'hu' ? 'Lábkiosztás (Pinout)' : 'Pinout Diagram'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {language === 'hu' ? 'Valós idejű logikai és analóg feszültségszintek' : 'Real-time logic levels and analog voltages'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-400">HIGH (5V)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-slate-500">LOW (0V)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400">PWM</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-400">ANALOG</span>
          </div>
        </div>
      </div>

      {/* Main DIP-28 Dual In-line Package Rendering */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative bg-[#05070A] border-2 border-slate-700 rounded-2xl w-full max-w-xl p-3 shadow-2xl flex justify-between gap-4">
          {/* Top Notch of IC Package */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#0B0F17] border-b-2 border-slate-700 rounded-b-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>

          {/* Left Column Pins (1 to 14) */}
          <div className="flex flex-col gap-1.5 w-1/2">
            {leftPins.map((pin) => {
              const isHigh = pin.digitalState;
              const isPwm = pin.isPwmCapable && pin.pwmDuty > 0;
              const isAnalog = pin.port === 'C' && pin.direction === 'INPUT';

              return (
                <div
                  key={pin.pinNumber}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {/* Pin Number & Metal Leg */}
                  <span className="w-4 text-[9px] font-mono text-slate-500 text-right">{pin.pinNumber}</span>
                  <div
                    className={`w-3 h-2 rounded-l transition-colors ${
                      isHigh ? 'bg-amber-300' : 'bg-slate-700'
                    }`}
                  />

                  {/* Status Indicator LED Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      isPwm
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
                        : isAnalog
                        ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : isHigh
                        ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />

                  {/* Pin Name Label */}
                  <div className="flex-1 flex items-center justify-between text-[10px] font-mono pr-2 group-hover:text-cyan-300 transition-colors">
                    <span className="text-slate-300 truncate font-semibold">{pin.name}</span>
                    <span className="text-[8px] text-slate-500 hidden sm:inline">{pin.direction}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Chip Label & Branding */}
          <div className="w-20 border-x border-slate-800/80 flex flex-col items-center justify-center text-center px-1">
            <div className="rotate-90 whitespace-nowrap text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              {mcuModel}
            </div>
            <div className="rotate-90 whitespace-nowrap text-[8px] font-mono text-slate-600 mt-6">
              16MHz RISC
            </div>
          </div>

          {/* Right Column Pins (28 down to 15) */}
          <div className="flex flex-col gap-1.5 w-1/2">
            {rightPins.map((pin) => {
              const isHigh = pin.digitalState;
              const isPwm = pin.isPwmCapable && pin.pwmDuty > 0;
              const isAnalog = pin.port === 'C' && pin.direction === 'INPUT';

              return (
                <div
                  key={pin.pinNumber}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  className="flex items-center gap-2 cursor-pointer group flex-row-reverse"
                >
                  {/* Pin Number & Metal Leg */}
                  <span className="w-4 text-[9px] font-mono text-slate-500 text-left">{pin.pinNumber}</span>
                  <div
                    className={`w-3 h-2 rounded-r transition-colors ${
                      isHigh ? 'bg-amber-300' : 'bg-slate-700'
                    }`}
                  />

                  {/* Status Indicator LED Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      isPwm
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
                        : isAnalog
                        ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : isHigh
                        ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />

                  {/* Pin Name Label */}
                  <div className="flex-1 flex items-center justify-between text-[10px] font-mono pl-2 group-hover:text-cyan-300 transition-colors flex-row-reverse">
                    <span className="text-slate-300 truncate font-semibold">{pin.name}</span>
                    <span className="text-[8px] text-slate-500 hidden sm:inline">{pin.direction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hovered Pin Info Drawer */}
      <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner">
        {hoveredPin ? (
          <>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <strong className="text-cyan-300">
                Pin {hoveredPin.pinNumber}: {hoveredPin.name}
              </strong>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>I/O: <strong className="text-white">{hoveredPin.direction}</strong></span>
              <span>Level: <strong className={hoveredPin.digitalState ? 'text-emerald-400' : 'text-slate-500'}>{hoveredPin.digitalState ? 'HIGH (1)' : 'LOW (0)'}</strong></span>
              <span>Voltage: <strong className="text-amber-300">{hoveredPin.analogVoltage.toFixed(2)} V</strong></span>
              {hoveredPin.isPwmCapable && (
                <span>PWM: <strong className="text-purple-300">{hoveredPin.pwmDuty}/255</strong></span>
              )}
            </div>
          </>
        ) : (
          <div className="text-slate-500 italic text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Vidd az egeret egy kivezetésre a részletek megtekintéséhez!' : 'Hover over any pin for full register & voltage details!'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
