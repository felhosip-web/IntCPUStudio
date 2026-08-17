import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  C64BusType,
  C64IcId,
  C64IcSpec,
  C64Scenario,
  C64ScenarioId,
  PlaInputState,
} from '../../types/c64Architecture';
import {
  C64_CUSTOM_ICS,
  C64_SCENARIOS,
  calculatePlaMemoryMap,
} from '../../core/c64ArchitectureData';
import { useI18n } from '../../i18n/I18nContext';
import { sidAudio } from '../../core/c64Audio';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  Layers,
  Maximize2,
  Minimize2,
  Music,
  Play,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';

interface C64ArchitectureSchematicProps {
  onSelectIc?: (icId: C64IcId) => void;
}

export const C64ArchitectureSchematic: React.FC<C64ArchitectureSchematicProps> = ({
  onSelectIc,
}) => {
  const { language } = useI18n();

  // Active view sub-tab
  const [subView, setSubView] = useState<'schematic' | 'scenarios' | 'pla' | 'chips'>('schematic');

  // Selected chip for deep-dive inspector
  const [selectedChipId, setSelectedChipId] = useState<C64IcId>('MOS_6510');

  // Clock Phase Simulation State
  const [currentPhase, setCurrentPhase] = useState<'PHI_1' | 'PHI_2'>('PHI_2');
  const [isClockAutoRunning, setIsClockAutoRunning] = useState<boolean>(false);
  const [clockSpeedHz, setClockSpeedHz] = useState<number>(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<C64ScenarioId>('PHASE_INTERLEAVING');
  const [scenarioStepIndex, setScenarioStepIndex] = useState<number>(0);
  const [isScenarioAutoPlay, setIsScenarioAutoPlay] = useState<boolean>(false);

  // PLA Configurator State
  const [plaInputs, setPlaInputs] = useState<PlaInputState>({
    loram: true,
    hiram: true,
    charen: true,
    game: true,
    exrom: true,
    ba: true,
    aec: true,
  });

  const selectedChip: C64IcSpec = useMemo(() => {
    return C64_CUSTOM_ICS[selectedChipId] || C64_CUSTOM_ICS.MOS_6510;
  }, [selectedChipId]);

  const activeScenario: C64Scenario = useMemo(() => {
    return C64_SCENARIOS.find((s) => s.id === selectedScenarioId) || C64_SCENARIOS[0];
  }, [selectedScenarioId]);

  const currentScenarioStep = activeScenario.steps[scenarioStepIndex] || activeScenario.steps[0];

  const plaMemorySlices = useMemo(() => {
    return calculatePlaMemoryMap(plaInputs);
  }, [plaInputs]);

  // Auto-Clock Generator Timer
  useEffect(() => {
    if (!isClockAutoRunning || subView !== 'schematic') return;

    const intervalMs = Math.max(200, 1000 / clockSpeedHz);
    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = prev === 'PHI_1' ? 'PHI_2' : 'PHI_1';
        if (isSoundEnabled) {
          try {
            sidAudio.playKeyClick();
          } catch {
            // Ignore audio error
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isClockAutoRunning, clockSpeedHz, isSoundEnabled, subView]);

  // Scenario Auto-Play Timer
  useEffect(() => {
    if (!isScenarioAutoPlay || subView !== 'scenarios') return;

    const timer = setInterval(() => {
      setScenarioStepIndex((prev) => {
        const next = (prev + 1) % activeScenario.steps.length;
        if (isSoundEnabled) {
          try {
            sidAudio.playKeyClick();
          } catch {
            // Audio ignore
          }
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isScenarioAutoPlay, activeScenario.steps.length, isSoundEnabled, subView]);

  const handleStepManualPhase = () => {
    setCurrentPhase((prev) => (prev === 'PHI_1' ? 'PHI_2' : 'PHI_1'));
    if (isSoundEnabled) {
      sidAudio.playKeyClick();
    }
  };

  const handleSelectChip = (chipId: C64IcId) => {
    setSelectedChipId(chipId);
    if (onSelectIc) {
      onSelectIc(chipId);
    }
  };

  const handleApplyPlaPreset = (preset: 'DEFAULT' | 'ALL_RAM' | 'CHAR_ROM' | 'CARTRIDGE_16K' | 'ULTIMAX') => {
    if (preset === 'DEFAULT') {
      setPlaInputs({ loram: true, hiram: true, charen: true, game: true, exrom: true, ba: true, aec: true });
    } else if (preset === 'ALL_RAM') {
      setPlaInputs({ loram: false, hiram: false, charen: false, game: true, exrom: true, ba: true, aec: true });
    } else if (preset === 'CHAR_ROM') {
      setPlaInputs({ loram: true, hiram: true, charen: false, game: true, exrom: true, ba: true, aec: true });
    } else if (preset === 'CARTRIDGE_16K') {
      setPlaInputs({ loram: true, hiram: true, charen: true, game: false, exrom: false, ba: true, aec: true });
    } else if (preset === 'ULTIMAX') {
      setPlaInputs({ loram: false, hiram: true, charen: true, game: true, exrom: false, ba: true, aec: true });
    }
    if (isSoundEnabled) {
      sidAudio.playDriveStep(2);
    }
  };

  // Determine active chips and buses based on current view/phase/scenario
  const { activeChipSet, currentBusSignals } = useMemo(() => {
    if (subView === 'scenarios') {
      const activeChips = new Set<C64IcId>(currentScenarioStep.activeChips);
      const activeBuses = currentScenarioStep.activeBuses;
      return { activeChipSet: activeChips, currentBusSignals: activeBuses };
    }

    // Default Schematic View phase logic
    const activeChips = new Set<C64IcId>();
    const activeBuses: { bus: C64BusType; from: C64IcId; to: C64IcId; signalName: string; valueHex?: string }[] = [];

    if (currentPhase === 'PHI_1') {
      // VIC-II Bus Master
      activeChips.add('MOS_6569_VIC2');
      activeChips.add('DRAM_64K');
      activeChips.add('SRAM_2114_COLOR');
      activeBuses.push({
        bus: 'ADDRESS',
        from: 'MOS_6569_VIC2',
        to: 'DRAM_64K',
        signalName: 'VIC-II Matrix Fetch (A0-A13)',
        valueHex: '$0400',
      });
      activeBuses.push({
        bus: 'DATA',
        from: 'DRAM_64K',
        to: 'MOS_6569_VIC2',
        signalName: 'Character Code (D0-D7)',
        valueHex: '$01 (A)',
      });
      activeBuses.push({
        bus: 'DATA',
        from: 'SRAM_2114_COLOR',
        to: 'MOS_6569_VIC2',
        signalName: 'Color Nybble (D0-D3)',
        valueHex: '$0E',
      });
    } else {
      // 6510 CPU Bus Master
      activeChips.add('MOS_6510');
      activeChips.add('MOS_82S100_PLA');
      activeChips.add('ROM_KERNAL');
      activeChips.add('DRAM_64K');
      activeBuses.push({
        bus: 'ADDRESS',
        from: 'MOS_6510',
        to: 'MOS_82S100_PLA',
        signalName: 'CPU Program Counter (A0-A15)',
        valueHex: '$E544',
      });
      activeBuses.push({
        bus: 'CONTROL',
        from: 'MOS_82S100_PLA',
        to: 'ROM_KERNAL',
        signalName: '/KERNAL Active (LOW)',
      });
      activeBuses.push({
        bus: 'DATA',
        from: 'ROM_KERNAL',
        to: 'MOS_6510',
        signalName: 'Instruction Opcode (D0-D7)',
        valueHex: '$A9 (LDA)',
      });
    }

    return { activeChipSet: activeChips, currentBusSignals: activeBuses };
  }, [subView, currentPhase, currentScenarioStep]);

  return (
    <div className="flex flex-col gap-5 bg-[#0b0f19] text-slate-200 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-wide text-white flex items-center gap-2">
                <span>COMMODORE 64 HARDWARE SCHEMATIC & CUSTOM ICs</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  MOS TECH ARCHITECTURE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hu'
                  ? 'Interaktív alaplapi áramköri séma, cél IC-k (6510, VIC-II, SID, PLA, CIA 1/2), busz animációk & dinamikus memóriatérkép.'
                  : 'Interactive motherboard schematic, dedicated custom ICs (6510, VIC-II, SID, PLA, CIA 1/2), bus animations & dynamic memory mapping.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-View Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#131927] p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setSubView('schematic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subView === 'schematic'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Alaplapi Séma & Buszok' : 'Motherboard Schematic'}</span>
          </button>

          <button
            onClick={() => setSubView('scenarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subView === 'scenarios'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Animált Szcenáriók' : 'Animated Scenarios'}</span>
          </button>

          <button
            onClick={() => setSubView('pla')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subView === 'pla'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'PLA Memória Bankváltás' : 'PLA Memory Mapping'}</span>
          </button>

          <button
            onClick={() => setSubView('chips')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subView === 'chips'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Cél IC Elemző & Lábkiosztás' : 'Custom IC Inspector'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE MOTHERBOARD SCHEMATIC & REAL-TIME BUS SHARING */}
      {subView === 'schematic' && (
        <div className="flex flex-col gap-5">
          {/* Phase Clock Controller Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131927] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">
                {language === 'hu' ? 'Rendszer Órajel Fázis:' : 'System Clock Phase:'}
              </span>

              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                    currentPhase === 'PHI_1'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Φ1: VIC-II VIDEO BUS</span>
                </div>

                <div
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                    currentPhase === 'PHI_2'
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Φ2: 6510 CPU BUS</span>
                </div>
              </div>
            </div>

            {/* Manual Step & Auto-Run Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleStepManualPhase}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hu' ? 'Fázis Léptetés' : 'Step Clock'}</span>
              </button>

              <button
                onClick={() => setIsClockAutoRunning((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  isClockAutoRunning
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isClockAutoRunning ? (language === 'hu' ? 'Szünet' : 'Pause') : (language === 'hu' ? 'Folyamatos Órajel' : 'Auto Clock')}</span>
              </button>

              <select
                value={clockSpeedHz}
                onChange={(e) => setClockSpeedHz(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono cursor-pointer"
              >
                <option value={0.5}>0.5 Hz</option>
                <option value={1}>1.0 Hz (1s / ciklus)</option>
                <option value={2}>2.0 Hz</option>
                <option value={4}>4.0 Hz (Gyors)</option>
              </select>

              <button
                onClick={() => setIsSoundEnabled((prev) => !prev)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                title={isSoundEnabled ? 'Hang kikapcsolása' : 'Hang bekapcsolása'}
              >
                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Motherboard Circuit Board Grid */}
          <div className="relative bg-[#0d131f] rounded-2xl border-2 border-slate-800 p-5 overflow-x-auto">
            {/* Bus legend header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hu' ? 'Busz Vonalak:' : 'Bus Topology:'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <span className="w-2 h-0.5 bg-amber-400 inline-block" /> ADDRESS BUS (A0..A15)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> DATA BUS (D0..D7)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> CONTROL BUS (Φ1/Φ2, /CS, R/W, IRQ)
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {language === 'hu' ? 'Kattints bármelyik IC-re a részletes adatlap megtekintéséhez!' : 'Click any IC to inspect internal registers & pinout!'}
              </div>
            </div>

            {/* Motherboard Grid of IC Chips */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* MOS 6510 CPU */}
              <div
                onClick={() => handleSelectChip('MOS_6510')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_6510')
                    ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : selectedChipId === 'MOS_6510'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    U7 • DIP-40
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">0.985 MHz</span>
                </div>
                <h3 className="text-sm font-black text-white">MOS 6510 CPU</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? '8-bites CPU + 6-bites I/O port ($00/$01) a PLA bankváltáshoz.' : '8-bit CPU + 6-bit I/O port ($00/$01) for PLA bank switching.'}
                </p>
                {activeChipSet.has('MOS_6510') && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ACTIVE IN Φ2: PC = $E544</span>
                  </div>
                )}
              </div>

              {/* MOS 82S100 PLA */}
              <div
                onClick={() => handleSelectChip('MOS_82S100_PLA')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_82S100_PLA')
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : selectedChipId === 'MOS_82S100_PLA'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    U17 • DIP-28
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Logic Array</span>
                </div>
                <h3 className="text-sm font-black text-white">82S100 / 8722 PLA</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Memóriavezérlő: /BASIC, /KERNAL, /CHAROM, /IO chip select vonalak.' : 'Memory Arbiter: decodes address & port bits to drive /CS lines.'}
                </p>
                {activeChipSet.has('MOS_82S100_PLA') && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                    <span>SELECT: /KERNAL = LOW</span>
                  </div>
                )}
              </div>

              {/* MOS 6569 VIC-II */}
              <div
                onClick={() => handleSelectChip('MOS_6569_VIC2')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_6569_VIC2')
                    ? 'bg-blue-950/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : selectedChipId === 'MOS_6569_VIC2'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    U19 • DIP-40
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">7.88 MHz Dot</span>
                </div>
                <h3 className="text-sm font-black text-white">MOS 6569 VIC-II</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Videóvezérlő: 8 hardveres sprite, raszterszámláló, Bad Line DMA.' : 'Video Processor: 8 hardware sprites, raster beam IRQ, Bad Line DMA.'}
                </p>
                {activeChipSet.has('MOS_6569_VIC2') && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>ACTIVE IN Φ1: READING $0400</span>
                  </div>
                )}
              </div>

              {/* MOS 6581 SID */}
              <div
                onClick={() => handleSelectChip('MOS_6581_SID')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_6581_SID')
                    ? 'bg-pink-950/30 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : selectedChipId === 'MOS_6581_SID'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">
                    U18 • DIP-28
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">3 Voices + Filter</span>
                </div>
                <h3 className="text-sm font-black text-white">MOS 6581 / 8580 SID</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? '3-szólamú szintetizátor, analóg rezonáns szűrő, ADSR, 2x Paddle ADC.' : '3-voice polyphonic synthesizer, analog resonant filter, ADSR, Paddle ADC.'}
                </p>
              </div>

              {/* MOS 6526 CIA 1 */}
              <div
                onClick={() => handleSelectChip('MOS_6526_CIA1')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_6526_CIA1')
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : selectedChipId === 'MOS_6526_CIA1'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    U1 • DIP-40
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">$DC00</span>
                </div>
                <h3 className="text-sm font-black text-white">MOS 6526 CIA 1</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Billentyűzet 8x8 mátrix, Botkormány 1 & 2, Timerek, 60Hz Rendszer IRQ.' : 'Keyboard 8x8 matrix scan, Joysticks 1 & 2, Timers A/B, 60Hz IRQ.'}
                </p>
              </div>

              {/* MOS 6526 CIA 2 */}
              <div
                onClick={() => handleSelectChip('MOS_6526_CIA2')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('MOS_6526_CIA2')
                    ? 'bg-purple-950/30 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : selectedChipId === 'MOS_6526_CIA2'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    U2 • DIP-40
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">$DD00</span>
                </div>
                <h3 className="text-sm font-black text-white">MOS 6526 CIA 2</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'VIC-II 16KB bankváltás, IEC soros busz (1541 Floppy), User Port, NMI.' : 'VIC-II 16KB bank switch, IEC serial bus (1541 floppy), User Port, NMI.'}
                </p>
              </div>

              {/* 64KB DRAM Matrix */}
              <div
                onClick={() => handleSelectChip('DRAM_64K')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('DRAM_64K')
                    ? 'bg-blue-950/30 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : selectedChipId === 'DRAM_64K'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    8x 4164 DRAM
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">65,536 Bytes</span>
                </div>
                <h3 className="text-sm font-black text-white">64KB System DRAM</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Fő operatív memória automatikus VIC-II dinamikus frissítéssel.' : 'Main memory with automatic VIC-II dynamic refresh during H-blank.'}
                </p>
              </div>

              {/* 2114 Color RAM */}
              <div
                onClick={() => handleSelectChip('SRAM_2114_COLOR')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('SRAM_2114_COLOR')
                    ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : selectedChipId === 'SRAM_2114_COLOR'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    U6 • 2114 SRAM
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">1024 x 4-Bit</span>
                </div>
                <h3 className="text-sm font-black text-white">Color RAM ($D800)</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? '1000 karaktercella 4-bites előtérszíne a képernyőn.' : 'Stores 4-bit foreground color for each of the 1000 character cells.'}
                </p>
              </div>

              {/* BASIC ROM (U3) */}
              <div
                onClick={() => handleSelectChip('ROM_BASIC')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('ROM_BASIC')
                    ? 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : selectedChipId === 'ROM_BASIC'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    U3 • 901226-01
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">8KB ($A000)</span>
                </div>
                <h3 className="text-sm font-black text-white">BASIC V2 ROM</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Commodore BASIC V2 parancsértelmező és futtatókörnyezet.' : 'Commodore BASIC V2 runtime interpreter.'}
                </p>
              </div>

              {/* KERNAL ROM (U4) */}
              <div
                onClick={() => handleSelectChip('ROM_KERNAL')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('ROM_KERNAL')
                    ? 'bg-teal-950/30 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                    : selectedChipId === 'ROM_KERNAL'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                    U4 • 901227-03
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">8KB ($E000)</span>
                </div>
                <h3 className="text-sm font-black text-white">KERNAL ROM</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Operációs rendszer, periféria meghajtók és hardveres vektorok.' : 'OS, I/O drivers, standardized jump table and CPU vectors.'}
                </p>
              </div>

              {/* CHARGEN ROM (U5) */}
              <div
                onClick={() => handleSelectChip('ROM_CHARGEN')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  activeChipSet.has('ROM_CHARGEN')
                    ? 'bg-violet-950/30 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : selectedChipId === 'ROM_CHARGEN'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                    U5 • 901225-01
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">4KB ($D000)</span>
                </div>
                <h3 className="text-sm font-black text-white">Character ROM</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? '512 darab 8x8 pixeles PETSCII betűkép mátrix.' : '512 PETSCII 8x8 font glyph bitmaps.'}
                </p>
              </div>

              {/* Expansion Cartridge Port */}
              <div
                onClick={() => handleSelectChip('PORT_CARTRIDGE')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  selectedChipId === 'PORT_CARTRIDGE'
                    ? 'bg-slate-800/80 border-slate-500'
                    : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    CN5 • 44-Pin
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Bus Extension</span>
                </div>
                <h3 className="text-sm font-black text-white">Cartridge Port</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {language === 'hu' ? 'Közvetlen buszkivezetés, GAME/EXROM vonalak, DMA átvétel.' : 'Direct system bus, GAME/EXROM lines, DMA takeover capability.'}
                </p>
              </div>
            </div>

            {/* Live Bus Transmission Indicator Box */}
            <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>{language === 'hu' ? 'Aktív Busz Átvitel:' : 'Live Bus Signal Flow:'}</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {currentBusSignals.map((sig, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-600 text-white flex items-center gap-1.5"
                    >
                      <span className="text-amber-400">{sig.from.replace('MOS_', '')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-cyan-400">{sig.to.replace('MOS_', '')}</span>
                      <span className="text-slate-400">[{sig.signalName}]</span>
                      {sig.valueHex && <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded">{sig.valueHex}</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {currentPhase === 'PHI_1'
                  ? (language === 'hu' ? 'Phase 1 (Φ1): A VIC-II olvassa a videó memóriát' : 'Phase 1 (Φ1): VIC-II reads video matrix')
                  : (language === 'hu' ? 'Phase 2 (Φ2): A 6510 CPU hajtja végre a gépi kódot' : 'Phase 2 (Φ2): 6510 CPU executes machine code')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ANIMATED OPERATIONAL SCENARIOS */}
      {subView === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Scenario Selector Menu */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {language === 'hu' ? 'Válassz Szcenáriót:' : 'Select Hardware Scenario:'}
            </h3>

            {C64_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioId(sc.id);
                    setScenarioStepIndex(0);
                    if (isSoundEnabled) sidAudio.playKeyClick();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                      : 'bg-[#131927] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      {sc.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sc.steps.length} {language === 'hu' ? 'lépés' : 'steps'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    {language === 'hu' ? sc.titleHu : sc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {language === 'hu' ? sc.summaryHu : sc.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Step-by-Step Scenario Player */}
          <div className="lg:col-span-8 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
            {/* Scenario Header with Play/Pause Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                  <span>{language === 'hu' ? activeScenario.titleHu : activeScenario.title}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hu' ? activeScenario.summaryHu : activeScenario.summary}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsScenarioAutoPlay((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    isScenarioAutoPlay
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isScenarioAutoPlay ? (language === 'hu' ? 'Leállítás' : 'Pause') : (language === 'hu' ? 'Auto Lejátszás' : 'Auto Play')}</span>
                </button>
              </div>
            </div>

            {/* Step Navigation Dots */}
            <div className="flex items-center gap-2">
              {activeScenario.steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setScenarioStepIndex(idx);
                    if (isSoundEnabled) sidAudio.playKeyClick();
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold text-center transition cursor-pointer border ${
                    idx === scenarioStepIndex
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : idx < scenarioStepIndex
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {language === 'hu' ? `${idx + 1}. Lépés` : `Step ${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Current Step Detailed Card */}
            <div className="p-4 rounded-xl bg-[#131927] border border-cyan-900/50 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-cyan-300">
                  {language === 'hu' ? currentScenarioStep.titleHu : currentScenarioStep.title}
                </h4>

                <div className="flex items-center gap-1.5">
                  {currentScenarioStep.statusBadges?.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'hu' ? currentScenarioStep.descriptionHu : currentScenarioStep.description}
              </p>

              {/* Active Chip & Bus Traffic Badges */}
              <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hu' ? 'Hardver Állapot Ebben a Lépésben:' : 'Hardware Signals in this Step:'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono">
                    <span className="text-slate-400">{language === 'hu' ? 'Érintett IC-k:' : 'Active ICs:'}</span>
                    <span className="text-amber-300 font-bold">
                      {currentScenarioStep.activeChips.map((c) => c.replace('MOS_', '')).join(', ')}
                    </span>
                  </div>

                  {currentScenarioStep.activeBuses.map((bus, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-800 text-xs font-mono text-cyan-200"
                    >
                      <span className="text-amber-400">{bus.from.replace('MOS_', '')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-400">{bus.to.replace('MOS_', '')}</span>
                      <span className="text-slate-300 font-bold">: {bus.signalName}</span>
                      {bus.valueHex && <span className="bg-cyan-950 px-1 rounded text-cyan-400">{bus.valueHex}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next / Previous Step Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={scenarioStepIndex === 0}
                onClick={() => {
                  setScenarioStepIndex((prev) => Math.max(0, prev - 1));
                  if (isSoundEnabled) sidAudio.playKeyClick();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {language === 'hu' ? '← Előző Lépés' : '← Previous Step'}
              </button>

              <button
                disabled={scenarioStepIndex === activeScenario.steps.length - 1}
                onClick={() => {
                  setScenarioStepIndex((prev) => Math.min(activeScenario.steps.length - 1, prev + 1));
                  if (isSoundEnabled) sidAudio.playKeyClick();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{language === 'hu' ? 'Következő Lépés →' : 'Next Step →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PLA DYNAMIC MEMORY MAPPING CONFIGURATOR */}
      {subView === 'pla' && (
        <div className="flex flex-col gap-5">
          {/* PLA Configurator Controls & Presets */}
          <div className="bg-[#131927] p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{language === 'hu' ? 'PLA Bemeneti Vezérlőbitek (CPU Port $0001 & Bővítőkártya)' : 'PLA Input Control Bits (CPU Port $0001 & Cartridge)'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hu'
                    ? 'A 6510 CPU beépített portjának bitjeivel és a kártyavonalakkal a 64KB-os címtér dinamikusan átkonfigurálható.'
                    : 'Toggle CPU $01 on-chip port bits and cartridge lines to see real-time 64KB memory bank switching.'}
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleApplyPlaPreset('DEFAULT')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Standard BASIC ($37)
                </button>
                <button
                  onClick={() => handleApplyPlaPreset('ALL_RAM')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  All 64KB RAM ($30)
                </button>
                <button
                  onClick={() => handleApplyPlaPreset('CHAR_ROM')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Character ROM ($33)
                </button>
                <button
                  onClick={() => handleApplyPlaPreset('CARTRIDGE_16K')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  16KB Cartridge
                </button>
                <button
                  onClick={() => handleApplyPlaPreset('ULTIMAX')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Ultimax Mode
                </button>
              </div>
            </div>

            {/* Bit Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* LORAM */}
              <button
                onClick={() => setPlaInputs((prev) => ({ ...prev, loram: !prev.loram }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  plaInputs.loram
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">LORAM (Bit 0)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${plaInputs.loram ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>
                    {plaInputs.loram ? '1 (HIGH)' : '0 (LOW)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {plaInputs.loram ? 'BASIC ROM at $A000' : 'RAM at $A000'}
                </div>
              </button>

              {/* HIRAM */}
              <button
                onClick={() => setPlaInputs((prev) => ({ ...prev, hiram: !prev.hiram }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  plaInputs.hiram
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">HIRAM (Bit 1)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${plaInputs.hiram ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>
                    {plaInputs.hiram ? '1 (HIGH)' : '0 (LOW)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {plaInputs.hiram ? 'KERNAL ROM at $E000' : 'RAM at $E000'}
                </div>
              </button>

              {/* CHAREN */}
              <button
                onClick={() => setPlaInputs((prev) => ({ ...prev, charen: !prev.charen }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  plaInputs.charen
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">CHAREN (Bit 2)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${plaInputs.charen ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>
                    {plaInputs.charen ? '1 (HIGH)' : '0 (LOW)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {plaInputs.charen ? 'I/O Chips at $D000' : 'CHAR ROM at $D000'}
                </div>
              </button>

              {/* GAME */}
              <button
                onClick={() => setPlaInputs((prev) => ({ ...prev, game: !prev.game }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  !plaInputs.game
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">/GAME (Cart)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${!plaInputs.game ? 'bg-rose-500 text-white' : 'bg-slate-800'}`}>
                    {plaInputs.game ? '1 (High-Z)' : '0 (GND)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {!plaInputs.game ? '8K Cartridge Mapped' : 'No 8K Cartridge'}
                </div>
              </button>

              {/* EXROM */}
              <button
                onClick={() => setPlaInputs((prev) => ({ ...prev, exrom: !prev.exrom }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  !plaInputs.exrom
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">/EXROM (Cart)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${!plaInputs.exrom ? 'bg-rose-500 text-white' : 'bg-slate-800'}`}>
                    {plaInputs.exrom ? '1 (High-Z)' : '0 (GND)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {!plaInputs.exrom ? '16K / Ultimax Mode' : 'No 16K Cartridge'}
                </div>
              </button>
            </div>
          </div>

          {/* Real-time 64KB Segmented Memory Map */}
          <div className="bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'hu' ? 'Aktuális 64KB Memóriatérkép a CPU Szemszögéből:' : 'Resulting 64KB Memory Map seen by CPU:'}
            </h4>

            {/* Visual Memory Map Bar */}
            <div className="flex h-10 w-full rounded-xl overflow-hidden border border-slate-700 shadow-inner">
              {plaMemorySlices.map((slice, idx) => {
                const widthPercent = (slice.sizeKb / 64) * 100;
                return (
                  <div
                    key={idx}
                    style={{ width: `${widthPercent}%`, backgroundColor: slice.color }}
                    className="h-full flex items-center justify-center text-[10px] font-bold font-mono text-white truncate px-1 border-r border-black/30 hover:opacity-90 transition cursor-help"
                    title={`${slice.range}: ${language === 'hu' ? slice.currentMappingHu : slice.currentMapping}`}
                  >
                    {slice.range.split(' - ')[0]}
                  </div>
                );
              })}
            </div>

            {/* Detailed Memory Slices Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {plaMemorySlices.map((slice, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#131927] border border-slate-800 flex items-start gap-3"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-white">{slice.range}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {slice.sizeKb} KB
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      {language === 'hu' ? slice.currentMappingHu : slice.currentMapping}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {language === 'hu' ? slice.descriptionHu : slice.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CUSTOM IC DEEP-DIVE & PINOUT INSPECTOR */}
      {subView === 'chips' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Chip Selector Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {language === 'hu' ? 'Válassz Cél IC-t:' : 'Select Custom IC:'}
            </h3>

            {Object.values(C64_CUSTOM_ICS).map((chip) => {
              const isSelected = chip.id === selectedChipId;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    handleSelectChip(chip.id);
                    if (isSoundEnabled) sidAudio.playKeyClick();
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-md text-white'
                      : 'bg-[#131927] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                        {chip.chipDesignator}
                      </span>
                      <span className="text-xs font-bold text-white">{chip.partNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {language === 'hu' ? chip.nameHu : chip.name}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Chip Deep-Dive Data Sheet */}
          <div className="lg:col-span-8 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedChip.chipDesignator} • {selectedChip.packageType}
                  </span>
                  {selectedChip.designer && (
                    <span className="text-xs text-slate-400 font-mono">
                      Designer: {selectedChip.designer}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedChip.partNumber} - {language === 'hu' ? selectedChip.nameHu : selectedChip.name}
                </h3>
              </div>

              {selectedChip.clockSpeed && (
                <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-amber-300 border border-slate-700">
                  {selectedChip.clockSpeed}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hu' ? selectedChip.detailedDescriptionHu : selectedChip.detailedDescription}
            </p>

            {/* Internal Blocks */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'hu' ? 'Belső Architektúrális Blokk-Egységek:' : 'Internal Architectural Blocks:'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {selectedChip.internalBlocks.map((block, idx) => (
                  <div key={idx} className="p-3 bg-[#131927] rounded-xl border border-slate-800">
                    <h5 className="text-xs font-bold text-amber-300">
                      {language === 'hu' ? block.titleHu : block.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {language === 'hu' ? block.descriptionHu : block.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Registers Table (if any) */}
            {selectedChip.registers && selectedChip.registers.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hu' ? 'Fő Memóriába Leképezett Regiszterek:' : 'Memory Mapped Registers:'}
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">{language === 'hu' ? 'Cím' : 'Address'}</th>
                        <th className="p-2">{language === 'hu' ? 'Név' : 'Name'}</th>
                        <th className="p-2">{language === 'hu' ? 'Bitek' : 'Bits'}</th>
                        <th className="p-2">{language === 'hu' ? 'Leírás' : 'Description'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#131927]">
                      {selectedChip.registers.map((reg, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2 text-amber-400 font-bold">{reg.address}</td>
                          <td className="p-2 text-white font-bold">{reg.name}</td>
                          <td className="p-2 text-cyan-300 text-[11px]">{reg.bits}</td>
                          <td className="p-2 text-slate-300 text-[11px]">
                            {language === 'hu' ? reg.descriptionHu : reg.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pinout Table */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'hu' ? `Lábkiosztás (${selectedChip.packageType}):` : `Pinout (${selectedChip.packageType}):`}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedChip.pins.map((pin, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#131927] rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {pin.pinNumber}
                      </span>
                      <span className="font-bold text-white">{pin.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 text-right truncate max-w-[200px]">
                      {language === 'hu' ? pin.descriptionHu : pin.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trivia Box */}
            {selectedChip.trivia && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    {language === 'hu' ? 'Történelmi Érdekesség:' : 'Historical Trivia:'}
                  </div>
                  <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                    {language === 'hu' ? selectedChip.trivia.hu : selectedChip.trivia.en}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
