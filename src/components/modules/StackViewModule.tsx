import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Layers, Sparkles } from 'lucide-react';

interface StackViewModuleProps {
  memory: Uint8Array;
  sp: number;
}

export const StackViewModule: React.FC<StackViewModuleProps> = ({ memory, sp }) => {
  const { language } = useI18n();
  // Stack grows downwards from 0xFF (255)
  // Inspect top items
  const stackBase = 0xff;
  const startAddr = Math.max(0, Math.min(sp - 1, 0xf0));
  const stackItems: Array<{ addr: number; value: number; isSp: boolean }> = [];

  for (let addr = stackBase; addr >= startAddr; addr--) {
    stackItems.push({
      addr,
      value: memory[addr],
      isSp: addr === sp,
    });
  }

  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {language === 'hu' ? 'VEREM MEMÓRIA (CALL STACK)' : 'STACK MEMORY (CALL STACK)'}
          </span>
        </div>
        <div className="text-indigo-300 font-bold">
          SP = {toHex(sp)} (Dec: {sp})
        </div>
      </div>

      {/* Visual Vertical Stack Frame list */}
      <div className="flex flex-col gap-1.5 bg-[#0A0B0E]/80 p-3 rounded-xl border border-slate-800 max-h-64 overflow-y-auto">
        <div className="text-[10px] font-mono text-slate-500 flex justify-between px-2">
          <span>{language === 'hu' ? 'MEMÓRIACÍM' : 'ADDRESS'}</span>
          <span>{language === 'hu' ? 'TARTALOM / ADAT' : 'DATA'}</span>
          <span>{language === 'hu' ? 'MUTATÓ' : 'POINTER'}</span>
        </div>

        {stackItems.map((item) => {
          const isPushed = item.addr > sp;
          const isSp = item.isSp;

          return (
            <div
              key={item.addr}
              className={`p-2 rounded-lg border font-mono text-xs flex items-center justify-between transition-all ${
                isSp
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                  : isPushed
                  ? 'bg-slate-900 border-slate-700/80 text-slate-200'
                  : 'bg-[#0A0B0E]/40 border-slate-800 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] text-slate-400">
                  {toHex(item.addr)}
                </span>
                <span className="text-[9px] text-slate-500">({item.addr})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{toHex(item.value)}</span>
                <span className="text-[10px] text-slate-400">(Dec: {item.value})</span>
              </div>

              <div className="min-w-20 text-right">
                {isSp ? (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-slate-950 font-extrabold text-[9px] uppercase">
                    {language === 'hu' ? '<-- SP CSÚCS' : '<-- SP TOP'}
                  </span>
                ) : isPushed ? (
                  <span className="text-[9px] text-indigo-300">
                    {language === 'hu' ? 'Mentett adat' : 'Pushed value'}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600">
                    {language === 'hu' ? 'Üres veremterület' : 'Empty stack frame'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 bg-[#0A0B0E] rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>
          {language === 'hu' ? (
            <>
              A verem a 0xFF címről lefelé növekszik. <code className="text-cyan-300">PUSH</code> és{' '}
              <code className="text-cyan-300">CALL</code> esetén az SP csökken, <code className="text-cyan-300">POP</code> és{' '}
              <code className="text-cyan-300">RET</code> esetén növekszik.
            </>
          ) : (
            <>
              Stack grows downwards from 0xFF. <code className="text-cyan-300">PUSH</code> /{' '}
              <code className="text-cyan-300">CALL</code> decrements SP, while <code className="text-cyan-300">POP</code> /{' '}
              <code className="text-cyan-300">RET</code> increments SP.
            </>
          )}
        </span>
      </div>
    </div>
  );
};
