import React, { useEffect, useState } from 'react';
import { TimerRtcState } from '../../types/hardware';
import { useI18n } from '../../i18n/I18nContext';
import { Clock, Play, Pause, RefreshCw, Zap, Bell, CheckCircle2 } from 'lucide-react';

interface TimerRtcModuleProps {
  timerState: TimerRtcState;
  onUpdateTimer: (updater: (prev: TimerRtcState) => TimerRtcState) => void;
}

export const TimerRtcModule: React.FC<TimerRtcModuleProps> = ({ timerState, onUpdateTimer }) => {
  const { language } = useI18n();

  const isEnabled = !!timerState?.enabled;
  const counter = timerState?.counter ?? 0;
  const prescaler = timerState?.prescaler ?? 1;
  const irqPending = !!timerState?.irqPending;
  const interruptOnOverflow = !!timerState?.interruptOnOverflow;

  // Live timer simulation tick
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      onUpdateTimer((prev) => {
        const curr = prev?.counter ?? 0;
        const next = (curr + 1) & 0xff;
        const isOverflow = next === 0;
        const ticks = (prev?.ticks ?? 0) + 1;
        const realSecs = prev?.realTimeSeconds ?? 0;
        return {
          ...prev,
          counter: next,
          irqPending: isOverflow && prev?.interruptOnOverflow ? true : prev?.irqPending ?? false,
          ticks: ticks,
          realTimeSeconds: ticks % 10 === 0 ? realSecs + 1 : realSecs,
        };
      });
    }, 100 * Math.max(1, prescaler));

    return () => clearInterval(interval);
  }, [isEnabled, prescaler, onUpdateTimer]);

  const percentage = Math.round((counter / 255) * 100);

  return (
    <div className="p-4 flex flex-col gap-3.5 text-xs font-mono select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'Hardver Időzítő & RTC' : 'Hardware Timer & RTC'}
            </div>
            <div className="text-[10px] text-cyan-400">
              {language === 'hu' ? 'I/O Port: 6 (0x06)' : 'I/O Port: 6 (0x06)'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onUpdateTimer((p) => ({ ...p, enabled: !p?.enabled }))}
          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors ${
            isEnabled
              ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isEnabled ? (language === 'hu' ? 'Fut' : 'Running') : (language === 'hu' ? 'Áll' : 'Halted')}</span>
        </button>
      </div>

      {/* Main Counter Display */}
      <div className="p-3 rounded-xl bg-[#0A0B0E]/90 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{language === 'hu' ? 'Időzítő Számláló:' : 'Timer Counter:'}</span>
          <span className="text-base font-bold font-mono text-cyan-300">
            0x{counter.toString(16).toUpperCase().padStart(2, '0')} ({counter}/255)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* IRQ status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">IRQ 0 Vonal:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold ${
                irqPending
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              {irqPending ? 'AKTÍV (TRIGGERED)' : 'INAKTÍV (IDLE)'}
            </span>
          </div>

          {irqPending && (
            <button
              onClick={() => onUpdateTimer((p) => ({ ...p, irqPending: false }))}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              {language === 'hu' ? 'Nyugtázás (ACK)' : 'Acknowledge'}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-[#0A0B0E]/60 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold">
            {language === 'hu' ? 'Előosztó (Prescaler):' : 'Prescaler:'}
          </span>
          <div className="grid grid-cols-3 gap-1">
            {[1, 8, 64].map((pre) => (
              <button
                key={pre}
                onClick={() => onUpdateTimer((p) => ({ ...p, prescaler: pre }))}
                className={`py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  prescaler === pre
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                1:{pre}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0A0B0E]/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold">
            {language === 'hu' ? 'Túlcsordulási IRQ:' : 'Overflow IRQ:'}
          </span>
          <button
            onClick={() => onUpdateTimer((p) => ({ ...p, interruptOnOverflow: !p?.interruptOnOverflow }))}
            className={`py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              interruptOnOverflow
                ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                : 'bg-slate-900 text-slate-500'
            }`}
          >
            {interruptOnOverflow ? 'ENGEDÉLYEZVE' : 'LETILTVA'}
          </button>
        </div>
      </div>
    </div>
  );
};
