import React, { useState } from 'react';
import { DmaState } from '../../types/hardware';
import { CpuState } from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import { Layers, Play, CheckCircle2, ArrowRight, Activity, Zap } from 'lucide-react';
import { playAluChime } from '../../core/audio';

interface DmaControllerModuleProps {
  dmaState: DmaState;
  cpu: CpuState;
  onUpdateDma: (updater: (prev: DmaState) => DmaState) => void;
  onUpdateCpuState: (updater: (prev: CpuState) => CpuState) => void;
}

export const DmaControllerModule: React.FC<DmaControllerModuleProps> = ({
  dmaState,
  cpu,
  onUpdateDma,
  onUpdateCpuState,
}) => {
  const { language } = useI18n();
  const [transferInProgress, setTransferInProgress] = useState(false);

  const channel = dmaState?.channels?.[0] || {
    channelId: 0,
    enabled: true,
    sourceAddress: 0x80,
    destAddress: 0xc0,
    transferLength: 16,
    transferredBytes: 0,
    direction: 'MEM_TO_MEM' as const,
    port: 0,
    isBusy: false,
    autoIncrement: true,
  };

  const handleTriggerTransfer = () => {
    setTransferInProgress(true);
    onUpdateDma((prev) => ({
      ...prev,
      isBusMaster: true,
    }));

    setTimeout(() => {
      onUpdateCpuState((prevCpu) => {
        const newMem = new Uint8Array(prevCpu.memory || 256);
        const transferLen = channel?.transferLength || 16;
        const srcAddr = channel?.sourceAddress ?? 0x80;
        const dstAddr = channel?.destAddress ?? 0xc0;

        for (let i = 0; i < transferLen; i++) {
          const src = (srcAddr + i) % newMem.length;
          const dst = (dstAddr + i) % newMem.length;
          newMem[dst] = newMem[src];
        }
        return {
          ...prevCpu,
          memory: newMem,
          bus: {
            ...prevCpu.bus,
            controlLines: ['DMA_HOLD', 'BUS_GRANT', 'BURST_TRANSFER'],
            activeSource: 'DMA_CONTROLLER',
            activeDestination: 'MEMORY_BUS',
          },
          picState: prevCpu.picState
            ? {
                ...prevCpu.picState,
                lines: (prevCpu.picState.lines || []).map((l) =>
                  l.irq === 2 ? { ...l, isPending: true } : l
                ),
              }
            : prevCpu.picState,
        };
      });

      playAluChime();
      setTransferInProgress(false);
      onUpdateDma((prev) => ({
        ...prev,
        isBusMaster: false,
        lastTransferTime: Date.now(),
      }));
    }, 400);
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'DMA Közvetlen Memóriahozzáférés' : 'DMA Memory Controller'}
            </div>
            <div className="text-[10px] text-blue-400">
              {language === 'hu' ? 'Nagysebességű Blokk-Átvitel' : 'High-Speed Block Transfer'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Bus Master:</span>
          <span
            className={`w-2.5 h-2.5 rounded-full border ${
              transferInProgress || dmaState?.isBusMaster
                ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                : 'bg-slate-800 border-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Channel 0 Config Box */}
      <div className="p-3 rounded-xl bg-[#0A0B0E]/90 border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{language === 'hu' ? 'Forrás Cím (SRC):' : 'Source Address:'}</span>
          <span className="font-bold text-cyan-300">
            0x{(channel?.sourceAddress ?? 0x80).toString(16).toUpperCase().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{language === 'hu' ? 'Cél Cím (DST):' : 'Destination Address:'}</span>
          <span className="font-bold text-emerald-300">
            0x{(channel?.destAddress ?? 0xc0).toString(16).toUpperCase().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{language === 'hu' ? 'Átviteli Hossz:' : 'Length:'}</span>
          <span className="font-bold text-purple-300">{channel?.transferLength ?? 16} Bájt</span>
        </div>

        <button
          onClick={handleTriggerTransfer}
          disabled={transferInProgress}
          className={`mt-1.5 w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
            transferInProgress
              ? 'bg-amber-600 text-slate-950 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>
            {transferInProgress
              ? language === 'hu'
                ? 'DMA Átvitel Folyamatban...'
                : 'DMA Transfer Active...'
              : language === 'hu'
              ? 'DMA Blokk Átvitel Indítása'
              : 'Execute DMA Block Transfer'}
          </span>
        </button>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-blue-400" />
        <span>
          {language === 'hu'
            ? 'A DMA átvitel befejezése után automatikusan IRQ 2 kérést küld a PIC vezérlőnek.'
            : 'Upon DMA completion, IRQ 2 line is automatically asserted to the PIC controller.'}
        </span>
      </div>
    </div>
  );
};
