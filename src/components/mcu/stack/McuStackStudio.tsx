import React, { useState } from 'react';
import { McuState, McuStackItem } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownCircle,
  ArrowUp,
  ArrowUpCircle,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  Database,
  Eye,
  FastForward,
  HelpCircle,
  History,
  Info,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface McuStackStudioProps {
  mcuState: McuState;
  onUpdateState: (updater: (prev: McuState) => McuState) => void;
  onFlashCode?: (code: string) => void;
}

export const McuStackStudio: React.FC<McuStackStudioProps> = ({
  mcuState,
  onUpdateState,
  onFlashCode,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'VISUALIZER' | 'CALL_STACK' | 'EXPERIMENTS'>('VISUALIZER');
  const [lastAction, setLastAction] = useState<string>('INIT');

  const sp = mcuState.registers.sp;
  const ramEnd = 0x08ff;
  const stackBytesUsed = Math.max(0, ramEnd - sp);
  const maxStackSafe = 512; // 512 bytes safe ceiling
  const isStackOverflow = sp < 0x0100;
  const isStackUnderflow = sp > ramEnd;

  // Build current stack items array (from RAMEND 0x08FF down to SP + 1)
  const stackItems: McuStackItem[] = [];
  for (let addr = ramEnd; addr > sp && addr >= 0x0100; addr--) {
    const offset = ramEnd - addr;
    const val = mcuState.sram[addr] || 0;
    let type: McuStackItem['type'] = 'DATA';
    let label = `SRAM[0x${addr.toString(16).toUpperCase()}]`;
    let desc = `Offset -${offset + 1} bytes from RAMEND`;
    let descHu = `Eltolás -${offset + 1} bájt a RAMEND-től`;

    // Guess item type based on pattern or offset
    if (offset % 2 === 0) {
      type = 'RET_ADDR_LOW';
      label = `RET_ADDR_L (0x${val.toString(16).toUpperCase().padStart(2, '0')})`;
      desc = `Low byte of Subroutine / ISR Return PC`;
      descHu = `Alprogram / Megszakítás visszatérési cím alsó bájtja`;
    } else if (offset % 2 === 1) {
      type = 'RET_ADDR_HIGH';
      label = `RET_ADDR_H (0x${val.toString(16).toUpperCase().padStart(2, '0')})`;
      desc = `High byte of Subroutine / ISR Return PC`;
      descHu = `Alprogram / Megszakítás visszatérési cím felső bájtja`;
    }

    if (val === 0x80 || val === 0x00) {
      // Could be SREG
    }

    stackItems.push({
      address: addr,
      offset,
      value: val,
      type,
      label,
      description: desc,
      descriptionHu: descHu,
    });
  }

  // Interactive Operations
  const handlePushByte = (value: number, customLabel?: string) => {
    onUpdateState((prev) => {
      const next = { ...prev };
      if (next.registers.sp >= 0x0100) {
        next.sram[next.registers.sp] = value & 0xff;
        next.registers.sp -= 1;
        setLastAction(`PUSH 0x${value.toString(16).toUpperCase().padStart(2, '0')}`);
      }
      return next;
    });
  };

  const handlePopByte = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      if (next.registers.sp < ramEnd) {
        next.registers.sp += 1;
        const popped = next.sram[next.registers.sp];
        next.registers.r[16] = popped;
        setLastAction(`POP -> R16 = 0x${popped.toString(16).toUpperCase().padStart(2, '0')}`);
      }
      return next;
    });
  };

  const handleSimulateRcall = (targetName: string = 'delay_ms') => {
    onUpdateState((prev) => {
      const next = { ...prev };
      const returnPc = (next.registers.pc + 1) % (next.flashMemory.length || 1);
      if (next.registers.sp >= 0x0102) {
        next.sram[next.registers.sp] = returnPc & 0xff;
        next.sram[next.registers.sp - 1] = (returnPc >> 8) & 0xff;
        next.registers.sp -= 2;
        setLastAction(`RCALL ${targetName} (Saved Return PC: Line ${returnPc + 1})`);
      }
      return next;
    });
  };

  const handleSimulateRet = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      if (next.registers.sp <= ramEnd - 2) {
        next.registers.sp += 2;
        const retPc = (next.sram[next.registers.sp - 1] << 8) | next.sram[next.registers.sp];
        next.registers.pc = retPc % (next.flashMemory.length || 1);
        setLastAction(`RET -> Restored PC to Line ${retPc + 1}`);
      }
      return next;
    });
  };

  const handleSimulateInterruptEntry = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      const returnPc = next.registers.pc;
      if (next.registers.sp >= 0x0103) {
        // Push PC Low & High
        next.sram[next.registers.sp] = returnPc & 0xff;
        next.sram[next.registers.sp - 1] = (returnPc >> 8) & 0xff;
        // Push SREG
        let sregVal = 0;
        if (next.registers.sreg.I) sregVal |= 0x80;
        if (next.registers.sreg.T) sregVal |= 0x40;
        if (next.registers.sreg.H) sregVal |= 0x20;
        if (next.registers.sreg.S) sregVal |= 0x10;
        if (next.registers.sreg.V) sregVal |= 0x08;
        if (next.registers.sreg.N) sregVal |= 0x04;
        if (next.registers.sreg.Z) sregVal |= 0x02;
        if (next.registers.sreg.C) sregVal |= 0x01;
        next.sram[next.registers.sp - 2] = sregVal;
        next.registers.sp -= 3;
        next.registers.sreg.I = false; // Disable interrupts during ISR
        setLastAction(`ISR ENTRY (INT0): Pushed PC (2B) + SREG (1B), I-flag cleared`);
      }
      return next;
    });
  };

  const handleSimulateReti = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      if (next.registers.sp <= ramEnd - 3) {
        // Pop SREG
        next.registers.sp += 1;
        const sregVal = next.sram[next.registers.sp];
        next.registers.sreg.Z = (sregVal & 0x02) !== 0;
        next.registers.sreg.C = (sregVal & 0x01) !== 0;
        // Pop PC
        next.registers.sp += 2;
        const retPc = (next.sram[next.registers.sp - 1] << 8) | next.sram[next.registers.sp];
        next.registers.pc = retPc % (next.flashMemory.length || 1);
        next.registers.sreg.I = true; // Auto re-enable I flag
        setLastAction(`RETI: Restored PC & SREG, Global Interrupts Re-enabled (I=1)`);
      }
      return next;
    });
  };

  const handleResetStack = () => {
    onUpdateState((prev) => {
      const next = { ...prev };
      next.registers.sp = ramEnd;
      setLastAction('STACK RESET: SP = 0x08FF (Empty Stack)');
      return next;
    });
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 md:p-6 flex flex-col gap-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-950/40">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Verem (Stack) & Memóriakeret Stúdió'
                  : 'MCU Stack Visualizer & Call Frame Studio'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold uppercase">
                SP @ 0x08FF
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {language === 'hu'
                ? 'A verem növekedése és ürülése CALL/RET, PUSH/POP és Megszakítások (ISR) során'
                : 'Live stack growth and shrinkage during CALL/RET, PUSH/POP, and Hardware Interrupts (ISR)'}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-[#05070A] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('VISUALIZER')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'VISUALIZER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Veremoszlop Vizuális Nézet' : 'Stack Column View'}</span>
          </button>
          <button
            onClick={() => setActiveTab('CALL_STACK')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'CALL_STACK'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Hívási Lánc (Call Stack)' : 'Call Hierarchy'}</span>
          </button>
          <button
            onClick={() => setActiveTab('EXPERIMENTS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'EXPERIMENTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hu' ? 'Oktató Kísérletek' : 'Stack Experiments'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Stack Usage Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Stack Pointer (SP) */}
        <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex flex-col gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Stack Pointer (SP)</span>
            <span className="text-cyan-400 font-bold">16-bit</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-cyan-300">
              0x{sp.toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <span className="text-xs text-slate-500 font-mono">({sp})</span>
          </div>
          <span className="text-[10px] text-slate-500 truncate">
            {sp === ramEnd ? '✨ RAMEND (Üres verem)' : `Offset: -${stackBytesUsed} bytes`}
          </span>
        </div>

        {/* Metric 2: Stack Depth */}
        <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex flex-col gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>{language === 'hu' ? 'Verem Mélység' : 'Stack Depth'}</span>
            <span className="text-indigo-400 font-bold">{stackBytesUsed} B</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-indigo-300">
              {stackBytesUsed} <span className="text-xs text-slate-400">/ 2048 B</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                isStackOverflow ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (stackBytesUsed / maxStackSafe) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Growth Direction */}
        <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex flex-col gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            {language === 'hu' ? 'Növekedési Irány' : 'Growth Direction'}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-sm font-bold mt-0.5">
            <ArrowDown className="w-4 h-4 animate-bounce text-cyan-400" />
            <span>{language === 'hu' ? 'LEFELÉ (0x08FF -> 0x0100)' : 'DOWNWARD (SP--)'}</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {language === 'hu' ? 'PUSH/CALL csökkent, POP/RET növel' : 'PUSH/CALL: SP--, POP/RET: SP++'}
          </span>
        </div>

        {/* Metric 4: Health / Overflow Guard */}
        <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex flex-col gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            {language === 'hu' ? 'Verem Integritás' : 'Stack Integrity'}
          </span>
          {isStackOverflow ? (
            <div className="flex items-center gap-1 text-rose-400 font-mono text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>STACK OVERFLOW!</span>
            </div>
          ) : isStackUnderflow ? (
            <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>STACK UNDERFLOW</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>STABIL & BIZTONSÁGOS</span>
            </div>
          )}
          <span className="text-[10px] text-slate-500">
            {2048 - stackBytesUsed} B szabad SRAM
          </span>
        </div>
      </div>

      {/* Interactive Control Toolbar */}
      <div className="p-3.5 rounded-2xl bg-[#05070A] border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          {/* Push Byte */}
          <button
            onClick={() => handlePushByte(mcuState.registers.r[16] || 0x42)}
            className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="PUSH R16: Érték elmentése a verembe és SP csökkentése 1-gyel"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>PUSH R16 (0x{(mcuState.registers.r[16] || 0x42).toString(16).toUpperCase().padStart(2, '0')})</span>
          </button>

          {/* Pop Byte */}
          <button
            onClick={handlePopByte}
            disabled={stackBytesUsed === 0}
            className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              stackBytesUsed > 0
                ? 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/50 text-amber-300 cursor-pointer shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="POP R16: Bájt visszatöltése a veremből R16-ba és SP növelése 1-gyel"
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>POP R16</span>
          </button>

          {/* RCALL Subroutine */}
          <button
            onClick={() => handleSimulateRcall('delay_ms')}
            className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="RCALL: Visszatérési PC (2 bájt) verembe mentése és SP csökkentése 2-vel"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>RCALL delay_ms (PC -2B)</span>
          </button>

          {/* RET Subroutine Return */}
          <button
            onClick={handleSimulateRet}
            disabled={stackBytesUsed < 2}
            className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              stackBytesUsed >= 2
                ? 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/50 text-cyan-300 cursor-pointer shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="RET: Visszatérési PC visszaolvasása a veremből és SP növelése 2-vel"
          >
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>RET (PC +2B)</span>
          </button>

          {/* Simulate Interrupt Frame */}
          <button
            onClick={handleSimulateInterruptEntry}
            className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="Hardveres Megszakítás (INT0): PC (2B) + SREG (1B) mentése a verembe"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Simulate ISR INT0 (-3B)</span>
          </button>

          {/* RETI Return from Interrupt */}
          <button
            onClick={handleSimulateReti}
            disabled={stackBytesUsed < 3}
            className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              stackBytesUsed >= 3
                ? 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50 text-purple-300 cursor-pointer shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="RETI: Visszatérés a megszakításból és I-bit (SREG) re-enable"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>RETI (+3B & I=1)</span>
          </button>
        </div>

        {/* Reset Stack */}
        <button
          onClick={handleResetStack}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'hu' ? 'Verem Nullázása (SP=0x08FF)' : 'Reset Stack (SP=RAMEND)'}</span>
        </button>
      </div>

      {/* Last Operation Feedback Banner */}
      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between text-xs font-mono text-indigo-300">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-400 font-sans">{language === 'hu' ? 'Utolsó veremművelet:' : 'Last Stack Event:'}</span>
          <strong className="text-white font-mono">{lastAction}</strong>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          ATmega328P SRAM: 0x0100 – 0x08FF (2048 B)
        </span>
      </div>

      {/* Main Studio Tab Content */}
      {activeTab === 'VISUALIZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Stack Column & Memory Ladder (8 cols) */}
          <div className="lg:col-span-8 bg-[#05070A] rounded-2xl border border-slate-800 p-4 flex flex-col gap-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 font-mono text-xs text-slate-300">
              <span className="font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {language === 'hu' ? 'Élő Verem Memóriatérkép (SRAM)' : 'Live Stack Memory Ladder'}
              </span>
              <span className="text-[10px] text-slate-500">
                Top of Stack: <strong className="text-cyan-400">0x{sp.toString(16).toUpperCase().padStart(4, '0')}</strong>
              </span>
            </div>

            {/* Stack Visual Representation */}
            {stackItems.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-slate-800/80 rounded-2xl">
                <div className="p-3 rounded-full bg-slate-900 text-slate-500">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="max-w-md">
                  <h4 className="font-mono text-sm font-bold text-slate-300">
                    {language === 'hu' ? 'A verem jelenleg üres (SP = RAMEND 0x08FF)' : 'Stack is Currently Empty (SP = RAMEND 0x08FF)'}
                  </h4>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    {language === 'hu'
                      ? 'Kattints a fenti PUSH, RCALL vagy ISR gombokra, vagy indítsd el a szimulátort, hogy lásd a verem dinamikus felépülését!'
                      : 'Click PUSH, RCALL, or ISR simulation buttons above, or run the CPU simulator to watch the stack grow in real-time!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {/* Visual Stack Pointer Head Marker */}
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/60 flex items-center justify-between font-mono text-xs shadow-lg shadow-cyan-950/50 animate-pulse">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <ArrowDown className="w-4 h-4 text-cyan-400" />
                    <span>👉 Stack Pointer (SP) = 0x{sp.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700">
                    {language === 'hu' ? 'KÖVETKEZŐ SZABAD BÁJT' : 'NEXT FREE SLOT'}
                  </span>
                </div>

                {/* Stack Slots from Top to Bottom */}
                {stackItems.map((item, idx) => {
                  const isTop = idx === stackItems.length - 1;
                  return (
                    <div
                      key={item.address}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs transition-all ${
                        item.type === 'RET_ADDR_LOW' || item.type === 'RET_ADDR_HIGH'
                          ? 'bg-cyan-950/30 border-cyan-800/60 text-cyan-200'
                          : item.type === 'SAVED_SREG'
                          ? 'bg-purple-950/30 border-purple-800/60 text-purple-200'
                          : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                      }`}
                    >
                      {/* Left: Address & Position */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-bold">
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <strong className="text-white">
                              0x{item.address.toString(16).toUpperCase().padStart(4, '0')}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-sans">
                              (RAMEND - {item.offset})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-300 font-bold">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Right: Value in Hex/Dec & Badge */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-white">
                            0x{item.value.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({item.value} / 0b{item.value.toString(2).padStart(8, '0')})
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-1 rounded-lg font-bold border uppercase tracking-wider ${
                            item.type === 'RET_ADDR_LOW' || item.type === 'RET_ADDR_HIGH'
                              ? 'bg-cyan-900/60 text-cyan-300 border-cyan-700'
                              : item.type === 'SAVED_SREG'
                              ? 'bg-purple-900/60 text-purple-300 border-purple-700'
                              : 'bg-amber-900/60 text-amber-300 border-amber-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Base of Stack: RAMEND (0x08FF) */}
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>⚓ RAMEND (0x08FF) — Verem Kezdőpontja</span>
                  <span>ATmega328P 2KB SRAM vége</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Architectural Stack Details & Micro-Guide (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Architecture Card */}
            <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 shadow-inner">
              <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>{language === 'hu' ? 'AVR Verem Működése' : 'AVR Stack Mechanics'}</span>
              </h3>
              <div className="text-xs text-slate-400 font-sans space-y-2 leading-relaxed">
                <p>
                  {language === 'hu'
                    ? 'Az ATmega328P mikrovezérlőben a verem (Stack) a belső 2KB SRAM tetejéről (0x08FF) növekszik lefelé a 0x0100 cím irányába.'
                    : 'On the ATmega328P, the stack grows downwards in the internal 2KB SRAM from RAMEND (0x08FF) towards address 0x0100.'}
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="text-cyan-300">
                    <strong>CALL / RCALL:</strong> SP -= 2 (Ment PC_L, PC_H)
                  </div>
                  <div className="text-cyan-300">
                    <strong>RET:</strong> SP += 2 (Visszatölti a PC-t)
                  </div>
                  <div className="text-amber-300">
                    <strong>PUSH Rxx:</strong> SP -= 1 (Elment 1 bájtot)
                  </div>
                  <div className="text-amber-300">
                    <strong>POP Rxx:</strong> SP += 1 (Visszatölt 1 bájtot)
                  </div>
                  <div className="text-purple-300">
                    <strong>INTERRUPT (ISR):</strong> SP -= 2..3 (PC + SREG)
                  </div>
                  <div className="text-purple-300">
                    <strong>RETI:</strong> SP += 2..3 & SREG.I = 1
                  </div>
                </div>
              </div>
            </div>

            {/* Stack Overflow Safeguard Card */}
            <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-4 flex flex-col gap-2.5 shadow-inner">
              <h4 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{language === 'hu' ? 'Veremtúlcsordulás (Overflow)' : 'Stack Overflow Protection'}</span>
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {language === 'hu'
                  ? 'Ha a verem túl mélyre nő (pl. végtelen rekurzió vagy túl sok beágyazott interrupt miatt), felülírhatja a globális változókat (SRAM 0x0100 felett), ami a rendszer összeomlását okozza.'
                  : 'If the stack grows too deep (infinite recursion or nested interrupts), it collides with global variables in SRAM, causing erratic memory corruption and crashes.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Call Hierarchy */}
      {activeTab === 'CALL_STACK' && (
        <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h3 className="font-mono text-sm font-bold text-white">
                {language === 'hu' ? 'Aktív Függvényhívási Lánc' : 'Active Call Stack Frame Hierarchy'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {language === 'hu' ? 'Aktív hívási mélység:' : 'Call Depth:'}{' '}
              <strong className="text-cyan-400">{Math.floor(stackBytesUsed / 2)} szintek</strong>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Main Entry Frame */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">
                  0
                </div>
                <div>
                  <div className="font-bold text-white">main() / loop()</div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {language === 'hu' ? 'Fő végrehajtási szál (Flash .org 0x0000)' : 'Root execution thread'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                PC: Line {mcuState.registers.pc + 1}
              </span>
            </div>

            {/* Subroutine Frames */}
            {stackItems.filter((i) => i.type === 'RET_ADDR_LOW').map((frame, idx) => (
              <div
                key={frame.address}
                className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between font-mono text-xs ml-4"
              >
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-cyan-300">
                      subroutine_level_{idx + 1}()
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {language === 'hu' ? 'Mentett visszatérési cím:' : 'Saved Return Address:'}{' '}
                      0x{frame.address.toString(16).toUpperCase()}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700">
                  SP @ 0x{frame.address.toString(16).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Experiments */}
      {activeTab === 'EXPERIMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#05070A] border border-slate-800 flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>1. Kísérlet: Függvényhívás és Veremkeret (RCALL & RET)</span>
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Töltsd be a beépített veremhívásos mintaprogramot, és figyeld meg, ahogy az alprogram hívásakor 2 bájt visszatérési cím íródik a verembe, majd a RET visszatölti azt a Program Counterbe!
            </p>
            <button
              onClick={() => {
                if (onFlashCode) {
                  onFlashCode(`; Veremkeret Teszt Program
.org 0x0000
  ldi r16, 0x42
  rcall process_data
  nop
  rjmp 0x0000

process_data:
  push r16
  ldi r17, 0x10
  add r16, r17
  pop r16
  ret`);
                }
              }}
              className="mt-2 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold cursor-pointer transition-all self-start"
            >
              Mintakód Betöltése
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#05070A] border border-slate-800 flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-purple-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>2. Kísérlet: Megszakítási Keret (ISR Context Save)</span>
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Amikor egy megszakítás (pl. INT0) bekövetkezik, a hardver automatikusan elmenti a PC-t a verembe, majd az ISR belépési pontján a szoftver elmenti az SREG regisztert is a PUSH utasítással.
            </p>
            <button
              onClick={() => handleSimulateInterruptEntry()}
              className="mt-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold cursor-pointer transition-all self-start"
            >
              ISR Megszakítás Kiváltása
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
