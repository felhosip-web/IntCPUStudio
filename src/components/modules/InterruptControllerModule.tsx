import React from 'react';
import { PicState } from '../../types/hardware';
import { useI18n } from '../../i18n/I18nContext';
import { Zap, ShieldCheck, ShieldAlert, Play, CheckCircle2, AlertOctagon } from 'lucide-react';

interface InterruptControllerModuleProps {
  picState: PicState;
  onUpdatePic: (updater: (prev: PicState) => PicState) => void;
}

export const InterruptControllerModule: React.FC<InterruptControllerModuleProps> = ({
  picState,
  onUpdatePic,
}) => {
  const { language } = useI18n();

  const handleToggleMask = (irq: number) => {
    onUpdatePic((prev) => {
      const currentLines = prev?.lines || [];
      const nextLines = currentLines.map((l) =>
        l.irq === irq ? { ...l, isMasked: !l.isMasked } : l
      );
      const nextImr = nextLines.reduce((acc, l) => (l.isMasked ? acc | (1 << l.irq) : acc), 0);
      return {
        ...prev,
        interruptMaskRegister: nextImr,
        lines: nextLines,
      };
    });
  };

  const handleFireIrq = (irq: number) => {
    onUpdatePic((prev) => ({
      ...prev,
      interruptRequestRegister: (prev?.interruptRequestRegister || 0) | (1 << irq),
      lines: (prev?.lines || []).map((l) => (l.irq === irq ? { ...l, isPending: true } : l)),
    }));
  };

  const handleClearIrq = (irq: number) => {
    onUpdatePic((prev) => ({
      ...prev,
      interruptRequestRegister: (prev?.interruptRequestRegister || 0) & ~(1 << irq),
      lines: (prev?.lines || []).map((l) => (l.irq === irq ? { ...l, isPending: false } : l)),
    }));
  };

  const lines = picState?.lines || [];
  const imr = picState?.interruptMaskRegister ?? 0;

  return (
    <div className="p-4 flex flex-col gap-3.5 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'PIC Megszakításvezérlő' : 'PIC Interrupt Controller (8259)'}
            </div>
            <div className="text-[10px] text-indigo-400">
              {language === 'hu' ? 'Prioritásos Vektor Alrendszer' : 'Vectored Priority Subsystem'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-400">IMR:</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-bold border border-slate-800">
            0b{imr.toString(2).padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* IRQ Lines Table */}
      <div className="flex flex-col gap-1.5">
        {lines.map((line) => {
          return (
            <div
              key={line.irq}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                line.isPending
                  ? 'bg-rose-950/40 border-rose-600/70 shadow-sm'
                  : 'bg-[#0A0B0E]/70 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-bold text-[10px]">
                  IRQ {line.irq}
                </span>
                <div>
                  <div className="font-bold text-slate-200 text-xs">
                    {language === 'hu' ? line.sourceHu : line.source}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'hu' ? 'Vektor Cím:' : 'Vector:'} 0x{line.vectorAddress.toString(16).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mask Toggle */}
                <button
                  onClick={() => handleToggleMask(line.irq)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    line.isMasked
                      ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {line.isMasked ? (language === 'hu' ? 'Maszkolva' : 'Masked') : (language === 'hu' ? 'Nyitott' : 'Unmasked')}
                </button>

                {/* Trigger / Clear Button */}
                {line.isPending ? (
                  <button
                    onClick={() => handleClearIrq(line.irq)}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer animate-pulse"
                  >
                    {language === 'hu' ? 'Törlés (CLR)' : 'Clear'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleFireIrq(line.irq)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                  >
                    {language === 'hu' ? 'Kiváltás' : 'Trigger'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
