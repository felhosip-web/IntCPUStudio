import React from 'react';
import { PeripheralsState } from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import {
  Monitor,
  Sliders,
  Terminal,
  Trash2,
  Volume2,
  Zap,
} from 'lucide-react';

interface IOPeripheralsModuleProps {
  peripherals: PeripheralsState;
  onToggleDipSwitch?: (bitIndex: number) => void;
  onClearTerminal?: () => void;
}

export const IOPeripheralsModule: React.FC<IOPeripheralsModuleProps> = ({
  peripherals,
  onToggleDipSwitch,
  onClearTerminal,
}) => {
  const { language, t } = useI18n();

  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  const ledBits = toBin(peripherals.leds).split('');
  const dipBits = toBin(peripherals.dipSwitches).split('');

  const segNumber = peripherals.sevenSegment;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: 7-Segment Display (Port 3) & Beeper (Port 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 7-Segment Display */}
        <div className="p-3 bg-[#0A0B0E]/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3 text-rose-400" />
              <span>
                {language === 'hu' ? '7-SZEGMENS KIJELZŐ (PORT 3)' : '7-SEGMENT DISPLAY (PORT 3)'}
              </span>
            </span>
            <span>HEX: {toHex(segNumber)}</span>
          </div>

          <div className="my-2 p-2.5 bg-black/80 rounded-lg border border-rose-950 flex items-center justify-center">
            <div className="font-mono text-3xl font-extrabold tracking-widest text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
              {segNumber.toString().padStart(4, '0')}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center">
            {language === 'hu' ? `Decimális érték: ${segNumber}` : `Decimal value: ${segNumber}`}
          </div>
        </div>

        {/* Beeper & Audio Status */}
        <div className="p-3 bg-[#0A0B0E]/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>
                {language === 'hu' ? 'HANGSZÓRÓ / BEEP (PORT 4)' : 'SPEAKER / BEEPER (PORT 4)'}
              </span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                peripherals.beeperActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500 animate-pulse'
                  : 'text-slate-600'
              }`}
            >
              {peripherals.beeperActive
                ? language === 'hu'
                  ? 'SÍPOL'
                  : 'BEEPING'
                : language === 'hu'
                ? 'CSENDES'
                : 'SILENT'}
            </span>
          </div>

          <div className="my-2 p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-center gap-2">
            <Volume2
              className={`w-8 h-8 transition-transform ${
                peripherals.beeperActive
                  ? 'text-amber-400 scale-125 animate-bounce'
                  : 'text-slate-700'
              }`}
            />
            <div className="text-xs font-mono text-slate-300">
              {peripherals.beeperActive
                ? language === 'hu'
                  ? 'Hangjelzés folyamatban...'
                  : 'Sound emitting...'
                : language === 'hu'
                ? 'Port 4 utasításra vár'
                : 'Awaiting Port 4 output'}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center">
            {language === 'hu' ? 'Aktiválás: OUT 4, 1 vagy OUTI 4, 1' : 'Trigger: OUT 4, 1 or OUTI 4, 1'}
          </div>
        </div>
      </div>

      {/* Port 1: 8-bit LED Output Bar */}
      <div className="p-3 bg-[#0A0B0E]/90 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>
              {language === 'hu' ? '8 BITES LED SOR (PORT 1 KIMENET)' : '8-BIT LED BAR (PORT 1 OUTPUT)'}
            </span>
          </div>
          <span className="font-mono text-xs text-emerald-300 font-bold">
            {toHex(peripherals.leds)} ({peripherals.leds})
          </span>
        </div>

        <div className="grid grid-cols-8 gap-2 pt-1">
          {ledBits.map((bit, idx) => {
            const bitNum = 7 - idx;
            const isOn = bit === '1';
            return (
              <div
                key={bitNum}
                className="flex flex-col items-center gap-1 p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80"
              >
                <span className="text-[9px] font-mono text-slate-500">L{bitNum}</span>
                <div
                  className={`w-5 h-5 rounded-full transition-all ${
                    isOn
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] border border-emerald-200'
                      : 'bg-[#0A0B0E] border border-slate-800'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isOn ? 'text-emerald-300' : 'text-slate-600'
                  }`}
                >
                  {bit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Port 0: 8-bit DIP Switches (Input) */}
      <div className="p-3 bg-[#0A0B0E]/90 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>
              {language === 'hu' ? '8 BITES DIP KAPCSOLÓK (PORT 0 BEMENET)' : '8-BIT DIP SWITCHES (PORT 0 INPUT)'}
            </span>
          </div>
          <span className="font-mono text-xs text-cyan-300 font-bold">
            {toHex(peripherals.dipSwitches)} ({peripherals.dipSwitches})
          </span>
        </div>

        <div className="grid grid-cols-8 gap-2 pt-1">
          {dipBits.map((bit, idx) => {
            const bitNum = 7 - idx;
            const isOn = bit === '1';
            return (
              <button
                key={bitNum}
                id={`dip-switch-${bitNum}`}
                onClick={() => onToggleDipSwitch && onToggleDipSwitch(bitNum)}
                title={`${language === 'hu' ? 'DIP kapcsoló' : 'DIP Switch'} ${bitNum}`}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                  isOn
                    ? 'bg-cyan-500/20 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[9px] font-mono text-slate-400">SW{bitNum}</span>
                <div
                  className={`w-5 h-7 rounded-sm p-0.5 border flex flex-col justify-between transition-colors ${
                    isOn ? 'bg-cyan-950 border-cyan-400' : 'bg-[#0A0B0E] border-slate-700'
                  }`}
                >
                  <div
                    className={`w-full h-2.5 rounded-xs transition-all ${
                      isOn ? 'bg-cyan-400 shadow-sm' : 'bg-slate-700'
                    }`}
                  />
                  <div
                    className={`w-full h-2.5 rounded-xs transition-all ${
                      isOn ? 'bg-transparent' : 'bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isOn ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  {bit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Port 2: ASCII Terminal */}
      <div className="p-3 bg-[#0A0B0E]/90 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'hu' ? 'ASCII TERMINÁL KONZOL (PORT 2)' : 'ASCII TERMINAL CONSOLE (PORT 2)'}
            </span>
          </div>
          {onClearTerminal && (
            <button
              onClick={onClearTerminal}
              title={t('clearTerminal')}
              className="p-1 text-slate-500 hover:text-slate-300 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="h-24 bg-black p-3 rounded-lg border border-slate-800 overflow-y-auto font-mono text-xs text-cyan-400 whitespace-pre-wrap flex flex-col justify-end">
          {peripherals.terminalOutput || (
            <span className="text-slate-600 italic">
              {language === 'hu'
                ? '(A terminál üres. Küldj karaktereket a Port 2-re: pl. OUTI 2, 72)'
                : '(Terminal is empty. Send ASCII bytes to Port 2: e.g. OUTI 2, 72)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
