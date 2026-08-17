import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import {
  Activity,
  Binary,
  Blocks,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

export type CpuStudioSubTab =
  | 'MODULAR_BOARD'
  | 'HEX_STUDIO'
  | 'IO_PERIPHERAL_STUDIO'
  | 'TIMING_STUDIO'
  | 'BLOCK_STUDIO'
  | 'RISCV_PIPELINE'
  | 'CACHE_HIERARCHY'
  | 'MICROCODE_STUDIO';

interface CpuStudioTabsProps {
  activeTab: CpuStudioSubTab;
  onChangeTab: (tab: CpuStudioSubTab) => void;
}

export const CpuStudioTabs: React.FC<CpuStudioTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { language } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-slate-800 rounded-2xl p-2 shadow-xl">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Tab 1: Modular 8-Bit Board */}
        <button
          onClick={() => onChangeTab('MODULAR_BOARD')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'MODULAR_BOARD'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{language === 'hu' ? '🖥️ 8-Bites Alaplap' : '🖥️ 8-Bit Modular Board'}</span>
        </button>

        {/* Tab: Hex Editor & Hex Dump Studio */}
        <button
          onClick={() => onChangeTab('HEX_STUDIO')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'HEX_STUDIO'
              ? 'bg-gradient-to-r from-amber-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Binary className="w-4 h-4 text-amber-300" />
          <span>{language === 'hu' ? '🔢 Hex Editor & Dump' : '🔢 Hex Editor & Dump'}</span>
        </button>

        {/* Tab 2: I/O Peripheral & MMIO Emulator */}
        <button
          onClick={() => onChangeTab('IO_PERIPHERAL_STUDIO')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'IO_PERIPHERAL_STUDIO'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>{language === 'hu' ? '🔌 I/O Periféria & MMIO' : '🔌 I/O & MMIO Emulator'}</span>
        </button>

        {/* Tab 2: Real-Time Timing Diagram / Logic Analyzer */}
        <button
          onClick={() => onChangeTab('TIMING_STUDIO')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'TIMING_STUDIO'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-300" />
          <span>{language === 'hu' ? '📈 Időzítési Diagram' : '📈 Timing Diagram'}</span>
        </button>

        {/* Tab 3: Visual Blockly Assembly Studio */}
        <button
          onClick={() => onChangeTab('BLOCK_STUDIO')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'BLOCK_STUDIO'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Blocks className="w-4 h-4 text-amber-200" />
          <span>{language === 'hu' ? '🧩 Blokk-Kódoló' : '🧩 Block Studio'}</span>
        </button>

        {/* Tab 3: RISC-V 5-Stage Pipeline */}
        <button
          onClick={() => onChangeTab('RISCV_PIPELINE')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'RISCV_PIPELINE'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>{language === 'hu' ? '⚡ RISC-V Futószalag' : '⚡ RISC-V Pipeline'}</span>
        </button>

        {/* Tab 4: Cache Hierarchy */}
        <button
          onClick={() => onChangeTab('CACHE_HIERARCHY')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'CACHE_HIERARCHY'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-blue-200" />
          <span>{language === 'hu' ? '💾 L1/L2 Cache' : '💾 L1/L2 Cache'}</span>
        </button>

        {/* Tab 5: Microcode ROM & Custom ISA */}
        <button
          onClick={() => onChangeTab('MICROCODE_STUDIO')}
          className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'MICROCODE_STUDIO'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-rose-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-rose-200" />
          <span>{language === 'hu' ? '⚙️ Mikrokód ROM' : '⚙️ Microcode ROM'}</span>
        </button>
      </div>

      <span className="text-[11px] font-mono text-slate-500 hidden xl:inline px-3">
        {activeTab === 'MODULAR_BOARD'
          ? language === 'hu'
            ? 'Edu8 / 6502 / Z80 / SAP-1 Interaktív Modulok'
            : 'Edu8 / 6502 / Z80 / SAP-1 Interactive Modules'
          : activeTab === 'HEX_STUDIO'
          ? language === 'hu'
            ? 'Klasszikus Hex Dump, ASCII Dekóder & Endianness Elemző'
            : 'Classic Hex Dump, ASCII Decoder & Endianness Inspector'
          : activeTab === 'IO_PERIPHERAL_STUDIO'
          ? language === 'hu'
            ? 'MMIO Címzés & Interaktív Perifériák'
            : 'MMIO Addressing & Interactive Peripherals'
          : activeTab === 'TIMING_STUDIO'
          ? language === 'hu'
            ? 'Órajel Ciklusok & Digitális Logikai Hullámformák'
            : 'Clock Cycles & Digital Logic Waveforms'
          : activeTab === 'BLOCK_STUDIO'
          ? language === 'hu'
            ? 'Drag & Drop Vizuális CPU Utasítások & Kódgenerátor'
            : 'Drag & Drop Visual CPU Instructions & Code Generator'
          : activeTab === 'RISCV_PIPELINE'
          ? language === 'hu'
            ? '5-Fokozatú IF/ID/EX/MEM/WB & Hardveres Forwarding'
            : '5-Stage IF/ID/EX/MEM/WB & Hardware Forwarding'
          : activeTab === 'CACHE_HIERARCHY'
          ? language === 'hu'
            ? 'Tag/Index/Offset Címbontás & LRU/FIFO Szimuláció'
            : 'Tag/Index/Offset Breakdown & LRU/FIFO Simulation'
          : language === 'hu'
          ? 'T0..T5 Vezérlővonalak & Hardver ROM Mátrix'
          : 'T0..T5 Control Lines & Hardware ROM Matrix'}
      </span>
    </div>
  );
};
