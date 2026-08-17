import React, { useState } from 'react';
import { INSTRUCTIONS } from '../../core/isa';
import { useI18n } from '../../i18n/I18nContext';
import { Database, Edit, Eye, Search, Sparkles, Trash2 } from 'lucide-react';

interface MemoryModuleProps {
  memory: Uint8Array;
  pc: number;
  sp: number;
  mar: number;
  lastChangedAddress: number | null;
  onUpdateMemoryByte?: (addr: number, value: number) => void;
  onClearMemory?: () => void;
}

export const MemoryModule: React.FC<MemoryModuleProps> = ({
  memory,
  pc,
  sp,
  mar,
  lastChangedAddress,
  onUpdateMemoryByte,
  onClearMemory,
}) => {
  const { language, t } = useI18n();
  const [selectedAddr, setSelectedAddr] = useState<number | null>(pc);
  const [editingByteValue, setEditingByteValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'HEX' | 'DEC' | 'ASCII' | 'DUMP'>('HEX');

  const selectedValue = selectedAddr !== null ? memory[selectedAddr] : null;
  const selectedInstruction =
    selectedValue !== null ? INSTRUCTIONS[selectedValue] : undefined;

  const handleCellClick = (addr: number) => {
    setSelectedAddr(addr);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (selectedAddr !== null) {
      setEditingByteValue(memory[selectedAddr].toString(16).toUpperCase());
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedAddr !== null && onUpdateMemoryByte) {
      const val = parseInt(editingByteValue, 16);
      if (!isNaN(val)) {
        onUpdateMemoryByte(selectedAddr, val & 0xff);
      }
    }
    setIsEditing(false);
  };

  const handleSearchJump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    let target = parseInt(searchQuery, searchQuery.startsWith('0x') ? 16 : 10);
    if (!isNaN(target) && target >= 0 && target < 256) {
      setSelectedAddr(target);
    }
  };

  const formatCell = (byte: number): string => {
    switch (viewMode) {
      case 'HEX':
      case 'DUMP':
        return byte.toString(16).toUpperCase().padStart(2, '0');
      case 'DEC':
        return byte.toString(10).padStart(3, ' ');
      case 'ASCII': {
        if (byte >= 32 && byte <= 126) return String.fromCharCode(byte);
        if (byte === 0) return '·';
        return '•';
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <form onSubmit={handleSearchJump} className="flex items-center gap-1">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                placeholder={t('memorySearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-2 py-1 bg-[#0A0B0E] border border-slate-800 rounded text-[11px] font-mono text-slate-200 w-32 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
            >
              {t('memoryJump')}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-[#0A0B0E] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
            {(['HEX', 'DEC', 'ASCII', 'DUMP'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-1.5 py-0.5 rounded ${
                  viewMode === m
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {onClearMemory && (
            <button
              onClick={onClearMemory}
              title={t('memoryClearAll')}
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Legend markers */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400" />
          <span>PC: 0x{pc.toString(16).toUpperCase().padStart(2, '0')}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500/30 border border-indigo-400" />
          <span>SP: 0x{sp.toString(16).toUpperCase().padStart(2, '0')}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-400" />
          <span>MAR: 0x{mar.toString(16).toUpperCase().padStart(2, '0')}</span>
        </span>
        {lastChangedAddress !== null && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400 animate-ping" />
            <span>
              {language === 'hu' ? 'Írva' : 'Written'}: 0x
              {lastChangedAddress.toString(16).toUpperCase().padStart(2, '0')}
            </span>
          </span>
        )}
      </div>

      {/* RAM Matrix Grid: 16 rows x 16 columns (256 bytes) */}
      <div className="overflow-x-auto bg-[#0A0B0E]/80 p-2 rounded-xl border border-slate-800">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800/80">
              <th className="p-1 text-left font-normal text-[9px]">
                {language === 'hu' ? 'CÍM' : 'ADDR'}
              </th>
              {Array.from({ length: 16 }, (_, i) => (
                <th key={i} className="p-0.5 text-center font-normal text-[9px]">
                  +{i.toString(16).toUpperCase()}
                </th>
              ))}
              {viewMode === 'DUMP' && (
                <th className="p-1 text-left font-normal text-[9px] text-emerald-400 pl-2">
                  ASCII
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 16 }, (_, row) => {
              const rowStart = row * 16;
              return (
                <tr key={row} className="hover:bg-slate-900/50">
                  <td className="p-1 text-slate-500 font-bold text-[10px] select-none">
                    0x{rowStart.toString(16).toUpperCase().padStart(2, '0')}
                  </td>
                  {Array.from({ length: 16 }, (_, col) => {
                    const addr = rowStart + col;
                    const val = memory[addr];
                    const isPc = pc === addr;
                    const isSp = sp === addr;
                    const isMar = mar === addr;
                    const isLastWritten = lastChangedAddress === addr;
                    const isSelected = selectedAddr === addr;
                    const isNonZero = val !== 0;

                    let bgClass = 'hover:bg-slate-800 text-slate-400';
                    if (isPc) {
                      bgClass = 'bg-emerald-500/30 text-emerald-300 font-bold ring-1 ring-emerald-400';
                    } else if (isSp) {
                      bgClass = 'bg-indigo-500/30 text-indigo-300 font-bold ring-1 ring-indigo-400';
                    } else if (isMar) {
                      bgClass = 'bg-amber-500/30 text-amber-300 font-bold ring-1 ring-amber-400';
                    } else if (isLastWritten) {
                      bgClass = 'bg-cyan-500/30 text-cyan-200 font-bold ring-1 ring-cyan-400';
                    } else if (isSelected) {
                      bgClass = 'bg-cyan-900/40 text-cyan-200 font-bold ring-1 ring-cyan-500';
                    } else if (isNonZero) {
                      bgClass = 'text-slate-200 font-medium bg-slate-900/60';
                    }

                    return (
                      <td
                        key={col}
                        id={`mem-cell-${addr}`}
                        onClick={() => handleCellClick(addr)}
                        title={`${language === 'hu' ? 'Cím' : 'Addr'}: 0x${addr.toString(16).toUpperCase().padStart(2, '0')} (${addr})\n${language === 'hu' ? 'Érték' : 'Val'}: 0x${val.toString(16).toUpperCase()} (${val})`}
                        className={`p-1 text-center cursor-pointer rounded transition-colors text-[10px] select-none ${bgClass}`}
                      >
                        {formatCell(val)}
                      </td>
                    );
                  })}
                  {viewMode === 'DUMP' && (
                    <td className="p-1 pl-2 font-mono text-[10px] text-emerald-300 select-none tracking-widest whitespace-nowrap">
                      {Array.from({ length: 16 }, (_, c) => {
                        const v = memory[rowStart + c];
                        return v >= 32 && v <= 126 ? String.fromCharCode(v) : '·';
                      }).join('')}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Address Inspector */}
      {selectedAddr !== null && selectedValue !== null && (
        <div className="p-2.5 bg-[#0A0B0E] rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-cyan-400 font-mono text-center min-w-16">
              <div className="text-[9px] text-slate-500">
                {language === 'hu' ? 'CÍM' : 'ADDR'}
              </div>
              <div className="font-bold text-xs">
                0x{selectedAddr.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[9px] text-slate-400">({selectedAddr})</div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">
                  {language === 'hu' ? 'Érték' : 'Value'}: 0x
                  {selectedValue.toString(16).toUpperCase().padStart(2, '0')}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  (Dec: {selectedValue}, Bin: {selectedValue.toString(2).padStart(8, '0')})
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                {selectedInstruction ? (
                  <span className="text-emerald-400 font-mono font-semibold">
                    {language === 'hu' ? 'Utasítás' : 'Instruction'}: {selectedInstruction.mnemonic} (
                    {language === 'hu'
                      ? selectedInstruction.descriptionHu
                      : selectedInstruction.description}
                    )
                  </span>
                ) : (
                  <span>{language === 'hu' ? 'Adatbájt' : 'Data Byte'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 font-mono">0x</span>
                <input
                  type="text"
                  maxLength={2}
                  value={editingByteValue}
                  onChange={(e) => setEditingByteValue(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="w-12 bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-500 font-mono text-xs text-cyan-300 uppercase"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs font-mono"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
              >
                <Edit className="w-3 h-3 text-cyan-400" />
                <span>{language === 'hu' ? 'Módosítás' : 'Edit Byte'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
