import React, { useState } from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Tv, Trash2, Send } from 'lucide-react';

interface IoCharacterLcdProps {
  device: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

export const IoCharacterLcd: React.FC<IoCharacterLcdProps> = ({
  device,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();
  const lcdState = device.lcdState || {
    ddram: Array(32).fill(' '),
    cursorPos: 0,
    displayOn: true,
    cursorOn: true,
    blinkOn: false,
    lastCommand: 0x80,
  };

  const [customText, setCustomText] = useState('');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  const line1 = lcdState.ddram.slice(0, 16);
  const line2 = lcdState.ddram.slice(16, 32);

  const handleClearDisplay = () => {
    onUpdateDevice({
      ...device,
      lcdState: {
        ...lcdState,
        ddram: Array(32).fill(' '),
        cursorPos: 0,
      },
    });
  };

  const handleSendCustomText = () => {
    if (!customText) return;
    const nextDdram = [...lcdState.ddram];
    let cur = lcdState.cursorPos;
    for (let i = 0; i < customText.length; i++) {
      nextDdram[cur] = customText[i];
      cur = (cur + 1) % 32;
    }
    onUpdateDevice({
      ...device,
      lcdState: {
        ...lcdState,
        ddram: nextDdram,
        cursorPos: cur,
      },
    });
    setCustomText('');
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {isBusActive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? device.nameHu : device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-teal-400 font-semibold">
                {toHex(device.baseAddress)} (CMD, RS=0) & {toHex(device.baseAddress + 1)} (DATA, RS=1)
              </span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                {device.chipSelectLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Clear LCD button */}
        <button
          onClick={handleClearDisplay}
          title="Clear LCD DDRAM"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Retro 16x2 HD44780 Backlit LCD Display */}
      <div className="p-3.5 bg-[#001c18] rounded-xl border-4 border-slate-800 shadow-[inset_0_0_20px_rgba(20,184,166,0.3)] mb-3 flex flex-col gap-1.5 font-mono select-none">
        {/* Line 1 */}
        <div className="flex items-center justify-between bg-[#002b25] px-2 py-1 rounded border border-teal-900/40">
          <div className="flex items-center tracking-widest text-sm font-bold text-teal-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]">
            {line1.map((char, idx) => {
              const isCursorHere = lcdState.cursorPos === idx;
              return (
                <span
                  key={idx}
                  className={`inline-block w-[15px] text-center ${
                    isCursorHere ? 'bg-teal-400 text-slate-950 animate-pulse font-extrabold' : ''
                  }`}
                >
                  {char || ' '}
                </span>
              );
            })}
          </div>
        </div>

        {/* Line 2 */}
        <div className="flex items-center justify-between bg-[#002b25] px-2 py-1 rounded border border-teal-900/40">
          <div className="flex items-center tracking-widest text-sm font-bold text-teal-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]">
            {line2.map((char, idx) => {
              const actualIdx = 16 + idx;
              const isCursorHere = lcdState.cursorPos === actualIdx;
              return (
                <span
                  key={idx}
                  className={`inline-block w-[15px] text-center ${
                    isCursorHere ? 'bg-teal-400 text-slate-950 animate-pulse font-extrabold' : ''
                  }`}
                >
                  {char || ' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manual text input injection */}
      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="text"
          maxLength={32}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCustomText()}
          placeholder={language === 'hu' ? 'Szöveg küldése DDRAM-ba...' : 'Type text to send to DDRAM...'}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-teal-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={handleSendCustomText}
          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-teal-900/30"
        >
          <Send className="w-3 h-3" />
          <span>{language === 'hu' ? 'Kiírás' : 'Send'}</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span>Cursor: pos {lcdState.cursorPos}</span>
        <span>Last CMD: <strong className="text-teal-400">{toHex(lcdState.lastCommand)}</strong></span>
      </div>
    </div>
  );
};
