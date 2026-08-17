import React, { useEffect, useRef, useState } from 'react';
import { LogicChannel } from '../../types/mcu';
import { useI18n } from '../../i18n/I18nContext';
import { Activity, FastForward, Play, Square, ZoomIn, ZoomOut } from 'lucide-react';

interface McuLogicAnalyzerProps {
  channels: LogicChannel[];
  isRunning: boolean;
}

export const McuLogicAnalyzer: React.FC<McuLogicAnalyzerProps> = ({ channels, isRunning }) => {
  const { language } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timebase, setTimebase] = useState<number>(1); // Zoom level

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#05070A';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      const chCount = channels.length || 4;
      const chHeight = (h - 20) / chCount;

      channels.forEach((ch, idx) => {
        const topY = 10 + idx * chHeight;
        const lowY = topY + chHeight - 6;
        const highY = topY + 6;

        // Channel baseline guide
        ctx.strokeStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(0, lowY);
        ctx.lineTo(w, lowY);
        ctx.stroke();

        // Channel Waveform
        ctx.strokeStyle = ch.color || '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const history = ch.history || [];
        const stepX = (w / Math.max(1, history.length - 1)) * timebase;

        for (let i = 0; i < history.length; i++) {
          const val = history[i];
          const x = i * stepX;
          // Interpolate y between highY and lowY
          const y = lowY - val * (lowY - highY);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Square wave transition
            const prevVal = history[i - 1];
            const prevY = lowY - prevVal * (lowY - highY);
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Channel Label
        ctx.fillStyle = ch.color || '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(ch.name, 6, topY + 12);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [channels, timebase]);

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200">
              {language === 'hu' ? '4-Csatornás Logikai Analizátor & Oszcilloszkóp' : '4-Channel Logic Analyzer & Scope'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {language === 'hu' ? 'PB5 (LED), PD3 (PWM), PD2 (INT0), PD1 (TXD) digitális hullámformák' : 'PB5 (LED), PD3 (PWM), PD2 (INT0), PD1 (TXD) digital waveforms'}
            </p>
          </div>
        </div>

        {/* Timebase Controls */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <button
            onClick={() => setTimebase((prev) => Math.max(0.5, prev - 0.25))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Időalap kicsinyítés"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-400 font-bold">{timebase.toFixed(2)}x</span>
          <button
            onClick={() => setTimebase((prev) => Math.min(2.5, prev + 0.25))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Időalap nagyítás"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Oscilloscope Screen */}
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-[#05070A] relative">
        <canvas ref={canvasRef} width={600} height={160} className="w-full h-40 block" />
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Trigger: <strong className="text-slate-400">Auto (Rising Edge)</strong></span>
        <span>Sample Rate: <strong className="text-slate-400">10 kS/s</strong></span>
        <span>Voltage Range: <strong className="text-emerald-400">0V - 5.0V TTL</strong></span>
      </div>
    </div>
  );
};
