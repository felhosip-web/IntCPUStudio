import React from 'react';
import { CpuState } from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import {
  ArrowDown,
  ArrowRight,
  Cpu,
  Database,
  Layers,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PipelineFlowModuleProps {
  cpu: CpuState;
}

export const PipelineFlowModule: React.FC<PipelineFlowModuleProps> = ({ cpu }) => {
  const { language } = useI18n();
  const isFetch = cpu.microStep === 'FETCH_MAR' || cpu.microStep === 'FETCH_IR';
  const isDecode = cpu.microStep === 'DECODE';
  const isExec = cpu.microStep === 'EXECUTE_OPERANDS' || cpu.microStep === 'EXECUTE_ALU';
  const isWriteback = cpu.microStep === 'WRITEBACK';

  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Visual Datapath Flow Diagram */}
      <div className="p-4 bg-[#0A0B0E]/90 rounded-xl border border-slate-800 flex flex-col gap-4">
        {/* Stage 1: Instruction Fetch */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isFetch
              ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400'
              : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-300">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {language === 'hu'
                  ? '1. FÁZIS: UTASÍTÁS BETÖLTÉSE (FETCH)'
                  : 'STAGE 1: INSTRUCTION FETCH'}
              </span>
            </div>
            {isFetch && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse font-semibold">
                {language === 'hu' ? 'AKTÍV FÁZIS' : 'ACTIVE'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-purple-500/30 text-purple-300">
              PC: <span className="font-bold text-slate-100">{toHex(cpu.registers.PC)}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-purple-500/30 text-purple-300">
              MAR: <span className="font-bold text-slate-100">{toHex(cpu.registers.MAR)}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-purple-500/30 text-purple-300">
              RAM[MAR]:{' '}
              <span className="font-bold text-slate-100">
                {toHex(cpu.memory[cpu.registers.MAR])}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-purple-500/30 text-purple-300">
              IR: <span className="font-bold text-slate-100">{toHex(cpu.registers.IR)}</span>
            </div>
          </div>
        </div>

        {/* Down connector */}
        <div className="flex justify-center -my-2 text-slate-600">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Stage 2: Decode & Control Unit */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isDecode
              ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
              : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {language === 'hu'
                  ? '2. FÁZIS: UTASÍTÁS DEKÓDOLÁSA (DECODE)'
                  : 'STAGE 2: INSTRUCTION DECODE'}
              </span>
            </div>
            {isDecode && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse font-semibold">
                {language === 'hu' ? 'AKTÍV FÁZIS' : 'ACTIVE'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-cyan-500/30 text-cyan-300">
              {language === 'hu' ? 'Opkód' : 'Opcode'}:{' '}
              <span className="font-bold text-slate-100">{toHex(cpu.registers.IR)}</span> (
              <span className="font-bold text-cyan-400">{cpu.currentInstructionName}</span>)
            </div>
            <div className="text-[11px] text-slate-400">
              {language === 'hu'
                ? 'Vezérlőmű mikro-utasításainak generálása'
                : 'Control Unit micro-instruction signals asserted'}
            </div>
          </div>
        </div>

        {/* Down connector */}
        <div className="flex justify-center -my-2 text-slate-600">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Stage 3: Execution & ALU */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isExec
              ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
              : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300">
              <Zap className="w-3.5 h-3.5" />
              <span>
                {language === 'hu'
                  ? '3. FÁZIS: VÉGREHAJTÁS ÉS ALU SZÁMÍTÁS (EXECUTE)'
                  : 'STAGE 3: EXECUTION & ALU'}
              </span>
            </div>
            {isExec && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse font-semibold">
                {language === 'hu' ? 'AKTÍV FÁZIS' : 'ACTIVE'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-emerald-500/30 text-emerald-300">
              Op A: <span className="font-bold text-slate-100">{cpu.alu.operandA}</span>
            </div>
            <span className="text-emerald-400 font-bold">[{cpu.alu.operation}]</span>
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-emerald-500/30 text-emerald-300">
              Op B: <span className="font-bold text-slate-100">{cpu.alu.operandB}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            <div className="p-1.5 bg-[#0A0B0E] rounded border border-emerald-500/30 text-emerald-300">
              {language === 'hu' ? 'ALU Eredmény' : 'ALU Result'}:{' '}
              <span className="font-bold text-slate-100">{cpu.alu.result}</span>
            </div>
          </div>
        </div>

        {/* Down connector */}
        <div className="flex justify-center -my-2 text-slate-600">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Stage 4: Writeback & Register Update */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isWriteback
              ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
              : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'hu'
                  ? '4. FÁZIS: EREDMÉNY MENTÉSE (WRITEBACK)'
                  : 'STAGE 4: WRITEBACK & STORE'}
              </span>
            </div>
            {isWriteback && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-semibold">
                {language === 'hu' ? 'AKTÍV FÁZIS' : 'ACTIVE'}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-300">
            {language === 'hu'
              ? 'Az ALU vagy busz kimenete átíródik a célregiszterbe vagy memóriacímre.'
              : 'Output latched into destination register or written to RAM.'}
          </div>
        </div>
      </div>
    </div>
  );
};
