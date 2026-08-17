import React from 'react';
import { CpuCoreType, CpuCoreConfig, HardwareSetupConfig } from '../../types/hardware';
import { CpuState } from '../../types/cpu';
import { CPU_CORES } from '../../core/cpuCores';
import { useI18n } from '../../i18n/I18nContext';
import {
  Cpu,
  Sliders,
  Shield,
  Zap,
  Cable,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface HardwareConfigModuleProps {
  cpu: CpuState;
  onSwitchCore: (core: CpuCoreType) => void;
  onUpdateCoreConfig: (config: Partial<CpuCoreConfig>) => void;
  onUpdateHardwareConfig: (config: Partial<HardwareSetupConfig>) => void;
}

export const HardwareConfigModule: React.FC<HardwareConfigModuleProps> = ({
  cpu,
  onSwitchCore,
  onUpdateCoreConfig,
  onUpdateHardwareConfig,
}) => {
  const { language } = useI18n();
  const currentCoreInfo = CPU_CORES[cpu.coreType] || CPU_CORES.EDU8;

  const coreList: CpuCoreType[] = ['EDU8', 'MOS6502', 'Z80', 'SAP1', 'HARVARD8'];

  return (
    <div className="p-4 flex flex-col gap-4 text-xs font-mono select-none">
      {/* CPU Core Selector Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            {language === 'hu' ? 'Processzor Mag Választó' : 'CPU Core Architecture'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
            {currentCoreInfo.isaType} / {currentCoreInfo.architecture}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {coreList.map((type) => {
            const core = CPU_CORES[type];
            const isSelected = cpu.coreType === type;

            return (
              <div
                key={type}
                onClick={() => onSwitchCore(type)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-[#0A0B0E]/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">
                      {language === 'hu' ? core.nameHu : core.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'hu' ? core.shortDescHu : core.shortDesc}
                  </p>
                </div>

                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/60 text-[9px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {core.dataBusWidth}-bit Busz
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {core.registers.length} Regiszter
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Hardware Parameters Editing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        {/* Core & Bus Configuration */}
        <div className="p-3 rounded-xl bg-[#0A0B0E]/80 border border-slate-800 flex flex-col gap-2.5">
          <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'hu' ? 'Busz & CPU Paraméterek' : 'Bus & Core Tuning'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'hu' ? 'Címbusz Szélesség:' : 'Address Bus:'}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateCoreConfig({ addressBusBits: 8 })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  cpu.coreConfig.addressBusBits === 8
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                8-bit (256B)
              </button>
              <button
                onClick={() => onUpdateCoreConfig({ addressBusBits: 16 })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  cpu.coreConfig.addressBusBits === 16
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                16-bit (64KB)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'hu' ? 'Megszakítások (IRQ):' : 'Interrupts (IRQ):'}</span>
            <button
              onClick={() => onUpdateCoreConfig({ interruptsEnabled: !cpu.coreConfig.interruptsEnabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                cpu.coreConfig.interruptsEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
              }`}
            >
              {cpu.coreConfig.interruptsEnabled ? 'ENGEDÉLYEZVE (ON)' : 'LETILTVA (OFF)'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'hu' ? 'DMA Bus-Grant:' : 'DMA Bus-Grant:'}</span>
            <button
              onClick={() => onUpdateCoreConfig({ busGrantSupported: !cpu.coreConfig.busGrantSupported })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                cpu.coreConfig.busGrantSupported
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {cpu.coreConfig.busGrantSupported ? 'TÁMOGATVA (YES)' : 'NINCS (NO)'}
            </button>
          </div>
        </div>

        {/* Memory Partitioning & Protection */}
        <div className="p-3 rounded-xl bg-[#0A0B0E]/80 border border-slate-800 flex flex-col gap-2.5">
          <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hu' ? 'Memória & ROM Védelem' : 'Memory & Protection'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'hu' ? 'Architektúra Mód:' : 'Architecture Mode:'}</span>
            <span className="font-bold text-amber-300">
              {currentCoreInfo.architecture === 'HARVARD'
                ? 'Harvard (Külön Kód/Adat)'
                : 'Von Neumann (Egységes)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'hu' ? 'ROM Írásvédelem:' : 'ROM Write Protect:'}</span>
            <button
              onClick={() =>
                onUpdateHardwareConfig({
                  memoryProtection: {
                    ...cpu.hardwareConfig.memoryProtection,
                    isRomProtected: !cpu.hardwareConfig.memoryProtection.isRomProtected,
                  },
                })
              }
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                cpu.hardwareConfig.memoryProtection.isRomProtected
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cpu.hardwareConfig.memoryProtection.isRomProtected ? 'VÉDETT (RO)' : 'SZABAD (RW)'}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            {language === 'hu'
              ? `Jelenlegi aktív mag: ${currentCoreInfo.suitableForHu}`
              : `Current active core: ${currentCoreInfo.suitableForEn}`}
          </div>
        </div>
      </div>
    </div>
  );
};
