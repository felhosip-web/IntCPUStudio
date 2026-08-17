import React from 'react';
import { BoardModule, ModuleType } from '../types/cpu';
import { useI18n } from '../i18n/I18nContext';
import {
  Activity,
  Cable,
  Check,
  Cpu,
  Database,
  Grid,
  HardDrive,
  Layers,
  Plus,
  Sliders,
  Sparkles,
  Terminal,
  Clock,
  Music,
  Radio,
  Zap,
  Calculator,
  Wrench,
  X,
} from 'lucide-react';

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: BoardModule[];
  onToggleModule: (type: ModuleType) => void;
  onApplyLayoutPreset: (preset: 'EDUCATIONAL' | 'FULL_CIRCUIT' | 'DEBUGGER' | 'MINIMAL' | 'RETRO_WORKSTATION') => void;
}

const AVAILABLE_MODULES: Array<{
  type: ModuleType;
  titleHu: string;
  titleEn: string;
  descHu: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'CORE' | 'MEMORY' | 'BUS' | 'IO' | 'DEV';
}> = [
  {
    type: 'HARDWARE_CONFIG',
    titleHu: 'Hardver & CPU Mag Konfigurátor',
    titleEn: 'Hardware & CPU Core Configurator',
    descHu: 'Élő processzormag váltó (Edu8, 6502, Z80, SAP-1, Harvard) és busz beállítások',
    descEn: 'Live CPU core switcher (Edu8, 6502, Z80, SAP-1, Harvard) & bus settings',
    icon: Wrench,
    category: 'CORE',
  },
  {
    type: 'REGISTERS',
    titleHu: 'Regisztertár (Registers File)',
    titleEn: 'Register File (Registers & Flags)',
    descHu: 'A, B, C, D, PC, SP, IR regiszterek és a FLAGS jelzőbitek',
    descEn: 'A, B, C, D, PC, SP, IR registers and status FLAGS',
    icon: Cpu,
    category: 'CORE',
  },
  {
    type: 'ALU',
    titleHu: 'ALU (Aritmetikai és Logikai Egység)',
    titleEn: 'ALU (Arithmetic Logic Unit)',
    descHu: 'Vizuális V-alakú logikai blokk, bemeneti és kimeneti buszokkal',
    descEn: 'Visual V-shaped execution unit with dual inputs and flags',
    icon: Activity,
    category: 'CORE',
  },
  {
    type: 'CONTROL_UNIT',
    titleHu: 'Vezérlőegység és Órajel Szekvenszer',
    titleEn: 'Control Unit & Clock Sequencer',
    descHu: '6 al-ciklusos mikrolépés állapotgép és vezérlővonalak',
    descEn: '6-phase microstep state sequencer & control lines',
    icon: Sliders,
    category: 'CORE',
  },
  {
    type: 'PIPELINE_FLOW',
    titleHu: 'Adatút Vonalak és Von Neumann Folyamat',
    titleEn: 'Datapath Flow & Von Neumann Cycle',
    descHu: 'Fetch -> Decode -> Execute -> Writeback vizuális adatfolyam',
    descEn: 'Fetch -> Decode -> Execute -> Writeback datapath',
    icon: Layers,
    category: 'CORE',
  },
  {
    type: 'MEMORY',
    titleHu: 'RAM Memória Térkép (256 Bájt)',
    titleEn: 'RAM Memory Map (256 Bytes)',
    descHu: 'Hexadecimális és ASCII memóriarács PC, SP és írás kijelzéssel',
    descEn: 'Hex & ASCII 256-byte RAM grid with PC/SP pointer indicators',
    icon: Database,
    category: 'MEMORY',
  },
  {
    type: 'STACK_VIEW',
    titleHu: 'Verem Memória (Call Stack)',
    titleEn: 'Call Stack & Memory View',
    descHu: 'Függvényhívások és mentett regiszterek veremmélysége',
    descEn: 'Subroutine call frames and pushed register values',
    icon: Layers,
    category: 'MEMORY',
  },
  {
    type: 'BUS_MONITOR',
    titleHu: 'Adat- és Címbusz Monitor',
    titleEn: 'Data & Address Bus Monitor',
    descHu: '8 bites fizikai buszvezetékek valós idejű LED lámpákkal',
    descEn: '8-bit physical bus traces with live animated LED indicators',
    icon: Cable,
    category: 'BUS',
  },
  {
    type: 'TIMING_DIAGRAM',
    titleHu: 'Valós Idejű Időzítési Diagram & Logikai Analizátor',
    titleEn: 'Timing Diagram & Logic Analyzer (100 Cycles)',
    descHu: 'Vezérlőjelek (/MREQ, /IORQ, /RD, /WR), mérőkurzorok (ΔT), adatlapos minták és gépi ciklus dekódoló',
    descEn: 'Real-time control strobes (/MREQ, /IORQ, /RD, /WR), dual measurement cursors (ΔT) & protocol decoding',
    icon: Activity,
    category: 'BUS',
  },
  {
    type: 'IO_PERIPHERALS',
    titleHu: 'I/O Alap-Perifériák (LED, 7-Seg, Konzol, DIP)',
    titleEn: 'Standard I/O Peripherals (LEDs, 7-Seg, Terminal, DIP)',
    descHu: 'Port 0-4 kapcsolók, LED-ek, ASCII Terminál, 7-szegmens kijelző, Beeper',
    descEn: 'Port 0-4 switches, LEDs, ASCII Terminal, 7-Segment, Beeper',
    icon: HardDrive,
    category: 'IO',
  },
  {
    type: 'MATRIX_DISPLAY',
    titleHu: '8x8 Grafikus LED Mátrix Kijelző',
    titleEn: '8x8 Graphical LED Matrix Display',
    descHu: 'Port 5-re küldött bájtok pixelmátrixként történő kirajzolása',
    descEn: 'Port 5 byte-driven graphical pixel matrix',
    icon: Grid,
    category: 'IO',
  },
  {
    type: 'TIMER_RTC',
    titleHu: 'Hardver Időzítő & RTC Óra (Port 6)',
    titleEn: 'Hardware Timer & RTC Clock (Port 6)',
    descHu: '16-bites számláló, prescaler osztó, periodikus IRQ megszakítás',
    descEn: '16-bit counter, prescaler divider, periodic IRQ interrupt generator',
    icon: Clock,
    category: 'IO',
  },
  {
    type: 'AUDIO_DAC_PSG',
    titleHu: 'PSG Chiptune Hanggenerátor (Port 7)',
    titleEn: 'PSG Chiptune Audio Synthesizer (Port 7)',
    descHu: 'Négyszög, háromszög, fűrészfog és zaj hanghullámok, élő oszcilloszkóp',
    descEn: 'Square, triangle, sawtooth and noise sound generator with live oscilloscope',
    icon: Music,
    category: 'IO',
  },
  {
    type: 'UART_SERIAL',
    titleHu: 'Hardver Soros Port UART (Port 8)',
    titleEn: 'Hardware Serial UART (Port 8)',
    descHu: 'TX/RX FIFO pufferek, Baud sebesség választó, soros monitor',
    descEn: 'TX/RX FIFO buffers, Baud rate selector, live serial console',
    icon: Radio,
    category: 'IO',
  },
  {
    type: 'INTERRUPT_CONTROLLER',
    titleHu: 'PIC Megszakításvezérlő (8259)',
    titleEn: 'PIC Interrupt Controller (8259)',
    descHu: 'Prioritásos IRQ 0-3 megszakítás vektorok és maszkregiszter (IMR)',
    descEn: 'Vectored priority IRQ 0-3 interrupts & interrupt mask register (IMR)',
    icon: Zap,
    category: 'CORE',
  },
  {
    type: 'MATH_COPROCESSOR',
    titleHu: 'Matematikai Koprocesszor MAC (Port 9)',
    titleEn: 'Math Co-Processor & MAC (Port 9)',
    descHu: '1-ciklusos 8x8 hardveres szorzó, 16-bites osztó és akkumulátor egység',
    descEn: '1-cycle 8x8 hardware multiplier, 16-bit divider & MAC accumulator',
    icon: Calculator,
    category: 'IO',
  },
  {
    type: 'DMA_CONTROLLER',
    titleHu: 'DMA Közvetlen Memóriahozzáférés',
    titleEn: 'DMA Direct Memory Access Controller',
    descHu: 'Nagysebességű memóriablokk másolás CPU beavatkozás nélkül',
    descEn: 'High-speed autonomous memory block copying with bus mastering',
    icon: Layers,
    category: 'MEMORY',
  },
  {
    type: 'CODE_EDITOR',
    titleHu: 'Assembly Kódszerkesztő & Hibakereső',
    titleEn: 'Assembly Code Editor & Debugger',
    descHu: 'Sorkövetés, töréspontok, szimbólumtábla és azonnali fordító',
    descEn: 'Line stepping, breakpoints, label resolution & live assembler',
    icon: Terminal,
    category: 'DEV',
  },
];

export const AddModuleModal: React.FC<AddModuleModalProps> = ({
  isOpen,
  onClose,
  modules,
  onToggleModule,
  onApplyLayoutPreset,
}) => {
  const { language } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0B0E]/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-slate-950">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white">
                {language === 'hu'
                  ? 'Modul Könyvtár & Elrendezés Kezelő'
                  : 'Module Library & Layout Manager'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hu'
                  ? 'Kapcsold be vagy ki a kívánt CPU egységeket, vagy válassz egy kész elrendezést!'
                  : 'Enable or disable CPU blocks, or choose a pre-configured layout preset!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Quick Layout Presets */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {language === 'hu' ? 'Gyors Elrendezési Sablonok (Presets)' : 'Quick Layout Presets'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  onApplyLayoutPreset('EDUCATIONAL');
                  onClose();
                }}
                className="p-3 bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 rounded-xl text-left transition-all group"
              >
                <div className="font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                  {language === 'hu' ? 'Oktató Mód' : 'Educational'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu' ? 'Kód + Regiszterek + ALU + I/O' : 'Code + Regs + ALU + I/O'}
                </div>
              </button>

              <button
                onClick={() => {
                  onApplyLayoutPreset('FULL_CIRCUIT');
                  onClose();
                }}
                className="p-3 bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition-all group"
              >
                <div className="font-mono text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                  {language === 'hu' ? 'Teljes Áramkör' : 'Full Circuit'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu' ? 'Minden modul bekapcsolva' : 'All modules enabled'}
                </div>
              </button>

              <button
                onClick={() => {
                  onApplyLayoutPreset('DEBUGGER');
                  onClose();
                }}
                className="p-3 bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500 rounded-xl text-left transition-all group"
              >
                <div className="font-mono text-xs font-bold text-purple-300 group-hover:text-purple-200">
                  {language === 'hu' ? 'IDE & Debugger' : 'IDE & Debugger'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu' ? 'Nagy szerkesztő + RAM + Verem' : 'Editor + RAM + Stack'}
                </div>
              </button>

              <button
                onClick={() => {
                  onApplyLayoutPreset('MINIMAL');
                  onClose();
                }}
                className="p-3 bg-[#0A0B0E]/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition-all group"
              >
                <div className="font-mono text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  {language === 'hu' ? 'Kompakt Nézet' : 'Compact View'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {language === 'hu' ? 'Csak a fő komponensek' : 'Essential blocks only'}
                </div>
              </button>
            </div>
          </div>

          {/* Module Toggles List */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3">
              {language === 'hu'
                ? `Elérhető Hardver Modulok (${AVAILABLE_MODULES.length})`
                : `Available Hardware Modules (${AVAILABLE_MODULES.length})`}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const isPresent = modules.some((m) => m.type === mod.type && m.isVisible);
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.type}
                    onClick={() => onToggleModule(mod.type)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isPresent
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-slate-100 shadow-sm'
                        : 'bg-[#0A0B0E]/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          isPresent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold truncate">
                          {language === 'hu' ? mod.titleHu : mod.titleEn}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {language === 'hu' ? mod.descHu : mod.descEn}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isPresent
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
