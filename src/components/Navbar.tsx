import React, { useState } from 'react';
import { SampleProgram } from '../types/cpu';
import { CpuCoreType } from '../types/hardware';
import { CPU_CORES } from '../core/cpuCores';
import { SAMPLE_PROGRAMS } from '../core/samplePrograms';
import { useI18n } from '../i18n/I18nContext';
import { CURRENT_APP_VERSION } from '../core/versionHistory';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Cpu,
  FastForward,
  GraduationCap,
  HelpCircle,
  History,
  Laptop,
  LayoutGrid,
  Monitor,
  Moon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Settings,
  Sliders,
  Sparkles,
  StepForward,
  Sun,
  Terminal,
  Volume2,
  VolumeX,
  Wrench,
  Zap,
} from 'lucide-react';
import { ThemeMode } from '../types/settings';

interface NavbarProps {
  viewMode: 'cpu-board' | 'c64-studio' | 'mcu-studio';
  onChangeViewMode: (mode: 'cpu-board' | 'c64-studio' | 'mcu-studio') => void;
  activeCoreType?: CpuCoreType;
  onSwitchCore?: (core: CpuCoreType) => void;
  conflictCount?: number;
  onOpenConflictModal?: () => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStepInstruction: () => void;
  onStepMicro: () => void;
  onStepBack: () => void;
  canStepBack: boolean;
  historyLength: number;
  onReset: () => void;
  clockSpeedHz: number;
  onChangeClockSpeed: (hz: number) => void;
  onSelectSampleProgram: (prog: SampleProgram) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLessons: () => void;
  onOpenModulePalette: () => void;
  onOpenSettings: () => void;
  onOpenHelpAndChangelog?: (tab?: 'help' | 'changelog' | 'pinouts') => void;
}

const SPEED_PRESETS = [
  { label: '0.5 Hz', value: 0.5 },
  { label: '1 Hz', value: 1 },
  { label: '2 Hz', value: 2 },
  { label: '5 Hz', value: 5 },
  { label: '10 Hz', value: 10 },
  { label: '25 Hz', value: 25 },
  { label: 'Max (100 Hz)', value: 100 },
];

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onChangeViewMode,
  activeCoreType = 'EDU8',
  onSwitchCore,
  conflictCount = 0,
  onOpenConflictModal,
  isRunning,
  onToggleRun,
  onStepInstruction,
  onStepMicro,
  onStepBack,
  canStepBack,
  historyLength,
  onReset,
  clockSpeedHz,
  onChangeClockSpeed,
  onSelectSampleProgram,
  isMuted,
  onToggleMute,
  onOpenLessons,
  onOpenModulePalette,
  onOpenSettings,
  onOpenHelpAndChangelog,
}) => {
  const { language, t, settings, updateSettings } = useI18n();
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [showCoreDropdown, setShowCoreDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const activeCore = CPU_CORES[activeCoreType] || CPU_CORES.EDU8;

  return (
    <header className="sticky top-0 z-40 min-h-16 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      {/* Left: Brand & Page Switch Tabs & CPU Core Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Mode Tab 1: 8-Bit CPU Board */}
          <button
            id="tab-view-cpu"
            onClick={() => onChangeViewMode('cpu-board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cpu-board'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10 glow-cyan'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{t('viewModeCpu')}</span>
            <span className="sm:hidden">CPU</span>
          </button>

          {/* Mode Tab 2: Commodore 64 Studio */}
          <button
            id="tab-view-c64"
            onClick={() => onChangeViewMode('c64-studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'c64-studio'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-md shadow-purple-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-purple-400" />
            <span>{t('viewModeC64')}</span>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-normal">
              {t('c64Badge')}
            </span>
          </button>

          {/* Mode Tab 3: AVR / MCU Studio */}
          <button
            id="tab-view-mcu"
            onClick={() => onChangeViewMode('mcu-studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'mcu-studio'
                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/60 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>{t('viewModeMcu')}</span>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
              {t('mcuBadge')}
            </span>
          </button>
        </div>

        {/* CPU Core Selector (In CPU mode) */}
        {viewMode === 'cpu-board' && onSwitchCore && (
          <div className="relative">
            <button
              onClick={() => setShowCoreDropdown(!showCoreDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 font-mono text-xs font-semibold cursor-pointer shadow-sm transition-all"
              title="Válassz Processzor Magot"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">{activeCore.name}</span>
              <span className="text-[10px] text-cyan-400/70 hidden lg:inline">
                ({activeCore.dataBusWidth}b)
              </span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            {showCoreDropdown && (
              <div className="absolute top-full mt-1.5 right-0 sm:right-auto sm:left-0 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 w-72 flex flex-col gap-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1 flex items-center justify-between">
                  <span>{language === 'hu' ? 'CPU Processzormagok' : 'CPU Cores'}</span>
                </div>
                {Object.values(CPU_CORES).map((core) => {
                  const isSelected = core.type === activeCoreType;
                  return (
                    <button
                      key={core.type}
                      onClick={() => {
                        onSwitchCore(core.type);
                        setShowCoreDropdown(false);
                      }}
                      className={`p-2 rounded-xl text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold flex items-center justify-between">
                        <span>{language === 'hu' ? core.nameHu : core.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          {core.dataBusWidth}-bit / {core.addressBusWidth}b
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                        {language === 'hu' ? core.shortDescHu : core.shortDesc}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Hardware Conflict Warning Alert Badge */}
        {conflictCount > 0 && onOpenConflictModal && (
          <button
            onClick={onOpenConflictModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-mono text-xs font-bold animate-pulse cursor-pointer shadow-md"
            title="Hardver / Port Konfliktus észlelve!"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{conflictCount}</span>
            <span className="hidden sm:inline text-[10px]">
              {language === 'hu' ? 'Ütközés' : 'Conflict'}
            </span>
          </button>
        )}
      </div>

      {/* Center: Main Clock & Stepper Controls (When in CPU Board mode) */}
      {viewMode === 'cpu-board' ? (
        <div className="flex items-center gap-1.5 bg-[#0A0B0E]/80 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
          {/* Run / Pause */}
          <button
            id="btn-play-pause"
            onClick={onToggleRun}
            title={isRunning ? `${t('pause')} (Space)` : `${t('run')} (Space)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-md shadow-amber-500/10 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-md shadow-emerald-500/10 glow-emerald'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{t('pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('run')}</span>
              </>
            )}
          </button>

          {/* Step Instruction */}
          <button
            id="btn-step-instruction"
            onClick={onStepInstruction}
            disabled={isRunning}
            title={t('stepInstruction')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-cyan-300 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-semibold transition-colors cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{t('stepInstruction')}</span>
          </button>

          {/* Micro-Step */}
          <button
            id="btn-step-micro"
            onClick={onStepMicro}
            disabled={isRunning}
            title={t('stepMicro')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-purple-300 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-semibold transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">{t('stepMicro')}</span>
          </button>

          {/* Step Back (Time-Travel) */}
          <button
            id="btn-step-back"
            onClick={onStepBack}
            disabled={isRunning || !canStepBack}
            title={`${t('stepBack')} (${historyLength})`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-amber-300 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">{t('stepBackShort')}</span>
            {historyLength > 0 && (
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1 rounded-full font-bold">
                {historyLength}
              </span>
            )}
          </button>

          {/* Reset */}
          <button
            id="btn-cpu-reset"
            onClick={onReset}
            title={t('reset')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Clock Speed Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/50 font-mono text-xs transition-colors cursor-pointer"
            >
              <FastForward className="w-3 h-3 text-cyan-400" />
              <span>{clockSpeedHz >= 100 ? 'Max' : `${clockSpeedHz} Hz`}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showSpeedDropdown && (
              <div className="absolute top-full mt-1 right-0 sm:right-0 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-slate-800 rounded-xl p-1.5 shadow-2xl flex flex-col gap-0.5 z-50 min-w-32">
                {SPEED_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      onChangeClockSpeed(p.value);
                      setShowSpeedDropdown(false);
                    }}
                    className={`px-2 py-1 rounded text-left font-mono text-xs cursor-pointer ${
                      clockSpeedHz === p.value
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'c64-studio' ? (
        <div className="flex items-center gap-2 bg-[#0A0B0E]/80 px-3 py-1.5 rounded-xl border border-purple-800/40 font-mono text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-purple-200 font-bold">COMMODORE 64 BASIC V2</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">MOS 6510 CPU / 64K RAM</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-[#0A0B0E]/80 px-3 py-1.5 rounded-xl border border-emerald-800/40 font-mono text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-200 font-bold">ATMEGA328P / ARDUINO RISC MCU</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">32KB FLASH / 2KB SRAM / ADC & PWM</span>
        </div>
      )}

      {/* Right: Actions, Samples, Lessons, Palette, Settings */}
      <div className="flex items-center gap-2">
        {/* Sample Programs Dropdown */}
        <div className="relative">
          <button
            id="btn-sample-programs"
            onClick={() => setShowProgramsDropdown(!showProgramsDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-mono text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{t('samplePrograms')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showProgramsDropdown && (
            <div className="absolute top-full mt-2 right-0 sm:right-0 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 w-80 flex flex-col gap-1 max-h-96 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1">
                {t('builtInPrograms')}
              </div>
              {SAMPLE_PROGRAMS.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => {
                    onSelectSampleProgram(prog);
                    setShowProgramsDropdown(false);
                  }}
                  className="p-2 rounded-xl text-left hover:bg-slate-800/80 transition-colors flex flex-col gap-0.5 group"
                >
                  <div className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                    <span>{language === 'hu' ? prog.titleHu : prog.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {prog.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {language === 'hu' ? prog.descriptionHu : prog.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Lessons Modal Button */}
        <button
          id="btn-open-lessons"
          onClick={onOpenLessons}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold transition-all shadow-sm shadow-purple-500/10 cursor-pointer"
        >
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">{t('lessons')}</span>
        </button>

        {/* Súgó & Verziókövetés (v4.0.0) Button */}
        <button
          id="btn-open-help-changelog"
          onClick={() => onOpenHelpAndChangelog?.('help')}
          title={language === 'hu' ? 'Súgó, Kézikönyv & Verziókövetés (v4.0.0)' : 'Help, Manual & Version History (v4.0.0)'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition-all shadow-sm shadow-cyan-500/20 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">{language === 'hu' ? 'Súgó & Verziók' : 'Help & Docs'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
            v{CURRENT_APP_VERSION}
          </span>
        </button>

        {/* Module Palette / Layout Switcher */}
        <button
          id="btn-open-palette"
          onClick={onOpenModulePalette}
          title={t('modulesAndLayout')}
          className="p-2 rounded-xl bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Quick Theme Switcher Button */}
        <div className="relative">
          <button
            id="btn-quick-theme-toggle"
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            title={t('settingThemeMode')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              settings.themeMode === 'hacker'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 glow-hacker'
                : settings.themeMode === 'light'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : settings.themeMode === 'system'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-400'
                : 'bg-[#0A0B0E]/80 hover:bg-slate-800 border-slate-800 text-cyan-400'
            }`}
          >
            {settings.themeMode === 'hacker' ? (
              <Terminal className="w-4 h-4" />
            ) : settings.themeMode === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : settings.themeMode === 'system' ? (
              <Laptop className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {showThemeDropdown && (
            <div className="absolute top-full mt-2 right-0 sm:right-0 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 w-64 flex flex-col gap-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1 flex items-center justify-between border-b border-slate-800 pb-1.5 mb-0.5">
                <span>{t('settingThemeMode')}</span>
              </div>

              {[
                {
                  id: 'dark' as ThemeMode,
                  name: t('themeDark'),
                  icon: <Moon className="w-3.5 h-3.5 text-cyan-400" />,
                  color: 'text-cyan-300',
                },
                {
                  id: 'system' as ThemeMode,
                  name: t('themeSystem'),
                  icon: <Laptop className="w-3.5 h-3.5 text-blue-400" />,
                  color: 'text-blue-300',
                },
                {
                  id: 'light' as ThemeMode,
                  name: t('themeLight'),
                  icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
                  color: 'text-amber-300',
                },
                {
                  id: 'hacker' as ThemeMode,
                  name: t('themeHacker'),
                  icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
                  color: 'text-emerald-300',
                },
              ].map((th) => {
                const isSelected = (settings.themeMode || 'dark') === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      updateSettings({ themeMode: th.id });
                      setShowThemeDropdown(false);
                    }}
                    className={`p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {th.icon}
                      <span className={isSelected ? th.color : ''}>{th.name}</span>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings & Tuning Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title={t('settings')}
          className="p-2 rounded-xl bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Audio Mute */}
        <button
          id="btn-toggle-mute"
          onClick={onToggleMute}
          title={isMuted ? t('unmute') : t('mute')}
          className={`p-2 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-[#0A0B0E]/80 border-slate-800 text-slate-500'
              : 'bg-[#0A0B0E]/80 hover:bg-slate-800 border-slate-800 text-cyan-400 glow-cyan'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
