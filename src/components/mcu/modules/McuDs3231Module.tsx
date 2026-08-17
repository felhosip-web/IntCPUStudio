import React from 'react';
import { Ds3231RtcState } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import { Battery, Bell, Calendar, Clock, RefreshCw, Thermometer, Zap } from 'lucide-react';

interface McuDs3231ModuleProps {
  state: Ds3231RtcState;
  onChange: (updater: (prev: Ds3231RtcState) => Ds3231RtcState) => void;
}

const DAYS_HU = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const McuDs3231Module: React.FC<McuDs3231ModuleProps> = ({ state, onChange }) => {
  const { language } = useI18n();

  // Sync to real local clock
  const handleSyncHost = () => {
    const now = new Date();
    onChange((prev) => ({
      ...prev,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dayOfWeek: now.getDay() === 0 ? 7 : now.getDay(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    }));
  };

  const handleAdjustMinutes = (delta: number) => {
    onChange((prev) => {
      let totalMins = prev.hours * 60 + prev.minutes + delta;
      if (totalMins < 0) totalMins += 24 * 60;
      totalMins %= 24 * 60;
      return {
        ...prev,
        hours: Math.floor(totalMins / 60),
        minutes: totalMins % 60,
      };
    });
  };

  const handleToggleAlarm = () => {
    onChange((prev) => ({
      ...prev,
      alarm1: {
        ...prev.alarm1,
        enabled: !prev.alarm1.enabled,
        triggered: false,
      },
    }));
  };

  const dayName =
    language === 'hu' ? DAYS_HU[(state.dayOfWeek - 1) % 7] : DAYS_EN[(state.dayOfWeek - 1) % 7];

  const timeString = `${String(state.hours).padStart(2, '0')}:${String(state.minutes).padStart(
    2,
    '0'
  )}:${String(state.seconds).padStart(2, '0')}`;

  const dateString = `${state.year}-${String(state.month).padStart(2, '0')}-${String(
    state.day
  ).padStart(2, '0')}`;

  return (
    <div className="bg-[#100F1E] rounded-xl border border-purple-500/30 p-3.5 flex flex-col gap-3 shadow-lg hover:border-purple-500/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-xs font-bold text-purple-300">DS3231 / DS1307</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono">
                I2C ({state.i2cAddress} - A4/A5)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {language === 'hu'
                ? 'Nagy Pontosságú Valós Idejű Óra (TCXO + Naptár)'
                : 'High-Precision Real-Time Clock with TCXO'}
            </p>
          </div>
        </div>

        {/* 1Hz SQW Blink Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className={`w-2.5 h-2.5 rounded-full border transition-all ${
              state.seconds % 2 === 0
                ? 'bg-purple-400 border-purple-200 shadow-md shadow-purple-500/50'
                : 'bg-slate-800 border-slate-700'
            }`}
          />
          <span className="text-purple-300 font-mono">SQW 1Hz</span>
        </div>
      </div>

      {/* Main Clock Face & Calendar Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#090812] p-3 rounded-lg border border-purple-950">
        {/* Left: Time & Date */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-mono text-purple-400/80 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {dateString} ({dayName})
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-3xl font-black text-purple-100 tracking-wider">
              {timeString}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <Thermometer className="w-3 h-3" /> TCXO: {state.temperature.toFixed(1)}°C
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Battery className="w-3 h-3" /> CR2032: {state.batteryVolts.toFixed(2)}V
            </span>
          </div>
        </div>

        {/* Right: Controls & Adjustments */}
        <div className="flex flex-col justify-between gap-1.5 font-mono text-[10px]">
          <span className="text-slate-400">
            {language === 'hu' ? 'Óra beállítás és szinkronizálás:' : 'Clock Controls:'}
          </span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={handleSyncHost}
              className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800 flex items-center justify-center gap-1 cursor-pointer"
              title="Számítógép órájának betöltése"
            >
              <RefreshCw className="w-2.5 h-2.5" /> {language === 'hu' ? 'Gép Óra' : 'Host Sync'}
            </button>
            <button
              onClick={() => handleAdjustMinutes(10)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-purple-950 text-purple-300 border border-purple-900 flex items-center justify-center cursor-pointer"
            >
              +10 Min
            </button>
            <button
              onClick={() => handleAdjustMinutes(60)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-purple-950 text-purple-300 border border-purple-900 flex items-center justify-center cursor-pointer"
            >
              +1 Óra
            </button>
          </div>

          {/* Alarm Status */}
          <div className="flex items-center justify-between pt-1 border-t border-purple-900/30">
            <span className="text-slate-500">Ébresztő (Alarm 1):</span>
            <button
              onClick={handleToggleAlarm}
              className={`px-2 py-0.5 rounded text-[9px] border font-bold flex items-center gap-1 cursor-pointer ${
                state.alarm1.enabled
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Bell className="w-2.5 h-2.5" />
              {state.alarm1.enabled ? '07:00 AKTÍV' : 'KIKAPCSOLVA'}
            </button>
          </div>
        </div>
      </div>

      {/* BCD Register Dump preview */}
      <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-purple-950">
        <div>
          <span className="text-slate-500">I2C Cím:</span>{' '}
          <strong className="text-purple-300">0x68 (DS3231) + 0x57 (AT24C32 EEPROM)</strong>
        </div>
        <div className="text-right text-emerald-400">
          I2C Bus: <span className="text-slate-300">SDA (A4) / SCL (A5) 400kHz Fast Mode</span>
        </div>
      </div>
    </div>
  );
};
