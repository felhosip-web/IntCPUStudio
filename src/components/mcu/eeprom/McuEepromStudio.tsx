import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { EepromPreset, EepromTabMode, EepromWriteSequenceState } from '../../../types/mcuEeprom';
import { EEPROM_PRESETS } from '../../../core/mcuEepromData';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  Flame,
  Gauge,
  HelpCircle,
  History,
  Layers,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react';

interface McuEepromStudioProps {
  eeprom: Uint8Array; // 1024 bytes from MCU state
  onUpdateEepromByte: (address: number, value: number) => void;
  onBulkUpdateEeprom?: (updates: { address: number; value: number }[]) => void;
  onClearEeprom?: () => void;
  onFlashCodeToMcu?: (code: string) => void;
  onOpenBreadboardTab?: () => void;
}

export const McuEepromStudio: React.FC<McuEepromStudioProps> = ({
  eeprom,
  onUpdateEepromByte,
  onBulkUpdateEeprom,
  onClearEeprom,
  onFlashCodeToMcu,
  onOpenBreadboardTab,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<EepromTabMode>('MEMORY_GRID');
  
  // Navigation & selection state
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIdx, setCurrentSearchIdx] = useState<number>(0);
  const [pageSize] = useState<number>(16); // 16 bytes per row
  const [startRow, setStartRow] = useState<number>(0); // 0..63 (64 rows of 16 bytes = 1024 bytes)

  // Direct editing state
  const [editingByteStr, setEditingByteStr] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<{ address: number; oldVal: number; newVal: number }[]>([]);
  const [redoStack, setRedoStack] = useState<{ address: number; oldVal: number; newVal: number }[]>([]);

  // Wear Leveling & Heatmap tracking (1024 cells write counts)
  const [writeCounts, setWriteCounts] = useState<Uint32Array>(() => new Uint32Array(1024));
  const [wearSimulationSpeed, setWearSimulationSpeed] = useState<number>(50);
  const [isWearSimRunning, setIsWearSimRunning] = useState<boolean>(false);
  const [wearMode, setWearMode] = useState<'NAIVE' | 'CIRCULAR_WEAR_LEVELING'>('NAIVE');
  const [ringPointer, setRingPointer] = useState<number>(0);
  const [totalSimulatedWrites, setTotalSimulatedWrites] = useState<number>(0);

  // Hardware 4-Clock Write Sequence Step-Through State
  const [writeSequence, setWriteSequence] = useState<EepromWriteSequenceState>({
    step: 'IDLE',
    stepIndex: 0,
    clockCyclesRemaining: 4,
    progressPercent: 0,
    targetAddress: 0x0010,
    targetData: 0x5a,
    isWriting: false,
    statusMessage: 'Ready for EEPROM read or write operation.',
    statusMessageHu: 'Készen áll az EEPROM olvasási vagy írási műveletre.',
  });

  // Selected Preset
  const [selectedPreset, setSelectedPreset] = useState<EepromPreset>(EEPROM_PRESETS[0]);
  const [crcStatus, setCrcStatus] = useState<{ computed: number; stored: number; isValid: boolean } | null>(null);
  const [copiedCodeType, setCopiedCodeType] = useState<'ARDUINO' | 'AVR' | null>(null);

  // Current selected byte value
  const currentByte = eeprom[selectedAddress] !== undefined ? eeprom[selectedAddress] : 0;

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const clean = searchQuery.trim().toLowerCase();
    const results: number[] = [];

    // Check if query is hex (e.g. "AA", "0x55")
    const isHex = /^0x?[0-9a-f]{1,2}$/i.test(clean);
    const hexVal = isHex ? parseInt(clean.replace('0x', ''), 16) : -1;

    for (let i = 0; i < 1024; i++) {
      const b = eeprom[i];
      if (isHex && b === hexVal) {
        results.push(i);
      } else {
        const char = String.fromCharCode(b).toLowerCase();
        if (char === clean) {
          results.push(i);
        }
      }
    }
    setSearchResults(results);
    setCurrentSearchIdx(0);
    if (results.length > 0) {
      setSelectedAddress(results[0]);
      setStartRow(Math.floor(results[0] / 16));
    }
  }, [searchQuery, eeprom]);

  // Navigate search matches
  const handleNextSearch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIdx + 1) % searchResults.length;
    setCurrentSearchIdx(nextIdx);
    const addr = searchResults[nextIdx];
    setSelectedAddress(addr);
    setStartRow(Math.floor(addr / 16));
  };

  // Modify Byte with History & Wear Tracking
  const setByteValue = (address: number, newValue: number) => {
    if (address < 0 || address >= 1024) return;
    const clamped = Math.max(0, Math.min(255, newValue));
    const oldVal = eeprom[address];
    if (oldVal === clamped) return; // EEPROM.update behavior: no write wear if unchanged!

    onUpdateEepromByte(address, clamped);

    // Track write count
    setWriteCounts((prev) => {
      const next = new Uint32Array(prev);
      next[address] += 1;
      return next;
    });

    // Push to history
    setHistory((prev) => [...prev.slice(-49), { address, oldVal, newVal: clamped }]);
    setRedoStack([]);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
    onUpdateEepromByte(last.address, last.oldVal);
    setSelectedAddress(last.address);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, next]);
    onUpdateEepromByte(next.address, next.newVal);
    setSelectedAddress(next.address);
  };

  // Wear simulation interval
  useEffect(() => {
    if (!isWearSimRunning) return;
    const interval = setInterval(() => {
      if (wearMode === 'NAIVE') {
        // Naive writing always strikes address 0 (or 0x0010)
        setByteValue(0x0000, Math.floor(Math.random() * 256));
        setTotalSimulatedWrites((prev) => prev + 1);
      } else {
        // Circular ring buffer with wear leveling
        const nextPtr = (ringPointer + 1) % 64; // 64 slots
        setRingPointer(nextPtr);
        setByteValue(0x0040 + nextPtr, Math.floor(Math.random() * 256));
        setTotalSimulatedWrites((prev) => prev + 1);
      }
    }, Math.max(10, 200 - wearSimulationSpeed * 2));

    return () => clearInterval(interval);
  }, [isWearSimRunning, wearMode, ringPointer, wearSimulationSpeed]);

  // Execute Step in 4-Clock Hardware Sequence
  const handleHardwareStep = () => {
    setWriteSequence((prev) => {
      switch (prev.step) {
        case 'IDLE':
          return {
            ...prev,
            step: 'WAIT_READY',
            stepIndex: 1,
            progressPercent: 20,
            statusMessage: 'Step 1: Polling EECR.EEPE bit. Waiting until previous write finishes (EEPE == 0).',
            statusMessageHu: '1. Lépés: EECR.EEPE bit lekérdezése. Várakozás az előző írás befejezésére (EEPE == 0).',
          };
        case 'WAIT_READY':
          return {
            ...prev,
            step: 'LOAD_REGISTERS',
            stepIndex: 2,
            progressPercent: 40,
            statusMessage: `Step 2: Loading EEAR = 0x${prev.targetAddress.toString(16).toUpperCase().padStart(4, '0')} and EEDR = 0x${prev.targetData.toString(16).toUpperCase().padStart(2, '0')}.`,
            statusMessageHu: `2. Lépés: Regiszterek feltöltése: EEAR = 0x${prev.targetAddress.toString(16).toUpperCase().padStart(4, '0')}, EEDR = 0x${prev.targetData.toString(16).toUpperCase().padStart(2, '0')}.`,
          };
        case 'LOAD_REGISTERS':
          return {
            ...prev,
            step: 'ENABLE_MASTER',
            stepIndex: 3,
            clockCyclesRemaining: 4,
            progressPercent: 60,
            statusMessage: 'Step 3: SBI EECR, EEMPE. Master Write Enable latch activated! 4 CPU clock countdown started.',
            statusMessageHu: '3. Lépés: SBI EECR, EEMPE. Fő írásengedélyező retesz aktiválva! 4 órajelnyi hardveres visszaszámlálás indult.',
          };
        case 'ENABLE_MASTER':
          return {
            ...prev,
            step: 'STROBE_WRITE',
            stepIndex: 4,
            clockCyclesRemaining: 3,
            progressPercent: 80,
            statusMessage: 'Step 4: SBI EECR, EEPE within 4 clocks! Hardware write strobe latched. Internal Charge Pump starting.',
            statusMessageHu: '4. Lépés: SBI EECR, EEPE a 4 órajelen belül! Belső feszültségnövelő (Charge Pump) elindult.',
          };
        case 'STROBE_WRITE':
          // Apply byte change to actual EEPROM
          setByteValue(prev.targetAddress, prev.targetData);
          return {
            ...prev,
            step: 'TUNNELING_PROGRAM',
            stepIndex: 5,
            progressPercent: 95,
            statusMessage: 'Step 5: ~12V Charge pump injecting electrons through SiO2 floating gate. Simulated 3.4ms write pulse.',
            statusMessageHu: '5. Lépés: ~12V feszültségpumpa elektronokat injektál a lebegőkapuba (Fowler-Nordheim alagút-effektus, ~3.4 ms).',
          };
        case 'TUNNELING_PROGRAM':
        case 'COMPLETE':
        default:
          return {
            ...prev,
            step: 'IDLE',
            stepIndex: 0,
            progressPercent: 100,
            statusMessage: `Write sequence complete! Byte 0x${prev.targetData.toString(16).toUpperCase()} permanently stored in EEPROM address 0x${prev.targetAddress.toString(16).toUpperCase()}.`,
            statusMessageHu: `Írási folyamat kész! A 0x${prev.targetData.toString(16).toUpperCase()} bájt tartósan elmentve a 0x${prev.targetAddress.toString(16).toUpperCase()} címen.`,
          };
      }
    });
  };

  // Reset Sequence
  const handleResetSequence = () => {
    setWriteSequence({
      step: 'IDLE',
      stepIndex: 0,
      clockCyclesRemaining: 4,
      progressPercent: 0,
      targetAddress: selectedAddress,
      targetData: currentByte,
      isWriting: false,
      statusMessage: 'Ready for EEPROM read or write operation.',
      statusMessageHu: 'Készen áll az EEPROM olvasási vagy írási műveletre.',
    });
  };

  // Load Preset
  const handleLoadPreset = (preset: EepromPreset) => {
    setSelectedPreset(preset);
    if (onBulkUpdateEeprom) {
      onBulkUpdateEeprom(preset.data.map((d) => ({ address: d.address, value: d.value })));
    } else {
      preset.data.forEach((d) => onUpdateEepromByte(d.address, d.value));
    }
    if (preset.data.length > 0) {
      setSelectedAddress(preset.data[0].address);
      setStartRow(Math.floor(preset.data[0].address / 16));
    }
  };

  // Checksum calculation (CRC-8 Dallas/Maxim)
  const calculateCrc8 = (data: Uint8Array, length: number): number => {
    let crc = 0x00;
    for (let i = 0; i < length; i++) {
      let extract = data[i];
      for (let tempI = 8; tempI > 0; tempI--) {
        const sum = (crc ^ extract) & 0x01;
        crc >>= 1;
        if (sum) {
          crc ^= 0x8c;
        }
        extract >>= 1;
      }
    }
    return crc;
  };

  // Wear stats calculation
  const wearStats = useMemo(() => {
    let maxWrites = 0;
    let hottestAddr = 0;
    let total = 0;
    let deadCells = 0;

    for (let i = 0; i < 1024; i++) {
      const c = writeCounts[i];
      total += c;
      if (c > maxWrites) {
        maxWrites = c;
        hottestAddr = i;
      }
      if (c >= 100000) {
        deadCells += 1;
      }
    }

    return {
      totalWrites: total,
      maxWritesOnSingleCell: maxWrites,
      hottestAddress: hottestAddr,
      deadCellsCount: deadCells,
      wearLevelEfficiency: maxWrites > 0 ? Math.round((total / (maxWrites * 1024)) * 100) : 100,
    };
  }, [writeCounts]);

  // Export to Intel HEX / C Array / Binary
  const handleExport = (format: 'c_array' | 'intel_hex' | 'json' | 'raw_dump') => {
    let content = '';
    let filename = `eeprom_dump_${Date.now()}`;

    if (format === 'c_array') {
      filename += '.h';
      content = `// ATmega328P EEPROM Dump (1024 Bytes)\n#include <stdint.h>\n\nconst uint8_t PROGMEM eeprom_default_image[1024] = {\n  ` +
        Array.from(eeprom)
          .map((b: number, i: number) => `0x${Number(b).toString(16).toUpperCase().padStart(2, '0')}${i < 1023 ? ',' : ''}${i % 16 === 15 ? '\n  ' : ' '}`)
          .join('') +
        `\n};\n`;
    } else if (format === 'intel_hex') {
      filename += '.hex';
      // Generate standard Intel HEX records for 1024 bytes (64 records of 16 bytes)
      for (let r = 0; r < 64; r++) {
        const addr = r * 16;
        const row: number[] = Array.from(eeprom.slice(addr, addr + 16));
        const byteCount = 0x10;
        const recordType = 0x00;
        let sum = byteCount + ((addr >> 8) & 0xff) + (addr & 0xff) + recordType;
        const dataHex = row.map((b: number) => {
          sum += Number(b);
          return Number(b).toString(16).toUpperCase().padStart(2, '0');
        }).join('');
        const checksum = ((~sum + 1) & 0xff).toString(16).toUpperCase().padStart(2, '0');
        content += `:${byteCount.toString(16).toUpperCase().padStart(2, '0')}${addr.toString(16).toUpperCase().padStart(4, '0')}${recordType.toString(16).toUpperCase().padStart(2, '0')}${dataHex}${checksum}\n`;
      }
      content += ':00000001FF\n'; // End of File Record
    } else if (format === 'json') {
      filename += '.json';
      content = JSON.stringify({
        device: 'ATmega328P',
        eepromSize: 1024,
        timestamp: new Date().toISOString(),
        bytes: Array.from(eeprom),
      }, null, 2);
    } else {
      filename += '.txt';
      for (let r = 0; r < 64; r++) {
        const addr = r * 16;
        const row: number[] = Array.from(eeprom.slice(addr, addr + 16));
        const hexStr = row.map((b: number) => Number(b).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        const asciiStr = row.map((b: number) => (b >= 32 && b <= 126 ? String.fromCharCode(Number(b)) : '·')).join('');
        content += `${addr.toString(16).toUpperCase().padStart(4, '0')}:  ${hexStr}  |${asciiStr}|\n`;
      }
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Studio Header Card */}
      <div className="bg-gradient-to-r from-[#0B0F17] via-[#0E1524] to-[#0B0F17] border border-cyan-900/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Database className="w-7 h-7 animate-pulse text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-mono text-white tracking-wide">
                EEPROM Stúdió & Tartós Memória Elemző
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold">
                1024 B (1 KB) • 100k Ciklus
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-xs font-mono">
                ATmega328P Non-Volatile
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {language === 'hu'
                ? 'Tartós bájttárolás, 4-órajelnyi hardveres biztonsági retesz, kopáskiegyenlítés (Wear-Leveling) & valós idejű szerkesztő'
                : 'Non-volatile byte storage, 4-clock hardware write safety latch, wear-leveling simulation & live editor'}
            </p>
          </div>
        </div>

        {/* Quick Stats & Undo Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Visszavonás (Undo)"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hu' ? 'Vissza' : 'Undo'}</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Újra (Redo)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hu' ? 'Újra' : 'Redo'}</span>
          </button>
          {onClearEeprom && (
            <button
              onClick={onClearEeprom}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="EEPROM Törlése ($FF-re állítás)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? 'Törlés ($FF)' : 'Erase ($FF)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0F17] border border-slate-800 rounded-2xl p-1.5 shadow-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Tab 1: Memory Grid & Hex Inspector */}
          <button
            onClick={() => setActiveTab('MEMORY_GRID')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'MEMORY_GRID'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-300" />
            <span>{language === 'hu' ? '1. Memória Mátrix (1024B Hex)' : '1. Memory Matrix (1024B Hex)'}</span>
          </button>

          {/* Tab 2: 4-Clock Hardware Sequence */}
          <button
            onClick={() => setActiveTab('HARDWARE_SEQUENCE')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'HARDWARE_SEQUENCE'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{language === 'hu' ? '2. 4-Órajel Hardveres Írás (EEMPE)' : '2. 4-Clock Hardware Latch (EEMPE)'}</span>
          </button>

          {/* Tab 3: Wear Leveling & Heatmap */}
          <button
            onClick={() => setActiveTab('WEAR_LEVELING')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'WEAR_LEVELING'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-300" />
            <span>{language === 'hu' ? '3. Kopáskiegyenlítés (Wear-Leveling)' : '3. Wear-Leveling & Heatmap'}</span>
          </button>

          {/* Tab 4: Presets & CRC Checksum */}
          <button
            onClick={() => setActiveTab('PRESETS_CRC')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'PRESETS_CRC'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>{language === 'hu' ? '4. Gyári Minták & CRC-8' : '4. Presets & CRC-8'}</span>
          </button>

          {/* Tab 5: Code Generator & Flasher */}
          <button
            onClick={() => setActiveTab('CODE_GENERATOR')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'CODE_GENERATOR'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-300" />
            <span>{language === 'hu' ? '5. C++ & ASM Kódgenerátor' : '5. C++ & ASM Generator'}</span>
          </button>
        </div>

        {/* Export Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 hidden md:inline">Export:</span>
          <button
            onClick={() => handleExport('intel_hex')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-mono border border-slate-800 transition-colors"
            title="Intel HEX formátum"
          >
            .HEX
          </button>
          <button
            onClick={() => handleExport('c_array')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-mono border border-slate-800 transition-colors"
            title="C Forráskód tömb"
          >
            .H (C)
          </button>
          <button
            onClick={() => handleExport('raw_dump')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-mono border border-slate-800 transition-colors"
            title="Szöveges dump"
          >
            .TXT
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'MEMORY_GRID' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 1024-Byte Hex Matrix (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            {/* Search & Address Range Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'hu' ? 'Keresés (Hex: 0xAA vagy Szöveg)...' : 'Search (Hex: 0xAA or Text)...'}
                    className="pl-8 pr-3 py-1.5 bg-[#05070A] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 w-56"
                  />
                </div>
                {searchResults.length > 0 && (
                  <button
                    onClick={handleNextSearch}
                    className="px-2.5 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentSearchIdx + 1}/{searchResults.length}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Row page navigator */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500">Címtartomány:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                  $0000 - $03FF (1024 Bájt)
                </span>
              </div>
            </div>

            {/* Hex Dump Table with synchronized ASCII view */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="sticky top-0 bg-[#0B0F17] z-10 text-slate-500 border-b border-slate-800 select-none text-[11px]">
                  <tr>
                    <th className="py-1 px-2 text-cyan-400 font-bold">Offset</th>
                    {Array.from({ length: 16 }, (_, i) => (
                      <th key={i} className="py-1 px-1.5 text-center font-bold text-slate-400">
                        +{i.toString(16).toUpperCase()}
                      </th>
                    ))}
                    <th className="py-1 px-3 text-emerald-400 font-bold">ASCII (Karakterek)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {Array.from({ length: 64 }, (_, rowIdx) => {
                    const rowBase = rowIdx * 16;
                    return (
                      <tr key={rowIdx} className="hover:bg-slate-900/40 transition-colors">
                        {/* Offset Address column */}
                        <td className="py-1 px-2 text-cyan-400/80 font-bold select-none whitespace-nowrap bg-slate-950/30">
                          ${rowBase.toString(16).toUpperCase().padStart(4, '0')}
                        </td>

                        {/* 16 Hex Byte Cells */}
                        {Array.from({ length: 16 }, (_, colIdx) => {
                          const addr = rowBase + colIdx;
                          const val = eeprom[addr] || 0;
                          const isSelected = addr === selectedAddress;
                          const isSearched = searchResults.includes(addr);
                          const writeCount = writeCounts[addr] || 0;

                          return (
                            <td
                              key={colIdx}
                              onClick={() => {
                                setSelectedAddress(addr);
                                setEditingByteStr(val.toString(16).toUpperCase().padStart(2, '0'));
                              }}
                              onDoubleClick={() => {
                                setSelectedAddress(addr);
                                setIsEditing(true);
                                setEditingByteStr(val.toString(16).toUpperCase().padStart(2, '0'));
                              }}
                              className={`py-1 px-1.5 text-center cursor-pointer select-none transition-all rounded ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md scale-105 ring-2 ring-cyan-300'
                                  : isSearched
                                  ? 'bg-amber-500/30 text-amber-200 font-bold'
                                  : writeCount > 10
                                  ? 'text-emerald-300 hover:bg-slate-800 font-medium'
                                  : val === 0xff
                                  ? 'text-slate-600 hover:bg-slate-800'
                                  : val === 0x00
                                  ? 'text-slate-500 hover:bg-slate-800'
                                  : 'text-slate-200 hover:bg-slate-800 font-medium'
                              }`}
                              title={`Cím: $${addr.toString(16).toUpperCase().padStart(4, '0')} (${addr})\nÉrték: 0x${val.toString(16).toUpperCase().padStart(2, '0')} (${val})\nÍrási ciklusok: ${writeCount}`}
                            >
                              {val.toString(16).toUpperCase().padStart(2, '0')}
                            </td>
                          );
                        })}

                        {/* ASCII Representation */}
                        <td className="py-1 px-3 text-slate-400 select-none whitespace-nowrap tracking-wider text-[11px] bg-slate-950/20">
                          {Array.from({ length: 16 }, (_, colIdx) => {
                            const addr = rowBase + colIdx;
                            const val = eeprom[addr] || 0;
                            const isSelected = addr === selectedAddress;
                            const char = val >= 32 && val <= 126 ? String.fromCharCode(val) : '·';
                            return (
                              <span
                                key={colIdx}
                                onClick={() => setSelectedAddress(addr)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-cyan-400 text-slate-950 font-bold px-0.5 rounded'
                                    : val >= 32 && val <= 126
                                    ? 'text-emerald-300 hover:text-white'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                              >
                                {char}
                              </span>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Byte Inspector, Bitmask Toggles & Register Mapping (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Selected Byte Detail Card */}
            <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold font-mono text-white">
                    Bájtszerkesztő & Dekóder
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800">
                  Addr: ${selectedAddress.toString(16).toUpperCase().padStart(4, '0')} ({selectedAddress})
                </span>
              </div>

              {/* Direct Hex/Dec/Char Input */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#05070A] p-2 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">HEX (00..FF)</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={isEditing ? editingByteStr : currentByte.toString(16).toUpperCase().padStart(2, '0')}
                    onFocus={() => setIsEditing(true)}
                    onChange={(e) => {
                      setEditingByteStr(e.target.value);
                      const parsed = parseInt(e.target.value, 16);
                      if (!isNaN(parsed)) {
                        setByteValue(selectedAddress, parsed);
                      }
                    }}
                    onBlur={() => setIsEditing(false)}
                    className="bg-transparent text-cyan-300 font-mono text-sm font-bold focus:outline-none"
                  />
                </div>

                <div className="bg-[#05070A] p-2 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">DEC (0..255)</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={currentByte}
                    onChange={(e) => setByteValue(selectedAddress, parseInt(e.target.value, 10) || 0)}
                    className="bg-transparent text-emerald-300 font-mono text-sm font-bold focus:outline-none"
                  />
                </div>

                <div className="bg-[#05070A] p-2 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">ASCII CHAR</span>
                  <input
                    type="text"
                    maxLength={1}
                    value={currentByte >= 32 && currentByte <= 126 ? String.fromCharCode(currentByte) : '·'}
                    onChange={(e) => {
                      if (e.target.value.length > 0) {
                        setByteValue(selectedAddress, e.target.value.charCodeAt(0));
                      }
                    }}
                    className="bg-transparent text-amber-300 font-mono text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* 8-Bit Interactive Bitmask Switcher */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[11px] font-mono text-slate-400 font-semibold flex items-center justify-between">
                  <span>8-Bites Bitmaszk (b7 .. b0):</span>
                  <span className="text-cyan-400 font-mono">
                    0b{currentByte.toString(2).padStart(8, '0')}
                  </span>
                </span>
                <div className="grid grid-cols-8 gap-1 font-mono text-center">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitIndex = 7 - i;
                    const isBitSet = (currentByte & (1 << bitIndex)) !== 0;
                    return (
                      <button
                        key={bitIndex}
                        onClick={() => {
                          const newByte = currentByte ^ (1 << bitIndex);
                          setByteValue(selectedAddress, newByte);
                        }}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isBitSet
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-900/40'
                            : 'bg-slate-900/50 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                        title={`Bit ${bitIndex} váltása (1 << ${bitIndex})`}
                      >
                        <span className="text-[9px] block text-slate-500">b{bitIndex}</span>
                        <span>{isBitSet ? '1' : '0'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-byte Interpretation */}
              <div className="bg-[#05070A] rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2 font-mono text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Több-bájtos Típusértelmezés (Címtől indulva):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Uint16 (Little-Endian):</span>
                    <span className="text-white font-bold">
                      {currentByte | ((eeprom[(selectedAddress + 1) % 1024] || 0) << 8)} ($
                      {(currentByte | ((eeprom[(selectedAddress + 1) % 1024] || 0) << 8)).toString(16).toUpperCase().padStart(4, '0')})
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Int8 (Előjeles):</span>
                    <span className="text-amber-300 font-bold">
                      {currentByte > 127 ? currentByte - 256 : currentByte}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Írási Ciklusok:</span>
                    <span className="text-emerald-300 font-bold">
                      {writeCounts[selectedAddress] || 0} / 100,000
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Cella Állapot:</span>
                    <span className="text-cyan-300 font-bold">
                      {(writeCounts[selectedAddress] || 0) >= 100000 ? '⚠️ Elhasználódott' : '✅ Egészséges (100%)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Microcontroller Hardware Register Mapping Panel */}
            <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  ATmega328P EEPROM I/O Regiszterek
                </h3>
              </div>

              <div className="space-y-2 text-[11px]">
                {/* EEARH:EEARL */}
                <div className="p-2 rounded-xl bg-[#05070A] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-cyan-400 font-bold">EEAR (10-Bit Címregiszter):</span>
                    <p className="text-[10px] text-slate-500">EEARH:EEARL ($000..$3FF tartomány)</p>
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 font-bold rounded border border-cyan-800">
                    ${selectedAddress.toString(16).toUpperCase().padStart(4, '0')}
                  </span>
                </div>

                {/* EEDR */}
                <div className="p-2 rounded-xl bg-[#05070A] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 font-bold">EEDR (8-Bit Adatregiszter):</span>
                    <p className="text-[10px] text-slate-500">Írandó vagy olvasott bájt tárolója</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-800">
                    ${currentByte.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                </div>

                {/* EECR */}
                <div className="p-2 rounded-xl bg-[#05070A] border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">EECR (Vezérlő Regiszter):</span>
                    <span className="text-[10px] text-slate-400">0b00000000</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[9px] text-center pt-1">
                    <span className="p-1 bg-slate-900 rounded border border-slate-800 text-slate-400">
                      EEPM[1:0]
                    </span>
                    <span className="p-1 bg-slate-900 rounded border border-slate-800 text-slate-400">
                      EERIE (Megsz.)
                    </span>
                    <span className="p-1 bg-amber-950 text-amber-300 rounded border border-amber-800 font-bold">
                      EEMPE (Fő Eng.)
                    </span>
                    <span className="p-1 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold">
                      EEPE (Írás Strobe)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 4-Clock Hardware Write Sequence Step-Through */}
      {activeTab === 'HARDWARE_SEQUENCE' && (
        <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 font-mono">
          {/* Hardware sequence explanation header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>ATmega328P 4-Órajel Hardveres Írásbiztonsági Retesz (EEMPE / EEPE)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                {language === 'hu'
                  ? 'A mikrokontroller véletlenszerű feszültségesések vagy szoftverhibák miatti memóriasérülés ellen 4-órajelnyi biztonsági ablakot (EEMPE Master Write Enable) használ, mielőtt az EEPE stroboszkóp bit aktiválná a ~12V-os Fowler-Nordheim lebegőkapus elektroninjektálást.'
                  : 'The MCU protects against accidental corruption using a strict 4 CPU-clock safety window (EEMPE) before the EEPE write strobe initiates internal ~12V Fowler-Nordheim floating gate electron tunneling.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleHardwareStep}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-900/40 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>{language === 'hu' ? 'Következő Lépés' : 'Next Step'}</span>
              </button>
              <button
                onClick={handleResetSequence}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                title="Visszaállítás (Reset Sequence)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5-Step Visual Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                stepNum: 1,
                id: 'WAIT_READY',
                title: '1. Várakozás (EEPE == 0)',
                desc: 'Lekérdezi az előző írás befejezését. Amíg EEPE=1, a CPU nem írhat újat.',
                code: 'while (EECR & (1<<EEPE));',
              },
              {
                stepNum: 2,
                id: 'LOAD_REGISTERS',
                title: '2. Cím & Adat Betöltés',
                desc: 'EEARH:EEARL regiszterbe a memóriacím, EEDR-be az írandó 8-bites bájt kerül.',
                code: 'EEAR = addr;\nEEDR = data;',
              },
              {
                stepNum: 3,
                id: 'ENABLE_MASTER',
                title: '3. EEMPE = 1 Reteszelés',
                desc: 'Aktiválja a Master Write Enable bitet. 4 órajelnyi visszaszámlálás indul a hardverben!',
                code: 'EECR |= (1<<EEMPE);',
              },
              {
                stepNum: 4,
                id: 'STROBE_WRITE',
                title: '4. EEPE = 1 Indítás',
                desc: '4 órajelen belül be kell állítani az EEPE bitet, különben a hardver törli az EEMPE-t!',
                code: 'EECR |= (1<<EEPE);',
              },
              {
                stepNum: 5,
                id: 'TUNNELING_PROGRAM',
                title: '5. Fowler-Nordheim ~12V',
                desc: 'Belső charge-pump magas feszültséggel elektronokat injektál a lebegőkapuba (~3.4 ms).',
                code: '// 3.4ms belső ciklus',
              },
            ].map((s) => {
              const isCurrent = writeSequence.stepIndex === s.stepNum;
              const isDone = writeSequence.stepIndex > s.stepNum;
              return (
                <div
                  key={s.stepNum}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-950/50 ring-2 ring-amber-400/60'
                      : isDone
                      ? 'bg-emerald-950/20 border-emerald-700/60 text-emerald-300'
                      : 'bg-[#05070A] border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-amber-500 text-slate-950' : isDone ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Step {s.stepNum}
                      </span>
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className={`text-xs font-bold ${isCurrent ? 'text-amber-200' : isDone ? 'text-emerald-200' : 'text-slate-300'}`}>
                      {s.title}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                  <pre className="mt-2 p-1.5 bg-black/40 rounded text-[9px] text-cyan-300 font-mono overflow-x-auto">
                    {s.code}
                  </pre>
                </div>
              );
            })}
          </div>

          {/* Live Register & Floating Gate Tunneling Animation Stage */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#05070A] border border-slate-800 rounded-2xl p-4">
            {/* Left: CPU Bus & Safety Timer (6 Cols) */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <span className="text-xs font-bold text-cyan-400">
                ⚡ Hardveres Biztonsági Állapotgép (State Monitor):
              </span>
              <div className="p-3 bg-[#0B0F17] rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Jelenlegi Állapot:</span>
                  <span className="font-bold text-amber-300">{writeSequence.step}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">4-Órajel Visszaszámláló:</span>
                  <div className="flex items-center gap-1">
                    {[3, 2, 1, 0].map((clk) => (
                      <span
                        key={clk}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          writeSequence.step === 'ENABLE_MASTER' && writeSequence.clockCyclesRemaining >= clk
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {clk}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cél Memóriacím:</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    ${writeSequence.targetAddress.toString(16).toUpperCase().padStart(4, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Írandó Bájt:</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    0x{writeSequence.targetData.toString(16).toUpperCase().padStart(2, '0')} ({writeSequence.targetData})
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                {language === 'hu' ? writeSequence.statusMessageHu : writeSequence.statusMessage}
              </div>
            </div>

            {/* Right: Floating Gate Transistor Schematic (6 Cols) */}
            <div className="md:col-span-6 flex flex-col gap-2 bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-300" />
                <span>EEPROM Lebegőkapus (Floating Gate) Tranzisztor Séma</span>
              </span>

              <div className="h-40 bg-[#030508] border border-slate-800/60 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-3">
                {/* Control Gate */}
                <div className="w-48 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded text-center text-[10px] font-bold text-white shadow-md">
                  Control Gate (+12V Charge Pump)
                </div>

                {/* Thin SiO2 Tunnel Oxide Layer */}
                <div className="w-40 h-2 bg-amber-400/30 my-1 rounded text-[8px] text-center text-amber-300 flex items-center justify-center">
                  SiO2 Alagút-Oxid (~10 nm)
                </div>

                {/* Floating Gate */}
                <div className={`w-40 py-2 rounded text-center text-[10px] font-bold border transition-all ${
                  writeSequence.step === 'TUNNELING_PROGRAM'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  Lebegő Kapu (Floating Gate) • {writeSequence.step === 'TUNNELING_PROGRAM' ? '⚡ Elektronok Csapdában (Töltés)' : 'Stabil Állapot'}
                </div>

                {/* Silicon Substrate */}
                <div className="w-48 py-1 bg-slate-900 text-slate-500 text-[9px] text-center rounded mt-1 border border-slate-800">
                  P-típusú Szilícium Hordozó (Drain / Source)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Wear-Leveling & Heatmap Simulator */}
      {activeTab === 'WEAR_LEVELING' && (
        <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 font-mono">
          {/* Wear Leveling header & controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <span>EEPROM Cellakopás & Élettartam (Wear-Leveling) Szimulátor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                {language === 'hu'
                  ? 'A mikrokontroller EEPROM memóriája bájtos alapon ~100 000 írási ciklust bír ki. A kopáskiegyenlítés (Wear-Leveling) egyenletesen terheli szét az írásokat a 1024 bájtos területen, megelőzve a korai hardverhibát.'
                  : 'AVR EEPROM cells support ~100,000 write cycles. Wear leveling distributes high-frequency sensor writes across the 1024-byte grid to extend lifespan up to 30x.'}
              </p>
            </div>

            {/* Simulation controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-[#05070A] p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setWearMode('NAIVE')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    wearMode === 'NAIVE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'hu' ? 'Naiv Írás ($0000)' : 'Naive (Addr 0)'}
                </button>
                <button
                  onClick={() => setWearMode('CIRCULAR_WEAR_LEVELING')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    wearMode === 'CIRCULAR_WEAR_LEVELING' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'hu' ? 'Wear-Leveling Ring' : 'Wear-Leveling Ring'}
                </button>
              </div>

              <button
                onClick={() => setIsWearSimRunning(!isWearSimRunning)}
                className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                  isWearSimRunning
                    ? 'bg-amber-600 text-white shadow-amber-900/40'
                    : 'bg-cyan-600 text-white shadow-cyan-900/40'
                }`}
              >
                {isWearSimRunning ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hu' ? 'Szünet' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{language === 'hu' ? 'Stressz-Teszt' : 'Stress Test'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setWriteCounts(new Uint32Array(1024));
                  setTotalSimulatedWrites(0);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs transition-colors"
              >
                {language === 'hu' ? 'Számlálók Nullázása' : 'Reset Counters'}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#05070A] p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">Összes Írási Ciklus</span>
              <span className="text-lg font-bold text-white">{totalSimulatedWrites.toLocaleString()}</span>
            </div>
            <div className="bg-[#05070A] p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">Legforróbb Cella Írása</span>
              <span className={`text-lg font-bold ${wearStats.maxWritesOnSingleCell > 1000 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {wearStats.maxWritesOnSingleCell.toLocaleString()} / 100k
              </span>
            </div>
            <div className="bg-[#05070A] p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">Elhasznált Cellák (Dead)</span>
              <span className="text-lg font-bold text-cyan-300">{wearStats.deadCellsCount} db</span>
            </div>
            <div className="bg-[#05070A] p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">Kopás Hatékonyság</span>
              <span className="text-lg font-bold text-amber-300">{wearStats.wearLevelEfficiency}%</span>
            </div>
          </div>

          {/* 1024-Cell Interactive Micro-Heatmap */}
          <div className="bg-[#05070A] p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">
                1024-Cellás Hőtérkép (0x000 .. 0x3FF):
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" /> 0 írás</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> 1-100</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> 100-1000</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" /> 1000+</span>
              </div>
            </div>

            {/* 32 x 32 Grid = 1024 cells */}
            <div className="grid grid-cols-32 gap-0.5 p-2 bg-black/50 rounded-xl border border-slate-800/80 max-h-60 overflow-y-auto">
              {Array.from({ length: 1024 }, (_, i) => {
                const count = writeCounts[i] || 0;
                let bg = 'bg-slate-800/40';
                if (count > 5000) bg = 'bg-rose-600 shadow-sm shadow-rose-500';
                else if (count > 1000) bg = 'bg-orange-500';
                else if (count > 100) bg = 'bg-amber-500';
                else if (count > 10) bg = 'bg-emerald-500';
                else if (count > 0) bg = 'bg-teal-600';

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedAddress(i)}
                    className={`h-2.5 w-full rounded-[1px] cursor-pointer transition-all ${bg} hover:scale-150 hover:z-10 hover:ring-1 hover:ring-white`}
                    title={`Addr $${i.toString(16).toUpperCase().padStart(4, '0')}: ${count} írás`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Presets & CRC-8 Integrity Check */}
      {activeTab === 'PRESETS_CRC' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
          {/* Preset Selector (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Klasszikus Gyári Minták (EEPROM Presets)</span>
            </h3>

            <div className="flex flex-col gap-2">
              {EEPROM_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                    selectedPreset.id === preset.id
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400'
                      : 'bg-[#05070A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{preset.titleHu}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {preset.categoryHu}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{preset.descriptionHu}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleLoadPreset(selectedPreset)}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hu' ? 'Minta Betöltése a Memóriába' : 'Load Preset to Memory'}</span>
            </button>
          </div>

          {/* Preset Detail & CRC-8 Checker (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Adatintegritás & CRC-8 Ellenőrzés</span>
              </h3>
              <button
                onClick={() => {
                  const computed = calculateCrc8(eeprom, 0x16);
                  const stored = eeprom[0x16] || 0;
                  setCrcStatus({ computed, stored, isValid: computed === stored });
                }}
                className="px-3 py-1 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                CRC-8 Újraszámolás
              </button>
            </div>

            {crcStatus && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                crcStatus.isValid
                  ? 'bg-emerald-950/30 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-700 text-rose-300'
              }`}>
                {crcStatus.isValid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                <div className="text-xs">
                  <span className="font-bold block">
                    {crcStatus.isValid ? 'Adatintegritás Érvényes (CRC-8 OK)!' : 'Figyelem: Korrupt EEPROM Adat!'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    Számított CRC: 0x{crcStatus.computed.toString(16).toUpperCase().padStart(2, '0')} | Tárolt CRC: 0x{crcStatus.stored.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {/* Preset byte layout breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold">Minta Bájtszerkezete:</span>
              <div className="overflow-x-auto max-h-60 overflow-y-auto bg-[#05070A] p-2 rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="py-1 px-2">Cím</th>
                      <th className="py-1 px-2">Hex Érték</th>
                      <th className="py-1 px-2">Dec</th>
                      <th className="py-1 px-2">Mező Megnevezése</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-[11px]">
                    {selectedPreset.data.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-1 px-2 text-cyan-400 font-bold">
                          ${d.address.toString(16).toUpperCase().padStart(4, '0')}
                        </td>
                        <td className="py-1 px-2 text-emerald-300 font-bold">
                          0x{d.value.toString(16).toUpperCase().padStart(2, '0')}
                        </td>
                        <td className="py-1 px-2 text-slate-300">{d.value}</td>
                        <td className="py-1 px-2 text-slate-400">{d.label || 'Adatbájt'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: C++ & AVR Assembly Code Generator */}
      {activeTab === 'CODE_GENERATOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          {/* Arduino C++ EEPROM.h */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Arduino C++ (<code className="text-cyan-300">&lt;EEPROM.h&gt;</code>)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPreset.arduinoCode);
                    setCopiedCodeType('ARDUINO');
                    setTimeout(() => setCopiedCodeType(null), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCodeType === 'ARDUINO' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeType === 'ARDUINO' ? 'Másolva!' : 'Másolás'}</span>
                </button>
                {onFlashCodeToMcu && (
                  <button
                    onClick={() => {
                      onFlashCodeToMcu(selectedPreset.arduinoCode);
                      if (onOpenBreadboardTab) onOpenBreadboardTab();
                    }}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-md transition-all"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Flash MCU</span>
                  </button>
                )}
              </div>
            </div>

            <pre className="p-3 bg-[#05070A] rounded-xl border border-slate-800 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-96 overflow-y-auto">
              {selectedPreset.arduinoCode}
            </pre>
          </div>

          {/* AVR Assembly Raw Routines */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Közvetlen AVR Assembly (ATmega328P)
                </h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedPreset.avrAsmCode);
                  setCopiedCodeType('AVR');
                  setTimeout(() => setCopiedCodeType(null), 2000);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedCodeType === 'AVR' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeType === 'AVR' ? 'Másolva!' : 'Másolás'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#05070A] rounded-xl border border-slate-800 text-amber-300/90 overflow-x-auto text-[11px] leading-relaxed max-h-96 overflow-y-auto">
              {selectedPreset.avrAsmCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
