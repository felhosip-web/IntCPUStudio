import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { AccentTheme, FontSize, Language, NumberFormat, ThemeMode, WaveformType } from '../types/settings';
import { playTestSound } from '../core/audio';
import {
  Activity,
  Check,
  Cpu,
  Download,
  Globe,
  HardDrive,
  Laptop,
  Moon,
  Music,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Upload,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'clock' | 'arch' | 'audio' | 'backup';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, t, settings, updateSettings, resetSettings } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpu_simulator_settings_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        updateSettings(parsed);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError(language === 'hu' ? 'Érvénytelen JSON formátum!' : 'Invalid JSON format!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm(t('resetConfirm'))) {
      resetSettings();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="settings-modal-dialog"
        className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0A0B0E]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                {t('settingsTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('settingsDesc')}
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-[#0A0B0E]/30 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('tabGeneral')}</span>
          </button>

          <button
            onClick={() => setActiveTab('clock')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'clock'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('tabCpuTuning')}</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'arch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{t('tabArch')}</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{t('tabAudio')}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('tabBackup')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* TAB 1: General & Language */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Appearance Theme & Color Mode */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {t('settingThemeMode')}
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">4 Választható Mód</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Default Dark Theme */}
                  <button
                    onClick={() => updateSettings({ themeMode: 'dark' })}
                    className={`flex items-start justify-between p-3.5 rounded-xl border font-mono text-xs transition-all text-left cursor-pointer ${
                      settings.themeMode === 'dark' || !settings.themeMode
                        ? 'bg-slate-800/80 border-cyan-500/60 text-cyan-300 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{t('themeDark')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                          {t('themeDarkDesc')}
                        </div>
                      </div>
                    </div>
                    {(settings.themeMode === 'dark' || !settings.themeMode) && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* 2. System Dynamic Theme */}
                  <button
                    onClick={() => updateSettings({ themeMode: 'system' })}
                    className={`flex items-start justify-between p-3.5 rounded-xl border font-mono text-xs transition-all text-left cursor-pointer ${
                      settings.themeMode === 'system'
                        ? 'bg-blue-950/40 border-blue-500/60 text-blue-300 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-blue-400">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{t('themeSystem')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                          {t('themeSystemDesc')}
                        </div>
                      </div>
                    </div>
                    {settings.themeMode === 'system' && (
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* 3. Modern Light Theme */}
                  <button
                    onClick={() => updateSettings({ themeMode: 'light' })}
                    className={`flex items-start justify-between p-3.5 rounded-xl border font-mono text-xs transition-all text-left cursor-pointer ${
                      settings.themeMode === 'light'
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{t('themeLight')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                          {t('themeLightDesc')}
                        </div>
                      </div>
                    </div>
                    {settings.themeMode === 'light' && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* 4. Hacker Pro Theme */}
                  <button
                    onClick={() => updateSettings({ themeMode: 'hacker' })}
                    className={`flex items-start justify-between p-3.5 rounded-xl border font-mono text-xs transition-all text-left cursor-pointer ${
                      settings.themeMode === 'hacker'
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/60 glow-hacker'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-black border border-emerald-500/50 text-emerald-400">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <span>{t('themeHacker')}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed font-sans">
                          {t('themeHackerDesc')}
                        </div>
                      </div>
                    </div>
                    {settings.themeMode === 'hacker' && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  {t('settingLanguage')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setLanguage('hu')}
                    className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-3 p-3 rounded-xl border font-mono text-xs transition-all ${
                      language === 'hu'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇭🇺</span>
                      <div className="text-left">
                        <div className="font-bold text-slate-100">{t('settingLanguageHu')}</div>
                        <div className="text-[10px] text-slate-500">Minden szöveg és lecke magyarul</div>
                      </div>
                    </div>
                    {language === 'hu' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-3 p-3 rounded-xl border font-mono text-xs transition-all ${
                      language === 'en'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇬🇧</span>
                      <div className="text-left">
                        <div className="font-bold text-slate-100">{t('settingLanguageEn')}</div>
                        <div className="text-[10px] text-slate-500">Switch entire UI & lessons to English</div>
                      </div>
                    </div>
                    {language === 'en' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* Theme & Accent Color */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  {t('settingThemeAccent')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cyan', label: t('settingThemeCyan'), color: 'bg-cyan-400' },
                    { id: 'emerald', label: t('settingThemeEmerald'), color: 'bg-emerald-400' },
                    { id: 'amber', label: t('settingThemeAmber'), color: 'bg-amber-400' },
                    { id: 'purple', label: t('settingThemePurple'), color: 'bg-purple-400' },
                    { id: 'matrix', label: t('settingThemeMatrix'), color: 'bg-green-500' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateSettings({ accentTheme: item.id as AccentTheme })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                        settings.accentTheme === item.id
                          ? 'bg-slate-800 border-cyan-500/50 text-slate-100'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Format & Font Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    {t('settingNumFormat')}
                  </label>
                  <select
                    value={settings.numberFormat}
                    onChange={(e) => updateSettings({ numberFormat: e.target.value as NumberFormat })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="HEX">{t('formatHex')}</option>
                    <option value="DEC">{t('formatDec')}</option>
                    <option value="BIN">{t('formatBin')}</option>
                    <option value="SIGNED">{t('formatSigned')}</option>
                  </select>
                </div>

                <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    {t('settingFontSize')}
                  </label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: e.target.value as FontSize })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="compact">{t('fontCompact')}</option>
                    <option value="normal">{t('fontNormal')}</option>
                    <option value="large">{t('fontLarge')}</option>
                  </select>
                </div>
              </div>

              {/* Grid Background Intensity */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300">
                  {t('settingGridIntensity')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: t('gridNone') },
                    { id: 'subtle', label: t('gridSubtle') },
                    { id: 'high', label: t('gridHigh') },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateSettings({ gridIntensity: item.id as 'none' | 'subtle' | 'high' })}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono transition-colors ${
                        settings.gridIntensity === item.id
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Clock & Simulation Tuning */}
          {activeTab === 'clock' && (
            <div className="space-y-5">
              {/* Clock Speed Slider */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    {t('settingClockSpeed')}
                  </label>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                    {settings.clockSpeedHz >= 100 ? '100 Hz (Max)' : `${settings.clockSpeedHz} Hz`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={settings.clockSpeedHz}
                  onChange={(e) => updateSettings({ clockSpeedHz: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
                  <span>0.5 Hz (Lassú / Tanulás)</span>
                  <span>10 Hz</span>
                  <span>100 Hz (Turbo)</span>
                </div>
              </div>

              {/* Microstep Delay */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    {t('settingMicroDelay')}
                  </label>
                  <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                    {settings.microStepDelayMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={settings.microStepDelayMs}
                  onChange={(e) => updateSettings({ microStepDelayMs: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* History Buffer Limit */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    {t('settingHistoryLimit')}
                  </label>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                    {settings.historyLimit}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={settings.historyLimit}
                  onChange={(e) => updateSettings({ historyLimit: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Watchdog & Breakpoint toggles */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.stopOnBreakpoint}
                    onChange={(e) => updateSettings({ stopOnBreakpoint: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingBreakpoints')}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.autoHaltOnOverflow}
                    onChange={(e) => updateSettings({ autoHaltOnOverflow: e.target.checked })}
                    className="w-4 h-4 accent-rose-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingAutoHaltOverflow')}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Architecture & RAM Tuning */}
          {activeTab === 'arch' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reset PC Vector */}
                <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    {t('settingResetPC')}
                  </label>
                  <input
                    type="text"
                    value={`0x${settings.resetPcVector.toString(16).padStart(2, '0').toUpperCase()}`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 16);
                      if (!isNaN(val)) updateSettings({ resetPcVector: val & 0xff });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Reset SP Base */}
                <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    {t('settingResetSP')}
                  </label>
                  <input
                    type="text"
                    value={`0x${settings.resetSpBase.toString(16).padStart(2, '0').toUpperCase()}`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 16);
                      if (!isNaN(val)) updateSettings({ resetSpBase: val & 0xff });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Memory Reset Behavior */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.clearMemoryOnReset}
                    onChange={(e) => updateSettings({ clearMemoryOnReset: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingClearMemOnReset')}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.matrixPersistence}
                    onChange={(e) => updateSettings({ matrixPersistence: e.target.checked })}
                    className="w-4 h-4 accent-emerald-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingMatrixPersist')}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Audio Tuning */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Master Volume */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    {t('settingMasterVolume')}
                  </label>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                    {settings.masterVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => updateSettings({ masterVolume: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Sound Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.enableClockTickSound}
                    onChange={(e) => updateSettings({ enableClockTickSound: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingClockTick')}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.enableAluChimeSound}
                    onChange={(e) => updateSettings({ enableAluChimeSound: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingAluChime')}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.enableHaltSound}
                    onChange={(e) => updateSettings({ enableHaltSound: e.target.checked })}
                    className="w-4 h-4 accent-rose-400 rounded"
                  />
                  <div className="text-xs font-mono text-slate-300">
                    {t('settingHaltSound')}
                  </div>
                </label>

                <div className="p-3 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">
                    {t('settingWaveform')}
                  </label>
                  <select
                    value={settings.tickWaveform}
                    onChange={(e) => updateSettings({ tickWaveform: e.target.value as WaveformType })}
                    className="w-full bg-slate-900 px-2 py-1 rounded border border-slate-700 text-xs font-mono text-cyan-300"
                  >
                    <option value="sine">Szinusz (Sine)</option>
                    <option value="square">Négyszög (Square)</option>
                    <option value="triangle">Háromszög (Triangle)</option>
                    <option value="sawtooth">Fűrészfog (Sawtooth)</option>
                  </select>
                </div>
              </div>

              {/* Beeper Base Frequency & Sound Test */}
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    {t('settingBeeperFreq')}
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="2000"
                    step="10"
                    value={settings.beeperBaseFreq}
                    onChange={(e) => updateSettings({ beeperBaseFreq: parseInt(e.target.value, 10) || 440 })}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300 w-32 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={playTestSound}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t('testSoundButton')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Backup & Export */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0A0B0E]/60 rounded-xl border border-slate-800/80 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  {t('tabBackup')}
                </h3>
                <p className="text-xs text-slate-400">
                  Mentsd el vagy oszd meg a saját CPU architektúra beállításaidat JSON fájlként, vagy állítsd vissza az alapértékeket.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('exportSettings')}</span>
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{t('importSettings')}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {importSuccess && (
                  <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                    ✓ Beállítások sikeresen betöltve!
                  </div>
                )}
                {importError && (
                  <div className="p-2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
                    {importError}
                  </div>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-3">
                <div className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  {t('resetToDefaults')}
                </div>
                <p className="text-xs text-slate-400">
                  Visszaállítja a teljes szimulátort a gyári magyar alapbeállításokra.
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('resetToDefaults')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-800 bg-[#0A0B0E]/80">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
          >
            {t('saveAndApply')}
          </button>
        </div>
      </div>
    </div>
  );
};
