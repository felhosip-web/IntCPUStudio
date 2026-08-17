import React, { useState } from 'react';
import { AluOperation, AluState, CpuFlags } from '../../types/cpu';
import { calculateAlu } from '../../core/cpuEngine';
import { useI18n } from '../../i18n/I18nContext';
import { Activity, ArrowDown, Cpu, Play, Sliders } from 'lucide-react';

interface ALUModuleProps {
  alu: AluState;
  flags: CpuFlags;
  onManualAluExecute?: (op: AluOperation, a: number, b: number) => void;
}

const ALU_OPS: Array<{
  op: AluOperation;
  nameHu: string;
  nameEn: string;
  symbol: string;
  cat: string;
}> = [
  { op: 'ADD', nameHu: 'Összeadás (A + B)', nameEn: 'Addition (A + B)', symbol: '+', cat: 'ARITHMETIC' },
  { op: 'ADC', nameHu: 'Összeadás átvitellel (A + B + C)', nameEn: 'Add with Carry (A + B + C)', symbol: '+C', cat: 'ARITHMETIC' },
  { op: 'SUB', nameHu: 'Kivonás (A - B)', nameEn: 'Subtraction (A - B)', symbol: '-', cat: 'ARITHMETIC' },
  { op: 'SBB', nameHu: 'Kivonás átvitellel (A - B - C)', nameEn: 'Subtract with Borrow (A - B - C)', symbol: '-C', cat: 'ARITHMETIC' },
  { op: 'INC', nameHu: 'Növelés 1-gyel (A + 1)', nameEn: 'Increment (A + 1)', symbol: '++A', cat: 'ARITHMETIC' },
  { op: 'DEC', nameHu: 'Csökkentés 1-gyel (A - 1)', nameEn: 'Decrement (A - 1)', symbol: '--A', cat: 'ARITHMETIC' },
  { op: 'AND', nameHu: 'Bitenkénti ÉS (A & B)', nameEn: 'Bitwise AND (A & B)', symbol: '&', cat: 'LOGIC' },
  { op: 'OR', nameHu: 'Bitenkénti VAGY (A | B)', nameEn: 'Bitwise OR (A | B)', symbol: '|', cat: 'LOGIC' },
  { op: 'XOR', nameHu: 'Kizáró VAGY (A ^ B)', nameEn: 'Bitwise XOR (A ^ B)', symbol: '^', cat: 'LOGIC' },
  { op: 'NOT', nameHu: 'Inverzió (~A)', nameEn: 'Bitwise NOT (~A)', symbol: '~A', cat: 'LOGIC' },
  { op: 'SHL', nameHu: 'Balra léptetés (A << 1)', nameEn: 'Shift Left (A << 1)', symbol: '<<', cat: 'SHIFT' },
  { op: 'SHR', nameHu: 'Jobbra léptetés (A >> 1)', nameEn: 'Shift Right (A >> 1)', symbol: '>>', cat: 'SHIFT' },
  { op: 'CMP', nameHu: 'Összehasonlítás (A - B jelzőbitek)', nameEn: 'Compare (A - B flags)', symbol: '== ?', cat: 'COMPARE' },
];

export const ALUModule: React.FC<ALUModuleProps> = ({
  alu,
  flags,
  onManualAluExecute,
}) => {
  const { language, t } = useI18n();
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [manualA, setManualA] = useState(25);
  const [manualB, setManualB] = useState(17);
  const [manualOp, setManualOp] = useState<AluOperation>('ADD');

  const activeOp = interactiveMode ? manualOp : alu.operation;
  const activeA = interactiveMode ? manualA : alu.operandA;
  const activeB = interactiveMode ? manualB : alu.operandB;

  const currentCalc = interactiveMode
    ? calculateAlu(manualOp, manualA, manualB, flags)
    : { result: alu.result, flags: alu.flags };

  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  const handleTestRun = (op: AluOperation) => {
    setManualOp(op);
    if (onManualAluExecute) {
      onManualAluExecute(op, manualA, manualB);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Mode toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">
            {interactiveMode ? t('aluPlayground') : t('aluRealtime')}
          </span>
        </div>
        <button
          id="btn-alu-mode-toggle"
          onClick={() => setInteractiveMode(!interactiveMode)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
            interactiveMode
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>{interactiveMode ? t('aluSwitchToRealtime') : t('aluSwitchToPlayground')}</span>
        </button>
      </div>

      {/* Manual inputs if in interactive mode */}
      {interactiveMode && (
        <div className="p-2.5 bg-[#0A0B0E]/80 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              {t('aluOperandA')}
            </label>
            <input
              type="number"
              value={manualA}
              onChange={(e) => setManualA(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-cyan-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              {t('aluOperandB')}
            </label>
            <input
              type="number"
              value={manualB}
              onChange={(e) => setManualB(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-blue-300 text-xs"
            />
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-end">
            <div className="text-[10px] text-slate-400 font-mono py-1">
              A: {toHex(manualA)} | B: {toHex(manualB)}
            </div>
          </div>
        </div>
      )}

      {/* Visual V-shaped ALU block */}
      <div className="relative bg-[#0A0B0E]/70 p-4 rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Top Input Ports */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Input A */}
          <div className="p-2 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
              <span>{language === 'hu' ? 'BEMENET [A]' : 'INPUT [A]'}</span>
              <span className="font-bold">{toHex(activeA)}</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-100 mt-0.5">
              Dec: {activeA & 0xff}
            </div>
            <div className="font-mono text-[9px] text-cyan-300/80 tracking-widest mt-1">
              {toBin(activeA)}
            </div>
          </div>

          {/* Input B */}
          <div className="p-2 bg-blue-950/30 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between text-[10px] font-mono text-blue-400">
              <span>{language === 'hu' ? 'BEMENET [B]' : 'INPUT [B]'}</span>
              <span className="font-bold">{toHex(activeB)}</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-100 mt-0.5">
              Dec: {activeB & 0xff}
            </div>
            <div className="font-mono text-[9px] text-blue-300/80 tracking-widest mt-1">
              {toBin(activeB)}
            </div>
          </div>
        </div>

        {/* Central ALU Hardware Logic Core */}
        <div className="relative my-2 p-3 bg-gradient-to-b from-slate-900 to-[#0A0B0E] rounded-xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {language === 'hu' ? `ALU 8-BIT MAG • ${activeOp}` : `ALU 8-BIT CORE • ${activeOp}`}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono">
            {activeA & 0xff} <span className="text-emerald-400 font-bold mx-1">[{activeOp}]</span>{' '}
            {activeB & 0xff} = <span className="text-emerald-300 font-bold">{currentCalc.result}</span>
          </div>

          {/* Bit-level Operation Flow */}
          <div className="mt-2 flex items-center justify-center gap-1 font-mono text-[9px] text-slate-400">
            <span>{toBin(activeA)}</span>
            <span className="text-emerald-400 font-bold">[{activeOp}]</span>
            <span>{toBin(activeB)}</span>
            <span>=</span>
            <span className="text-emerald-300 font-bold">{toBin(currentCalc.result)}</span>
          </div>
        </div>

        {/* Output & Generated Flags Section */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Result Port */}
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase">
                {t('aluResult')}
              </div>
              <div className="font-mono text-sm font-bold text-slate-100">
                {toHex(currentCalc.result)} ({currentCalc.result})
              </div>
            </div>
            <div className="font-mono text-[10px] text-emerald-300/90 tracking-wider">
              {toBin(currentCalc.result)}
            </div>
          </div>

          {/* ALU Flags result */}
          <div className="p-2.5 bg-[#0A0B0E]/80 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              {t('aluActiveFlags')}
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span
                className={`px-1.5 py-0.5 rounded ${
                  currentCalc.flags.Z
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-600'
                }`}
              >
                Z:{currentCalc.flags.Z ? '1' : '0'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  currentCalc.flags.C
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-600'
                }`}
              >
                C:{currentCalc.flags.C ? '1' : '0'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  currentCalc.flags.N
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-slate-600'
                }`}
              >
                N:{currentCalc.flags.N ? '1' : '0'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  currentCalc.flags.V
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                    : 'text-slate-600'
                }`}
              >
                V:{currentCalc.flags.V ? '1' : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick interactive test buttons */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
          {t('aluOperation')}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
          {ALU_OPS.map((item) => (
            <button
              key={item.op}
              onClick={() => handleTestRun(item.op)}
              className={`p-1.5 rounded-lg border font-mono text-[11px] transition-all flex flex-col items-center justify-center ${
                activeOp === item.op
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                  : 'bg-[#0A0B0E]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="font-bold">{item.op}</span>
              <span className="text-[8px] text-slate-500 truncate max-w-full">
                {language === 'hu' ? item.nameHu : item.nameEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
