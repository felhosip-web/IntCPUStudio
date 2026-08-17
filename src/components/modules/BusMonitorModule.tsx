import React from 'react';
import { BusSignalState } from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import { ArrowRight, Cable, Cpu, Database, HardDrive, Radio } from 'lucide-react';

interface BusMonitorModuleProps {
  bus: BusSignalState;
}

export const BusMonitorModule: React.FC<BusMonitorModuleProps> = ({ bus }) => {
  const { language, t } = useI18n();

  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  const dataBits = toBin(bus.dataBus).split('');
  const addrBits = toBin(bus.addressBus).split('');

  const getSourceIcon = (src: string) => {
    if (src.includes('RAM') || src.includes('STACK')) return Database;
    if (src.includes('REG') || src.includes('PC') || src.includes('IR')) return Cpu;
    if (src.includes('PORT')) return HardDrive;
    return Radio;
  };

  const SourceIcon = getSourceIcon(bus.activeSource);
  const DestIcon = getSourceIcon(bus.activeDestination);

  return (
    <div className="flex flex-col gap-4">
      {/* Active Source -> Bus -> Destination Flow Header */}
      <div className="p-3 bg-gradient-to-r from-[#0A0B0E] via-slate-900 to-[#0A0B0E] rounded-xl border border-slate-800 flex items-center justify-between">
        {/* Source Unit */}
        <div className="flex items-center gap-2 p-2 bg-[#0A0B0E] rounded-lg border border-cyan-500/40 min-w-28">
          <SourceIcon className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-500">
              {language === 'hu' ? 'FORRÁS' : 'SOURCE'}
            </div>
            <div className="font-mono text-xs font-bold text-cyan-300 truncate">
              {bus.activeSource || (language === 'hu' ? 'INAKTÍV' : 'IDLE')}
            </div>
          </div>
        </div>

        {/* Animated Bus Transfer Arrow */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="flex items-center gap-1 text-cyan-400 animate-pulse">
            <span className="h-[2px] w-6 bg-gradient-to-r from-cyan-500 to-emerald-500" />
            <ArrowRight className="w-4 h-4" />
            <span className="h-[2px] w-6 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
            {language === 'hu' ? 'BUSZ TRANSZFER' : 'BUS TRANSFER'}
          </span>
        </div>

        {/* Destination Unit */}
        <div className="flex items-center gap-2 p-2 bg-[#0A0B0E] rounded-lg border border-emerald-500/40 min-w-28">
          <DestIcon className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-500">
              {language === 'hu' ? 'CÉL' : 'DESTINATION'}
            </div>
            <div className="font-mono text-xs font-bold text-emerald-300 truncate">
              {bus.activeDestination || (language === 'hu' ? 'INAKTÍV' : 'IDLE')}
            </div>
          </div>
        </div>
      </div>

      {/* 8-bit Data Bus Visualizer */}
      <div className="p-3 bg-[#0A0B0E]/80 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
            <Cable className="w-3.5 h-3.5" />
            <span>
              {language === 'hu' ? 'ADATBUSZ (DATA BUS - 8 BIT)' : 'DATA BUS (8-BIT)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Dec: {bus.dataBus}</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              {toHex(bus.dataBus)}
            </span>
          </div>
        </div>

        {/* 8 physical LED pins */}
        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {dataBits.map((bit, idx) => {
            const pinNumber = 7 - idx;
            const isOn = bit === '1';
            return (
              <div
                key={pinNumber}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isOn
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-[8px] font-mono text-slate-500">D{pinNumber}</div>
                <div
                  className={`w-3 h-3 mx-auto my-1 rounded-full ${
                    isOn
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-300 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                />
                <div
                  className={`font-mono text-xs font-bold ${
                    isOn ? 'text-cyan-300' : 'text-slate-600'
                  }`}
                >
                  {bit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-bit Address Bus Visualizer */}
      <div className="p-3 bg-[#0A0B0E]/80 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
            <Cable className="w-3.5 h-3.5" />
            <span>
              {language === 'hu' ? 'CÍMBUSZ (ADDRESS BUS - 8 BIT)' : 'ADDRESS BUS (8-BIT)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Dec: {bus.addressBus}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              {toHex(bus.addressBus)}
            </span>
          </div>
        </div>

        {/* 8 physical LED pins */}
        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {addrBits.map((bit, idx) => {
            const pinNumber = 7 - idx;
            const isOn = bit === '1';
            return (
              <div
                key={pinNumber}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isOn
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-[8px] font-mono text-slate-500">A{pinNumber}</div>
                <div
                  className={`w-3 h-3 mx-auto my-1 rounded-full ${
                    isOn
                      ? 'bg-amber-400 shadow-sm shadow-amber-300 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                />
                <div
                  className={`font-mono text-xs font-bold ${
                    isOn ? 'text-amber-300' : 'text-slate-600'
                  }`}
                >
                  {bit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
