import React, { useEffect, useMemo, useState } from 'react';
import {
  TurboCartridgeModel,
  TurboCartridgeState,
  TurboCartridgeType,
  TurboCheatPreset,
} from '../../types/c64TurboCartridge';
import {
  SAMPLE_SPRITES,
  SpriteTemplate,
  TURBO_CARTRIDGE_MODELS,
  TURBO_CHEAT_PRESETS,
  TURBO_PROTOCOL_COMPARISON,
} from '../../core/c64TurboCartridgeData';
import { C64_PALETTE, C64State } from '../../types/c64';
import { useI18n } from '../../i18n/I18nContext';
import { sidAudio } from '../../core/c64Audio';
import {
  Activity,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Download,
  Eye,
  Flame,
  Gauge,
  HardDrive,
  Layers,
  Lock,
  Music,
  Pause,
  Play,
  Power,
  RefreshCw,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Tv,
  Upload,
  Volume2,
  Wrench,
  Zap,
} from 'lucide-react';

interface C64TurboCartridgeStudioProps {
  c64State: C64State;
  turboState: TurboCartridgeState;
  onUpdateTurboState: (updater: (prev: TurboCartridgeState) => TurboCartridgeState) => void;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onResetC64: () => void;
  onInjectPoke: (address: number, value: number) => void;
  onSaveSnapshotToDisk?: (snapshotName: string) => void;
  onRestoreSnapshot?: () => void;
  onTriggerFastloadDemo?: () => void;
}

export const C64TurboCartridgeStudio: React.FC<C64TurboCartridgeStudioProps> = ({
  c64State,
  turboState,
  onUpdateTurboState,
  onFreeze,
  onUnfreeze,
  onResetC64,
  onInjectPoke,
  onSaveSnapshotToDisk,
  onRestoreSnapshot,
}) => {
  const { language } = useI18n();

  // Active studio view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'freeze_menu' | 'fastload_tech' | 'supercpu_bench'>('overview');

  // Custom POKE input state
  const [customPokeAddr, setCustomPokeAddr] = useState<string>('53280');
  const [customPokeVal, setCustomPokeVal] = useState<string>('0');
  const [pokeSuccessMsg, setPokeSuccessMsg] = useState<string | null>(null);

  // Sprite Ripper State
  const [selectedSpriteIdx, setSelectedSpriteIdx] = useState<number>(0);
  const [customSpriteMatrix, setCustomSpriteMatrix] = useState<number[]>(SAMPLE_SPRITES[0].bitmap);
  const [spriteColor, setSpriteColor] = useState<number>(7);

  // Fastload Protocol Simulator State
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState<boolean>(false);
  const [transferProgress, setTransferProgress] = useState<number>(0);
  const [transferMode, setTransferMode] = useState<'stock' | 'turbo'>('turbo');
  const [transferBytes, setTransferBytes] = useState<number>(0);

  // SuperCPU Benchmark State
  const [benchStatus, setBenchStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [benchProgress, setBenchProgress] = useState<number>(0);
  const [benchStockTimeMs, setBenchStockTimeMs] = useState<number>(2450);
  const [benchSuperCpuTimeMs, setBenchSuperCpuTimeMs] = useState<number>(122);
  const [benchScoreMultiplier, setBenchScoreMultiplier] = useState<number>(20.1);

  const currentModel: TurboCartridgeModel = useMemo(() => {
    return TURBO_CARTRIDGE_MODELS[turboState.activeModel] || TURBO_CARTRIDGE_MODELS.FINAL_CARTRIDGE_3;
  }, [turboState.activeModel]);

  // Handle Model Change
  const handleSelectModel = (modelId: TurboCartridgeType) => {
    onUpdateTurboState((prev) => ({
      ...prev,
      activeModel: modelId,
      cpuSpeedMultiplier: modelId === 'SUPER_CPU_20MHZ' ? 20 : 1,
    }));
    sidAudio.playKeyClick();
  };

  // Toggle Cartridge Plugged In/Out
  const handleToggleCartridge = () => {
    onUpdateTurboState((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
      isFrozen: false,
    }));
    sidAudio.playDriveStep(3);
  };

  // Handle Hardware Freeze Button Click
  const handleHardwareFreeze = () => {
    if (!turboState.isEnabled) {
      // Auto-enable if user pushes freeze on unplugged cartridge
      onUpdateTurboState((prev) => ({ ...prev, isEnabled: true }));
    }
    if (turboState.isFrozen) {
      onUnfreeze();
      sidAudio.playKeyClick();
    } else {
      onFreeze();
      setActiveTab('freeze_menu');
      sidAudio.playBootJingle();
    }
  };

  // Handle POKE Injection
  const handleApplyPoke = (address: number, value: number, desc: string) => {
    onInjectPoke(address, value);
    onUpdateTurboState((prev) => ({
      ...prev,
      activePokes: [
        ...prev.activePokes.filter((p) => p.address !== address),
        { id: `poke-${Date.now()}-${address}`, address, value, description: desc, enabled: true },
      ],
    }));
    setPokeSuccessMsg(`POKE ${address}, ${value} (${desc}) Applied!`);
    setTimeout(() => setPokeSuccessMsg(null), 3000);
    sidAudio.playKeyClick();
  };

  const handleApplyCustomPoke = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = parseInt(customPokeAddr, 10);
    const val = parseInt(customPokeVal, 10);
    if (isNaN(addr) || addr < 0 || addr > 65535) {
      alert(language === 'hu' ? 'Érvénytelen cím (0 - 65535 tartomány)' : 'Invalid Address (0 - 65535)');
      return;
    }
    if (isNaN(val) || val < 0 || val > 255) {
      alert(language === 'hu' ? 'Érvénytelen érték (0 - 255 tartomány)' : 'Invalid Value (0 - 255)');
      return;
    }
    handleApplyPoke(addr, val, 'Manual POKE');
  };

  // Handle Sprite Template Select
  const handleSelectSpriteTemplate = (idx: number) => {
    setSelectedSpriteIdx(idx);
    const tmpl = SAMPLE_SPRITES[idx];
    if (tmpl) {
      setCustomSpriteMatrix([...tmpl.bitmap]);
      setSpriteColor(tmpl.color);
    }
    sidAudio.playKeyClick();
  };

  // Toggle single pixel in sprite ripper matrix
  const handleToggleSpritePixel = (row: number, col: number) => {
    const byteOffset = row * 3 + Math.floor(col / 8);
    const bitPos = 7 - (col % 8);
    const next = [...customSpriteMatrix];
    next[byteOffset] ^= 1 << bitPos;
    setCustomSpriteMatrix(next);
    sidAudio.playKeyClick();
  };

  // Inject Sprite to RAM at $2000 (8192)
  const handleInjectSpriteToRam = () => {
    for (let i = 0; i < 63; i++) {
      c64State.memory[8192 + i] = customSpriteMatrix[i] || 0;
    }
    // Set Sprite 0 pointer at $07F8 (2040) to bank block 128 ($2000 / 64 = 128)
    c64State.memory[2040] = 128;
    // Enable Sprite 0 ($D015 = 1) and color ($D027 = spriteColor)
    c64State.memory[53269] = 1;
    c64State.memory[53287] = spriteColor;
    sidAudio.playDriveStep(2);
    setPokeSuccessMsg(
      language === 'hu'
        ? 'Sprite sikeresen betöltve a $2000 RAM címre & Sprite 0 aktiválva!'
        : 'Sprite successfully injected to RAM at $2000 and Sprite 0 enabled!'
    );
    setTimeout(() => setPokeSuccessMsg(null), 3500);
  };

  // Run Fastload Protocol Simulator
  const handleStartTransferSim = (mode: 'stock' | 'turbo') => {
    setTransferMode(mode);
    setIsSimulatingTransfer(true);
    setTransferProgress(0);
    setTransferBytes(0);

    const totalBytes = 10240; // 10KB sample PRG file
    const speedBps = mode === 'turbo' ? 6000 : 400;
    const durationMs = (totalBytes / speedBps) * 1000;
    const intervalMs = 50;
    const steps = durationMs / intervalMs;
    const bytesPerStep = totalBytes / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(100, Math.round((currentStep / steps) * 100));
      const curBytes = Math.min(totalBytes, Math.round(currentStep * bytesPerStep));

      setTransferProgress(currentProgress);
      setTransferBytes(curBytes);

      if (currentStep % 4 === 0) {
        sidAudio.playDriveChatter(0.15);
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        setIsSimulatingTransfer(false);
        sidAudio.playDriveStep(3);
      }
    }, intervalMs);
  };

  // Run SuperCPU 20MHz Benchmark Simulation
  const handleRunBenchmark = () => {
    setBenchStatus('running');
    setBenchProgress(0);

    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      setBenchProgress(progress);
      sidAudio.playKeyClick();

      if (progress >= 100) {
        clearInterval(timer);
        setBenchStatus('done');
        setBenchStockTimeMs(2450);
        setBenchSuperCpuTimeMs(122);
        setBenchScoreMultiplier(20.08);
        sidAudio.playBootJingle();
      }
    }, 150);
  };

  return (
    <div className="flex flex-col gap-5 bg-[#0b0f19] text-slate-200 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: `${currentModel.badgeColor}20`, borderColor: currentModel.badgeColor }}
            className="w-10 h-10 rounded-xl border flex items-center justify-center text-amber-400 shadow-lg"
          >
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black tracking-wide text-white flex items-center gap-2">
                <span>COMMODORE 64 TURBO CARTRIDGE & ACCELERATOR</span>
                <span
                  style={{
                    backgroundColor: `${currentModel.badgeColor}25`,
                    color: currentModel.badgeColor,
                    borderColor: `${currentModel.badgeColor}50`,
                  }}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                >
                  {currentModel.name}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Klasszikus C64 gyorstöltők (Final Cartridge III, Action Replay MK VI, Epyx Fastload) & 20MHz hardveres SuperCPU gyorsító.'
                : 'Classic C64 fastload cartridges (Final Cartridge III, Action Replay MK VI, Epyx Fastload) & 20MHz SuperCPU hardware accelerator.'}
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-[#131927] p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Kártya Vezérlő & Működés' : 'Cartridge & Controls'}</span>
          </button>

          <button
            onClick={() => setActiveTab('freeze_menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'freeze_menu'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pause className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Freeze Menü & Csalások' : 'Freeze HUD & Cheats'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fastload_tech')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fastload_tech'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Gyorstöltő IEC Protokoll' : 'Fastloader IEC Tech'}</span>
          </button>

          <button
            onClick={() => setActiveTab('supercpu_bench')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'supercpu_bench'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'SuperCPU 20MHz Benchmark' : 'SuperCPU 20MHz Bench'}</span>
          </button>
        </div>
      </div>

      {/* Retro Cartridge Bezel & Physical Switches Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#0d131f] p-4 rounded-2xl border-2 border-slate-800 shadow-xl">
        {/* Cartridge Selection & Status Indicator */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'hu' ? 'Válassz Turbó Kártyát:' : 'Select Turbo Cartridge:'}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  turboState.isEnabled
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                {turboState.isEnabled ? 'INSERTED & ACTIVE' : 'UNPLUGGED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TURBO_CARTRIDGE_MODELS) as TurboCartridgeType[]).map((key) => {
              const m = TURBO_CARTRIDGE_MODELS[key];
              const isSelected = turboState.activeModel === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectModel(key)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-[#131927] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    borderColor: isSelected ? m.badgeColor : undefined,
                  }}
                >
                  <span className="text-xs font-bold line-clamp-1">{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.year} • {m.fastloadSpeedFactor}x Speed
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Hardware Buttons: Power, Freeze, Reset, Speed Switch */}
        <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-3 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
          {/* Cartridge In/Out Toggle Switch */}
          <button
            onClick={handleToggleCartridge}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
              turboState.isEnabled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{turboState.isEnabled ? (language === 'hu' ? 'Kártya Csatlakoztatva' : 'Cartridge Plugged In') : (language === 'hu' ? 'Kártya Kihúzva' : 'Plug In Cartridge')}</span>
          </button>

          {/* Physical FREEZE Push-Button */}
          <button
            onClick={handleHardwareFreeze}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-lg transition cursor-pointer flex items-center gap-2 ${
              turboState.isFrozen
                ? 'bg-pink-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse'
                : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-rose-500'
            }`}
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>{turboState.isFrozen ? (language === 'hu' ? 'FAGYASZTVA (UNFREEZE)' : 'FROZEN (UNFREEZE)') : (language === 'hu' ? 'HARDVERES FREEZE' : 'HARDWARE FREEZE')}</span>
          </button>

          {/* Hardware Reset */}
          <button
            onClick={() => {
              onResetC64();
              sidAudio.playBootJingle();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Kártya Reset' : 'Cartridge Reset'}</span>
          </button>

          {/* CPU Speed Selector */}
          <div className="flex items-center gap-1.5 bg-[#131927] p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5">CPU:</span>
            {[1, 2, 4, 20].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onUpdateTurboState((prev) => ({ ...prev, cpuSpeedMultiplier: speed }));
                  sidAudio.playKeyClick();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                  turboState.cpuSpeedMultiplier === speed
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed === 1 ? '1 MHz (Stock)' : `${speed} MHz`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {pokeSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{pokeSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & HARDWARE ARCHITECTURE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Cartridge Specs & How it Works */}
          <div className="lg:col-span-7 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>{language === 'hu' ? currentModel.nameHu : currentModel.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {currentModel.manufacturer} ({currentModel.year})
                </p>
              </div>

              <span
                style={{
                  backgroundColor: `${currentModel.badgeColor}20`,
                  color: currentModel.badgeColor,
                  borderColor: `${currentModel.badgeColor}40`,
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-black border"
              >
                {currentModel.fastloadSpeedFactor}x FASTLOAD
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hu' ? currentModel.descriptionHu : currentModel.description}
            </p>

            {/* Hardware Features List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === 'hu' ? 'Fő Hardveres Jellemzők:' : 'Key Hardware Features:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(language === 'hu' ? currentModel.hardwareFeaturesHu : currentModel.hardwareFeatures).map(
                  (feat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#131927] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* How Fastload Technology Works */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>{language === 'hu' ? 'Hogyan működik a gyorstöltés?' : 'How Fastload Technology Works:'}</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'hu' ? currentModel.fastloadTechnologyHu : currentModel.fastloadTechnology}
              </p>
            </div>
          </div>

          {/* Right: Cartridge Port Architecture & Signal Diagram */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>{language === 'hu' ? 'Bővítőport (Expansion Port) Vonalak' : 'Expansion Port (CN5) Signals'}</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span className="font-bold text-rose-300">/NMI (Pin B-4)</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'hu' ? 'Freeze megszakítás a CPU-nak' : 'Freeze CPU Interrupt'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold text-cyan-300">/GAME & /EXROM</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'hu' ? 'PLA $8000/$E000 bankváltás' : 'PLA 8K/16K Bank Switching'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-emerald-300">/DMA (Pin 12)</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'hu' ? 'Teljes buszátvétel 20MHz CPU-hoz' : 'Direct Bus Takeover'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-bold text-amber-300">/RESET & /IRQ</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'hu' ? 'Hardveres újraindítás & időzítők' : 'Cold/Warm Reboot & Timers'}
                </span>
              </div>
            </div>

            {/* Quick DOS Wedge Shortcuts Help Box */}
            <div className="p-3.5 rounded-xl bg-[#131927] border border-amber-500/30 flex flex-col gap-2 mt-auto">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'hu' ? 'Klasszikus Gyorsbillentyűk (DOS Wedge)' : 'Classic DOS Wedge Commands'}</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                <div><span className="text-amber-300 font-bold">F1:</span> LIST</div>
                <div><span className="text-amber-300 font-bold">F3:</span> RUN</div>
                <div><span className="text-amber-300 font-bold">F5:</span> LOAD &quot;*&quot;,8,1</div>
                <div><span className="text-amber-300 font-bold">F7:</span> DIRECTORY ($)</div>
                <div><span className="text-cyan-300 font-bold">←L:</span> Fastload PRG</div>
                <div><span className="text-cyan-300 font-bold">←D:</span> Disk Directory</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FREEZE MENU HUD, CHEAT POKES & SPRITE RIPPER */}
      {activeTab === 'freeze_menu' && (
        <div className="flex flex-col gap-5">
          {/* Freeze Banner */}
          <div className="p-3 bg-pink-950/40 border border-pink-500/60 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-pink-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-pink-300">
                  {language === 'hu' ? 'ACTION REPLAY / FINAL CARTRIDGE FREEZE MENÜ' : 'ACTION REPLAY / FINAL CARTRIDGE FREEZE HUD'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'hu'
                    ? 'A 6510 CPU állapota befagyasztva az /NMI vonalon. Injektálj csalásokat, ments le sprite-okat vagy készíts teljes 64KB RAM mentést!'
                    : '6510 CPU state frozen via /NMI. Inject game cheat POKEs, rip sprites, or save a complete 64KB RAM snapshot!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleHardwareFreeze}
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              {turboState.isFrozen ? (language === 'hu' ? 'Visszatérés a Játékba (UNFREEZE)' : 'Return to Game (UNFREEZE)') : (language === 'hu' ? 'Megállítás (FREEZE)' : 'Freeze Game')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Preset Cheat Trainers & Manual POKE */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Bookmark className="w-4 h-4 text-pink-400" />
                <span>{language === 'hu' ? 'Játék Csaláskészletek (Trainer POKEs)' : 'Game Cheat Trainers (Trainer POKEs)'}</span>
              </h3>

              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {TURBO_CHEAT_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-xl bg-[#131927] border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">
                        {language === 'hu' ? preset.gameTitleHu : preset.gameTitle}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                        {preset.pokes.length} POKEs
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{language === 'hu' ? preset.descriptionHu : preset.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {preset.pokes.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplyPoke(p.address, p.value, `${preset.gameTitle}: ${p.label}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-pink-900/50 hover:border-pink-500 text-slate-200 rounded-lg text-[11px] font-mono border border-slate-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{language === 'hu' ? p.labelHu : p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Manual POKE Form */}
              <form onSubmit={handleApplyCustomPoke} className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-300">
                  {language === 'hu' ? 'Egyedi Memória POKE Injektálás:' : 'Manual Memory POKE Injection:'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={customPokeAddr}
                      onChange={(e) => setCustomPokeAddr(e.target.value)}
                      placeholder="Address (0-65535)"
                      className="w-full bg-[#131927] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={customPokeVal}
                      onChange={(e) => setCustomPokeVal(e.target.value)}
                      placeholder="Val (0-255)"
                      className="w-full bg-[#131927] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    POKE
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Sprite Ripper & Editor */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'hu' ? 'Sprite Ripper (24x21 Mátrix)' : 'Sprite Ripper (24x21 Grid)'}</span>
                </h3>

                <div className="flex items-center gap-1.5">
                  {SAMPLE_SPRITES.map((sp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSpriteTemplate(idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        selectedSpriteIdx === idx
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprite Visual Matrix Grid (24 columns x 21 rows) */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/80 rounded-xl border border-slate-800 overflow-x-auto">
                <div
                  className="grid gap-[1px]"
                  style={{
                    gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
                    width: '288px',
                    height: '252px',
                  }}
                >
                  {Array.from({ length: 21 }).map((_, row) =>
                    Array.from({ length: 24 }).map((_, col) => {
                      const byteOffset = row * 3 + Math.floor(col / 8);
                      const bitPos = 7 - (col % 8);
                      const isBitSet = (customSpriteMatrix[byteOffset] & (1 << bitPos)) !== 0;
                      const pixelColor = isBitSet ? C64_PALETTE[spriteColor]?.hex || '#FFFF00' : '#111827';

                      return (
                        <div
                          key={`${row}-${col}`}
                          onClick={() => handleToggleSpritePixel(row, col)}
                          style={{ backgroundColor: pixelColor }}
                          className="w-full h-full rounded-[1px] hover:opacity-80 transition-colors cursor-pointer"
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Color Selector & Inject to RAM Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold">
                    {language === 'hu' ? 'Szín:' : 'Color:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 5, 7, 14].map((cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => {
                          setSpriteColor(cIdx);
                          sidAudio.playKeyClick();
                        }}
                        style={{ backgroundColor: C64_PALETTE[cIdx].hex }}
                        className={`w-5 h-5 rounded-md border transition cursor-pointer ${
                          spriteColor === cIdx ? 'border-white scale-110 shadow' : 'border-slate-700'
                        }`}
                        title={C64_PALETTE[cIdx].name}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleInjectSpriteToRam}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'hu' ? 'Betöltés a C64 RAM-ba ($2000)' : 'Inject Sprite to RAM ($2000)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FASTLOAD IEC PROTOCOL COMPARISON & SIMULATOR */}
      {activeTab === 'fastload_tech' && (
        <div className="flex flex-col gap-5">
          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stock C64 IEC */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border-2 border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-sm font-black text-rose-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>{language === 'hu' ? 'Gyári C64 1541 IEC Átvitel' : 'Stock C64 1541 IEC Protocol'}</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                  ~400 Bytes/sec
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>{language === 'hu' ? 'A hiba oka:' : 'The Silicon Bug:'}</strong>{' '}
                  {language === 'hu'
                    ? 'A 6526 CIA hardveres shift-regiszterét egy szilíciumhiba miatt letiltották, így a KERNAL lassú szoftveres bit-banging hurkokkal küldi a biteket.'
                    : 'A silicon flaw in early MOS 6526 CIAs forced Commodore to disable the hardware shift register, defaulting to slow software bit-banging loops.'}
                </p>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                  <div>• Órajel / bájt: ~2500 ciklus</div>
                  <div>• 10 KB játék betöltése: ~25 másodperc</div>
                  <div>• 202 blokkos játék: ~2 perc 10 mp</div>
                </div>
              </div>

              <button
                disabled={isSimulatingTransfer}
                onClick={() => handleStartTransferSim('stock')}
                className="mt-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'hu' ? 'Gyári Betöltés Szimulálása (Lassú)' : 'Simulate Stock Load (Slow)'}</span>
              </button>
            </div>

            {/* Turbo Fastloader */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border-2 border-cyan-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-cyan-800/60 pb-2.5">
                <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'hu' ? 'Turbó Kártya Gyorstöltő Protokoll' : 'Turbo Cartridge Fastloader Protocol'}</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                  ~6,000 Bytes/sec (15x - 25x)
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>{language === 'hu' ? 'A megoldás:' : 'The Fastloader Hack:'}</strong>{' '}
                  {language === 'hu'
                    ? 'A kártya saját gépi kódot küld a 1541 6502 processzorának, és mind a CLK, mind a DATA vonalat egyszerre 2-bites párhuzamos adatátvitelre használja.'
                    : 'The cartridge sends custom code to 1541 RAM, repurposing CLK and DATA as parallel 2-bit data streams synchronized with raster beams.'}
                </p>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-cyan-900 font-mono text-[11px] text-cyan-200 space-y-1">
                  <div>• Órajel / bájt: ~160 ciklus (15x gyorsabb)</div>
                  <div>• 10 KB játék betöltése: ~1.8 másodperc</div>
                  <div>• 202 blokkos játék: ~5 másodperc</div>
                </div>
              </div>

              <button
                disabled={isSimulatingTransfer}
                onClick={() => handleStartTransferSim('turbo')}
                className="mt-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'hu' ? 'Turbó Betöltés Szimulálása (Villámgyors)' : 'Simulate Turbo Fastload (15x)'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Transfer Progress Bar & Oscilloscope Visualizer */}
          {isSimulatingTransfer && (
            <div className="p-4 bg-[#131927] rounded-xl border border-cyan-700 flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">
                  {transferMode === 'turbo' ? 'TURBO FASTLOAD IN PROGRESS...' : 'STOCK IEC BIT-BANGING IN PROGRESS...'}
                </span>
                <span className="text-slate-300">
                  {transferBytes} / 10240 Bytes ({transferProgress}%)
                </span>
              </div>

              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-75 ${
                    transferMode === 'turbo' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-rose-500'
                  }`}
                  style={{ width: `${transferProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CMD SUPERCPU 20MHZ ACCELERATOR BENCHMARK */}
      {activeTab === 'supercpu_bench' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Benchmark Runner Card */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'hu' ? 'SuperCPU 20MHz vs 1MHz 6510 Benchmark' : 'SuperCPU 20MHz vs 1MHz 6510 Benchmark'}</span>
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'hu'
                  ? 'Futtass le egy 10,000 iterációs fraktál / mátrix számítási benchmarkot és hasonlítsd össze az eredeti 1.0 MHz-es MOS 6510 processzort a 20.0 MHz-es WDC 65C816 SuperCPU-val!'
                  : 'Run a 10,000 iteration matrix / Mandelbrot benchmark comparing the stock 1.0 MHz MOS 6510 with the 20.0 MHz WDC 65C816 SuperCPU!'}
              </p>

              {/* Benchmark Results Display */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-400 font-bold">MOS 6510 (1.0 MHz):</span>
                  <span className="text-lg font-mono font-black text-rose-400">{benchStockTimeMs} ms</span>
                  <span className="text-[10px] text-slate-500 font-mono">1.0x Baseline</span>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/60 flex flex-col gap-1">
                  <span className="text-[11px] text-emerald-300 font-bold">SuperCPU (20.0 MHz):</span>
                  <span className="text-lg font-mono font-black text-emerald-400">{benchSuperCpuTimeMs} ms</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    +{benchScoreMultiplier}x SPEEDUP!
                  </span>
                </div>
              </div>

              <button
                disabled={benchStatus === 'running'}
                onClick={handleRunBenchmark}
                className="mt-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{benchStatus === 'running' ? (language === 'hu' ? 'Számítás folyamatban...' : 'Benchmarking...') : (language === 'hu' ? 'Benchmark Futtatása (20 MHz)' : 'Run 20MHz Benchmark')}</span>
              </button>
            </div>

            {/* Hardware Architecture Insight for SuperCPU */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-[#0d131f] p-5 rounded-2xl border-2 border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hu' ? 'A SuperCPU Működési Elve' : 'How SuperCPU Achieves 20x Speed'}</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800">
                  <strong className="text-emerald-300">1. WDC 65C816 16-bit Core:</strong>{' '}
                  {language === 'hu'
                    ? '24-bites címbusz (16 MB címtartomány), 16-bites akkumulátor és natív 20 MHz-es órajel.'
                    : '24-bit address bus (16 MB addressing), 16-bit accumulator, and native 20 MHz clocking.'}
                </div>

                <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800">
                  <strong className="text-emerald-300">2. Zero-Wait-State Fast SRAM:</strong>{' '}
                  {language === 'hu'
                    ? 'Az alaplapi 64KB lassú DRAM-ot a kártya tükrözi a saját ultragyors 512KB-os statikus RAM-jába.'
                    : 'Shadows the motherboard 64KB DRAM into high-speed on-board SRAM for zero wait-states.'}
                </div>

                <div className="p-2.5 rounded-xl bg-[#131927] border border-slate-800">
                  <strong className="text-emerald-300">3. I/O Clock Synchronization:</strong>{' '}
                  {language === 'hu'
                    ? 'Amikor a CPU a VIC-II ($D000) vagy SID ($D400) regisztereket írja, a hardver automatikusan 1 MHz-re lassítja az adott ciklust a tökéletes kompatibilitásért.'
                    : 'Automatically drops to 1 MHz during VIC-II ($D000) and SID ($D400) I/O writes for 100% video and audio compatibility.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
