import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C64State, C64_PALETTE } from '../../types/c64';
import { useI18n } from '../../i18n/I18nContext';
import {
  C64_MEMORY_REGIONS,
  C64_KNOWN_REGISTERS,
  petsciiScreenCodeToChar,
  C64MemoryRegion,
} from '../../core/c64MemoryMap';
import {
  Binary,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Edit2,
  Eye,
  FileCode,
  HardDrive,
  Hash,
  Layers,
  MapPin,
  Maximize2,
  Paintbrush,
  Pin,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface C64MemoryInspectorProps {
  c64State: C64State;
  onUpdateMemoryByte: (address: number, val: number) => void;
}

export const C64MemoryInspector: React.FC<C64MemoryInspectorProps> = ({
  c64State,
  onUpdateMemoryByte,
}) => {
  const { language } = useI18n();

  // Navigation & Address State
  const [startAddr, setStartAddr] = useState<number>(0x0400); // Default to Screen RAM
  const [addrInput, setAddrInput] = useState<string>('0400');
  const [selectedAddr, setSelectedAddr] = useState<number>(0x0400);
  const [rowCount, setRowCount] = useState<number>(16); // 16 rows * 16 bytes = 256 bytes per page

  // Editing state
  const [editingAddr, setEditingAddr] = useState<number | null>(null);
  const [editHexBuffer, setEditHexBuffer] = useState<string>('');
  const [editMode, setEditMode] = useState<'hex' | 'ascii'>('hex');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'text' | 'hex'>('text');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIdx, setCurrentSearchIdx] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Fill tool state
  const [showFillModal, setShowFillModal] = useState<boolean>(false);
  const [fillStart, setFillStart] = useState<string>('C000');
  const [fillEnd, setFillEnd] = useState<string>('C0FF');
  const [fillVal, setFillVal] = useState<string>('00');

  // Export DATA modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportStart, setExportStart] = useState<string>('0801');
  const [exportLength, setExportLength] = useState<string>('64');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Watchpoints state
  const [watchAddresses, setWatchAddresses] = useState<number[]>([
    0xd020, // Border color
    0xd021, // Background color
    0x0400, // Screen RAM (top-left)
    0x0286, // Text color
  ]);
  const [newWatchInput, setNewWatchInput] = useState<string>('');

  // Screen RAM Matrix Visualizer Toggle
  const [showScreenRamMatrix, setShowScreenRamMatrix] = useState<boolean>(false);

  // Live Flash Highlight tracking for memory modifications
  const [changedBytes, setChangedBytes] = useState<Set<number>>(new Set());
  const prevMemoryRef = useRef<Uint8Array | null>(null);
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track live changes in memory
  useEffect(() => {
    if (!prevMemoryRef.current) {
      prevMemoryRef.current = new Uint8Array(c64State.memory);
      return;
    }

    const prev = prevMemoryRef.current;
    const current = c64State.memory;
    const diffs = new Set<number>();

    // Check visible memory block plus watched addresses
    const checkStart = Math.max(0, startAddr - 16);
    const checkEnd = Math.min(65535, startAddr + rowCount * 16 + 16);

    for (let i = checkStart; i <= checkEnd; i++) {
      if (prev[i] !== current[i]) {
        diffs.add(i);
      }
    }

    watchAddresses.forEach((addr) => {
      if (prev[addr] !== current[addr]) {
        diffs.add(addr);
      }
    });

    if (diffs.size > 0) {
      setChangedBytes(diffs);

      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setChangedBytes(new Set());
      }, 1200);
    }

    prevMemoryRef.current = new Uint8Array(c64State.memory);
  }, [c64State.memory, startAddr, rowCount, watchAddresses]);

  // Jump to given address
  const jumpToAddress = (addr: number) => {
    const clamped = Math.max(0, Math.min(65536 - rowCount * 16, addr));
    setStartAddr(clamped);
    setAddrInput(clamped.toString(16).toUpperCase().padStart(4, '0'));
    setSelectedAddr(addr);
  };

  const handleAddrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let addr = 0;
    const trimmed = addrInput.trim().toUpperCase();

    if (trimmed.startsWith('$') || trimmed.startsWith('0X')) {
      addr = parseInt(trimmed.replace('$', '').replace('0X', ''), 16);
    } else if (/^[0-9A-F]{1,4}$/i.test(trimmed)) {
      addr = parseInt(trimmed, 16);
    } else {
      addr = parseInt(trimmed, 10);
    }

    if (!isNaN(addr) && addr >= 0 && addr < 65536) {
      jumpToAddress(addr);
    }
  };

  // Keyboard navigation & hex typing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingAddr !== null) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedAddr((prev) => Math.min(65535, prev + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedAddr((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAddr((prev) => Math.min(65535, prev + 16));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAddr((prev) => Math.max(0, prev - 16));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      jumpToAddress(Math.min(65536 - rowCount * 16, startAddr + rowCount * 16));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      jumpToAddress(Math.max(0, startAddr - rowCount * 16));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startEditingCell(selectedAddr, 'hex');
    }
  };

  const startEditingCell = (addr: number, mode: 'hex' | 'ascii') => {
    setEditingAddr(addr);
    setEditMode(mode);
    if (mode === 'hex') {
      setEditHexBuffer(c64State.memory[addr].toString(16).padStart(2, '0').toUpperCase());
    } else {
      const b = c64State.memory[addr];
      setEditHexBuffer(b >= 32 && b <= 126 ? String.fromCharCode(b) : '.');
    }
  };

  const commitHexEdit = (addr: number, hexStr: string) => {
    const val = parseInt(hexStr, 16);
    if (!isNaN(val)) {
      onUpdateMemoryByte(addr, val & 0xff);
    }
    setEditingAddr(null);
  };

  const commitAsciiEdit = (addr: number, char: string) => {
    if (char.length > 0) {
      const code = char.charCodeAt(0) & 0xff;
      onUpdateMemoryByte(addr, code);
    }
    setEditingAddr(null);
  };

  // Perform Memory Search
  const handlePerformSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results: number[] = [];

    if (searchType === 'text') {
      const needle = searchQuery.toUpperCase();
      const mem = c64State.memory;
      for (let i = 0; i <= 65536 - needle.length; i++) {
        let match = true;
        for (let j = 0; j < needle.length; j++) {
          const charCode = needle.charCodeAt(j);
          const screenCode = charCode >= 65 && charCode <= 90 ? charCode - 64 : charCode;
          // Match either raw ASCII or PETSCII screen code
          if (mem[i + j] !== charCode && mem[i + j] !== screenCode) {
            match = false;
            break;
          }
        }
        if (match) results.push(i);
        if (results.length >= 50) break;
      }
    } else {
      // Hex sequence (e.g., "A9 01" or "A901")
      const cleaned = searchQuery.replace(/\s+/g, '').replace(/\$/g, '');
      const bytes: number[] = [];
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes.push(parseInt(cleaned.substr(i, 2), 16));
      }

      if (bytes.length > 0 && !bytes.some(isNaN)) {
        const mem = c64State.memory;
        for (let i = 0; i <= 65536 - bytes.length; i++) {
          let match = true;
          for (let j = 0; j < bytes.length; j++) {
            if (mem[i + j] !== bytes[j]) {
              match = false;
              break;
            }
          }
          if (match) results.push(i);
          if (results.length >= 50) break;
        }
      }
    }

    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIdx(0);
      jumpToAddress(results[0]);
    }
    setIsSearching(false);
  };

  const handleNextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIdx + 1) % searchResults.length;
    setCurrentSearchIdx(nextIdx);
    jumpToAddress(searchResults[nextIdx]);
  };

  const handlePrevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentSearchIdx - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIdx(prevIdx);
    jumpToAddress(searchResults[prevIdx]);
  };

  // Perform Memory Fill
  const handleExecuteFill = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(fillStart.replace('$', '').replace('0X', ''), 16);
    const end = parseInt(fillEnd.replace('$', '').replace('0X', ''), 16);
    const val = parseInt(fillVal.replace('$', '').replace('0X', ''), 16) & 0xff;

    if (!isNaN(start) && !isNaN(end) && !isNaN(val) && start <= end && start >= 0 && end < 65536) {
      for (let a = start; a <= end; a++) {
        onUpdateMemoryByte(a, val);
      }
      setShowFillModal(false);
      jumpToAddress(start);
    }
  };

  // Watchpoints management
  const handleAddWatchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    let addr = 0;
    const trimmed = newWatchInput.trim().toUpperCase();
    if (trimmed.startsWith('$')) addr = parseInt(trimmed.slice(1), 16);
    else if (/^[0-9A-F]{1,4}$/i.test(trimmed)) addr = parseInt(trimmed, 16);
    else addr = parseInt(trimmed, 10);

    if (!isNaN(addr) && addr >= 0 && addr < 65536 && !watchAddresses.includes(addr)) {
      setWatchAddresses([...watchAddresses, addr]);
      setNewWatchInput('');
    }
  };

  const handleRemoveWatchpoint = (addr: number) => {
    setWatchAddresses(watchAddresses.filter((a) => a !== addr));
  };

  // Generate BASIC DATA export code
  const generatedDataCode = useMemo(() => {
    const start = parseInt(exportStart.replace('$', ''), 16) || 0x0801;
    const len = parseInt(exportLength, 10) || 64;
    const lines: string[] = [];
    let currentLineNum = 1000;
    let currentBytes: number[] = [];

    for (let i = 0; i < len; i++) {
      const addr = start + i;
      if (addr >= 65536) break;
      currentBytes.push(c64State.memory[addr]);

      if (currentBytes.length === 8 || i === len - 1) {
        lines.push(`${currentLineNum} DATA ${currentBytes.join(', ')}`);
        currentLineNum += 10;
        currentBytes = [];
      }
    }
    return lines.join('\n');
  }, [c64State.memory, exportStart, exportLength]);

  const handleCopyDataCode = () => {
    navigator.clipboard.writeText(generatedDataCode);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Active region & selected byte info
  const selectedByteVal = c64State.memory[selectedAddr] || 0;
  const currentRegion = useMemo<C64MemoryRegion | undefined>(() => {
    return C64_MEMORY_REGIONS.find(
      (r) => selectedAddr >= r.startAddr && selectedAddr <= r.endAddr
    );
  }, [selectedAddr]);

  const knownRegister = C64_KNOWN_REGISTERS[selectedAddr];

  // Hex display helpers
  const toHex16 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const toHex8 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, '0');
  const toBin8 = (v: number) => (v & 0xff).toString(2).padStart(8, '0');

  // Build rows for current page
  const rows: { addr: number; bytes: number[]; ascii: string; petscii: string }[] = [];
  for (let r = 0; r < rowCount; r++) {
    const rowAddr = startAddr + r * 16;
    if (rowAddr >= 65536) break;
    const rowBytes: number[] = [];
    let asciiStr = '';
    let petsciiStr = '';

    for (let c = 0; c < 16; c++) {
      const b = c64State.memory[rowAddr + c] || 0;
      rowBytes.push(b);
      asciiStr += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
      petsciiStr += petsciiScreenCodeToChar(b);
    }
    rows.push({ addr: rowAddr, bytes: rowBytes, ascii: asciiStr, petscii: petsciiStr });
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="bg-[#0F1420] rounded-2xl border border-cyan-900/40 p-4 sm:p-5 shadow-2xl flex flex-col gap-4 font-mono outline-none text-slate-200"
    >
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-400 shadow-md">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span>{language === 'hu' ? 'C64 Memória Hex Szerkesztő' : 'C64 Memory Hex Editor'}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  64KB RAM
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'hu'
                ? 'Valós idejű memóriainspekció és módosítás BASIC futás közben'
                : 'Real-time RAM inspection & modification during BASIC execution'}
            </p>
          </div>
        </div>

        {/* Address Jump Form & Row Count Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Paging buttons */}
          <div className="flex items-center bg-[#090C14] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => jumpToAddress(Math.max(0, startAddr - rowCount * 16))}
              disabled={startAddr === 0}
              title="Page Up (-256b)"
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => jumpToAddress(Math.min(65536 - rowCount * 16, startAddr + rowCount * 16))}
              disabled={startAddr >= 65536 - rowCount * 16}
              title="Page Down (+256b)"
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump to Address Form */}
          <form onSubmit={handleAddrSubmit} className="flex items-center gap-1">
            <span className="text-xs text-emerald-400 font-bold">$</span>
            <input
              type="text"
              value={addrInput}
              onChange={(e) => setAddrInput(e.target.value.toUpperCase())}
              placeholder="0400"
              className="w-16 bg-[#161D2C] border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300 font-bold text-center outline-none focus:border-emerald-500 uppercase"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Ugrás
            </button>
          </form>

          {/* Row count toggle (8, 16, 24) */}
          <div className="flex items-center gap-1 bg-[#090C14] p-1 rounded-lg border border-slate-800 text-[10px]">
            <span className="text-slate-500 px-1">Sorok:</span>
            {[8, 16, 24].map((r) => (
              <button
                key={r}
                onClick={() => setRowCount(r)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  rowCount === r
                    ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Zone Quick Jump Bookmarks Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            {language === 'hu' ? 'C64 Memória Térkép Zónák:' : 'C64 Memory Map Zones:'}
          </span>
          <span className="text-[10px] text-slate-500">
            {language === 'hu' ? 'Kattints az azonnali ugráshoz' : 'Click to jump'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {C64_MEMORY_REGIONS.map((zone) => {
            const isInside = selectedAddr >= zone.startAddr && selectedAddr <= zone.endAddr;
            return (
              <button
                key={zone.name}
                onClick={() => jumpToAddress(zone.startAddr)}
                title={language === 'hu' ? zone.descriptionHu : zone.description}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  isInside
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950'
                    : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span>{language === 'hu' ? zone.nameHu : zone.name}</span>
                <span className="text-slate-500 font-mono text-[9px]">
                  (${toHex16(zone.startAddr)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090C14] p-2.5 rounded-xl border border-slate-800/80">
        {/* Search Bar */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[260px]">
          <div className="flex items-center bg-[#161D2C] border border-slate-700 rounded-lg px-2 py-1 flex-1 gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePerformSearch()}
              placeholder={
                searchType === 'text'
                  ? 'Keresés szövegben (pl. COMMODORE)...'
                  : 'Keresés hex-ben (pl. A9 01 8D)...'
              }
              className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none w-full"
            />
            <button
              onClick={() => setSearchType(searchType === 'text' ? 'hex' : 'text')}
              className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700 cursor-pointer"
            >
              {searchType.toUpperCase()}
            </button>
          </div>

          <button
            onClick={handlePerformSearch}
            className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Keresés
          </button>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-400 font-bold text-[11px]">
                {currentSearchIdx + 1}/{searchResults.length}
              </span>
              <button
                onClick={handlePrevSearchResult}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={handleNextSearchResult}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Action Tools: Fill, DATA Export, Screen RAM Matrix */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowFillModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
          >
            <Paintbrush className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Kitöltés</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
          >
            <FileCode className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">DATA Export</span>
          </button>

          <button
            onClick={() => setShowScreenRamMatrix(!showScreenRamMatrix)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showScreenRamMatrix
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Képernyő Mátrix</span>
          </button>
        </div>
      </div>

      {/* Screen RAM 40x25 Character Matrix Live Preview (Collapsible) */}
      {showScreenRamMatrix && (
        <div className="bg-[#050811] border border-emerald-500/40 rounded-xl p-3 shadow-inner flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              {language === 'hu' ? 'VIC-II Képernyő RAM Mátrix ($0400-$07E7)' : 'Screen RAM Matrix ($0400-$07E7)'}
            </span>
            <span className="text-[10px] text-slate-400">
              40 oszlop × 25 sor (1000 karakter)
            </span>
          </div>

          <div className="bg-[#0000AA] border-2 border-[#0088FF] rounded-lg p-2 overflow-x-auto text-[#0088FF] font-mono text-[9px] leading-tight select-none">
            {Array.from({ length: 25 }).map((_, row) => (
              <div key={row} className="flex whitespace-nowrap">
                <span className="text-[#AAFFEE]/40 w-8 inline-block select-none">
                  {row.toString().padStart(2, '0')}:
                </span>
                {Array.from({ length: 40 }).map((_, col) => {
                  const cellAddr = 0x0400 + row * 40 + col;
                  const screenCode = c64State.memory[cellAddr] || 0;
                  const colorIdx = c64State.memory[0xd800 + row * 40 + col] || 14;
                  const colorHex = C64_PALETTE[colorIdx & 0x0f]?.hex || '#0088FF';
                  const char = petsciiScreenCodeToChar(screenCode);
                  const isSelected = selectedAddr === cellAddr;

                  return (
                    <span
                      key={col}
                      onClick={() => setSelectedAddr(cellAddr)}
                      style={{ color: colorHex }}
                      className={`inline-block w-3 text-center cursor-pointer hover:bg-white hover:text-black rounded-xs ${
                        isSelected ? 'bg-white text-black font-black ring-1 ring-yellow-400' : ''
                      }`}
                      title={`$${toHex16(cellAddr)} (Row ${row}, Col ${col}): ${screenCode} ('${char}')`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Hex & ASCII Table Grid */}
      <div className="bg-[#080B12] border border-slate-800/90 rounded-xl p-3 overflow-x-auto text-[11px] leading-relaxed shadow-inner">
        {/* Table Column Headers */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-1.5 text-slate-500 font-bold select-none text-[10px]">
          <span className="w-16">CÍM (ADDR)</span>
          <div className="grid grid-cols-16 gap-1.5 text-center flex-1 max-w-[420px]">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={selectedAddr % 16 === i ? 'text-emerald-400 font-black' : ''}
              >
                +{toHex8(i).toUpperCase()}
              </span>
            ))}
          </div>
          <span className="w-28 pl-2 border-l border-slate-800 text-center">ASCII / PETSCII</span>
        </div>

        {/* Rows */}
        <div className="space-y-1 pt-1.5">
          {rows.map((row) => {
            const isRowSelected = selectedAddr >= row.addr && selectedAddr < row.addr + 16;

            return (
              <div
                key={row.addr}
                className={`flex items-center gap-3 px-1 py-0.5 rounded transition-colors ${
                  isRowSelected ? 'bg-slate-800/40' : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Row Address Label */}
                <span
                  onClick={() => jumpToAddress(row.addr)}
                  className="w-16 text-cyan-400 font-bold select-none cursor-pointer hover:text-cyan-300"
                >
                  ${toHex16(row.addr)}:
                </span>

                {/* 16 Hex Cells */}
                <div className="grid grid-cols-16 gap-1.5 text-center flex-1 max-w-[420px]">
                  {row.bytes.map((byte, idx) => {
                    const cellAddr = row.addr + idx;
                    const isSelected = selectedAddr === cellAddr;
                    const isEditing = editingAddr === cellAddr && editMode === 'hex';
                    const isChanged = changedBytes.has(cellAddr);
                    const isSearchResult = searchResults.includes(cellAddr);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedAddr(cellAddr)}
                        onDoubleClick={() => startEditingCell(cellAddr, 'hex')}
                        className={`relative px-0.5 py-0.2 rounded transition-all cursor-pointer select-none font-mono ${
                          isSelected
                            ? 'bg-emerald-500 text-black font-black ring-2 ring-emerald-300 shadow-md scale-105 z-10'
                            : isChanged
                            ? 'bg-amber-500 text-black font-bold animate-pulse shadow-sm shadow-amber-500'
                            : isSearchResult
                            ? 'bg-cyan-500/40 text-cyan-200 font-bold ring-1 ring-cyan-400'
                            : byte === 0
                            ? 'text-slate-600 hover:text-slate-400'
                            : 'text-emerald-300 hover:bg-slate-800 font-semibold'
                        }`}
                        title={`$${toHex16(cellAddr)}: ${byte} ($${toHex8(byte)}) - Dupla kattintás a szerkesztéshez`}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            maxLength={2}
                            value={editHexBuffer}
                            onChange={(e) => setEditHexBuffer(e.target.value.toUpperCase())}
                            onBlur={() => commitHexEdit(cellAddr, editHexBuffer)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitHexEdit(cellAddr, editHexBuffer);
                              if (e.key === 'Escape') setEditingAddr(null);
                            }}
                            className="w-5 bg-black text-emerald-300 text-center font-bold outline-none rounded"
                          />
                        ) : (
                          toHex8(byte)
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ASCII Character Representation */}
                <div className="w-28 pl-2 border-l border-slate-800 flex items-center gap-0.5 text-slate-400 select-none">
                  {row.bytes.map((byte, idx) => {
                    const cellAddr = row.addr + idx;
                    const isSelected = selectedAddr === cellAddr;
                    const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';

                    return (
                      <span
                        key={idx}
                        onClick={() => setSelectedAddr(cellAddr)}
                        onDoubleClick={() => startEditingCell(cellAddr, 'ascii')}
                        className={`cursor-pointer hover:text-white rounded-xs ${
                          isSelected ? 'text-emerald-300 font-black bg-emerald-950 px-0.5' : ''
                        }`}
                        title={`$${toHex16(cellAddr)}: '${char}' (PETSCII: '${petsciiScreenCodeToChar(byte)}')`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Byte Inspector & Real-time Hardware Meaning Panel */}
      <div className="bg-[#090C14] border border-cyan-900/50 rounded-xl p-3.5 shadow-lg flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          {/* Selected Address and Values */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/50 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">Cím:</span>
              <span className="text-emerald-300 font-bold font-mono">
                ${toHex16(selectedAddr)}
              </span>
              <span className="text-slate-500">({selectedAddr})</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141A28] border border-slate-700 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">Hex:</span>
              <span className="text-cyan-300 font-bold font-mono">
                ${toHex8(selectedByteVal)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141A28] border border-slate-700 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">Dec:</span>
              <span className="text-purple-300 font-bold font-mono">
                {selectedByteVal}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141A28] border border-slate-700 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">Bináris:</span>
              <span className="text-amber-300 font-bold font-mono">
                %{toBin8(selectedByteVal)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141A28] border border-slate-700 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">PETSCII:</span>
              <span className="text-white font-bold bg-[#0000AA] px-1.5 py-0.5 rounded text-xs">
                '{petsciiScreenCodeToChar(selectedByteVal)}'
              </span>
            </div>
          </div>

          {/* Quick Edit Buttons (+1, -1, Zero, Invert, Toggle Bit) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateMemoryByte(selectedAddr, (selectedByteVal + 1) & 0xff)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
              title="+1 Increment"
            >
              +1
            </button>
            <button
              onClick={() => onUpdateMemoryByte(selectedAddr, (selectedByteVal - 1 + 256) & 0xff)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
              title="-1 Decrement"
            >
              -1
            </button>
            <button
              onClick={() => onUpdateMemoryByte(selectedAddr, 0)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
              title="Set to 0"
            >
              $00
            </button>
            <button
              onClick={() => onUpdateMemoryByte(selectedAddr, (~selectedByteVal) & 0xff)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
              title="Invert bits"
            >
              INV
            </button>
            <button
              onClick={() => {
                if (!watchAddresses.includes(selectedAddr)) {
                  setWatchAddresses([...watchAddresses, selectedAddr]);
                }
              }}
              className="px-2 py-0.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-xs font-bold border border-purple-700 cursor-pointer flex items-center gap-1"
              title="Pin to Watchpoints"
            >
              <Pin className="w-3 h-3" />
              <span>Megfigyelés</span>
            </button>
          </div>
        </div>

        {/* 8-Bit Interactive Bit Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Bitek (7..0):</span>
          <div className="flex items-center gap-1">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
              const isSet = (selectedByteVal & (1 << bitIdx)) !== 0;
              return (
                <button
                  key={bitIdx}
                  onClick={() => {
                    const nextVal = selectedByteVal ^ (1 << bitIdx);
                    onUpdateMemoryByte(selectedAddr, nextVal);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold border transition-colors cursor-pointer ${
                    isSet
                      ? 'bg-amber-500 border-amber-400 text-black shadow-sm shadow-amber-500/40'
                      : 'bg-[#141A28] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Bit ${bitIdx}: ${isSet ? '1' : '0'} (Érték: ${1 << bitIdx})`}
                >
                  {isSet ? '1' : '0'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Hardware Annotation & Description */}
        <div className="bg-[#121826] border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentRegion?.color || '#06b6d4' }}
            />
            <span className="font-bold text-slate-200">
              {language === 'hu'
                ? currentRegion?.nameHu || 'C64 Memória'
                : currentRegion?.name || 'C64 Memory'}
            </span>
            {knownRegister && (
              <span className="text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-[11px]">
                {language === 'hu' ? knownRegister.nameHu : knownRegister.name}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {knownRegister
              ? language === 'hu'
                ? knownRegister.descHu
                : knownRegister.desc
              : language === 'hu'
              ? currentRegion?.descriptionHu || 'Szabványos C64 memória bájt.'
              : currentRegion?.description || 'Standard C64 memory byte.'}
          </p>
        </div>
      </div>

      {/* Live Memory Watchpoints (Pinned PEEK monitors) */}
      <div className="bg-[#090C14] border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-purple-300 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-purple-400" />
            {language === 'hu' ? 'Valós Idejű Memória Figyelők (Watchpoints)' : 'Live Memory Watchpoints'}
          </span>

          <form onSubmit={handleAddWatchpoint} className="flex items-center gap-1">
            <span className="text-slate-400 text-xs">$</span>
            <input
              type="text"
              value={newWatchInput}
              onChange={(e) => setNewWatchInput(e.target.value.toUpperCase())}
              placeholder="D020"
              className="w-14 bg-[#141A28] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-purple-300 text-center outline-none focus:border-purple-500 uppercase"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-500/40 rounded text-xs cursor-pointer"
            >
              +
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {watchAddresses.map((addr) => {
            const val = c64State.memory[addr] || 0;
            const reg = C64_KNOWN_REGISTERS[addr];
            const isChanged = changedBytes.has(addr);

            return (
              <div
                key={addr}
                onClick={() => setSelectedAddr(addr)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedAddr === addr
                    ? 'bg-purple-950/70 border-purple-400'
                    : isChanged
                    ? 'bg-amber-950/60 border-amber-500 animate-pulse'
                    : 'bg-[#121826] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold font-mono">
                    ${toHex16(addr)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWatchpoint(addr);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-0.5 text-[10px]"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    PEEK: <b className="text-slate-100">{val}</b> (${toHex8(val)})
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    %{toBin8(val).slice(4)}
                  </span>
                </div>

                {reg && (
                  <span className="text-[9px] text-slate-400 truncate" title={reg.name}>
                    {reg.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Fill Modal */}
      {showFillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121826] border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-amber-400" />
                {language === 'hu' ? 'Memória Tartomány Kitöltése' : 'Fill Memory Range'}
              </h4>
              <button
                onClick={() => setShowFillModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleExecuteFill} className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Kezdő Cím ($Start):</span>
                <input
                  type="text"
                  value={fillStart}
                  onChange={(e) => setFillStart(e.target.value.toUpperCase())}
                  className="bg-[#1A2338] border border-slate-700 rounded-lg px-2.5 py-1 text-emerald-300 font-bold outline-none uppercase w-28 text-center"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Záró Cím ($End):</span>
                <input
                  type="text"
                  value={fillEnd}
                  onChange={(e) => setFillEnd(e.target.value.toUpperCase())}
                  className="bg-[#1A2338] border border-slate-700 rounded-lg px-2.5 py-1 text-emerald-300 font-bold outline-none uppercase w-28 text-center"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Kitöltési Érték ($Hex):</span>
                <input
                  type="text"
                  value={fillVal}
                  onChange={(e) => setFillVal(e.target.value.toUpperCase())}
                  className="bg-[#1A2338] border border-slate-700 rounded-lg px-2.5 py-1 text-amber-300 font-bold outline-none uppercase w-28 text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFillModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Kitöltés Végrehajtása
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DATA Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121826] border border-purple-500/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                {language === 'hu' ? 'BASIC DATA Sorok Generálása' : 'Generate BASIC DATA Lines'}
              </h4>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Kezdőcím:</span>
                <input
                  type="text"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value.toUpperCase())}
                  className="w-20 bg-[#1A2338] border border-slate-700 rounded px-2 py-1 text-purple-300 text-center font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Bájtok száma:</span>
                <input
                  type="number"
                  value={exportLength}
                  onChange={(e) => setExportLength(e.target.value)}
                  className="w-16 bg-[#1A2338] border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                />
              </div>
            </div>

            <pre className="bg-[#0A0D14] border border-slate-800 rounded-xl p-3 text-[11px] text-purple-200 overflow-y-auto max-h-48 select-all">
              {generatedDataCode}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                Beilleszthető a BASIC programba (pl. POKE ciklushoz).
              </span>
              <button
                onClick={handleCopyDataCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Másolva!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Másolás Vágólapra</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
