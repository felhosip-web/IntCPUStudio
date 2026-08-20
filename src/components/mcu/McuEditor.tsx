import React, { useState } from 'react';
import { McuSampleProgram } from '../../types/mcu';
import { MCU_SAMPLE_PROGRAMS } from '../../core/mcuSamplePrograms';
import { useI18n } from '../../i18n/I18nContext';
import {
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  FileCode,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';

interface McuEditorProps {
  sourceCode: string;
  onChangeSourceCode: (code: string) => void;
  onFlashCode: (code: string) => void;
  currentPc: number;
  currentExplanation: string;
  currentExplanationHu: string;
}

export const McuEditor: React.FC<McuEditorProps> = ({
  sourceCode,
  onChangeSourceCode,
  onFlashCode,
  currentPc,
  currentExplanation,
  currentExplanationHu,
}) => {
  const { language } = useI18n();
  const [showSamples, setShowSamples] = useState(false);
  const [selectedSample, setSelectedSample] = useState<McuSampleProgram>(MCU_SAMPLE_PROGRAMS[0]);

  const handleSelectSample = (sample: McuSampleProgram) => {
    setSelectedSample(sample);
    onChangeSourceCode(sample.code);
    onFlashCode(sample.code);
    setShowSamples(false);
  };

  const lines = sourceCode.split('\n');

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3.5 shadow-xl select-none">
      {/* Editor Header & Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200">
              {language === 'hu' ? 'Kódszerkesztő & Flash Programozó' : 'MCU Code Editor & Flash Loader'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              AVR Assembly (.asm) & Arduino C (.ino)
            </p>
          </div>
        </div>

        {/* Sample Programs Dropdown & Flash Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {language === 'hu' ? selectedSample.titleHu : selectedSample.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSamples && (
              <div className="absolute right-0 sm:right-0 max-w-[calc(100vw-2rem)] top-full mt-1.5 w-80 bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 max-h-96 overflow-y-auto">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1 flex items-center justify-between">
                  <span>{language === 'hu' ? 'MCU Mintaprogramok' : 'MCU Sample Programs'}</span>
                </div>
                {MCU_SAMPLE_PROGRAMS.map((sample) => {
                  const isCur = sample.id === selectedSample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2 rounded-xl text-left font-mono text-xs cursor-pointer transition-all flex flex-col gap-0.5 ${
                        isCur
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{language === 'hu' ? sample.titleHu : sample.title}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400">
                          {sample.language}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                        {language === 'hu' ? sample.descriptionHu : sample.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onFlashCode(sourceCode)}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-900/30 transition-all"
            title="Kód lefordítása és betöltése a Flash memóriába"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'hu' ? 'Flash Betöltés' : 'Flash Code'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Instruction Explanation Banner */}
      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 font-mono text-xs text-cyan-200 flex items-center gap-2 shadow-inner">
        <Zap className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
        <span className="truncate">
          {language === 'hu' ? currentExplanationHu : currentExplanation}
        </span>
      </div>

      {/* Code Text Area */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#05070A] shadow-inner font-mono text-xs">
        <textarea
          value={sourceCode}
          onChange={(e) => onChangeSourceCode(e.target.value)}
          rows={14}
          spellCheck={false}
          className="w-full bg-transparent p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-cyan-500/30"
          placeholder="Írd ide az AVR Assembly vagy Arduino C kódot..."
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>PC: <strong className="text-amber-400">Line {currentPc + 1}</strong></span>
        <span>Flash Usage: <strong className="text-slate-400">{lines.length * 2} / 32768 Bytes (32KB)</strong></span>
        <span>Target: <strong className="text-cyan-400">ATmega328P @ 16 MHz</strong></span>
      </div>
    </div>
  );
};
