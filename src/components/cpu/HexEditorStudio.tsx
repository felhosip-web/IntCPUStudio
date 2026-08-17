import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { HexEditEntry, HexPreset } from '../../types/hexEditor';
import { HEX_PRESETS } from '../../core/hexPresets';
import { HexExplainerGuide } from './HexExplainerGuide';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Binary,
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  Edit2,
  Eye,
  FileCode,
  FolderOpen,
  Hash,
  HelpCircle,
  History,
  Layers,
  Palette,
  Play,
  Redo2,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react';

interface HexEditorStudioProps {
  memory: Uint8Array;
  pc?: number;
  sp?: number;
  mar?: number;
  lastChangedAddress?: number | null;
  onUpdateMemoryByte: (addr: number, value: number) => void;
  onClearMemory?: () => void;
}

export const HexEditorStudio: React.FC<HexEditorStudioProps> = ({
  memory,
  pc = 0,
  sp = 255,
  mar = 0,
  lastChangedAddress = null,
  onUpdateMemoryByte,
  onClearMemory,
}) => {
  const { language } = useI18n();

  // Selected cursor address
  const [selectedAddr, setSelectedAddr] = useState<number>(0);
  const [activePane, setActivePane] = useState<'hex' | 'ascii'>('hex');
  const [nibbleInputBuffer, setNibbleInputBuffer] = useState<string>('');

  // View settings
  const [showExplainer, setShowExplainer] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<HexPreset | null>(null);
  const [viewRowsCount, setViewRowsCount] = useState<number>(16); // 256 bytes (16 rows x 16)
  const [baseOffset, setBaseOffset] = useState<number>(0); // Start page
  const [endianness, setEndianness] = useState<'LITTLE' | 'BIG'>('LITTLE');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'hex' | 'ascii'>('ascii');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // Undo / Redo History
  const [editHistory, setEditHistory] = useState<HexEditEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HexEditEntry[]>([]);
  const [modifiedAddresses, setModifiedAddresses] = useState<Set<number>>(new Set());

  // Copy status feedback
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Grid container reference for keyboard capture
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const selectedValue = memory[selectedAddr] ?? 0;

  // Compute 16-bit and 32-bit decoded values at selected cursor
  const val16Little =
    (memory[selectedAddr] ?? 0) | ((memory[(selectedAddr + 1) % memory.length] ?? 0) << 8);
  const val16Big =
    ((memory[selectedAddr] ?? 0) << 8) | (memory[(selectedAddr + 1) % memory.length] ?? 0);

  const val32Little =
    (memory[selectedAddr] ?? 0) |
    ((memory[(selectedAddr + 1) % memory.length] ?? 0) << 8) |
    ((memory[(selectedAddr + 2) % memory.length] ?? 0) << 16) |
    ((memory[(selectedAddr + 3) % memory.length] ?? 0) << 24);

  // Calculate search matches across memory
  const searchMatches = useMemo<number[]>(() => {
    if (!searchQuery.trim()) return [];
    const matches: number[] = [];

    if (searchMode === 'hex') {
      const cleanHex = searchQuery.replace(/[^0-9a-fA-F]/g, '');
      if (cleanHex.length >= 2) {
        const targetBytes: number[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
          targetBytes.push(parseInt(cleanHex.slice(i, i + 2), 16));
        }

        for (let i = 0; i <= memory.length - targetBytes.length; i++) {
          let isMatch = true;
          for (let j = 0; j < targetBytes.length; j++) {
            if (memory[i + j] !== targetBytes[j]) {
              isMatch = false;
              break;
            }
          }
          if (isMatch) matches.push(i);
        }
      }
    } else {
      const queryLower = searchQuery.toLowerCase();
      const memString = (Array.from(memory) as number[])
        .map((b: number) => (b >= 32 && b <= 126 ? String.fromCharCode(b).toLowerCase() : '.'))
        .join('');

      let pos = memString.indexOf(queryLower);
      while (pos !== -1) {
        matches.push(pos);
        pos = memString.indexOf(queryLower, pos + 1);
      }
    }
    return matches;
  }, [searchQuery, searchMode, memory]);

  // Jump to active search match
  useEffect(() => {
    if (searchMatches.length > 0) {
      const target = searchMatches[currentMatchIndex % searchMatches.length];
      if (target !== undefined) {
        setSelectedAddr(target);
      }
    }
  }, [currentMatchIndex, searchMatches]);

  // Handle byte modification with history
  const modifyByte = (addr: number, newValue: number) => {
    const oldValue = memory[addr] ?? 0;
    if (oldValue === newValue) return;

    onUpdateMemoryByte(addr, newValue);
    setModifiedAddresses((prev) => new Set(prev).add(addr));

    setEditHistory((prev) => [
      ...prev.slice(-49),
      {
        address: addr,
        oldValue,
        newValue,
        timestamp: Date.now(),
      },
    ]);
    setRedoStack([]);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (editHistory.length === 0) return;
    const last = editHistory[editHistory.length - 1];
    setEditHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
    onUpdateMemoryByte(last.address, last.oldValue);
    setSelectedAddr(last.address);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setEditHistory((prev) => [...prev, next]);
    onUpdateMemoryByte(next.address, next.newValue);
    setSelectedAddr(next.address);
  };

  // Toggle specific bit in selected byte
  const handleToggleBit = (bitIndex: number) => {
    const current = memory[selectedAddr] ?? 0;
    const mask = 1 << bitIndex;
    const updated = current ^ mask;
    modifyByte(selectedAddr, updated);
  };

  // Keyboard navigation and in-place editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev + 1) % memory.length);
      setNibbleInputBuffer('');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev - 1 + memory.length) % memory.length);
      setNibbleInputBuffer('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev + 16) % memory.length);
      setNibbleInputBuffer('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev - 16 + memory.length) % memory.length);
      setNibbleInputBuffer('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setActivePane((prev) => (prev === 'hex' ? 'ascii' : 'hex'));
      setNibbleInputBuffer('');
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev + 64) % memory.length);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setSelectedAddr((prev) => (prev - 64 + memory.length) % memory.length);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (activePane === 'hex') {
      // Hex numeric typing (0-9, a-f)
      const hexChar = e.key.toUpperCase();
      if (/^[0-9A-F]$/.test(hexChar)) {
        e.preventDefault();
        const nextBuffer = nibbleInputBuffer + hexChar;
        if (nextBuffer.length === 1) {
          setNibbleInputBuffer(nextBuffer);
        } else {
          const val = parseInt(nextBuffer, 16);
          modifyByte(selectedAddr, val);
          setNibbleInputBuffer('');
          setSelectedAddr((prev) => (prev + 1) % memory.length);
        }
      }
    } else if (activePane === 'ascii') {
      // ASCII character typing (single printable character)
      if (e.key.length === 1 && e.key.charCodeAt(0) >= 32 && e.key.charCodeAt(0) <= 126) {
        e.preventDefault();
        modifyByte(selectedAddr, e.key.charCodeAt(0));
        setSelectedAddr((prev) => (prev + 1) % memory.length);
      }
    }
  };

  // Load Preset
  const handleLoadPreset = (preset: HexPreset) => {
    setActivePreset(preset);
    for (let i = 0; i < preset.data.length; i++) {
      onUpdateMemoryByte(preset.baseAddress + i, preset.data[i]);
    }
    setSelectedAddr(preset.baseAddress);
    setNibbleInputBuffer('');
  };

  // Copy formats
  const handleCopy = (format: 'c_array' | 'asm' | 'intel_hex' | 'raw_dump') => {
    let output = '';
    const slice = Array.from(memory.slice(0, 256)) as number[];

    if (format === 'c_array') {
      output = `const uint8_t rom_data[256] = {\n  ` +
        slice
          .map((b: number, i: number) => `0x${b.toString(16).toUpperCase().padStart(2, '0')}${i < slice.length - 1 ? ',' : ''}${i % 16 === 15 ? '\n  ' : ' '}`)
          .join('') +
        `\n};`;
    } else if (format === 'asm') {
      for (let r = 0; r < 16; r++) {
        const rowBytes = slice.slice(r * 16, (r + 1) * 16);
        output += `  .BYTE ` + rowBytes.map((b: number) => `$${b.toString(16).toUpperCase().padStart(2, '0')}`).join(', ') + `\n`;
      }
    } else if (format === 'intel_hex') {
      // Standard Intel HEX 16-byte record
      for (let r = 0; r < 16; r++) {
        const addr = r * 16;
        const rowBytes = slice.slice(addr, addr + 16);
        const count = rowBytes.length;
        const addrHi = (addr >> 8) & 0xff;
        const addrLo = addr & 0xff;
        const recordType = 0x00; // Data
        let sum = count + addrHi + addrLo + recordType;
        let line = `:${count.toString(16).toUpperCase().padStart(2, '0')}${addr.toString(16).toUpperCase().padStart(4, '0')}00`;
        for (const b of rowBytes) {
          sum += b;
          line += b.toString(16).toUpperCase().padStart(2, '0');
        }
        const checksum = ((~sum + 1) & 0xff).toString(16).toUpperCase().padStart(2, '0');
        output += `${line}${checksum}\n`;
      }
      output += `:00000001FF\n`;
    } else {
      // Raw classic hex dump
      for (let r = 0; r < 16; r++) {
        const addr = r * 16;
        const rowBytes = slice.slice(addr, addr + 16);
        const hexStr = rowBytes.map((b: number) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
        const asciiStr = rowBytes.map((b: number) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
        output += `${addr.toString(16).toUpperCase().padStart(8, '0')}:  ${hexStr}  |${asciiStr}|\n`;
      }
    }

    navigator.clipboard.writeText(output);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Decode Opcode mnemonic for 6502/Edu8
  const opcodeDecoded = useMemo(() => {
    const op = memory[selectedAddr] ?? 0;
    const OP_MAP: Record<number, { mnemonic: string; desc: string }> = {
      0x00: { mnemonic: 'BRK / NOP', desc: 'Break / Halt' },
      0x01: { mnemonic: 'LDA (zp,X)', desc: 'Load Accumulator' },
      0x05: { mnemonic: 'ORA zp', desc: 'Bitwise OR Accumulator' },
      0x06: { mnemonic: 'ASL zp', desc: 'Arithmetic Shift Left' },
      0x08: { mnemonic: 'PHP', desc: 'Push Processor Status' },
      0x09: { mnemonic: 'ORA #imm', desc: 'Bitwise OR Immediate' },
      0x0a: { mnemonic: 'ASL A', desc: 'Shift Accumulator Left' },
      0x18: { mnemonic: 'CLC', desc: 'Clear Carry Flag' },
      0x20: { mnemonic: 'JSR abs', desc: 'Jump to Subroutine' },
      0x24: { mnemonic: 'BIT zp', desc: 'Bit Test' },
      0x28: { mnemonic: 'PLP', desc: 'Pull Processor Status' },
      0x29: { mnemonic: 'AND #imm', desc: 'Bitwise AND Immediate' },
      0x38: { mnemonic: 'SEC', desc: 'Set Carry Flag' },
      0x48: { mnemonic: 'PHA', desc: 'Push Accumulator to Stack' },
      0x49: { mnemonic: 'EOR #imm', desc: 'Bitwise XOR Immediate' },
      0x4c: { mnemonic: 'JMP abs', desc: 'Jump Absolute' },
      0x60: { mnemonic: 'RTS', desc: 'Return from Subroutine' },
      0x65: { mnemonic: 'ADC zp', desc: 'Add with Carry' },
      0x69: { mnemonic: 'ADC #imm', desc: 'Add with Carry Immediate' },
      0x85: { mnemonic: 'STA zp', desc: 'Store Accumulator' },
      0x86: { mnemonic: 'STX zp', desc: 'Store X Register' },
      0x88: { mnemonic: 'DEY', desc: 'Decrement Y Register' },
      0x8a: { mnemonic: 'TXA', desc: 'Transfer X to Accumulator' },
      0x8d: { mnemonic: 'STA abs', desc: 'Store Accumulator Absolute' },
      0x90: { mnemonic: 'BCC rel', desc: 'Branch if Carry Clear / NOP' },
      0x98: { mnemonic: 'TYA', desc: 'Transfer Y to Accumulator' },
      0xa0: { mnemonic: 'LDY #imm', desc: 'Load Y Immediate' },
      0xa2: { mnemonic: 'LDX #imm', desc: 'Load X Immediate' },
      0xa5: { mnemonic: 'LDA zp', desc: 'Load Accumulator ZP' },
      0xa8: { mnemonic: 'TAY', desc: 'Transfer Accumulator to Y' },
      0xa9: { mnemonic: 'LDA #imm', desc: 'Load Accumulator Immediate' },
      0xaa: { mnemonic: 'TAX', desc: 'Transfer Accumulator to X' },
      0xad: { mnemonic: 'LDA abs', desc: 'Load Accumulator Absolute' },
      0xb0: { mnemonic: 'BCS rel', desc: 'Branch if Carry Set' },
      0xc8: { mnemonic: 'INY', desc: 'Increment Y Register' },
      0xca: { mnemonic: 'DEX', desc: 'Decrement X Register' },
      0xd0: { mnemonic: 'BNE rel', desc: 'Branch if Not Equal (Z=0)' },
      0xe6: { mnemonic: 'INC zp', desc: 'Increment Memory' },
      0xe8: { mnemonic: 'INX', desc: 'Increment X Register' },
      0xea: { mnemonic: 'NOP', desc: 'No Operation' },
      0xf0: { mnemonic: 'BEQ rel', desc: 'Branch if Equal (Z=1)' },
    };
    return OP_MAP[op] || { mnemonic: `DB $${op.toString(16).toUpperCase().padStart(2, '0')}`, desc: 'Data Byte' };
  }, [memory, selectedAddr]);

  // Decode active preset highlight for cursor position
  const activeHighlight = useMemo(() => {
    if (!activePreset || !activePreset.highlights) return null;
    return activePreset.highlights.find(
      (h) => selectedAddr >= h.start && selectedAddr < h.start + h.length
    );
  }, [activePreset, selectedAddr]);

  return (
    <div
      ref={gridContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-5 focus:outline-none select-none"
    >
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0D15] p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Binary className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2">
                <span>{language === 'hu' ? 'HEX EDITOR & DUMP STÚDIÓ' : 'HEX EDITOR & DUMP STUDIO'}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                LIVE RAM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Professzionális bájtszerkesztő, memóriatérkép elemző és interaktív adatdekóder'
                : 'Professional byte editor, memory map analyzer and interactive data decoder'}
            </p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Guide Explainer Toggle */}
          <button
            onClick={() => setShowExplainer((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              showExplainer
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? '📖 Hogyan Működik?' : '📖 How it Works'}</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={handleUndo}
              disabled={editHistory.length === 0}
              title={language === 'hu' ? 'Visszavonás (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title={language === 'hu' ? 'Újra (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Memory */}
          {onClearMemory && (
            <button
              onClick={onClearMemory}
              title={language === 'hu' ? 'Memória törlése (0x00)' : 'Clear memory (0x00)'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Explainer Guide Collapsible */}
      {showExplainer && <HexExplainerGuide />}

      {/* Main Grid + Inspector Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Hex Dump Table & Navigation (col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Sub-toolbar: Search & Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0D111A] p-2.5 rounded-xl border border-slate-800 text-xs">
            {/* Search Bar */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={
                    searchMode === 'hex'
                      ? language === 'hu'
                        ? 'Keresés Hex (pl. A9 05, FF)...'
                        : 'Search Hex (e.g. A9 05, FF)...'
                      : language === 'hu'
                      ? 'Keresés Szöveg (pl. CPU, 6502)...'
                      : 'Search Text (e.g. CPU, 6502)...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#07090E] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Search mode toggle */}
              <button
                onClick={() => setSearchMode((prev) => (prev === 'hex' ? 'ascii' : 'hex'))}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg font-mono text-[11px] font-bold text-cyan-300 border border-slate-800 cursor-pointer"
              >
                {searchMode === 'hex' ? 'HEX' : 'ASCII'}
              </button>

              {/* Match Navigator */}
              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <span>
                    {(currentMatchIndex % searchMatches.length) + 1}/{searchMatches.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length)
                    }
                    className="p-0.5 hover:text-white cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length)}
                    className="p-0.5 hover:text-white cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Presets Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">
                {language === 'hu' ? 'Minta:' : 'Preset:'}
              </span>
              <select
                value={activePreset?.id || ''}
                onChange={(e) => {
                  const p = HEX_PRESETS.find((x) => x.id === e.target.value);
                  if (p) handleLoadPreset(p);
                }}
                className="bg-[#07090E] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="">{language === 'hu' ? '-- Válassz Mintát --' : '-- Select Preset --'}</option>
                {HEX_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {language === 'hu' ? p.titleHu : p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Preset Banner (if loaded) */}
          {activePreset && (
            <div className="p-3 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-purple-950/40 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span className="font-bold text-white font-mono">
                  {language === 'hu' ? activePreset.titleHu : activePreset.title}
                </span>
                <span className="text-slate-400 hidden md:inline">
                  — {language === 'hu' ? activePreset.descriptionHu : activePreset.description}
                </span>
              </div>
              <button
                onClick={() => setActivePreset(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-[11px] underline cursor-pointer"
              >
                {language === 'hu' ? 'Bezárás' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* Authentic Hex Dump Grid */}
          <div className="bg-[#080B12] rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-2xl overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs select-none">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/80 text-[11px]">
                  {/* Address Column Header */}
                  <th className="p-1.5 text-left font-bold text-amber-400/90 tracking-wider">
                    OFFSET
                  </th>

                  {/* 16 Hex Columns (+0 .. +F) */}
                  {Array.from({ length: 16 }, (_, col) => {
                    const isSelectedCol = selectedAddr % 16 === col;
                    return (
                      <th
                        key={col}
                        className={`p-1 text-center font-bold transition-colors ${
                          isSelectedCol ? 'text-cyan-300 bg-cyan-950/30' : 'text-slate-500'
                        }`}
                      >
                        +{col.toString(16).toUpperCase()}
                      </th>
                    );
                  })}

                  {/* Divider */}
                  <th className="px-2 text-slate-700">|</th>

                  {/* ASCII Header */}
                  <th className="p-1.5 text-left font-bold text-emerald-400/90 tracking-wider">
                    ASCII TEXT (0..F)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: viewRowsCount }, (_, row) => {
                  const rowAddr = baseOffset + row * 16;
                  const isSelectedRow = Math.floor(selectedAddr / 16) === row;

                  return (
                    <tr
                      key={row}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isSelectedRow ? 'bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Offset / Physical Address Column */}
                      <td
                        className={`p-1.5 font-bold text-[11px] whitespace-nowrap ${
                          isSelectedRow ? 'text-amber-300' : 'text-slate-600'
                        }`}
                      >
                        {rowAddr.toString(16).toUpperCase().padStart(8, '0')}
                      </td>

                      {/* 16 Hex Byte Cells */}
                      {Array.from({ length: 16 }, (_, col) => {
                        const addr = rowAddr + col;
                        const val = memory[addr] ?? 0;
                        const isSelected = selectedAddr === addr;
                        const isPc = pc === addr;
                        const isSp = sp === addr;
                        const isMar = mar === addr;
                        const isModified = modifiedAddresses.has(addr);
                        const isSearchMatch = searchMatches.includes(addr);

                        // Highlight from preset structure
                        const highlight = activePreset?.highlights?.find(
                          (h) => addr >= h.start && addr < h.start + h.length
                        );

                        // Color coding
                        let textClass = 'text-slate-500';
                        let bgClass = 'hover:bg-slate-800';

                        if (val === 0) {
                          textClass = 'text-slate-600';
                        } else if (val >= 32 && val <= 126) {
                          textClass = 'text-emerald-300 font-medium';
                        } else if (val >= 128) {
                          textClass = 'text-cyan-300';
                        } else {
                          textClass = 'text-amber-300';
                        }

                        if (isSelected) {
                          bgClass = 'bg-cyan-500 text-slate-950 font-black ring-2 ring-cyan-300 shadow-md shadow-cyan-500/50';
                          textClass = 'text-slate-950 font-black';
                        } else if (isSearchMatch) {
                          bgClass = 'bg-yellow-500/30 text-yellow-200 font-bold ring-1 ring-yellow-400 animate-pulse';
                        } else if (isPc) {
                          bgClass = 'bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-400';
                        } else if (isSp) {
                          bgClass = 'bg-indigo-500/20 text-indigo-300 font-bold ring-1 ring-indigo-400';
                        } else if (isMar) {
                          bgClass = 'bg-amber-500/20 text-amber-300 font-bold ring-1 ring-amber-400';
                        } else if (isModified) {
                          bgClass = 'bg-amber-950/40 text-amber-200 font-bold ring-1 ring-amber-500/50';
                        }

                        return (
                          <td
                            key={col}
                            onClick={() => {
                              setSelectedAddr(addr);
                              setActivePane('hex');
                              setNibbleInputBuffer('');
                            }}
                            style={
                              !isSelected && highlight
                                ? { backgroundColor: `${highlight.color}18`, color: highlight.color }
                                : {}
                            }
                            className={`p-1 text-center cursor-pointer rounded transition-all text-xs select-none ${bgClass} ${textClass}`}
                            title={`Address: $${addr.toString(16).toUpperCase().padStart(4, '0')} (${addr})\nDec: ${val}\nBin: ${val.toString(2).padStart(8, '0')}\nASCII: '${val >= 32 && val <= 126 ? String.fromCharCode(val) : '.'}'`}
                          >
                            {isSelected && nibbleInputBuffer
                              ? `${nibbleInputBuffer}_`
                              : val.toString(16).toUpperCase().padStart(2, '0')}
                          </td>
                        );
                      })}

                      {/* Divider */}
                      <td className="px-2 text-slate-800">|</td>

                      {/* ASCII Representation Pane */}
                      <td className="p-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-0.5 tracking-wider font-mono text-xs">
                          {Array.from({ length: 16 }, (_, col) => {
                            const addr = rowAddr + col;
                            const val = memory[addr] ?? 0;
                            const isSelected = selectedAddr === addr;
                            const isPrintable = val >= 32 && val <= 126;
                            const char = isPrintable ? String.fromCharCode(val) : '·';

                            return (
                              <span
                                key={col}
                                onClick={() => {
                                  setSelectedAddr(addr);
                                  setActivePane('ascii');
                                }}
                                className={`w-3.5 text-center cursor-pointer rounded transition-colors ${
                                  isSelected
                                    ? 'bg-cyan-500 text-slate-950 font-black ring-1 ring-cyan-300'
                                    : isPrintable
                                    ? 'text-emerald-300 font-semibold hover:bg-slate-800'
                                    : 'text-slate-600 hover:bg-slate-800'
                                }`}
                              >
                                {char}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Copy & Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0A0D15] rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'hu' ? 'Másolás & Export:' : 'Copy & Export:'}</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleCopy('c_array')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 font-mono text-[11px] cursor-pointer"
              >
                {copiedFormat === 'c_array' ? '✓ Másolva!' : 'C/C++ Tömb'}
              </button>
              <button
                onClick={() => handleCopy('asm')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 font-mono text-[11px] cursor-pointer"
              >
                {copiedFormat === 'asm' ? '✓ Másolva!' : 'ASM .BYTE'}
              </button>
              <button
                onClick={() => handleCopy('intel_hex')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 font-mono text-[11px] cursor-pointer"
              >
                {copiedFormat === 'intel_hex' ? '✓ Másolva!' : 'Intel HEX'}
              </button>
              <button
                onClick={() => handleCopy('raw_dump')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 font-mono text-[11px] cursor-pointer"
              >
                {copiedFormat === 'raw_dump' ? '✓ Másolva!' : 'Text Dump'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data Inspector & Decoders (col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Active Address Card */}
          <div className="p-4 bg-[#0A0E18] rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                {language === 'hu' ? 'Aktuális Pozíció' : 'Selected Position'}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
                0x{selectedAddr.toString(16).toUpperCase().padStart(4, '0')} (${selectedAddr.toString(16).toUpperCase().padStart(4, '0')})
              </span>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-500">HEX BÁJT</div>
                <div className="text-xl font-black text-cyan-300">
                  0x{selectedValue.toString(16).toUpperCase().padStart(2, '0')}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-500">ASCII KARAKTER</div>
                <div className="text-xl font-black text-emerald-300">
                  '{selectedValue >= 32 && selectedValue <= 126 ? String.fromCharCode(selectedValue) : '·'}'
                </div>
              </div>
            </div>

            {/* Interactive 8-Bit Bitmask with Clickable Toggles */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{language === 'hu' ? 'Bináris Bitmaszk (Kattintható):' : 'Binary Bitmask (Clickable):'}</span>
                <span className="text-cyan-400 font-bold">
                  {selectedValue.toString(2).padStart(8, '0')}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-xs text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bitIdx = 7 - i;
                  const isSet = ((selectedValue >> bitIdx) & 1) === 1;
                  return (
                    <button
                      key={bitIdx}
                      onClick={() => handleToggleBit(bitIdx)}
                      title={`Bit ${bitIdx} (2^${bitIdx} = ${1 << bitIdx}) - Kattints a váltáshoz`}
                      className={`py-1.5 rounded font-bold cursor-pointer transition-all ${
                        isSet
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {isSet ? '1' : '0'}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-[9px] text-slate-600 text-center">
                <span>b7</span>
                <span>b6</span>
                <span>b5</span>
                <span>b4</span>
                <span>b3</span>
                <span>b2</span>
                <span>b1</span>
                <span>b0</span>
              </div>
            </div>

            {/* Opcode Disassembler Info */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                <span>{language === 'hu' ? 'Gépi Kód Dekódoló (Opcode)' : 'Disassembled Opcode'}</span>
                <span className="text-amber-400 font-bold">6502 / Edu8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-amber-300">
                  {opcodeDecoded.mnemonic}
                </span>
                <span className="text-xs text-slate-400 font-mono">{opcodeDecoded.desc}</span>
              </div>
            </div>

            {/* Multi-Type Decoder */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                {language === 'hu' ? 'Adattípus Értelmezések' : 'Data Type Interpretations'}
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400">Unsigned 8-bit (uint8):</span>
                  <span className="text-white font-bold">{selectedValue}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400">Signed 8-bit (int8):</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedValue > 127 ? selectedValue - 256 : selectedValue}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400">16-bit Int (Little Endian):</span>
                  <span className="text-emerald-300 font-bold">
                    {val16Little} (0x{val16Little.toString(16).toUpperCase().padStart(4, '0')})
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400">16-bit Int (Big Endian):</span>
                  <span className="text-purple-300 font-bold">
                    {val16Big} (0x{val16Big.toString(16).toUpperCase().padStart(4, '0')})
                  </span>
                </div>
              </div>
            </div>

            {/* Active Preset Highlight Annotation */}
            {activeHighlight && (
              <div
                style={{
                  backgroundColor: `${activeHighlight.color}15`,
                  borderColor: `${activeHighlight.color}40`,
                }}
                className="p-3 rounded-xl border text-xs flex flex-col gap-1"
              >
                <span className="text-[10px] font-mono uppercase font-bold" style={{ color: activeHighlight.color }}>
                  {language === 'hu' ? 'Minta Struktúra Megjelölés' : 'Preset Structure Tag'}
                </span>
                <span className="font-bold text-white">
                  {language === 'hu' ? activeHighlight.labelHu : activeHighlight.label}
                </span>
              </div>
            )}
          </div>

          {/* 8x8 Pixel Bitmap Visualizer */}
          <div className="p-4 bg-[#0A0D15] rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'hu' ? '8x8 Sprite / Pixel Előnézet' : '8x8 Pixel Bitmap Preview'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">8 bájt a kurzortól</span>
            </div>

            {/* 8x8 Pixel Grid */}
            <div className="flex justify-center p-2 bg-black rounded-xl border border-slate-800">
              <div className="grid grid-cols-8 gap-0.5 w-40 h-40">
                {Array.from({ length: 8 }, (_, r) => {
                  const byteVal = memory[(selectedAddr + r) % memory.length] ?? 0;
                  return Array.from({ length: 8 }, (_, c) => {
                    const bit = ((byteVal >> (7 - c)) & 1) === 1;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`rounded-sm transition-colors ${
                          bit ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-900'
                        }`}
                        title={`Row ${r} (Byte: 0x${byteVal.toString(16).toUpperCase()}), Col ${c}`}
                      />
                    );
                  });
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono text-center">
              {language === 'hu'
                ? 'Minden sor 1 bájt, az 1-es bitek világító pixelek (pl. retro karakterek és játék sprite-ok).'
                : 'Each row is 1 byte, 1-bits are active pixels (retro fonts and game sprites).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
