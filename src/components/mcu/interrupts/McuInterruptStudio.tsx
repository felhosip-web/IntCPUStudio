import React, { useState } from 'react';
import { McuState, McuInterruptVector } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import { ATMEGA328P_INTERRUPT_VECTORS } from '../../../core/mcuInterruptData';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  Cpu,
  Eye,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

interface McuInterruptStudioProps {
  mcuState: McuState;
  onUpdateState: (updater: (prev: McuState) => McuState) => void;
  onFlashCode?: (code: string) => void;
}

export const McuInterruptStudio: React.FC<McuInterruptStudioProps> = ({
  mcuState,
  onUpdateState,
  onFlashCode,
}) => {
  const { language } = useI18n();
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVector, setSelectedVector] = useState<McuInterruptVector>(
    ATMEGA328P_INTERRUPT_VECTORS[1] // INT0 default
  );

  const globalI = mcuState.registers.sreg.I;
  const isrActive = !globalI && mcuState.registers.sp < 0x08fd;

  // Filter vectors
  const filteredVectors = ATMEGA328P_INTERRUPT_VECTORS.filter((v) => {
    const matchesCategory =
      selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchesSearch =
      v.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameHu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Inject Interrupt Event Handlers
  const handleTriggerInt0 = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      // Simulate INT0 trigger
      const returnPc = next.registers.pc;
      if (next.registers.sp >= 0x0102) {
        next.sram[next.registers.sp] = returnPc & 0xff;
        next.sram[next.registers.sp - 1] = (returnPc >> 8) & 0xff;
        next.registers.sp -= 2;
        next.registers.sreg.I = false; // Disable global interrupts
        // Search for ISR_INT0 label or line
        const isrIdx = next.flashMemory.findIndex(
          (line) =>
            line.toUpperCase().includes('ISR_INT0') ||
            line.toUpperCase().includes('INT0:') ||
            line.includes('.org 0x0002')
        );
        if (isrIdx !== -1) {
          next.registers.pc = isrIdx;
        }
        next.currentExplanation = 'HARDWARE INTERRUPT (INT0): Button PD2 triggered. PC saved to Stack, I-flag cleared, branched to ISR.';
        next.currentExplanationHu = 'HARDVERES MEGSZAKÍTÁS (INT0): PD2 gomb megnyomva. PC mentve a verembe, I-bit törölve, ugrás az ISR-re.';
      }
      return next;
    });
    setActivePipelineStep(4);
  };

  const handleTriggerTimerOvf = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      const returnPc = next.registers.pc;
      if (next.registers.sp >= 0x0102) {
        next.sram[next.registers.sp] = returnPc & 0xff;
        next.sram[next.registers.sp - 1] = (returnPc >> 8) & 0xff;
        next.registers.sp -= 2;
        next.registers.sreg.I = false;
        next.currentExplanation = 'TIMER0 OVERFLOW INTERRUPT: TCNT0 reached 255 -> 0. Millis() timebase tick triggered.';
        next.currentExplanationHu = 'TIMER0 TÚLCSORDULÁS: TCNT0 átfordult 255 -> 0. Millis() időalap megszakítás lefutott.';
      }
      return next;
    });
    setActivePipelineStep(4);
  };

  const handleTriggerAdcComplete = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      const returnPc = next.registers.pc;
      if (next.registers.sp >= 0x0102) {
        next.sram[next.registers.sp] = returnPc & 0xff;
        next.sram[next.registers.sp - 1] = (returnPc >> 8) & 0xff;
        next.registers.sp -= 2;
        next.registers.sreg.I = false;
        next.currentExplanation = 'ADC CONVERSION COMPLETE: 10-bit sensor result loaded into ADCL/ADCH registers.';
        next.currentExplanationHu = 'ADC MÉRÉS KÉSZ: 10-bites szenzorérték betöltve az ADCL/ADCH regiszterekbe.';
      }
      return next;
    });
    setActivePipelineStep(4);
  };

  const handleExecuteReti = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      if (next.registers.sp <= 0x08fd) {
        next.registers.sp += 2;
        const retPc = (next.sram[next.registers.sp - 1] << 8) | next.sram[next.registers.sp];
        next.registers.pc = retPc % (next.flashMemory.length || 1);
        next.registers.sreg.I = true; // Re-enable global interrupts
        next.currentExplanation = `RETI: Return from Interrupt to line ${next.registers.pc}. Global Interrupts re-enabled (I=1).`;
        next.currentExplanationHu = `RETI: Visszatérés a megszakításból a(z) ${next.registers.pc}. sorra. Globális megszakítások újra aktívak (I=1).`;
      }
      return next;
    });
    setActivePipelineStep(5);
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 md:p-6 flex flex-col gap-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-950/40">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Hardveres Megszakítás (Interrupt) Stúdió & Vektortábla'
                  : 'Hardware Interrupt Pipeline & IVT Explorer'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-bold uppercase">
                26 Hardware Vectors
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {language === 'hu'
                ? 'Vizuális folyamatábra: Hogyan menti el a hardver a PC-t a verembe, futtatja az ISR-t és tér vissza RETI-vel'
                : 'Visual signal flow: Hardware triggering, context stacking, vector lookup, ISR execution, and RETI unwinding'}
            </p>
          </div>
        </div>

        {/* Global Interrupt Enable (I-Flag) Status Badge */}
        <div className="flex items-center gap-3 bg-[#05070A] p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">SREG I-Bit (SEI / CLI):</span>
          {globalI ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ENGEDÉLYEZVE (1)</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-300 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>TILTVA / ISR FUT (0)</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual 5-Stage Interactive Interrupt Pipeline */}
      <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-mono text-xs font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>{language === 'hu' ? 'Megszakítási Hardver Folyamat (5 Lépés)' : 'Visual 5-Stage Interrupt Lifecycle'}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Aktív fázis: <strong className="text-purple-300">{activePipelineStep}. Lépés</strong>
          </span>
        </div>

        {/* Pipeline Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Step 1: Trigger Event */}
          <div
            onClick={() => setActivePipelineStep(1)}
            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
              activePipelineStep === 1
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                #1
              </span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="font-mono text-xs font-bold">1. Esemény / Trigger</h4>
            <p className="text-[11px] font-sans text-slate-400 leading-tight">
              PD2 gomb lefutó él, Timer túlcsordulás vagy ADC kész
            </p>
          </div>

          {/* Step 2: Flag Register Latching */}
          <div
            onClick={() => setActivePipelineStep(2)}
            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
              activePipelineStep === 2
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                #2
              </span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="font-mono text-xs font-bold">2. Flag Regiszter</h4>
            <p className="text-[11px] font-sans text-slate-400 leading-tight">
              A hardver 1-be állítja a flag bitet (pl. EIFR.INTF0 = 1)
            </p>
          </div>

          {/* Step 3: Mask & Global I Gate */}
          <div
            onClick={() => setActivePipelineStep(3)}
            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
              activePipelineStep === 3
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                #3
              </span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-mono text-xs font-bold">3. Maszk & I-Bit</h4>
            <p className="text-[11px] font-sans text-slate-400 leading-tight">
              SREG.I és EIMSK.INT0 mindkettőnek 1-nek kell lennie
            </p>
          </div>

          {/* Step 4: Hardware Context Save */}
          <div
            onClick={() => setActivePipelineStep(4)}
            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
              activePipelineStep === 4
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                #4
              </span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="font-mono text-xs font-bold">4. Verembe Mentés</h4>
            <p className="text-[11px] font-sans text-slate-400 leading-tight">
              PC verembe írás (SP -= 2), SREG.I = 0 és ugrás a vektorra
            </p>
          </div>

          {/* Step 5: ISR & RETI */}
          <div
            onClick={() => setActivePipelineStep(5)}
            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
              activePipelineStep === 5
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                #5
              </span>
              <RotateCcw className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="font-mono text-xs font-bold">5. ISR & RETI</h4>
            <p className="text-[11px] font-sans text-slate-400 leading-tight">
              Kiszolgáló rutin lefutása, majd RETI: PC visszatöltése & I=1
            </p>
          </div>
        </div>

        {/* Interactive Event Injector Toolbar */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {language === 'hu' ? 'Hardver Esemény Injektálása:' : 'Trigger Event:'}
            </span>
            <button
              onClick={handleTriggerInt0}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>PD2 Gomb (INT0)</span>
            </button>
            <button
              onClick={handleTriggerTimerOvf}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Timer0 Túlcsordulás</span>
            </button>
            <button
              onClick={handleTriggerAdcComplete}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>ADC Konverzió Kész</span>
            </button>
          </div>

          <button
            onClick={handleExecuteReti}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RETI (Visszatérés & I=1)</span>
          </button>
        </div>
      </div>

      {/* 26-Vector Interrupt Table (IVT) & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vector Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#05070A] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>ATmega328P Megszakítási Vektortábla (IVT)</span>
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={language === 'hu' ? 'Keresés vektorok között...' : 'Search vectors...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            {['ALL', 'EXTERNAL', 'TIMER', 'COMMUNICATION', 'ANALOG', 'SYSTEM'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Vector Table List */}
          <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredVectors.map((vector) => {
              const isSelected = selectedVector.vectorNum === vector.vectorNum;
              return (
                <div
                  key={vector.vectorNum}
                  onClick={() => setSelectedVector(vector)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 font-mono text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-950/40'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold">
                      #{vector.vectorNum}
                    </span>
                    <strong className="text-cyan-300">{vector.address}</strong>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{vector.symbol}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {language === 'hu' ? vector.nameHu : vector.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Prio #{vector.priority}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Vector Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-[#05070A] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-white">
                {selectedVector.symbol}
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              {selectedVector.address}
            </span>
          </div>

          <div className="text-xs text-slate-300 font-sans leading-relaxed">
            {language === 'hu' ? selectedVector.descriptionHu : selectedVector.description}
          </div>

          {/* Hardware Trigger & Registers Spec */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex flex-col gap-2">
            <div>
              <span className="text-slate-500">{language === 'hu' ? 'Kiváltó Esemény:' : 'Trigger Source:'}</span>
              <div className="text-amber-300 font-bold mt-0.5">
                {language === 'hu' ? selectedVector.triggerHu : selectedVector.trigger}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[11px]">
              <div>
                <span className="text-slate-500">Maszk Regiszter:</span>
                <div className="text-emerald-300 font-bold">{selectedVector.maskRegister} ({selectedVector.maskBit})</div>
              </div>
              <div>
                <span className="text-slate-500">Flag Regiszter:</span>
                <div className="text-rose-300 font-bold">{selectedVector.flagRegister} ({selectedVector.flagBit})</div>
              </div>
            </div>
          </div>

          {/* Example Implementation Code */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              {language === 'hu' ? 'Kód Példa (C & Assembly):' : 'Code Example:'}
            </span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
              {selectedVector.exampleCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
