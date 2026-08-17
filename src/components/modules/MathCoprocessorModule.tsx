import React from 'react';
import { MathCoprocessorState } from '../../types/hardware';
import { useI18n } from '../../i18n/I18nContext';
import { Calculator, Cpu, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface MathCoprocessorModuleProps {
  mathState: MathCoprocessorState;
  onUpdateMath: (updater: (prev: MathCoprocessorState) => MathCoprocessorState) => void;
}

export const MathCoprocessorModule: React.FC<MathCoprocessorModuleProps> = ({
  mathState,
  onUpdateMath,
}) => {
  const { language } = useI18n();

  const operandA = mathState?.operandA ?? 12;
  const operandB = mathState?.operandB ?? 5;
  const operation = mathState?.operation ?? 'MUL';
  const resultProduct = mathState?.resultProduct ?? (operandA * operandB);
  const resultQuotient = mathState?.resultQuotient ?? (operandB > 0 ? Math.floor(operandA / operandB) : 0);
  const resultRemainder = mathState?.resultRemainder ?? (operandB > 0 ? operandA % operandB : 0);
  const accumulator16 = mathState?.accumulator16 ?? 60;

  const handleCompute = (opA: number, opB: number, op: 'MUL' | 'DIV' | 'MAC' | 'SQRT') => {
    opA = opA & 0xff;
    opB = opB & 0xff;
    let prod = (opA * opB) & 0xffff;
    let quot = opB > 0 ? Math.floor(opA / opB) : 0;
    let rem = opB > 0 ? opA % opB : 0;
    let acc = (accumulator16 + prod) & 0xffff;

    onUpdateMath((prev) => ({
      ...prev,
      operandA: opA,
      operandB: opB,
      operation: op,
      resultProduct: prod,
      resultQuotient: quot,
      resultRemainder: rem,
      accumulator16: op === 'MAC' ? acc : prev?.accumulator16 ?? acc,
    }));
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-950 text-orange-400 border border-orange-800">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'Matematikai Koprocesszor (MAC)' : 'Math Co-Processor & MAC'}
            </div>
            <div className="text-[10px] text-orange-400">
              {language === 'hu' ? 'I/O Port: 9 (0x09) • 1-Ciklusos Hardver' : 'I/O Port: 9 (0x09) • 1-Cycle Hardware'}
            </div>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800 text-[10px] font-bold">
          8x8 -&gt; 16-bit
        </span>
      </div>

      {/* Interactive Operands Input */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-[#0A0B0E]/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold">Operand A (8-bit):</span>
          <input
            type="number"
            min={0}
            max={255}
            value={operandA}
            onChange={(e) => handleCompute(Number(e.target.value), operandB, operation)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-[#0A0B0E]/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold">Operand B (8-bit):</span>
          <input
            type="number"
            min={0}
            max={255}
            value={operandB}
            onChange={(e) => handleCompute(operandA, Number(e.target.value), operation)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Result Display Box */}
      <div className="p-3 rounded-xl bg-[#05070A] border border-orange-900/40 shadow-inner flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">
            {language === 'hu' ? '16-bites Szorzat Eredmény:' : '16-bit Product Result:'}
          </span>
          <div className="text-right">
            <span className="text-base font-bold text-orange-300">
              0x{resultProduct.toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">({resultProduct})</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
          <span className="text-slate-400">
            {language === 'hu' ? 'Osztás (Hányados / Maradék):' : 'Division (Quot / Rem):'}
          </span>
          <span className="text-slate-200 font-bold">
            {resultQuotient} (Maradék: {resultRemainder})
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
          <span className="text-slate-400">
            {language === 'hu' ? 'MAC Akkumulátor (Σ A×B):' : 'MAC Accumulator (Σ A×B):'}
          </span>
          <span className="text-cyan-300 font-bold">
            0x{accumulator16.toString(16).toUpperCase().padStart(4, '0')} ({accumulator16})
          </span>
        </div>
      </div>

      {/* Speed Benchmark Comparison */}
      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'hu' ? 'Sebesség előny:' : 'Speed Gain:'}</span>
        </div>
        <span className="font-bold text-emerald-400">
          {language === 'hu' ? '1 Ciklus vs 48 Ciklus CPU szoftveres szorzás' : '1 Cycle vs 48 Cycles Software Loop'}
        </span>
      </div>
    </div>
  );
};
