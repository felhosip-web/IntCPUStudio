import React from 'react';
import { ShiftRegisterChipState } from '../../../types/mcuShiftRegister';
import { useI18n } from '../../../i18n/I18nContext';
import {
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  Zap,
} from 'lucide-react';

interface ShiftRegisterInternalDiagramProps {
  chip: ShiftRegisterChipState;
  chipIndex?: number;
  isCascaded?: boolean;
}

export const ShiftRegisterInternalDiagram: React.FC<ShiftRegisterInternalDiagramProps> = ({
  chip,
  chipIndex = 1,
  isCascaded,
}) => {
  const { language } = useI18n();

  const toHex = (v: number) => `0x${v.toString(16).toUpperCase().padStart(2, '0')}`;

  const bitLabels = ['QA (Bit 0)', 'QB (Bit 1)', 'QC (Bit 2)', 'QD (Bit 3)', 'QE (Bit 4)', 'QF (Bit 5)', 'QG (Bit 6)', 'QH (Bit 7)'];

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
      {/* Active Clock Pulse Glow Top Indicator */}
      {chip.pins.shcp && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      )}
      {chip.pins.stcp && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
              <span>{language === 'hu' ? chip.nameHu : chip.name}</span>
              {isCascaded && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  {chipIndex === 1 ? 'Chip 1 (Master)' : "Chip 2 (Slave via QH')"}
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Belső 2-Szintes Flip-Flop Architektúra & Bit-Léptetési Mechanizmus'
                : 'Internal 2-Stage Flip-Flop Architecture & Bit Shifting Mechanism'}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">DS Bemenet:</span>
            <strong className={chip.pins.ds ? 'text-emerald-400' : 'text-slate-500'}>
              {chip.pins.ds ? 'HIGH (1)' : 'LOW (0)'}
            </strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">QH' Kaszkád:</span>
            <strong className={chip.pins.q7s ? 'text-purple-400' : 'text-slate-500'}>
              {chip.pins.q7s ? '1' : '0'}
            </strong>
          </div>
        </div>
      </div>

      {/* STAGE 1: 8-Bit Shift Register Flip-Flops (S0..S7) */}
      <div className="bg-black/60 rounded-2xl p-4 border border-cyan-950/80 relative">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[10px]">
              1. SZINT
            </span>
            <h4 className="font-bold text-cyan-300">
              8-BITES LÉPTETŐ REGISZTER (SHIFT REGISTER STAGE - S0..S7)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">
            Órajel (SH_CP): <strong className={chip.pins.shcp ? 'text-cyan-400' : 'text-slate-500'}>{chip.pins.shcp ? 'HIGH ⤤' : 'LOW'}</strong>
          </span>
        </div>

        {/* Flip-Flops Row */}
        <div className="grid grid-cols-8 gap-2">
          {chip.shiftBuffer.map((bitVal, idx) => {
            const isHigh = bitVal === 1;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isHigh
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1 flex items-center justify-between w-full">
                  <span>S{idx}</span>
                  {idx === 0 && <span className="text-emerald-400 font-extrabold">IN</span>}
                  {idx === 7 && <span className="text-purple-400 font-extrabold">OUT</span>}
                </div>

                <div
                  className={`text-lg font-mono font-extrabold ${
                    isHigh ? 'text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-600'
                  }`}
                >
                  {bitVal}
                </div>

                <span className="text-[8px] font-mono text-slate-500 mt-1">
                  D-FF #{idx}
                </span>
              </div>
            );
          })}
        </div>

        {/* Shifting visual flow direction arrows */}
        <div className="flex items-center justify-between mt-2 px-3 text-[10px] font-mono text-cyan-400/80">
          <div className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
            <span>Soros Be (DS) → S0</span>
          </div>
          <div className="flex items-center gap-1">
            <span>S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7</span>
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <span>S7 → Kaszkád (QH')</span>
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* TRANSFER ARROWS: ST_CP Latch Transfer Bus */}
      <div className="flex items-center justify-between px-6 py-1">
        {chip.shiftBuffer.map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <ArrowDown
              className={`w-4 h-4 transition-all duration-300 ${
                chip.pins.stcp
                  ? 'text-emerald-400 scale-125 animate-bounce drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'text-slate-700'
              }`}
            />
            <span className="text-[8px] font-mono text-slate-600">ST_CP</span>
          </div>
        ))}
      </div>

      {/* STAGE 2: 8-Bit Storage Register / Latches (L0..L7) */}
      <div className="bg-black/60 rounded-2xl p-4 border border-emerald-950/80 relative">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
              2. SZINT
            </span>
            <h4 className="font-bold text-emerald-300">
              8-BITES KIMENETI TÁROLÓ REGISZTER (STORAGE LATCH - L0..L7)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">
            Retesz (ST_CP): <strong className={chip.pins.stcp ? 'text-emerald-400' : 'text-slate-500'}>{chip.pins.stcp ? 'PULSE ⤤' : 'LOW'}</strong>
          </span>
        </div>

        {/* Latches Row */}
        <div className="grid grid-cols-8 gap-2">
          {chip.storageLatch.map((bitVal, idx) => {
            const isHigh = bitVal === 1;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isHigh
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1 flex items-center justify-between w-full">
                  <span>L{idx}</span>
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                </div>

                <div
                  className={`text-lg font-mono font-extrabold ${
                    isHigh ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-600'
                  }`}
                >
                  {bitVal}
                </div>

                <span className="text-[8px] font-mono text-slate-500 mt-1">
                  Latch #{idx}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE 3: 3-State Buffers & Output Enable (/OE) */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
            3. SZINT
          </span>
          <span className="text-slate-300">
            3-Állapotú Kimeneti Meghajtók (/OE = {chip.pins.oe_n ? '1 [TILTVA - High-Z]' : '0 [ENGEDÉLYEZVE]'}):
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            chip.isHighZ
              ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {chip.isHighZ ? 'HIGH-IMPEDANCE (High-Z lebeg)' : 'OUTPUTS ACTIVE (QA..QH Meghajtva)'}
        </span>
      </div>

      {/* PARALLEL OUTPUT PINS (QA..QH) */}
      <div className="grid grid-cols-8 gap-2 pt-1">
        {chip.qOutputs.map((isActive, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl border text-center font-mono flex flex-col items-center justify-between ${
              chip.isHighZ
                ? 'bg-slate-900/40 border-dashed border-slate-700 text-slate-600'
                : isActive
                ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md shadow-emerald-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] font-bold">
              {['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'][idx]}
            </span>
            <div
              className={`w-3.5 h-3.5 rounded-full my-1 border ${
                chip.isHighZ
                  ? 'bg-slate-700 border-slate-600'
                  : isActive
                  ? 'bg-white border-emerald-300 shadow-[0_0_8px_#ffffff]'
                  : 'bg-slate-950 border-slate-700'
              }`}
            />
            <span className="text-[9px]">
              {chip.isHighZ ? 'Z' : isActive ? '5V' : '0V'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
