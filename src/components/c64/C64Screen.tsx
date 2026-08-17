import React, { useEffect, useRef, useState } from 'react';
import { C64_PALETTE, C64State } from '../../types/c64';
import { TurboCartridgeState } from '../../types/c64TurboCartridge';
import { TURBO_CARTRIDGE_MODELS } from '../../core/c64TurboCartridgeData';
import { useI18n } from '../../i18n/I18nContext';
import { sidAudio } from '../../core/c64Audio';
import {
  Copy,
  Flame,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  Square,
  Terminal,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';

interface C64ScreenProps {
  c64State: C64State;
  turboState?: TurboCartridgeState;
  onSendCommand: (command: string) => void;
  onBreak: () => void;
  onClearScreen: () => void;
  onResetC64: () => void;
  onFreezeCartridge?: () => void;
}

export const C64Screen: React.FC<C64ScreenProps> = ({
  c64State,
  turboState,
  onSendCommand,
  onBreak,
  onClearScreen,
  onResetC64,
  onFreezeCartridge,
}) => {
  const { language } = useI18n();
  const [currentInput, setCurrentInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [enableCrtEffect, setEnableCrtEffect] = useState(true);
  const [copied, setCopied] = useState(false);

  const screenScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of screen on output changes
  useEffect(() => {
    if (screenScrollRef.current) {
      screenScrollRef.current.scrollTop = screenScrollRef.current.scrollHeight;
    }
  }, [c64State.terminalHistory, currentInput]);

  // Keep focus on input unless another element was deliberately selected
  const handleScreenClick = () => {
    inputRef.current?.focus();
  };

  const borderColorHex = C64_PALETTE[c64State.borderColor]?.hex || '#0088FF';
  const bgColorHex = C64_PALETTE[c64State.backgroundColor]?.hex || '#0000AA';
  const defaultTextColorHex = C64_PALETTE[c64State.textColor]?.hex || '#AAFFEE';

  const activeCartridgeModel = turboState?.activeModel ? TURBO_CARTRIDGE_MODELS[turboState.activeModel] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sidAudio.playKeyClick();
    onSendCommand(currentInput);
    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (c64State.commandHistory.length > 0) {
        const nextIdx =
          historyIndex === -1
            ? c64State.commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setCurrentInput(c64State.commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= c64State.commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(nextIdx);
          setCurrentInput(c64State.commandHistory[nextIdx]);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onBreak();
    }
  };

  const handleCopyScreen = () => {
    const allText = c64State.terminalHistory.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Commodore 64 Vintage CRT Housing */}
      <div className="p-3 sm:p-5 bg-gradient-to-b from-[#C4B79B] to-[#9C8F75] rounded-3xl border-4 border-[#736750] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-2">
        {/* Top Case Badge & Status LED */}
        <div className="flex items-center justify-between px-3 py-1 font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#382F24] tracking-widest text-xs sm:text-sm">
              commodore
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#382F24] text-[#E0D8C3] font-black text-[11px] tracking-wider">
              64
            </span>

            {/* Turbo Cartridge Active Bezel Badge */}
            {turboState?.isEnabled && activeCartridgeModel && (
              <div
                style={{
                  backgroundColor: `${activeCartridgeModel.bezelColor}E0`,
                  borderColor: activeCartridgeModel.badgeColor,
                }}
                className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black text-white shadow"
              >
                <Zap className="w-3 h-3 text-amber-300 fill-current" />
                <span className="truncate max-w-[150px]">{activeCartridgeModel.name.toUpperCase()}</span>
                <span className="text-amber-300">
                  {turboState.cpuSpeedMultiplier > 1 ? `${turboState.cpuSpeedMultiplier}MHz` : `${activeCartridgeModel.fastloadSpeedFactor}x`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* 1541 Disk Drive Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#382F24]">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              <span>1541 DISK READY</span>
            </div>

            {/* Power LED Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#382F24]">POWER</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Outer C64 Border Box (Dynamically styled via POKE 53280) */}
        <div
          id="c64-crt-screen-container"
          onClick={handleScreenClick}
          style={{ backgroundColor: borderColorHex }}
          className="relative p-4 sm:p-7 rounded-2xl shadow-inner transition-colors duration-200 cursor-text overflow-hidden"
        >
          {/* Inner C64 40x25 Screen (Dynamically styled via POKE 53281) */}
          <div
            style={{ backgroundColor: bgColorHex }}
            className={`relative min-h-[380px] sm:min-h-[460px] max-h-[520px] rounded-xl p-4 sm:p-5 flex flex-col font-mono text-xs sm:text-sm shadow-2xl transition-colors duration-200 overflow-hidden ${
              enableCrtEffect ? 'c64-crt-scanlines' : ''
            }`}
          >
            {/* Scrollable Terminal Output Buffer */}
            <div
              ref={screenScrollRef}
              className="flex-1 overflow-y-auto space-y-0.5 leading-relaxed selection:bg-[#AAFFEE]/30 selection:text-white"
            >
              {c64State.terminalHistory.map((line, idx) => {
                const lineCol =
                  line.textColor !== undefined
                    ? C64_PALETTE[line.textColor]?.hex
                    : defaultTextColorHex;
                return (
                  <div
                    key={idx}
                    style={{ color: lineCol }}
                    className="whitespace-pre-wrap break-all uppercase tracking-wider font-semibold font-mono"
                  >
                    {line.text || '\u00A0'}
                  </div>
                );
              })}

              {/* Active Interactive Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-1">
                <input
                  ref={inputRef}
                  id="c64-terminal-input"
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  style={{ color: defaultTextColorHex }}
                  className="flex-1 bg-transparent outline-none font-mono uppercase tracking-wider font-bold text-xs sm:text-sm"
                  placeholder=""
                />
                {/* Blinking C64 solid block cursor */}
                <span
                  style={{ backgroundColor: defaultTextColorHex }}
                  className="w-2.5 h-4 inline-block animate-pulse select-none"
                />
              </form>
            </div>
          </div>
        </div>

        {/* Vintage Monitor & CRT Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1 font-mono text-xs text-[#382F24] select-none">
          <div className="flex items-center gap-2">
            {/* RUN / STOP (Break) button */}
            <button
              onClick={onBreak}
              title="RUN/STOP (Escape)"
              className="px-2.5 py-1 bg-[#382F24] hover:bg-[#4D4133] text-[#E0D8C3] rounded-lg font-bold text-[10px] sm:text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>RUN / STOP</span>
            </button>

            {/* Reset C64 Computer */}
            <button
              onClick={onResetC64}
              title={language === 'hu' ? 'C64 Újraindítása (Cold Reset)' : 'C64 Reset'}
              className="p-1.5 bg-[#4D4133] hover:bg-[#5C4F3F] text-[#E0D8C3] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Hardware Freeze button (if cartridge present) */}
            {onFreezeCartridge && (
              <button
                onClick={onFreezeCartridge}
                title={language === 'hu' ? 'Turbó Kártya Hardveres Freeze Gomb' : 'Cartridge Hardware Freeze'}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1 ${
                  turboState?.isFrozen
                    ? 'bg-pink-600 text-white animate-pulse'
                    : 'bg-rose-700 hover:bg-rose-600 text-white'
                }`}
              >
                <Pause className="w-3 h-3 fill-current" />
                <span>FREEZE</span>
              </button>
            )}

            {/* Clear Screen */}
            <button
              onClick={onClearScreen}
              className="px-2 py-1 bg-[#4D4133] hover:bg-[#5C4F3F] text-[#E0D8C3] rounded-lg text-[10px] transition-colors cursor-pointer"
            >
              {language === 'hu' ? 'KÉPERNYŐ TÖRLÉS (CLR)' : 'CLR SCREEN'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* CRT Effect Toggle */}
            <button
              onClick={() => setEnableCrtEffect(!enableCrtEffect)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                enableCrtEffect
                  ? 'bg-[#382F24] text-[#AAFFEE]'
                  : 'bg-[#5C4F3F] text-[#E0D8C3]'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>CRT {enableCrtEffect ? 'ON' : 'OFF'}</span>
            </button>

            {/* Copy screen contents */}
            <button
              onClick={handleCopyScreen}
              className="flex items-center gap-1 px-2 py-1 bg-[#4D4133] hover:bg-[#5C4F3F] text-[#E0D8C3] rounded-lg text-[10px] transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? (language === 'hu' ? 'Másolva!' : 'Copied!') : 'Másolás'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
