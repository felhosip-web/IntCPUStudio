import React, { useMemo, useRef, useState, useEffect } from 'react';
import { CpuState } from '../../types/cpu';
import {
  LogicAnalyzerChannel,
  TimingChannelId,
  TimingSample,
  TimingTriggerConfig,
  TimingTriggerType,
} from '../../types/timing';
import {
  DEFAULT_LOGIC_CHANNELS,
  EDUCATIONAL_TIMING_PRESETS,
  MAX_TIMING_SAMPLES,
  evaluateTrigger,
  extractTimingSample,
} from '../../core/timingDiagramEngine';
import { useI18n } from '../../i18n/I18nContext';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from 'lucide-react';

interface TimingDiagramModuleProps {
  cpu: CpuState;
  timingHistory?: TimingSample[];
  onClearHistory?: () => void;
}

type ColorTheme = 'MODERN_LAB' | 'PHOSPHOR_GREEN' | 'AMBER_CRT' | 'HIGH_CONTRAST';

export const TimingDiagramModule: React.FC<TimingDiagramModuleProps> = ({
  cpu,
  timingHistory = [],
  onClearHistory,
}) => {
  const { language } = useI18n();

  // Settings and view configuration
  const [channels, setChannels] = useState<LogicAnalyzerChannel[]>(DEFAULT_LOGIC_CHANNELS);
  const [isActiveLowMode, setIsActiveLowMode] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<20 | 50 | 100>(50);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('HIGH_CONTRAST');
  const [isLiveFollowing, setIsLiveFollowing] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [activeEduTab, setActiveEduTab] = useState<'OVERVIEW' | 'SIGNALS' | 'CYCLES' | 'INTERACTIVE'>('OVERVIEW');

  // Measurement Cursors (Cursor A and Cursor B)
  const [cursorA, setCursorA] = useState<number | null>(null);
  const [cursorB, setCursorB] = useState<number | null>(null);
  const [activeCursorToPlace, setActiveCursorToPlace] = useState<'A' | 'B' | null>('A');

  // Trigger Configuration
  const [triggerConfig, setTriggerConfig] = useState<TimingTriggerConfig>({
    type: 'FREE_RUN',
    enabled: false,
    targetAddress: 0x0080,
    targetData: 0xff,
    hasTriggered: false,
  });

  // Local sample buffer (stores up to 100 cycles)
  const [samplesBuffer, setSamplesBuffer] = useState<TimingSample[]>(() => {
    // If incoming timingHistory has samples, initialize with them
    if (timingHistory && timingHistory.length > 0) {
      return timingHistory.slice(-MAX_TIMING_SAMPLES);
    }
    // Otherwise seed with a default sample from initial CPU
    return [extractTimingSample(cpu, 1)];
  });

  const [frozenSamples, setFrozenSamples] = useState<TimingSample[] | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync incoming CPU updates into samplesBuffer when not paused
  useEffect(() => {
    if (isPaused || frozenSamples !== null) return;

    if (timingHistory && timingHistory.length > 0) {
      setSamplesBuffer(timingHistory.slice(-MAX_TIMING_SAMPLES));
      return;
    }

    // Incremental fallback sampling
    setSamplesBuffer((prev) => {
      const lastCycle = prev.length > 0 ? prev[prev.length - 1].cycle : 0;
      if (cpu.cycleCount !== lastCycle) {
        const newSample = extractTimingSample(cpu);

        // Check Trigger condition
        if (triggerConfig.enabled && evaluateTrigger(newSample, triggerConfig)) {
          setTriggerConfig((t) => ({
            ...t,
            hasTriggered: true,
            triggeredCycleIndex: newSample.cycle,
          }));
        }

        const updated = [...prev, newSample];
        if (updated.length > MAX_TIMING_SAMPLES) {
          return updated.slice(updated.length - MAX_TIMING_SAMPLES);
        }
        return updated;
      }
      return prev;
    });
  }, [cpu.cycleCount, cpu.microStep, timingHistory, isPaused, frozenSamples, triggerConfig]);

  // Active samples to render (live buffer or loaded educational preset / frozen buffer)
  const activeSamples = frozenSamples || samplesBuffer;

  // Windowed visible slice based on zoom level and scroll position
  const visibleSamples = useMemo(() => {
    if (activeSamples.length === 0) return [];
    if (activeSamples.length <= zoomLevel) {
      return activeSamples;
    }
    if (isLiveFollowing) {
      return activeSamples.slice(-zoomLevel);
    }
    return activeSamples.slice(0, zoomLevel);
  }, [activeSamples, zoomLevel, isLiveFollowing]);

  // Toggle individual channel visibility
  const handleToggleChannel = (id: TimingChannelId) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, visible: !ch.visible } : ch))
    );
  };

  // Load Educational Preset Trace
  const handleLoadPreset = (presetId: string) => {
    const preset = EDUCATIONAL_TIMING_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFrozenSamples(preset.samples);
      setSelectedPresetId(preset.id);
      setIsPaused(true);
      setIsPresetModalOpen(false);
      setCursorA(1);
      setCursorB(preset.samples.length);
    }
  };

  // Clear or resume to live CPU buffer
  const handleResumeLive = () => {
    setFrozenSamples(null);
    setSelectedPresetId(null);
    setIsPaused(false);
    setTriggerConfig((t) => ({ ...t, hasTriggered: false }));
  };

  // Reset entire buffer
  const handleClearBuffer = () => {
    setSamplesBuffer([extractTimingSample(cpu, 1)]);
    setFrozenSamples(null);
    setSelectedPresetId(null);
    setCursorA(null);
    setCursorB(null);
    if (onClearHistory) onClearHistory();
  };

  // Click on waveform canvas to place Cursor A or Cursor B
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleSamples.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const labelWidth = 110;
    const plotWidth = rect.width - labelWidth - 20;

    if (clickX < labelWidth) return;

    const relX = clickX - labelWidth;
    const cycleIndex = Math.floor((relX / plotWidth) * visibleSamples.length);
    const clampedIndex = Math.max(0, Math.min(visibleSamples.length - 1, cycleIndex));
    const targetSample = visibleSamples[clampedIndex];

    if (targetSample) {
      if (activeCursorToPlace === 'A') {
        setCursorA(targetSample.cycle);
        setActiveCursorToPlace('B');
      } else {
        setCursorB(targetSample.cycle);
        setActiveCursorToPlace('A');
      }
    }
  };

  // Find sample by cycle number
  const sampleAtCursorA = useMemo(
    () => activeSamples.find((s) => s.cycle === cursorA) || null,
    [activeSamples, cursorA]
  );
  const sampleAtCursorB = useMemo(
    () => activeSamples.find((s) => s.cycle === cursorB) || null,
    [activeSamples, cursorB]
  );

  // Delta calculation
  const deltaCycles =
    cursorA !== null && cursorB !== null ? Math.abs(cursorB - cursorA) : null;
  const estimatedTimeUs =
    deltaCycles !== null
      ? (deltaCycles * (1 / (cpu.hardwareConfig?.coreConfig?.clockPrescaler || 2)) * 1000).toFixed(1)
      : null;

  // Copy CSV Trace to clipboard
  const handleCopyTrace = () => {
    if (activeSamples.length === 0) return;
    const headers = ['Cycle', 'Instruction', 'MicroStep', 'MREQ', 'IORQ', 'RD', 'WR', 'M1', 'ALE', 'ADDR', 'DATA', 'BusType'];
    const rows = activeSamples.map((s) => [
      s.cycle,
      `"${s.instructionName}"`,
      s.microStep,
      s.mreq ? 1 : 0,
      s.iorq ? 1 : 0,
      s.rd ? 1 : 0,
      s.wr ? 1 : 0,
      s.m1 ? 1 : 0,
      s.ale ? 1 : 0,
      `0x${s.addressBus.toString(16).toUpperCase().padStart(4, '0')}`,
      `0x${s.dataBus.toString(16).toUpperCase().padStart(2, '0')}`,
      s.busCycleType,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Color theme palettes
  const themeColors = useMemo(() => {
    switch (colorTheme) {
      case 'PHOSPHOR_GREEN':
        return {
          bg: '#041308',
          grid: '#0D3818',
          label: '#4ADE80',
          activeHigh: '#22C55E',
          activeLow: '#15803D',
          bus: '#86EFAC',
          cursorA: '#6EE7B7',
          cursorB: '#A7F3D0',
        };
      case 'AMBER_CRT':
        return {
          bg: '#140E04',
          grid: '#3D2808',
          label: '#FBBF24',
          activeHigh: '#F59E0B',
          activeLow: '#B45309',
          bus: '#FDE68A',
          cursorA: '#FCD34D',
          cursorB: '#FEF08A',
        };
      case 'MODERN_LAB':
        return {
          bg: '#0A0F1D',
          grid: '#1E293B',
          label: '#38BDF8',
          activeHigh: '#0EA5E9',
          activeLow: '#0369A1',
          bus: '#7DD3FC',
          cursorA: '#06B6D4',
          cursorB: '#F43F5E',
        };
      case 'HIGH_CONTRAST':
      default:
        return {
          bg: '#070B14',
          grid: '#1E293B',
          label: '#E2E8F0',
          activeHigh: '#38BDF8',
          activeLow: '#64748B',
          bus: '#FACC15',
          cursorA: '#00F0FF',
          cursorB: '#FF007F',
        };
    }
  }, [colorTheme]);

  // Waveform SVG Drawing Parameters
  const LABEL_WIDTH = 110;
  const ROW_HEIGHT = 38;
  const HEADER_HEIGHT = 44;
  const visibleChannels = channels.filter((ch) => ch.visible);
  const TOTAL_HEIGHT = HEADER_HEIGHT + visibleChannels.length * ROW_HEIGHT + 24;
  const SVG_WIDTH = 900;
  const PLOT_WIDTH = SVG_WIDTH - LABEL_WIDTH - 24;
  const stepWidth = visibleSamples.length > 0 ? PLOT_WIDTH / visibleSamples.length : 10;

  // Group consecutive machine cycles for protocol banner overlay
  const protocolBanners = useMemo(() => {
    if (visibleSamples.length === 0) return [];
    const banners: Array<{
      type: string;
      label: string;
      startIndex: number;
      count: number;
      color: string;
    }> = [];

    let currType = visibleSamples[0].busCycleType;
    let currInstr = visibleSamples[0].instructionName;
    let startIdx = 0;
    let count = 1;

    for (let i = 1; i < visibleSamples.length; i++) {
      const sample = visibleSamples[i];
      if (sample.busCycleType === currType && sample.instructionName === currInstr) {
        count++;
      } else {
        banners.push({
          type: currType,
          label:
            currType === 'FETCH'
              ? `M1 (Fetch ${currInstr})`
              : currType === 'MEM_RD'
              ? `MEM RD [0x${visibleSamples[startIdx].addressBus.toString(16).toUpperCase()}]`
              : currType === 'MEM_WR'
              ? `MEM WR [0x${visibleSamples[startIdx].addressBus.toString(16).toUpperCase()}]`
              : currType === 'IO_RD'
              ? `IO RD Port ${visibleSamples[startIdx].addressBus}`
              : currType === 'IO_WR'
              ? `IO WR Port ${visibleSamples[startIdx].addressBus}`
              : currType === 'DMA_XFER'
              ? 'DMA XFER'
              : 'IDLE / ALU',
          startIndex: startIdx,
          count,
          color:
            currType === 'FETCH'
              ? '#A855F7'
              : currType === 'MEM_RD'
              ? '#3B82F6'
              : currType === 'MEM_WR'
              ? '#F97316'
              : currType === 'IO_RD'
              ? '#10B981'
              : currType === 'IO_WR'
              ? '#EF4444'
              : '#64748B',
        });
        currType = sample.busCycleType;
        currInstr = sample.instructionName;
        startIdx = i;
        count = 1;
      }
    }
    banners.push({
      type: currType,
      label:
        currType === 'FETCH'
          ? `M1 (Fetch ${currInstr})`
          : currType === 'MEM_RD'
          ? `MEM RD [0x${visibleSamples[startIdx].addressBus.toString(16).toUpperCase()}]`
          : currType === 'MEM_WR'
          ? `MEM WR [0x${visibleSamples[startIdx].addressBus.toString(16).toUpperCase()}]`
          : currType === 'IO_RD'
          ? `IO RD Port ${visibleSamples[startIdx].addressBus}`
          : currType === 'IO_WR'
          ? `IO WR Port ${visibleSamples[startIdx].addressBus}`
          : currType === 'DMA_XFER'
          ? 'DMA XFER'
          : 'IDLE / ALU',
      startIndex: startIdx,
      count,
      color:
        currType === 'FETCH'
          ? '#A855F7'
          : currType === 'MEM_RD'
          ? '#3B82F6'
          : currType === 'MEM_WR'
          ? '#F97316'
          : currType === 'IO_RD'
          ? '#10B981'
          : currType === 'IO_WR'
          ? '#EF4444'
          : '#64748B',
    });
    return banners;
  }, [visibleSamples]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3.5 bg-[#070A12] border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-slate-200"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        {/* Left Title & Status Badges */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                {language === 'hu' ? 'Valós Idejű Időzítési Diagram & Logikai Analizátor' : 'Real-Time Timing Diagram & Logic Analyzer'}
              </h3>
              {frozenSamples !== null ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {language === 'hu' ? 'Oktatási Minta' : 'Edu Preset'}
                </span>
              ) : isPaused ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {language === 'hu' ? 'Megállítva' : 'PAUSED'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {language === 'hu' ? 'Élő Busz Mintavétel' : 'LIVE 100 CYCLES'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {language === 'hu'
                ? 'Hardver vezérlőjelek (MREQ, IORQ, RD, WR) és buszok digitális oszcilloszkópja'
                : 'Digital waveform analyzer for control strobes (/MREQ, /IORQ, /RD, /WR) & buses'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Active-LOW (/MREQ) vs Active-HIGH Toggle */}
          <button
            onClick={() => setIsActiveLowMode((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              isActiveLowMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={language === 'hu' ? 'Váltás Adatlapos Aktív-Alacsony (/MREQ) és Logikai 1 nézet között' : 'Toggle Active-LOW (/MREQ) vs Active-HIGH logic'}
          >
            <span className="font-bold">{isActiveLowMode ? '/MREQ (Active-LOW 0V)' : 'MREQ (Active-HIGH 1)'}</span>
          </button>

          {/* Educational Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPresetModalOpen((v) => !v)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? 'Oktató Időzítések' : 'Timing Presets'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isPresetModalOpen && (
              <div className="absolute right-0 sm:right-0 max-w-[calc(100vw-2rem)] mt-1 w-80 bg-[#0E1424] border border-slate-700 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1.5">
                <div className="text-[11px] font-mono font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                  {language === 'hu' ? 'Válassz egy szabványos adatlapos mintát:' : 'Select a standard datasheet timing:'}
                </div>
                {EDUCATIONAL_TIMING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset.id)}
                    className={`text-left p-2 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-purple-300">
                      {language === 'hu' ? preset.titleHu : preset.titleEn}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {language === 'hu' ? preset.descriptionHu : preset.descriptionEn}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Channel Filter Modal Toggle */}
          <button
            onClick={() => setIsChannelModalOpen((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hu' ? 'Csatornák' : 'Channels'} ({visibleChannels.length})</span>
          </button>

          {/* Zoom Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {([20, 50, 100] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  zoomLevel === z
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z}T
              </button>
            ))}
          </div>

          {/* Live Follow / Freeze / Clear Controls */}
          {frozenSamples ? (
            <button
              onClick={handleResumeLive}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? 'Vissza Élőre' : 'Return Live'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                isPaused
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-600/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? (language === 'hu' ? 'Folytatás' : 'Resume') : (language === 'hu' ? 'Fagyasztás' : 'Freeze')}</span>
            </button>
          )}

          <button
            onClick={handleClearBuffer}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all cursor-pointer"
            title={language === 'hu' ? 'Puffer Ürítése' : 'Clear Buffer'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyTrace}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all cursor-pointer"
            title={language === 'hu' ? 'Időzítési adatok másolása CSV formátumban' : 'Copy CSV timing trace to clipboard'}
          >
            {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Channel Configuration Drawer (Collapsible) */}
      {isChannelModalOpen && (
        <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {language === 'hu' ? 'Megjelenített Digitális Csatornák' : 'Displayed Digital Channels'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">{language === 'hu' ? 'Téma:' : 'Theme:'}</span>
              {(['HIGH_CONTRAST', 'MODERN_LAB', 'PHOSPHOR_GREEN', 'AMBER_CRT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setColorTheme(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    colorTheme === t
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleToggleChannel(ch.id)}
                className={`p-2 rounded-lg border text-left font-mono transition-all flex items-center justify-between cursor-pointer ${
                  ch.visible
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                  <span className="text-xs font-bold">{isActiveLowMode ? ch.activeLowLabel : ch.label}</span>
                </div>
                {ch.visible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Measurement Cursors HUD (Delta T & States) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs">
        {/* Cursor Placement Selector */}
        <div className="md:col-span-3 flex flex-col justify-center gap-1 border-r border-slate-800/80 pr-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>{language === 'hu' ? 'MÉRŐKURZOR ELHELYEZÉSE:' : 'MEASUREMENT CURSORS:'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveCursorToPlace('A')}
              className={`px-2 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                activeCursorToPlace === 'A'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm ring-1 ring-cyan-400/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Cursor A ({cursorA !== null ? `T${cursorA}` : '--'})
            </button>
            <button
              onClick={() => setActiveCursorToPlace('B')}
              className={`px-2 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                activeCursorToPlace === 'B'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-400 shadow-sm ring-1 ring-pink-400/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Cursor B ({cursorB !== null ? `T${cursorB}` : '--'})
            </button>
          </div>
        </div>

        {/* Delta T Display */}
        <div className="md:col-span-3 flex flex-col justify-center gap-0.5 border-r border-slate-800/80 pr-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{language === 'hu' ? 'ΔT IDŐKÜLÖNBSÉG:' : 'DELTA-T MEASUREMENT:'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-300">
              {deltaCycles !== null ? `ΔT = ${deltaCycles} órajel ciklus` : 'Kattints a grafikonra'}
            </span>
            {estimatedTimeUs && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                ~{estimatedTimeUs} µs
              </span>
            )}
          </div>
        </div>

        {/* Cursor A vs Cursor B State Readout */}
        <div className="md:col-span-6 flex items-center justify-between gap-2 pl-1">
          {sampleAtCursorA && (
            <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-cyan-500/30">
              <div className="text-[10px] text-cyan-400 font-bold flex items-center justify-between">
                <span>[A] T{sampleAtCursorA.cycle} - {sampleAtCursorA.instructionName}</span>
                <span className="text-[9px] text-slate-400">{sampleAtCursorA.busCycleType}</span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>ADDR: <strong className="text-amber-300">0x{sampleAtCursorA.addressBus.toString(16).toUpperCase().padStart(2, '0')}</strong></span>
                <span>DATA: <strong className="text-cyan-300">0x{sampleAtCursorA.dataBus.toString(16).toUpperCase().padStart(2, '0')}</strong></span>
                <span className="text-[9px] text-slate-400">
                  {sampleAtCursorA.mreq ? '/MREQ' : ''} {sampleAtCursorA.rd ? '/RD' : ''} {sampleAtCursorA.wr ? '/WR' : ''}
                </span>
              </div>
            </div>
          )}

          {sampleAtCursorB && (
            <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-pink-500/30">
              <div className="text-[10px] text-pink-400 font-bold flex items-center justify-between">
                <span>[B] T{sampleAtCursorB.cycle} - {sampleAtCursorB.instructionName}</span>
                <span className="text-[9px] text-slate-400">{sampleAtCursorB.busCycleType}</span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>ADDR: <strong className="text-amber-300">0x{sampleAtCursorB.addressBus.toString(16).toUpperCase().padStart(2, '0')}</strong></span>
                <span>DATA: <strong className="text-cyan-300">0x{sampleAtCursorB.dataBus.toString(16).toUpperCase().padStart(2, '0')}</strong></span>
                <span className="text-[9px] text-slate-400">
                  {sampleAtCursorB.mreq ? '/MREQ' : ''} {sampleAtCursorB.rd ? '/RD' : ''} {sampleAtCursorB.wr ? '/WR' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Real-Time Logic Analyzer SVG Canvas */}
      <div className="relative overflow-x-auto bg-[#05070E] rounded-xl border border-slate-800 p-2 shadow-inner">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
          className="w-full h-auto min-w-[700px] cursor-crosshair select-none font-mono"
          onClick={handleCanvasClick}
        >
          {/* Background Grid & Container */}
          <rect x="0" y="0" width={SVG_WIDTH} height={TOTAL_HEIGHT} fill={themeColors.bg} />

          {/* Left Channel Header Column Background */}
          <rect x="0" y="0" width={LABEL_WIDTH} height={TOTAL_HEIGHT} fill="#0A0F1D" />
          <line x1={LABEL_WIDTH} y1="0" x2={LABEL_WIDTH} y2={TOTAL_HEIGHT} stroke="#1E293B" strokeWidth="1.5" />

          {/* Machine Cycle Protocol Banners (Top Row) */}
          <g transform={`translate(${LABEL_WIDTH}, 4)`}>
            {protocolBanners.map((banner, bIdx) => {
              const bX = banner.startIndex * stepWidth;
              const bW = Math.max(8, banner.count * stepWidth - 2);
              return (
                <g key={bIdx}>
                  <rect
                    x={bX}
                    y="0"
                    width={bW}
                    height="18"
                    rx="4"
                    fill={banner.color}
                    fillOpacity="0.25"
                    stroke={banner.color}
                    strokeWidth="1"
                  />
                  <text
                    x={bX + bW / 2}
                    y="12"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {bW > 35 ? banner.label : banner.type}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Clock T-State Ruler & Vertical Grid Dividers */}
          <g transform={`translate(${LABEL_WIDTH}, ${HEADER_HEIGHT - 12})`}>
            {visibleSamples.map((sample, idx) => {
              const xPos = idx * stepWidth;
              const isEven = sample.cycle % 5 === 0 || idx === 0 || idx === visibleSamples.length - 1;
              return (
                <g key={`ruler-${sample.cycle}-${idx}`}>
                  {/* Vertical dashed clock grid lines across entire canvas */}
                  <line
                    x1={xPos}
                    y1={0}
                    x2={xPos}
                    y2={TOTAL_HEIGHT - HEADER_HEIGHT}
                    stroke={themeColors.grid}
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                    opacity={idx % 2 === 0 ? 0.8 : 0.4}
                  />
                  {/* T-state label */}
                  <text
                    x={xPos + stepWidth / 2}
                    y="-2"
                    textAnchor="middle"
                    fill={isEven ? '#94A3B8' : '#475569'}
                    fontSize={stepWidth < 18 ? '7' : '8'}
                    fontWeight={isEven ? 'bold' : 'normal'}
                  >
                    T{sample.cycle}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Signal Rows (One by One) */}
          {visibleChannels.map((channel, rowIdx) => {
            const yBase = HEADER_HEIGHT + rowIdx * ROW_HEIGHT;
            const yHigh = yBase + 8;
            const yLow = yBase + ROW_HEIGHT - 8;
            const yMid = (yHigh + yLow) / 2;

            // Generate Path for Digital or Bus Channel
            let pathD = '';
            let prevVal: boolean | null = null;

            if (channel.type === 'DIGITAL') {
              visibleSamples.forEach((sample, idx) => {
                const xStart = LABEL_WIDTH + idx * stepWidth;
                const xEnd = xStart + stepWidth;

                let isLogicalActive = false;
                switch (channel.id) {
                  case 'CLK':
                    isLogicalActive = sample.clk;
                    break;
                  case 'MREQ':
                    isLogicalActive = sample.mreq;
                    break;
                  case 'IORQ':
                    isLogicalActive = sample.iorq;
                    break;
                  case 'RD':
                    isLogicalActive = sample.rd;
                    break;
                  case 'WR':
                    isLogicalActive = sample.wr;
                    break;
                  case 'M1':
                    isLogicalActive = sample.m1;
                    break;
                  case 'ALE':
                    isLogicalActive = sample.ale;
                    break;
                  case 'WAIT':
                    isLogicalActive = sample.wait;
                    break;
                  case 'BUSREQ':
                    isLogicalActive = sample.busreq;
                    break;
                  case 'INT':
                    isLogicalActive = sample.int;
                    break;
                  case 'ALU_ACT':
                    isLogicalActive = sample.aluActive;
                    break;
                }

                // In Active-Low mode: 0V (Low) is the ACTIVE state, 5V (High) is the INACTIVE state
                // For signals like MREQ, IORQ, RD, WR, M1:
                const isControlStrobe = ['MREQ', 'IORQ', 'RD', 'WR', 'M1', 'WAIT', 'BUSREQ', 'INT'].includes(channel.id);
                const isRenderedHigh = isActiveLowMode && isControlStrobe ? !isLogicalActive : isLogicalActive;

                const yVal = isRenderedHigh ? yHigh : yLow;

                if (idx === 0) {
                  pathD += `M ${xStart} ${yVal} L ${xEnd} ${yVal}`;
                } else {
                  if (prevVal !== isRenderedHigh) {
                    // Transition edge
                    pathD += ` L ${xStart} ${yVal} L ${xEnd} ${yVal}`;
                  } else {
                    pathD += ` L ${xEnd} ${yVal}`;
                  }
                }
                prevVal = isRenderedHigh;
              });
            }

            return (
              <g key={channel.id}>
                {/* Horizontal row divider line */}
                <line
                  x1="0"
                  y1={yBase + ROW_HEIGHT}
                  x2={SVG_WIDTH}
                  y2={yBase + ROW_HEIGHT}
                  stroke="#111827"
                  strokeWidth="1"
                />

                {/* Left Channel Label and Pin Name */}
                <g transform={`translate(10, ${yBase + 16})`}>
                  <rect
                    x="-4"
                    y="-10"
                    width="95"
                    height="20"
                    rx="4"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1"
                  />
                  <circle cx="4" cy="0" r="3" fill={channel.color} />
                  <text x="14" y="3" fill="#F8FAFC" fontSize="10" fontWeight="bold">
                    {isActiveLowMode ? channel.activeLowLabel : channel.label}
                  </text>
                  <text x="75" y="3" fill="#64748B" fontSize="8">
                    {channel.type === 'BUS' ? '8b' : '1b'}
                  </text>
                </g>

                {/* Digital Waveform Trace */}
                {channel.type === 'DIGITAL' && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={channel.color}
                    strokeWidth="2"
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                    className="drop-shadow-sm"
                  />
                )}

                {/* Multi-Bit Bus Trace (ADDR BUS or DATA BUS) */}
                {channel.type === 'BUS' && (
                  <g>
                    {visibleSamples.map((sample, idx) => {
                      const xStart = LABEL_WIDTH + idx * stepWidth;
                      const xEnd = xStart + stepWidth;
                      const val =
                        channel.id === 'ADDR_BUS' ? sample.addressBus : sample.dataBus;
                      const isTri =
                        channel.id === 'DATA_BUS' ? sample.isDataBusTriStated : false;
                      const hexText = isTri
                        ? 'Hi-Z'
                        : channel.id === 'ADDR_BUS'
                        ? `0x${val.toString(16).toUpperCase().padStart(4, '0')}`
                        : `0x${val.toString(16).toUpperCase().padStart(2, '0')}`;

                      return (
                        <g key={`bus-${channel.id}-${idx}`}>
                          {isTri ? (
                            // High-Z single center dashed line
                            <line
                              x1={xStart}
                              y1={yMid}
                              x2={xEnd}
                              y2={yMid}
                              stroke="#64748B"
                              strokeWidth="1.5"
                              strokeDasharray="3,2"
                            />
                          ) : (
                            // Dual crossover diamond envelope
                            <g>
                              {/* Top wire */}
                              <line
                                x1={xStart + 2}
                                y1={yHigh + 2}
                                x2={xEnd - 2}
                                y2={yHigh + 2}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />
                              {/* Bottom wire */}
                              <line
                                x1={xStart + 2}
                                y1={yLow - 2}
                                x2={xEnd - 2}
                                y2={yLow - 2}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />
                              {/* Left & Right crossover transitions */}
                              <line
                                x1={xStart}
                                y1={yMid}
                                x2={xStart + 2}
                                y2={yHigh + 2}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={xStart}
                                y1={yMid}
                                x2={xStart + 2}
                                y2={yLow - 2}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={xEnd - 2}
                                y1={yHigh + 2}
                                x2={xEnd}
                                y2={yMid}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={xEnd - 2}
                                y1={yLow - 2}
                                x2={xEnd}
                                y2={yMid}
                                stroke={channel.color}
                                strokeWidth="1.5"
                              />

                              {/* Text value inside bus */}
                              {stepWidth >= 22 && (
                                <text
                                  x={xStart + stepWidth / 2}
                                  y={yMid + 3}
                                  textAnchor="middle"
                                  fill="#FFFFFF"
                                  fontSize={stepWidth < 35 ? '7' : '8.5'}
                                  fontWeight="bold"
                                >
                                  {hexText}
                                </text>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}

          {/* Measurement Cursor A Line & Badge */}
          {cursorA !== null && (
            (() => {
              const cAIdx = visibleSamples.findIndex((s) => s.cycle === cursorA);
              if (cAIdx !== -1) {
                const cAX = LABEL_WIDTH + cAIdx * stepWidth + stepWidth / 2;
                return (
                  <g>
                    <line
                      x1={cAX}
                      y1="0"
                      x2={cAX}
                      y2={TOTAL_HEIGHT}
                      stroke={themeColors.cursorA}
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      className="drop-shadow-md"
                    />
                    <polygon
                      points={`${cAX - 6},0 ${cAX + 6},0 ${cAX},10`}
                      fill={themeColors.cursorA}
                    />
                    <text
                      x={cAX}
                      y="20"
                      textAnchor="middle"
                      fill={themeColors.cursorA}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      A
                    </text>
                  </g>
                );
              }
              return null;
            })()
          )}

          {/* Measurement Cursor B Line & Badge */}
          {cursorB !== null && (
            (() => {
              const cBIdx = visibleSamples.findIndex((s) => s.cycle === cursorB);
              if (cBIdx !== -1) {
                const cBX = LABEL_WIDTH + cBIdx * stepWidth + stepWidth / 2;
                return (
                  <g>
                    <line
                      x1={cBX}
                      y1="0"
                      x2={cBX}
                      y2={TOTAL_HEIGHT}
                      stroke={themeColors.cursorB}
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      className="drop-shadow-md"
                    />
                    <polygon
                      points={`${cBX - 6},0 ${cBX + 6},0 ${cBX},10`}
                      fill={themeColors.cursorB}
                    />
                    <text
                      x={cBX}
                      y="20"
                      textAnchor="middle"
                      fill={themeColors.cursorB}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      B
                    </text>
                  </g>
                );
              }
              return null;
            })()
          )}
        </svg>
      </div>

      {/* 5. Educational Guide & Timing Reference Tabs */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">
              {language === 'hu' ? 'Hardver Időzítési Útmutató & Adatlap Elemzés' : 'Hardware Timing & Datasheet Reference Guide'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {(['OVERVIEW', 'SIGNALS', 'CYCLES', 'INTERACTIVE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveEduTab(tab)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeEduTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'OVERVIEW'
                  ? language === 'hu' ? '1. Áttekintés' : '1. Overview'
                  : tab === 'SIGNALS'
                  ? language === 'hu' ? '2. Vezérlő Vonalak' : '2. Control Lines'
                  : tab === 'CYCLES'
                  ? language === 'hu' ? '3. Gépi Ciklusok' : '3. Machine Cycles'
                  : language === 'hu' ? '4. Kísérlet' : '4. Lab Sandbox'}
              </button>
            ))}
          </div>
        </div>

        {activeEduTab === 'OVERVIEW' && (
          <div className="text-[11px] text-slate-300 leading-relaxed space-y-1.5">
            <p>
              {language === 'hu'
                ? 'A mikroszámítógépek vezérlőbusza az órajelhez (CLK) szinkronizált digitális négyszögjelekkel vezérli a RAM-ot, I/O egységeket és a processzort. A klasszikus processzorokban (pl. Zilog Z80, Intel 8085, MOS 6502) a vezérlőjelek szabványosított Aktív-Alacsony (Active-LOW, 0V) logikával működnek a jobb zajvédettség és a nyitott kollektoros (Open-Collector) felhúzó-ellenállások miatt.'
                : 'Microprocessor control buses coordinate RAM, I/O peripherals, and the CPU using digital square waves synchronized with the master clock (CLK). In classic architectures (Zilog Z80, Intel 8085, MOS 6502), control signals operate on Active-LOW (0V) logic for superior noise immunity and open-collector bus tying.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-bold">/MREQ (Memória Kérelem)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'hu' ? 'Aktív, ha a címbuszon érvényes RAM/ROM cím van' : 'Asserted when address bus holds a valid RAM/ROM address'}
                </div>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-rose-400 font-bold">/IORQ (I/O Kérelem)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'hu' ? 'Aktív, ha az alsó 8 címbittel perifériaportot címzünk' : 'Asserted when addressing I/O ports via lower 8 address lines'}
                </div>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-blue-400 font-bold">/RD és /WR (Írás/Olvasás)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'hu' ? 'Adatbusz irányítást és írási/olvasási kapuzást vezérel' : 'Gates data bus transfer direction and latching'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEduTab === 'SIGNALS' && (
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-300">/MREQ vs /IORQ Elválasztás:</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu'
                    ? 'A Z80 és 8085 független memória és I/O címtartományt használ (Port 0-255 vs RAM 0x0000-0xFFFF). Az /MREQ és /IORQ sosem lehet egyszerre aktív normál futáskor!'
                    : 'Z80/8085 use isolated I/O address spaces. /MREQ and /IORQ are mutually exclusive during standard execution.'}
                </p>
              </div>
              <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-300">Buszütközés Megelőzése (/RD & /WR):</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu'
                    ? 'Az /RD és /WR jelek szigorúan kizárják egymást. Amikor egyik sem aktív, az adatbusz lebegő (High-Z) állapotban van.'
                    : '/RD and /WR are strictly non-overlapping to prevent destructive bus contention. When neither is asserted, data bus floats in High-Z.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeEduTab === 'CYCLES' && (
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 bg-purple-950/40 rounded-lg border border-purple-800/60">
                <div className="font-bold text-purple-300">M1 (Utasítás-Betöltés):</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  /M1=0, /MREQ=0, /RD=0. A PC-ből beolvassa az utasításkódot (Opcode).
                </div>
              </div>
              <div className="p-2 bg-blue-950/40 rounded-lg border border-blue-800/60">
                <div className="font-bold text-blue-300">Memória Olvasás:</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  /MREQ=0, /RD=0, /M1=1. Operandusz vagy változó beolvasása a RAM-ból.
                </div>
              </div>
              <div className="p-2 bg-orange-950/40 rounded-lg border border-orange-800/60">
                <div className="font-bold text-orange-300">Memória Írás:</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  /MREQ=0, /WR=0, /RD=1. Eredmény végleges mentése a RAM-ba.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEduTab === 'INTERACTIVE' && (
          <div className="p-2 bg-cyan-950/30 rounded-lg border border-cyan-800/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">
                {language === 'hu' ? 'Interaktív Kurzormérés Gyakorlat:' : 'Interactive Cursor Measurement Practice:'}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'hu' ? 'Kattints két tetszőleges pontra a diagramon!' : 'Click any two points on the diagram above!'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              {language === 'hu'
                ? `Jelenleg kiválasztott időkülönbség: ${deltaCycles !== null ? `${deltaCycles} órajel ciklus (${estimatedTimeUs} µs)` : 'Nincs mérve'}. Figyeld meg, hogy a memóriaciklusok (T1-T4) alatt pontosan mikor vált át az /MREQ és /RD, illetve hogy a cím mikor stabilizálódik a címbuszon az adat mintavétele előtt (Setup Time $t_{AS}$).`
                : `Currently measured time delta: ${deltaCycles !== null ? `${deltaCycles} clock cycles (~${estimatedTimeUs} µs)` : 'None'}. Observe setup and hold times ($t_{AS}, t_{DH}$) relative to strobe edges.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
