import React, { useEffect, useRef, useState } from 'react';
import { SerialMessage, SerialPlotPoint } from '../../types/mcu';
import { useI18n } from '../../i18n/I18nContext';
import { LineChart, MessageSquare, Send, Terminal, Trash2 } from 'lucide-react';

interface McuSerialConsoleProps {
  serialLogs: SerialMessage[];
  serialPlotData: SerialPlotPoint[];
  onSendSerial: (text: string) => void;
  onClearLogs: () => void;
}

export const McuSerialConsole: React.FC<McuSerialConsoleProps> = ({
  serialLogs,
  serialPlotData,
  onSendSerial,
  onClearLogs,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'PLOTTER'>('MONITOR');
  const [inputText, setInputText] = useState('');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'MONITOR') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, activeTab]);

  // Serial Plotter Canvas Render
  useEffect(() => {
    if (activeTab !== 'PLOTTER') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#05070A';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 20; y < h; y += 30) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    if (serialPlotData.length < 2) return;

    // Draw Channel 1: Potentiometer (0..1023)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const stepX = w / (serialPlotData.length - 1);

    serialPlotData.forEach((pt, idx) => {
      const x = idx * stepX;
      const y = h - 10 - (pt.val1 / 1023) * (h - 20);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Channel 2: Temp (0..1000)
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    serialPlotData.forEach((pt, idx) => {
      const x = idx * stepX;
      const y = h - 10 - ((pt.val2 || 0) / 1000) * (h - 20);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [serialPlotData, activeTab]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendSerial(inputText);
    setInputText('');
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 shadow-xl select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200">
              {language === 'hu' ? 'UART Soros Monitor & Plotter' : 'UART Serial Monitor & Plotter'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              9600 Baud [8N1] • UDR0 Transceiver
            </p>
          </div>
        </div>

        {/* Tab & Clear Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#05070A] p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setActiveTab('MONITOR')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'MONITOR'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>{language === 'hu' ? 'Terminál' : 'Terminal'}</span>
            </button>

            <button
              onClick={() => setActiveTab('PLOTTER')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'PLOTTER'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3 h-3" />
              <span>Plotter</span>
            </button>
          </div>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
            title="Napló törlése"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Terminal Log OR Plotter Canvas */}
      {activeTab === 'MONITOR' ? (
        <div className="p-3 rounded-xl bg-[#05070A] border border-slate-800 h-44 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col gap-1 shadow-inner">
          {serialLogs.length === 0 ? (
            <div className="text-slate-600 italic text-[11px]">
              {language === 'hu' ? 'Nincs soros adatforgalom...' : 'No serial traffic yet...'}
            </div>
          ) : (
            serialLogs.map((log) => (
              <div
                key={log.id}
                className={`text-[11px] leading-relaxed ${
                  log.type === 'SYS'
                    ? 'text-cyan-400'
                    : log.type === 'RX'
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 text-[9px] mr-2">[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-[#05070A]">
            <canvas ref={canvasRef} width={500} height={140} className="w-full h-36 block" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-cyan-400 font-bold">● Ch1: Potentiometer ADC (0..1023)</span>
            <span className="text-rose-400 font-bold">● Ch2: Temperature Sensor</span>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={language === 'hu' ? 'Küldj adatot vagy parancsot (pl. LED ON, 255)...' : 'Send data or command (e.g. LED ON, 255)...'}
          className="flex-1 bg-[#05070A] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/30 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{language === 'hu' ? 'Küldés' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
