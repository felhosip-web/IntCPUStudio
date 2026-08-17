import React, { useState, useMemo } from 'react';
import {
  accessCache,
  calculateAddressBreakdown,
  CACHE_BENCHMARKS,
  createInitialCacheState,
  DEFAULT_CACHE_CONFIG,
} from '../../core/cacheEngine';
import {
  CacheConfig,
  CachePlacementPolicy,
  CacheReplacementPolicy,
  CacheSimulatorState,
  CacheWriteAllocatePolicy,
  CacheWritePolicy,
} from '../../types/cache';
import { useI18n } from '../../i18n/I18nContext';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';

export const CacheSimulatorStudio: React.FC = () => {
  const { language } = useI18n();
  const [config, setConfig] = useState<CacheConfig>(DEFAULT_CACHE_CONFIG);
  const [state, setState] = useState<CacheSimulatorState>(() =>
    createInitialCacheState(DEFAULT_CACHE_CONFIG)
  );

  const [inputAddress, setInputAddress] = useState<string>('0x1004');
  const [inputWriteVal, setInputWriteVal] = useState<string>('42');
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('spatial_sequential');

  // Handle configuration changes
  const handleUpdateConfig = (updates: Partial<CacheConfig>) => {
    const nextConfig = { ...config, ...updates };
    setConfig(nextConfig);
    setState(createInitialCacheState(nextConfig));
  };

  // Reset Cache
  const handleReset = () => {
    setState(createInitialCacheState(config));
  };

  // Perform single memory access
  const handleAccess = (isWrite: boolean) => {
    let addr = 0;
    const clean = inputAddress.trim();
    if (clean.startsWith('0x') || clean.startsWith('0X')) {
      addr = parseInt(clean, 16) || 0;
    } else {
      addr = parseInt(clean, 10) || 0;
    }

    const val = parseInt(inputWriteVal, 10) || 0;
    setState((prev) => accessCache(prev, addr, isWrite, isWrite ? val : undefined));
  };

  // Run benchmark stream
  const handleRunBenchmark = () => {
    const bm = CACHE_BENCHMARKS.find((b) => b.id === selectedBenchmarkId);
    if (!bm) return;

    let currState = state;
    for (const req of bm.addresses) {
      currState = accessCache(currState, req.address, req.isWrite, req.value);
    }
    setState(currState);
  };

  const toHex = (n: number, w = 4) =>
    `0x${(n >>> 0).toString(16).toUpperCase().padStart(w, '0')}`;

  const breakdown = useMemo(() => {
    let addr = 0;
    const clean = inputAddress.trim();
    if (clean.startsWith('0x') || clean.startsWith('0X')) addr = parseInt(clean, 16) || 0;
    else addr = parseInt(clean, 10) || 0;
    return calculateAddressBreakdown(addr, config);
  }, [inputAddress, config]);

  return (
    <div className="flex flex-col gap-5 p-2 sm:p-4 bg-[#07090E] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0D111A] rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-900/30 text-white">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Memory Hierarchy & L1/L2 Cache Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SET-ASSOCIATIVE & AMAT SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Tag/Index/Offset címbontás, LRU/FIFO cserealgoritmusok, Write-Through/Back és AMAT analitika'
                : 'Tag/Index/Offset decomposition, LRU/FIFO replacements, Write-Through/Back & AMAT analytics'}
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all shadow"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'hu' ? 'CACHE TÖRLÉSE' : 'CLEAR CACHE'}</span>
        </button>
      </div>

      {/* Configuration & Parameters Toolbar */}
      <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          {/* Associativity */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold">Leképezési Struktúra:</span>
            <select
              value={config.placement}
              onChange={(e) => {
                const p = e.target.value as CachePlacementPolicy;
                let assoc = 1;
                if (p === 'SET_ASSOCIATIVE_2') assoc = 2;
                if (p === 'SET_ASSOCIATIVE_4') assoc = 4;
                if (p === 'SET_ASSOCIATIVE_8') assoc = 8;
                handleUpdateConfig({ placement: p, associativity: assoc });
              }}
              className="bg-[#06080C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none"
            >
              <option value="DIRECT_MAPPED">Direct Mapped (1-Way)</option>
              <option value="SET_ASSOCIATIVE_2">2-Way Set Associative</option>
              <option value="SET_ASSOCIATIVE_4">4-Way Set Associative</option>
              <option value="SET_ASSOCIATIVE_8">8-Way Set Associative</option>
              <option value="FULLY_ASSOCIATIVE">Fully Associative</option>
            </select>
          </div>

          {/* Replacement */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold">Csere Algoritmus:</span>
            <select
              value={config.replacement}
              onChange={(e) => handleUpdateConfig({ replacement: e.target.value as CacheReplacementPolicy })}
              className="bg-[#06080C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none"
            >
              <option value="LRU">LRU (Least Recently Used)</option>
              <option value="FIFO">FIFO (First In First Out)</option>
              <option value="RANDOM">Random</option>
            </select>
          </div>

          {/* Write Policy */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold">Írási Stratégia:</span>
            <select
              value={`${config.writePolicy}_${config.writeAllocate}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'WRITE_BACK_WRITE_ALLOCATE') {
                  handleUpdateConfig({ writePolicy: 'WRITE_BACK', writeAllocate: 'WRITE_ALLOCATE' });
                } else {
                  handleUpdateConfig({ writePolicy: 'WRITE_THROUGH', writeAllocate: 'NO_WRITE_ALLOCATE' });
                }
              }}
              className="bg-[#06080C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none"
            >
              <option value="WRITE_BACK_WRITE_ALLOCATE">Write-Back + Write-Allocate</option>
              <option value="WRITE_THROUGH_NO_WRITE_ALLOCATE">Write-Through + No-Allocate</option>
            </select>
          </div>

          {/* Block Size */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold">Blokk Méret:</span>
            <select
              value={config.blockSizeBytes}
              onChange={(e) => handleUpdateConfig({ blockSizeBytes: parseInt(e.target.value, 10) })}
              className="bg-[#06080C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none"
            >
              <option value="4">4 Bájt / Blokk</option>
              <option value="8">8 Bájt / Blokk</option>
              <option value="16">16 Bájt / Blokk</option>
              <option value="32">32 Bájt / Blokk</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 border-l border-slate-800 pl-4 hidden md:block">
          <div>Összméret: <strong className="text-slate-200">{config.totalSizeBytes} B</strong></div>
          <div>Sets száma: <strong className="text-slate-200">{state.sets.length}</strong></div>
        </div>
      </div>

      {/* Address Breakdown Visualizer */}
      <div className="p-4 bg-[#0A0D14] rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{language === 'hu' ? '16-BITES CÍMBONTÁS (TAG | INDEX | OFFSET)' : 'ADDRESS BIT FIELD DECOMPOSITION'}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {config.addressBits}-bit Physical Address
          </span>
        </div>

        {/* Address Input & Actions */}
        <div className="flex flex-wrap items-center gap-3 bg-[#06080C] p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Cím:</span>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 font-bold focus:outline-none"
              placeholder="0x1000"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Érték (Írásnál):</span>
            <input
              type="text"
              value={inputWriteVal}
              onChange={(e) => setInputWriteVal(e.target.value)}
              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-300 font-bold focus:outline-none"
              placeholder="42"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccess(false)}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow"
            >
              MEM READ
            </button>
            <button
              onClick={() => handleAccess(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow"
            >
              MEM WRITE
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-2 hidden sm:block" />

          {/* Benchmark Preset Stream */}
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={selectedBenchmarkId}
              onChange={(e) => setSelectedBenchmarkId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none max-w-[200px]"
            >
              {CACHE_BENCHMARKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'hu' ? b.titleHu : b.titleEn}
                </option>
              ))}
            </select>
            <button
              onClick={handleRunBenchmark}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
            >
              <Play className="w-3 h-3" />
              <span>{language === 'hu' ? 'BENCHMARK FUTTATÁSA' : 'RUN BENCHMARK'}</span>
            </button>
          </div>
        </div>

        {/* Color-Coded Bit Decomposition Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs mt-1">
          {/* Tag */}
          <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl flex flex-col gap-1">
            <div className="flex justify-between items-center text-purple-300 font-bold">
              <span>TAG MEZŐ ({breakdown.tagBits} bit)</span>
              <span>{toHex(breakdown.tag, 2)}</span>
            </div>
            <span className="text-[11px] text-purple-200 font-bold tracking-widest">{breakdown.tagBinary}</span>
            <span className="text-[10px] text-slate-400">Azonosítja a blokk memóriabeli eredetét.</span>
          </div>

          {/* Index */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex flex-col gap-1">
            <div className="flex justify-between items-center text-cyan-300 font-bold">
              <span>SET INDEX ({breakdown.indexBits} bit)</span>
              <span>Set #{breakdown.setIndex}</span>
            </div>
            <span className="text-[11px] text-cyan-200 font-bold tracking-widest">{breakdown.indexBinary}</span>
            <span className="text-[10px] text-slate-400">Kijelöli a Cache Set sorát.</span>
          </div>

          {/* Offset */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex flex-col gap-1">
            <div className="flex justify-between items-center text-emerald-300 font-bold">
              <span>BLOCK OFFSET ({breakdown.offsetBits} bit)</span>
              <span>Byte #{breakdown.blockOffset}</span>
            </div>
            <span className="text-[11px] text-emerald-200 font-bold tracking-widest">{breakdown.offsetBinary}</span>
            <span className="text-[10px] text-slate-400">Kiválasztja a bájtot a blokkon belül.</span>
          </div>
        </div>
      </div>

      {/* Telemetry & AMAT Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3 bg-[#0B0F17] rounded-xl border border-slate-800 text-xs font-mono">
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">ÖSSZES HOZZÁFÉRÉS</span>
          <span className="text-base font-bold text-slate-100">{state.stats.totalAccesses}</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">CACHE TALÁLAT (HIT)</span>
          <span className="text-base font-bold text-emerald-400">{state.stats.hits} ({state.stats.hitRate}%)</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">CACHE HIÁNY (MISS)</span>
          <span className="text-base font-bold text-rose-400">{state.stats.misses} ({state.stats.missRate}%)</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">3Cs MISS BONTÁS</span>
          <span className="text-[11px] font-bold text-amber-300">
            Cold: {state.stats.compulsoryMisses} | Cap: {state.stats.capacityMisses} | Conf: {state.stats.conflictMisses}
          </span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">KILÖKÉSEK (EVICTIONS)</span>
          <span className="text-base font-bold text-purple-300">{state.stats.evictions} ({state.stats.dirtyEvictionsWrittenBack} dirty)</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400">AMAT (ÁTLAGOS KÉSLELTETÉS)</span>
          <span className="text-base font-bold text-cyan-300">{state.stats.averageMemoryAccessTime} Ciklus</span>
        </div>
      </div>

      {/* Live Access Result Banner */}
      {state.lastAccess && (
        <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all animate-fadeIn ${
          state.lastAccess.isHit
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          {state.lastAccess.isHit ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-bold">
              {language === 'hu' ? state.lastAccess.explanationHu : state.lastAccess.explanationEn}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-slate-900/80 rounded border border-slate-700">
            +{state.lastAccess.cyclesTaken} CYCLES
          </span>
        </div>
      )}

      {/* Main Grid: Cache Table & Access History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Cache Block Table (8 cols) */}
        <div className="lg:col-span-8 p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Live Cache Table (Sets & Ways)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {config.blockSizeBytes} Bytes per Block
            </span>
          </div>

          <div className="overflow-x-auto max-h-[420px] scrollbar-thin">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-2">Set</th>
                  <th className="py-2 px-2">Way</th>
                  <th className="py-2 px-2 text-center">V</th>
                  <th className="py-2 px-2 text-center">D</th>
                  <th className="py-2 px-2">Tag</th>
                  <th className="py-2 px-2">LRU Age</th>
                  <th className="py-2 px-2">Data Block Bytes</th>
                </tr>
              </thead>
              <tbody>
                {state.sets.map((set) =>
                  set.lines.map((line, wayIdx) => {
                    const isRecentTarget =
                      state.lastAccess &&
                      breakdown.setIndex === set.setIndex &&
                      (state.lastAccess.hitWay === wayIdx || (!state.lastAccess.isHit && wayIdx === 0));

                    return (
                      <tr
                        key={`${set.setIndex}-${wayIdx}`}
                        className={`border-b border-slate-900/60 transition-all ${
                          isRecentTarget
                            ? state.lastAccess?.isHit
                              ? 'bg-emerald-950/30 font-bold'
                              : 'bg-rose-950/20 font-bold'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <td className="py-1.5 px-2 text-slate-400">#{set.setIndex}</td>
                        <td className="py-1.5 px-2 text-cyan-300">W{wayIdx}</td>
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`px-1 rounded text-[10px] ${
                              line.valid ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {line.valid ? '1' : '0'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`px-1 rounded text-[10px] ${
                              line.dirty ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {line.dirty ? '1' : '0'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-purple-300 font-bold">
                          {line.valid ? toHex(line.tag, 2) : '—'}
                        </td>
                        <td className="py-1.5 px-2 text-slate-400">{line.valid ? line.age : '—'}</td>
                        <td className="py-1.5 px-2">
                          <div className="flex gap-1">
                            {line.data.slice(0, 8).map((byte, bIdx) => (
                              <span
                                key={bIdx}
                                className={`px-1 py-0.5 rounded text-[10px] ${
                                  line.valid ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'text-slate-700'
                                }`}
                              >
                                {toHex(byte, 2).replace('0x', '')}
                              </span>
                            ))}
                            {line.data.length > 8 && <span className="text-slate-600 text-[10px]">...</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Access Log & AMAT Formula (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* AMAT Formula Box */}
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>AMAT Képlet & Számítás</span>
            </h3>
            <div className="p-2.5 bg-[#06080C] rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-col gap-1">
              <span className="text-slate-400">AMAT = Hit Time + (Miss Rate × Miss Penalty)</span>
              <span className="text-emerald-300 font-bold">
                = {config.hitLatencyCycles} + ({state.stats.missRate}% × {config.missPenaltyCycles})
              </span>
              <span className="text-cyan-300 font-bold text-xs mt-1">
                = {state.stats.averageMemoryAccessTime} Ciklus / Hozzáférés
              </span>
            </div>
          </div>

          {/* Access History */}
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-2 flex-1">
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>{language === 'hu' ? 'Legutóbbi Hozzáférések' : 'Access History'}</span>
              <span className="text-[10px] text-slate-500">Last 15</span>
            </h3>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-64 scrollbar-thin font-mono text-[11px]">
              {state.accessHistory.map((acc, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    acc.isHit
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{acc.isWrite ? 'WR' : 'RD'}</span>
                    <span>{toHex(acc.address)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900">
                      {acc.isHit ? 'HIT' : acc.missType}
                    </span>
                    <span className="text-slate-400 text-[10px]">+{acc.cyclesTaken}c</span>
                  </div>
                </div>
              ))}
              {state.accessHistory.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  {language === 'hu' ? 'Nincs rögzített hozzáférés.' : 'No access history yet.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
