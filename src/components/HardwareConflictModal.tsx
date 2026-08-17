import React from 'react';
import { HardwareConflict } from '../types/hardware';
import { useI18n } from '../i18n/I18nContext';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Info,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';

interface HardwareConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: HardwareConflict[];
  onApplyFix?: (conflictId: string) => void;
}

export const HardwareConflictModal: React.FC<HardwareConflictModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onApplyFix,
}) => {
  const { language } = useI18n();

  if (!isOpen || conflicts.length === 0) return null;

  const hasFixableConflicts = conflicts.some((c) => c.suggestedFix !== undefined);
  const highestSeverity = conflicts.some((c) => c.severity === 'INCOMPATIBLE' || c.severity === 'ERROR')
    ? 'INCOMPATIBLE'
    : 'WARNING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 ring-1 ring-white/10">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            highestSeverity === 'INCOMPATIBLE'
              ? 'bg-rose-950/40 border-rose-900/60'
              : 'bg-amber-950/40 border-amber-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                highestSeverity === 'INCOMPATIBLE'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {highestSeverity === 'INCOMPATIBLE' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  {language === 'hu'
                    ? 'Hardver Kompatibilitási Értesítés'
                    : 'Hardware Compatibility Notice'}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    highestSeverity === 'INCOMPATIBLE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {highestSeverity === 'INCOMPATIBLE'
                    ? language === 'hu'
                      ? 'Inkompatibilis Elemek'
                      : 'Incompatible Setup'
                    : language === 'hu'
                    ? 'Figyelmeztetés'
                    : 'Advisory'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hu'
                  ? 'A hardver komponensek és a processzormag összeállítása ellenőrizve lett.'
                  : 'Hardware components and core architecture verified for compatibility.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflicts List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 max-h-[60vh]">
          {conflicts.map((conflict, index) => {
            const isFixable = conflict.suggestedFix !== undefined;

            return (
              <div
                key={conflict.id || index}
                className={`p-4 rounded-xl border transition-all ${
                  conflict.severity === 'INCOMPATIBLE'
                    ? 'bg-[#14121E] border-rose-900/40'
                    : 'bg-[#17161E] border-amber-900/40'
                }`}
              >
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {conflict.severity === 'INCOMPATIBLE' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <h3 className="font-mono text-sm font-bold text-slate-100">
                      {language === 'hu' ? conflict.titleHu : conflict.titleEn}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mt-2 pl-6">
                  {language === 'hu' ? conflict.descriptionHu : conflict.descriptionEn}
                </p>

                {/* Affected components chips */}
                {conflict.affectedComponents && conflict.affectedComponents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-6">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {language === 'hu' ? 'Érintett hardver:' : 'Affected components:'}
                    </span>
                    {conflict.affectedComponents.map((comp, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-300"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Resolution Suggestion Box */}
                {conflict.suggestedFix ? (
                  <div className="mt-4 ml-6 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-cyan-200 font-mono">
                          {language === 'hu'
                            ? conflict.suggestedFix.actionLabelHu
                            : conflict.suggestedFix.actionLabelEn}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {language === 'hu'
                            ? conflict.suggestedFix.descriptionHu
                            : conflict.suggestedFix.descriptionEn}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        conflict.suggestedFix?.apply();
                        onApplyFix?.(conflict.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-md flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{language === 'hu' ? 'Javítás Alkalmazása' : 'Apply Quick Fix'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 ml-6 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {language === 'hu'
                        ? 'Egyszerű figyelmeztetés: Manuális beavatkozás vagy architektúra-tudatosság javasolt.'
                        : 'Informational advisory: Architecture awareness or manual tuning recommended.'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0B0E]/80 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>
              {language === 'hu'
                ? 'Valós idejű hardver- és architektúra felügyelet aktív'
                : 'Real-time hardware & architecture supervisor active'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            {language === 'hu' ? 'Megértettem / Bezárás' : 'Dismiss / Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
