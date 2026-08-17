import React, { useState } from 'react';
import { C64State } from '../../types/c64';
import { disassemble6502, step6502Instruction } from '../../core/mos6502Emulator';
import { useI18n } from '../../i18n/I18nContext';
import { Cpu, Footprints, Layers, RefreshCw } from 'lucide-react';

interface C64CpuMonitorProps {
  c64State: C64State;
  onUpdateState: (next: C64State) => void;
}

export const C64CpuMonitor: React.FC<C64CpuMonitorProps> = ({
  c64State,
  onUpdateState,
}) => {
  const { language } = useI18n();
  const [disasmAddr, setDisasmAddr] = useState<string>('C000');

  const parsedAddr = parseInt(disasmAddr, 16) || 0xc000;
  const disassembled = disassemble6502(c64State.memory, parsedAddr, 10);

  const handleStep6502 = () => {
    const nextCpu = step6502Instruction(c64State.cpu, c64State.memory);
    onUpdateState({
      ...c64State,
      cpu: nextCpu,
      cycleCount: c64State.cycleCount + 1,
    });
  };

  const toHex8 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, '0');
  const toHex16 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, '0');

  return (
    <div className="bg-[#111622] rounded-2xl border border-slate-800/90 p-4 shadow-lg flex flex-col gap-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
            {language === 'hu' ? 'MOS 6502 / 6510 CPU Regiszterek' : 'MOS 6502 / 6510 CPU Registers'}
          </h3>
        </div>

        <button
          onClick={handleStep6502}
          className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>{language === 'hu' ? '6502 Léptetés' : 'Step 6502'}</span>
        </button>
      </div>

      {/* Registers Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Accumulator A */}
        <div className="bg-[#172033] p-2.5 rounded-xl border border-cyan-800/40 flex flex-col items-center">
          <span className="text-[10px] text-cyan-400 font-bold">A (ACC)</span>
          <span className="text-sm sm:text-base text-slate-100 font-black">
            ${toHex8(c64State.cpu.A)}
          </span>
          <span className="text-[9px] text-slate-400">dec {c64State.cpu.A}</span>
        </div>

        {/* Index X */}
        <div className="bg-[#172033] p-2.5 rounded-xl border border-purple-800/40 flex flex-col items-center">
          <span className="text-[10px] text-purple-400 font-bold">X (IDX)</span>
          <span className="text-sm sm:text-base text-slate-100 font-black">
            ${toHex8(c64State.cpu.X)}
          </span>
          <span className="text-[9px] text-slate-400">dec {c64State.cpu.X}</span>
        </div>

        {/* Index Y */}
        <div className="bg-[#172033] p-2.5 rounded-xl border border-emerald-800/40 flex flex-col items-center">
          <span className="text-[10px] text-emerald-400 font-bold">Y (IDX)</span>
          <span className="text-sm sm:text-base text-slate-100 font-black">
            ${toHex8(c64State.cpu.Y)}
          </span>
          <span className="text-[9px] text-slate-400">dec {c64State.cpu.Y}</span>
        </div>

        {/* Program Counter PC */}
        <div className="bg-[#172033] p-2.5 rounded-xl border border-amber-800/40 flex flex-col items-center col-span-1">
          <span className="text-[10px] text-amber-400 font-bold">PC</span>
          <span className="text-sm sm:text-base text-amber-300 font-black">
            ${toHex16(c64State.cpu.PC)}
          </span>
          <span className="text-[9px] text-slate-400">16-bit</span>
        </div>

        {/* Stack Pointer SP */}
        <div className="bg-[#172033] p-2.5 rounded-xl border border-rose-800/40 flex flex-col items-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-rose-400 font-bold">SP</span>
          <span className="text-sm sm:text-base text-rose-300 font-black">
            ${toHex8(c64State.cpu.SP)}
          </span>
          <span className="text-[9px] text-slate-400">$01{toHex8(c64State.cpu.SP)}</span>
        </div>
      </div>

      {/* Processor Status Flags (P) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {language === 'hu' ? 'Processzor Állapotjelző Flagek (P)' : 'Processor Status Flags (P)'}
        </span>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {[
            { key: 'N', label: 'N', desc: 'Negative', val: c64State.cpu.flags.N },
            { key: 'V', label: 'V', desc: 'Overflow', val: c64State.cpu.flags.V },
            { key: 'B', label: 'B', desc: 'Break', val: c64State.cpu.flags.B },
            { key: 'D', label: 'D', desc: 'Decimal', val: c64State.cpu.flags.D },
            { key: 'I', label: 'I', desc: 'Interrupt', val: c64State.cpu.flags.I },
            { key: 'Z', label: 'Z', desc: 'Zero', val: c64State.cpu.flags.Z },
            { key: 'C', label: 'C', desc: 'Carry', val: c64State.cpu.flags.C },
          ].map((fl) => (
            <div
              key={fl.key}
              title={fl.desc}
              className={`p-1.5 rounded-lg border font-bold transition-colors ${
                fl.val
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600'
              }`}
            >
              <div className="text-[11px]">{fl.label}</div>
              <div className="text-[9px] opacity-70">{fl.val ? '1' : '0'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 6502 Disassembler Table */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            {language === 'hu' ? '6502 Disassembler / Gépi Kód' : '6502 Disassembler'}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[10px]">$</span>
            <input
              type="text"
              value={disasmAddr}
              onChange={(e) => setDisasmAddr(e.target.value.toUpperCase())}
              placeholder="C000"
              className="w-16 bg-[#1A2234] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 text-center outline-none focus:border-cyan-500 uppercase"
            />
          </div>
        </div>

        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl overflow-x-auto text-[11px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                <th className="p-1.5 pl-3">CÍM</th>
                <th className="p-1.5">BÁJTOK</th>
                <th className="p-1.5">UTASÍTÁS</th>
                <th className="p-1.5 pr-3">MEGJEGYZÉS</th>
              </tr>
            </thead>
            <tbody>
              {disassembled.map((row) => {
                const isCurrentPc = c64State.cpu.PC === row.address;
                return (
                  <tr
                    key={row.address}
                    className={`border-b border-slate-900/60 hover:bg-slate-800/40 transition-colors ${
                      isCurrentPc ? 'bg-amber-950/40 text-amber-200 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <td className="p-1.5 pl-3 text-cyan-400">
                      ${toHex16(row.address)}
                    </td>
                    <td className="p-1.5 text-slate-400 font-mono">
                      {row.hexBytes}
                    </td>
                    <td className="p-1.5 font-bold text-purple-300">
                      {row.mnemonic} <span className="text-slate-200">{row.operands}</span>
                    </td>
                    <td className="p-1.5 pr-3 text-slate-500 text-[10px]">
                      {row.comment || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
