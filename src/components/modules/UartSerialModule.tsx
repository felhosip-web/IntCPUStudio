import React, { useState } from 'react';
import { UartState } from '../../types/hardware';
import { useI18n } from '../../i18n/I18nContext';
import { Terminal, Send, RefreshCw, Repeat, Radio, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface UartSerialModuleProps {
  uartState: UartState;
  onUpdateUart: (updater: (prev: UartState) => UartState) => void;
}

export const UartSerialModule: React.FC<UartSerialModuleProps> = ({ uartState, onUpdateUart }) => {
  const { language } = useI18n();
  const [inputMessage, setInputMessage] = useState('');

  const handleInjectRx = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage) return;

    const bytes: number[] = [];
    for (let i = 0; i < inputMessage.length; i++) {
      bytes.push(inputMessage.charCodeAt(i));
    }
    // Add newline
    bytes.push(10);

    onUpdateUart((prev) => ({
      ...prev,
      rxBuffer: [...(prev?.rxBuffer || []), ...bytes],
      rxReady: true,
      historyLog: [...(prev?.historyLog || []), `[RX Injected] "${inputMessage}\\n" (${bytes.length} bytes)`],
    }));

    setInputMessage('');
  };

  const rxBuffer = uartState?.rxBuffer || [];
  const historyLog = uartState?.historyLog || [];
  const isTxBusy = !!uartState?.txBusy;
  const isLoopback = !!uartState?.loopback;
  const baud = uartState?.baudRate ?? 9600;

  return (
    <div className="p-4 flex flex-col gap-3 text-xs font-mono select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'Hardver Soros Port (UART)' : 'Hardware Serial UART'}
            </div>
            <div className="text-[10px] text-emerald-400">
              {language === 'hu' ? 'I/O Port: 8 (0x08)' : 'I/O Port: 8 (0x08)'}
            </div>
          </div>
        </div>

        {/* TX/RX Activity LEDs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400">TX</span>
            <div
              className={`w-2.5 h-2.5 rounded-full border ${
                isTxBusy
                  ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400">RX</span>
            <div
              className={`w-2.5 h-2.5 rounded-full border ${
                rxBuffer.length > 0
                  ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Baud & Loopback Settings */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[#0A0B0E]/60 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Baud:</span>
          <select
            value={baud}
            onChange={(e) => {
              const b = Number(e.target.value);
              onUpdateUart((p) => ({ ...p, baudRate: b }));
            }}
            className="bg-slate-900 text-cyan-300 font-bold text-[10px] px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none"
          >
            <option value={1200}>1200</option>
            <option value={9600}>9600</option>
            <option value={115200}>115200</option>
          </select>
        </div>

        <button
          onClick={() => onUpdateUart((p) => ({ ...p, loopback: !p.loopback }))}
          className={`p-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
            isLoopback
              ? 'bg-blue-950 text-blue-300 border-blue-700'
              : 'bg-[#0A0B0E]/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Repeat className="w-3 h-3" />
          <span>{isLoopback ? 'Loopback: BE' : 'Loopback: KI'}</span>
        </button>
      </div>

      {/* Serial Monitor Log Box */}
      <div className="p-2.5 rounded-xl bg-[#05070A] border border-slate-800 h-28 overflow-y-auto flex flex-col gap-1 font-mono text-[10px] text-slate-300 shadow-inner">
        {historyLog.length === 0 ? (
          <div className="text-slate-600 italic">{language === 'hu' ? 'Nincs soros forgalom...' : 'No serial traffic...'}</div>
        ) : (
          historyLog.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.includes('[TX]')
                  ? 'text-amber-300'
                  : log.includes('[RX')
                  ? 'text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* Inject Data into RX input form */}
      <form onSubmit={handleInjectRx} className="flex items-center gap-1.5">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={language === 'hu' ? 'Bemenő szöveg (RX pufferbe)...' : 'Type to send to RX buffer...'}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Send className="w-3 h-3" />
          <span>{language === 'hu' ? 'Küld' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
