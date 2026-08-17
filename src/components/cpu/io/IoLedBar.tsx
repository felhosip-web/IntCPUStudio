import React from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Cpu, Zap } from 'lucide-react';

interface IoLedBarProps {
  device: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

export const IoLedBar: React.FC<IoLedBarProps> = ({
  device,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();
  const ledState = device.ledState || {
    value: 0,
    color: 'emerald',
    activeLow: false,
  };

  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;
  const binStr = toBin(ledState.value);

  const colors = [
    { id: 'emerald', name: 'Emerald', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.8)] bg-emerald-400 border-emerald-200' },
    { id: 'rose', name: 'Ruby Red', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.8)] bg-rose-500 border-rose-200' },
    { id: 'amber', name: 'Amber', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.8)] bg-amber-400 border-amber-200' },
    { id: 'cyan', name: 'Cyan', glow: 'shadow-[0_0_12px_rgba(34,211,238,0.8)] bg-cyan-400 border-cyan-200' },
    { id: 'blue', name: 'Cobalt', glow: 'shadow-[0_0_12px_rgba(96,165,250,0.8)] bg-blue-400 border-blue-200' },
  ];

  const currentColor = colors.find((c) => c.id === ledState.color) || colors[0];

  const handleToggleBit = (bitIndex: number) => {
    const nextVal = ledState.value ^ (1 << bitIndex);
    onUpdateDevice({
      ...device,
      ledState: {
        ...ledState,
        value: nextVal,
      },
    });
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {isBusActive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
      )}

      {/* Header with Address badge and Chip Select */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? device.nameHu : device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold">{toHex(device.baseAddress)}</span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                {device.chipSelectLabel}
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{device.accessMode}</span>
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                onUpdateDevice({
                  ...device,
                  ledState: { ...ledState, color: c.id as any },
                })
              }
              title={c.name}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                ledState.color === c.id
                  ? 'scale-125 border-white ring-2 ring-emerald-500/40'
                  : 'border-slate-700 opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor:
                  c.id === 'emerald'
                    ? '#10b981'
                    : c.id === 'rose'
                    ? '#f43f5e'
                    : c.id === 'amber'
                    ? '#f59e0b'
                    : c.id === 'cyan'
                    ? '#06b6d4'
                    : '#3b82f6',
              }}
            />
          ))}
        </div>
      </div>

      {/* 8-bit LED display array */}
      <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-3">
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {binStr.split('').map((bit, idx) => {
            const bitNum = 7 - idx;
            const isOn = ledState.activeLow ? bit === '0' : bit === '1';
            return (
              <button
                key={bitNum}
                onClick={() => handleToggleBit(bitNum)}
                title={`Bit ${bitNum}: ${isOn ? 'ON (1)' : 'OFF (0)'} (Click to toggle)`}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
              >
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                  D{bitNum}
                </span>
                <div
                  className={`w-6 h-6 rounded-full transition-all duration-150 border ${
                    isOn
                      ? currentColor.glow
                      : 'bg-[#080B11] border-slate-800 shadow-inner'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isOn ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  {bit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer info: 74HC574 Latch schematic indication */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span>74HC574 Octal D-Latch</span>
        </div>
        <div className="flex items-center gap-2">
          <span>HEX: <strong className="text-emerald-400">{toHex(ledState.value)}</strong></span>
          <span>DEC: <strong className="text-slate-200">{ledState.value}</strong></span>
        </div>
      </div>
    </div>
  );
};
