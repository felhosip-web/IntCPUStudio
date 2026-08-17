import React, { useState } from 'react';
import {
  CpuFlags,
  CpuRegisters,
  RegisterName,
} from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import { NumberFormat } from '../../types/settings';
import { Binary, Cpu, Edit3, Hash, Sparkles } from 'lucide-react';

interface RegistersModuleProps {
  registers: CpuRegisters;
  flags: CpuFlags;
  lastChangedRegister: RegisterName | null;
  onUpdateRegister?: (reg: RegisterName, value: number) => void;
  onUpdateFlag?: (flagKey: keyof CpuFlags, value: boolean) => void;
}

export const RegistersModule: React.FC<RegistersModuleProps> = ({
  registers,
  flags,
  lastChangedRegister,
  onUpdateRegister,
  onUpdateFlag,
}) => {
  const { language, t, settings } = useI18n();
  const [format, setFormat] = useState<NumberFormat>(settings.numberFormat || 'HEX');
  const [editingReg, setEditingReg] = useState<RegisterName | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const formatValue = (val: number, fmt: NumberFormat = format): string => {
    val = val & 0xff;
    switch (fmt) {
      case 'HEX':
        return `0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
      case 'DEC':
        return val.toString(10);
      case 'BIN':
        return val.toString(2).padStart(8, '0');
      case 'SIGNED': {
        const signed = val > 127 ? val - 256 : val;
        return signed >= 0 ? `+${signed}` : `${signed}`;
      }
    }
  };

  const handleStartEdit = (reg: RegisterName) => {
    setEditingReg(reg);
    setEditValue(registers[reg].toString(10));
  };

  const handleSaveEdit = (reg: RegisterName) => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && onUpdateRegister) {
      onUpdateRegister(reg, ((parsed % 256) + 256) % 256);
    }
    setEditingReg(null);
  };

  const handleToggleBit = (reg: RegisterName, bitIndex: number) => {
    if (!onUpdateRegister) return;
    const current = registers[reg];
    const mask = 1 << bitIndex;
    const updated = current ^ mask;
    onUpdateRegister(reg, updated);
  };

  const generalRegs: Array<{
    name: RegisterName;
    labelHu: string;
    labelEn: string;
    descHu: string;
    descEn: string;
    color: string;
  }> = [
    {
      name: 'A',
      labelHu: 'Akkumulátor (A)',
      labelEn: 'Accumulator (A)',
      descHu: 'Fő számítási regiszter',
      descEn: 'Primary calculation register',
      color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 text-cyan-300',
    },
    {
      name: 'B',
      labelHu: 'Általános B',
      labelEn: 'General B',
      descHu: 'Másodlagos adatregiszter',
      descEn: 'Secondary data register',
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/40 text-blue-300',
    },
    {
      name: 'C',
      labelHu: 'Számláló (C)',
      labelEn: 'Counter (C)',
      descHu: 'Ciklusszámláló és mutató',
      descEn: 'Loop counter & index',
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-300',
    },
    {
      name: 'D',
      labelHu: 'Adat (D)',
      labelEn: 'Data (D)',
      descHu: 'Általános segédregiszter',
      descEn: 'General helper register',
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-300',
    },
  ];

  const specialRegs: Array<{
    name: RegisterName;
    labelHu: string;
    labelEn: string;
    descHu: string;
    descEn: string;
    color: string;
  }> = [
    {
      name: 'PC',
      labelHu: 'Program Számláló (PC)',
      labelEn: 'Program Counter (PC)',
      descHu: 'Következő memóriacím',
      descEn: 'Next instruction address',
      color: 'from-purple-500/20 to-purple-500/5 border-purple-500/40 text-purple-300',
    },
    {
      name: 'SP',
      labelHu: 'Verem Mutató (SP)',
      labelEn: 'Stack Pointer (SP)',
      descHu: 'Stack csúcsának címe',
      descEn: 'Top of stack pointer',
      color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/40 text-indigo-300',
    },
    {
      name: 'IR',
      labelHu: 'Utasítás Regiszter (IR)',
      labelEn: 'Instruction Reg (IR)',
      descHu: 'Jelenlegi opkód',
      descEn: 'Current opcode in decode',
      color: 'from-rose-500/20 to-rose-500/5 border-rose-500/40 text-rose-300',
    },
    {
      name: 'MAR',
      labelHu: 'Cím Regiszter (MAR)',
      labelEn: 'Memory Address Reg (MAR)',
      descHu: 'RAM címző puffer',
      descEn: 'Bus RAM address buffer',
      color: 'from-slate-700/40 to-slate-800/20 border-slate-700 text-slate-300',
    },
    {
      name: 'MBR',
      labelHu: 'Adat Puffer (MBR)',
      labelEn: 'Memory Buffer Reg (MBR)',
      descHu: 'RAM adat puffer',
      descEn: 'Bus RAM data buffer',
      color: 'from-slate-700/40 to-slate-800/20 border-slate-700 text-slate-300',
    },
  ];

  const flagList: Array<{
    key: keyof CpuFlags;
    name: string;
    descHu: string;
    descEn: string;
    color: string;
  }> = [
    { key: 'Z', name: 'Zero (Z)', descHu: 'Eredmény nulla', descEn: 'Result is zero', color: 'text-amber-400 border-amber-500 bg-amber-500/20' },
    { key: 'C', name: 'Carry (C)', descHu: 'Átvitel / Túlcsordulás', descEn: 'Carry / Overflow', color: 'text-rose-400 border-rose-500 bg-rose-500/20' },
    { key: 'N', name: 'Negative (N)', descHu: 'Negatív előjel (bit 7)', descEn: 'Negative sign bit', color: 'text-purple-400 border-purple-500 bg-purple-500/20' },
    { key: 'V', name: 'Overflow (V)', descHu: 'Előjeles túlcsordulás', descEn: 'Signed overflow', color: 'text-orange-400 border-orange-500 bg-orange-500/20' },
    { key: 'E', name: 'Equal (E)', descHu: 'Egyenlő (CMP)', descEn: 'Equal (CMP A==B)', color: 'text-emerald-400 border-emerald-500 bg-emerald-500/20' },
    { key: 'G', name: 'Greater (G)', descHu: 'Nagyobb (CMP)', descEn: 'Greater (CMP A>B)', color: 'text-blue-400 border-blue-500 bg-blue-500/20' },
    { key: 'L', name: 'Less (L)', descHu: 'Kisebb (CMP)', descEn: 'Less (CMP A<B)', color: 'text-indigo-400 border-indigo-500 bg-indigo-500/20' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Format Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'hu' ? 'Számformátum:' : 'Format:'}</span>
        </div>
        <div className="flex items-center gap-1 bg-[#0A0B0E] p-0.5 rounded-lg border border-slate-800">
          {(['HEX', 'DEC', 'BIN', 'SIGNED'] as NumberFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                format === fmt
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* General Purpose Registers */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>{t('generalRegisters')}</span>
          <span className="text-[9px] text-slate-500 lowercase font-normal">
            {language === 'hu' ? 'dupla kattintás az érték átírásához' : 'double-click to edit'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {generalRegs.map((reg) => {
            const val = registers[reg.name];
            const isChanged = lastChangedRegister === reg.name;
            const isEditing = editingReg === reg.name;

            return (
              <div
                key={reg.name}
                onDoubleClick={() => handleStartEdit(reg.name)}
                className={`p-3 rounded-xl border bg-gradient-to-b ${reg.color} transition-all relative overflow-hidden group ${
                  isChanged ? 'ring-2 ring-cyan-400 animate-pulse' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {language === 'hu' ? reg.labelHu : reg.labelEn}
                  </span>
                  <button
                    onClick={() => handleStartEdit(reg.name)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-300 transition-opacity"
                    title={language === 'hu' ? 'Érték szerkesztése' : 'Edit value'}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {isEditing ? (
                  <input
                    type="number"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(reg.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(reg.name);
                      if (e.key === 'Escape') setEditingReg(null);
                    }}
                    className="w-full bg-[#0A0B0E] border border-cyan-400 rounded px-1 py-0.5 text-sm font-mono text-cyan-300 outline-none"
                  />
                ) : (
                  <div className="font-mono text-base font-bold tracking-wider">
                    {formatValue(val)}
                  </div>
                )}

                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                  {language === 'hu' ? reg.descHu : reg.descEn}
                </div>

                {/* Mini Bitwise interactive indicator */}
                <div className="flex items-center gap-0.5 mt-2 pt-1.5 border-t border-slate-800/60">
                  {Array.from({ length: 8 }).map((_, bitIdx) => {
                    const actualBitIdx = 7 - bitIdx;
                    const bitSet = ((val >> actualBitIdx) & 1) === 1;
                    return (
                      <button
                        key={bitIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBit(reg.name, actualBitIdx);
                        }}
                        title={`Bit ${actualBitIdx}: ${bitSet ? '1' : '0'}`}
                        className={`flex-1 h-2 rounded-sm transition-colors ${
                          bitSet
                            ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special & Pointer Registers */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2">
          {t('specialRegisters')}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {specialRegs.map((reg) => {
            const val = registers[reg.name];
            const isChanged = lastChangedRegister === reg.name;

            return (
              <div
                key={reg.name}
                className={`p-2.5 rounded-xl border bg-gradient-to-b ${reg.color} transition-all ${
                  isChanged ? 'ring-2 ring-purple-400 animate-pulse' : ''
                }`}
              >
                <div className="font-mono text-[10px] font-bold text-slate-300 truncate">
                  {reg.name}
                </div>
                <div className="font-mono text-sm font-bold tracking-wider my-0.5">
                  {formatValue(val)}
                </div>
                <div className="text-[8px] text-slate-400 truncate">
                  {language === 'hu' ? reg.descHu : reg.descEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Flags */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>{t('statusFlags')}</span>
          <span className="text-[9px] text-slate-500 font-normal">
            {language === 'hu' ? 'kattints a bitek kézi teszteléséhez' : 'click flags to toggle'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {flagList.map((f) => {
            const isActive = flags[f.key];

            return (
              <button
                key={f.key}
                onClick={() => onUpdateFlag && onUpdateFlag(f.key, !isActive)}
                className={`p-2 rounded-xl border text-center font-mono transition-all ${
                  isActive
                    ? `${f.color} shadow-md`
                    : 'bg-[#0A0B0E]/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{f.key}</div>
                <div className="text-[9px] font-semibold mt-0.5">
                  {isActive ? '1 (SET)' : '0'}
                </div>
                <div className="text-[8px] truncate mt-0.5 opacity-80">
                  {language === 'hu' ? f.descHu : f.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
