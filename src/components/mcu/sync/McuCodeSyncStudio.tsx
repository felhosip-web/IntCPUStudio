import React, { useState, useEffect, useMemo } from 'react';
import { McuState, CodeSyncLineMapping } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import {
  CODE_SYNC_PRESETS,
  transpileCToAssembly,
  TranspileResult,
} from '../../../core/mcuTranspiler';
import {
  ArrowLeftRight,
  Check,
  Code,
  Copy,
  Cpu,
  Download,
  FileCode,
  Info,
  Layers,
  Play,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface McuCodeSyncStudioProps {
  mcuState: McuState;
  onFlashCode?: (code: string) => void;
  onSelectLanguage?: (lang: 'AVR-ASM' | 'ARDUINO-C') => void;
}

export const McuCodeSyncStudio: React.FC<McuCodeSyncStudioProps> = ({
  mcuState,
  onFlashCode,
}) => {
  const { language } = useI18n();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CODE_SYNC_PRESETS[0].id);
  const [cCode, setCCode] = useState<string>(CODE_SYNC_PRESETS[0].cSource);
  const [hoveredCLine, setHoveredCLine] = useState<number | null>(null);
  const [hoveredAsmLine, setHoveredAsmLine] = useState<number | null>(null);
  const [copiedAsm, setCopiedAsm] = useState(false);
  const [copiedC, setCopiedC] = useState(false);

  // Transpile C code
  const transpileResult: TranspileResult = useMemo(() => {
    return transpileCToAssembly(cCode);
  }, [cCode]);

  const cLines = useMemo(() => cCode.split('\n'), [cCode]);
  const asmLines = useMemo(() => transpileResult.asmCode.split('\n'), [transpileResult]);

  // Find active mappings based on hover
  const activeMappingForHoveredC = useMemo(() => {
    if (hoveredCLine === null) return null;
    return transpileResult.mappings.find((m) => m.cLineIndex === hoveredCLine) || null;
  }, [hoveredCLine, transpileResult]);

  const activeMappingForHoveredAsm = useMemo(() => {
    if (hoveredAsmLine === null) return null;
    return (
      transpileResult.mappings.find((m) =>
        m.asmLineIndices.includes(hoveredAsmLine)
      ) || null
    );
  }, [hoveredAsmLine, transpileResult]);

  // Current MCU Execution Line (PC)
  const currentPcLine = mcuState.registers.pc;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = CODE_SYNC_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCCode(found.cSource);
    }
  };

  const handleFlashToMcu = () => {
    if (onFlashCode) {
      onFlashCode(transpileResult.asmCode);
    }
  };

  const handleCopyAsm = () => {
    navigator.clipboard.writeText(transpileResult.asmCode);
    setCopiedAsm(true);
    setTimeout(() => setCopiedAsm(false), 2000);
  };

  const handleCopyC = () => {
    navigator.clipboard.writeText(cCode);
    setCopiedC(true);
    setTimeout(() => setCopiedC(false), 2000);
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 md:p-6 flex flex-col gap-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/40">
            <ArrowLeftRight className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Arduino C ⟷ AVR Assembly Szinkron Kódszerkesztő'
                  : 'Arduino C ⟷ AVR Assembly Synchronized Studio'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold uppercase">
                Bidirectional Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {language === 'hu'
                ? 'Soronkénti kiemelés: Ha C-ben írod, azonnal látod a lefordított assembly-t és a regiszterműveleteket'
                : 'Line-by-line synchronized highlighting between high-level C statements and low-level AVR opcodes'}
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">
            {language === 'hu' ? 'Mintakód:' : 'Preset:'}
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-[#05070A] border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {CODE_SYNC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {language === 'hu' ? p.nameHu : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="p-3 rounded-2xl bg-[#05070A] border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFlashToMcu}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950/50"
            title="Lefordított Assembly betöltése a virtuális ATmega328P Flash memóriájába"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'hu' ? 'Betöltés az MCU Flash-be & Futtatás' : 'Flash Generated ASM to MCU'}</span>
          </button>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            | {asmLines.length} sor Assembly generálva
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyC}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {copiedC ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{language === 'hu' ? 'C Kód Másolása' : 'Copy C'}</span>
          </button>
          <button
            onClick={handleCopyAsm}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {copiedAsm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{language === 'hu' ? 'ASM Kód Másolása' : 'Copy ASM'}</span>
          </button>
        </div>
      </div>

      {/* Synchronized Side-by-Side Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Arduino C */}
        <div className="bg-[#05070A] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-inner">
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
              <FileCode className="w-4 h-4" />
              <span>Arduino C Forráskód</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {cLines.length} sorok
            </span>
          </div>

          <div className="p-3 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
            {cLines.map((line, idx) => {
              const mapping = transpileResult.mappings.find((m) => m.cLineIndex === idx);
              const isHovered = hoveredCLine === idx;
              const isTargetOfAsmHover =
                activeMappingForHoveredAsm &&
                activeMappingForHoveredAsm.cLineIndex === idx;
              const isHighlighted = isHovered || isTargetOfAsmHover;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCLine(idx)}
                  onMouseLeave={() => setHoveredCLine(null)}
                  className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all cursor-pointer ${
                    isHighlighted
                      ? 'bg-emerald-950/60 text-emerald-200 border-l-2 border-emerald-400 pl-3 font-bold shadow-inner'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <span className="w-6 text-right text-[10px] text-slate-600 select-none">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre">
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Generated AVR Assembly */}
        <div className="bg-[#05070A] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-inner">
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>Lefordított AVR Assembly (ATmega328P)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {asmLines.length} sorok
            </span>
          </div>

          <div className="p-3 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
            {asmLines.map((line, idx) => {
              const isHovered = hoveredAsmLine === idx;
              const isTargetOfCHover =
                activeMappingForHoveredC &&
                activeMappingForHoveredC.asmLineIndices.includes(idx);
              const isCurrentPc = currentPcLine === idx;
              const isHighlighted = isHovered || isTargetOfCHover;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredAsmLine(idx)}
                  onMouseLeave={() => setHoveredAsmLine(null)}
                  className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all cursor-pointer ${
                    isCurrentPc
                      ? 'bg-amber-950/80 text-amber-200 border-l-2 border-amber-400 font-bold shadow-lg animate-pulse'
                      : isHighlighted
                      ? 'bg-cyan-950/60 text-cyan-200 border-l-2 border-cyan-400 pl-3 font-bold shadow-inner'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <span className="w-6 text-right text-[10px] text-slate-600 select-none">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre">
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Synchronized Micro-Inspector (Bottom Banner) */}
      {(activeMappingForHoveredC || activeMappingForHoveredAsm) && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col gap-2 font-mono text-xs shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>
              {language === 'hu' ? 'Kijelölt Utasítás Műveleti Elemzése:' : 'Synchronized Statement Breakdown:'}
            </span>
          </div>
          <div className="text-slate-300 font-sans leading-relaxed">
            {language === 'hu'
              ? (activeMappingForHoveredC || activeMappingForHoveredAsm)?.explanationHu
              : (activeMappingForHoveredC || activeMappingForHoveredAsm)?.explanation}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1 border-t border-slate-800 pt-2">
            <div>
              C Sor: <strong className="text-emerald-300">#{(activeMappingForHoveredC || activeMappingForHoveredAsm)!.cLineIndex + 1}</strong>
            </div>
            <div>
              Generált ASM Sorok:{' '}
              <strong className="text-cyan-300">
                {(activeMappingForHoveredC || activeMappingForHoveredAsm)!.asmLineIndices.map((i) => `#${i + 1}`).join(', ')}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
