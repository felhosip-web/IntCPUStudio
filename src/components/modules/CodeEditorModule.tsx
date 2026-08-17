import React, { useState } from 'react';
import { AssembledProgram } from '../../types/cpu';
import { INSTRUCTIONS } from '../../core/isa';
import { useI18n } from '../../i18n/I18nContext';
import { CpuBlockStudio } from '../cpu/CpuBlockStudio';
import {
  AlertTriangle,
  Blocks,
  BookOpen,
  Check,
  Code,
  FileCode,
  List,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

interface CodeEditorModuleProps {
  sourceCode: string;
  onChangeSourceCode: (code: string) => void;
  assembledProgram: AssembledProgram | null;
  currentPc: number;
  onAssembleAndLoad: () => void;
  breakpoints: Set<number>;
  onToggleBreakpoint: (lineNum: number) => void;
}

export const CodeEditorModule: React.FC<CodeEditorModuleProps> = ({
  sourceCode,
  onChangeSourceCode,
  assembledProgram,
  currentPc,
  onAssembleAndLoad,
  breakpoints,
  onToggleBreakpoint,
}) => {
  const { language, t, settings } = useI18n();
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showBlockStudioModal, setShowBlockStudioModal] = useState(false);

  // Find currently active source line from PC
  const activeLine = assembledProgram?.lineMapping[currentPc] || null;

  const lines = sourceCode.split('\n');

  const insertInstruction = (mnemonic: string, template: string) => {
    onChangeSourceCode(sourceCode + '\n' + template);
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'compact':
        return 'text-xs';
      case 'large':
        return 'text-base';
      case 'normal':
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="btn-assemble-load"
            onClick={onAssembleAndLoad}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold rounded-lg text-xs font-mono shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('editorAssembleAndLoad')}</span>
          </button>

          {assembledProgram && assembledProgram.errors.length === 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <Check className="w-3 h-3" />
              <span>
                {language === 'hu'
                  ? `Kész (${assembledProgram.codeSize} bájt)`
                  : `Ready (${assembledProgram.codeSize} bytes)`}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setShowSymbols(!showSymbols)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors cursor-pointer ${
              showSymbols
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <List className="w-3 h-3" />
            <span>
              {language === 'hu' ? 'Címkék' : 'Labels'} (
              {Object.keys(assembledProgram?.symbolTable || {}).length})
            </span>
          </button>

          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors cursor-pointer ${
              showCheatsheet
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>{language === 'hu' ? 'Utasításkészlet' : 'Instruction Set'}</span>
          </button>

          <button
            onClick={() => setShowBlockStudioModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-[10px] shadow-sm transition-all cursor-pointer"
          >
            <Blocks className="w-3 h-3" />
            <span>{language === 'hu' ? '🧩 Blokk Kódoló' : '🧩 Block Studio'}</span>
          </button>
        </div>
      </div>

      {/* Visual Block Studio Modal */}
      {showBlockStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl w-full max-w-7xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Blocks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'hu'
                      ? 'Vizuális CPU Blokk-Programozó (Assembly Generátor)'
                      : 'Visual CPU Block Studio (Assembly Generator)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'hu'
                      ? 'Állítsd össze a programot grafikus blokkokkal, majd töltsd be közvetlenül a processzor memóriájába!'
                      : 'Assemble instructions visually and flash directly into CPU memory!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlockStudioModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CpuBlockStudio
              onAssembleAndLoad={(code) => {
                onChangeSourceCode(code);
                setShowBlockStudioModal(false);
                setTimeout(() => {
                  onAssembleAndLoad();
                }, 50);
              }}
            />
          </div>
        </div>
      )}

      {/* Assembly Errors Warning Banner */}
      {assembledProgram && assembledProgram.errors.length > 0 && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {language === 'hu' ? 'Fordítási hibák' : 'Assembly Errors'} (
              {assembledProgram.errors.length}):
            </span>
          </div>
          {assembledProgram.errors.map((err, i) => (
            <div key={i} className="text-[11px] pl-5">
              {language === 'hu' ? `Sor ${err.line}: ${err.messageHu}` : `Line ${err.line}: ${err.message}`}
            </div>
          ))}
        </div>
      )}

      {/* Symbol Table Drawer */}
      {showSymbols && assembledProgram && (
        <div className="p-2.5 bg-[#0A0B0E] rounded-xl border border-purple-500/40 text-xs font-mono">
          <div className="text-[10px] uppercase font-bold text-purple-400 mb-1">
            {language === 'hu'
              ? 'Szimbólumtábla (Címkék & Memóriacímek)'
              : 'Symbol Table (Labels & Memory Addresses)'}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(assembledProgram.symbolTable).map(([label, addr]) => {
              const numAddr = Number(addr);
              return (
                <span
                  key={label}
                  className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300"
                >
                  {label}: 0x{numAddr.toString(16).toUpperCase().padStart(2, '0')} ({numAddr})
                </span>
              );
            })}
            {Object.keys(assembledProgram.symbolTable).length === 0 && (
              <span className="text-slate-500 italic">
                {language === 'hu' ? 'Nincsenek címkék definiálva.' : 'No labels defined.'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cheatsheet quick insert */}
      {showCheatsheet && (
        <div className="p-3 bg-[#0A0B0E] rounded-xl border border-cyan-500/40 text-xs font-mono max-h-48 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-cyan-400 mb-2">
            {language === 'hu'
              ? 'Gyors Utasítás Beillesztés (Kattints a kódhoz adáshoz)'
              : 'Quick Instruction Insertion (Click to append)'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.values(INSTRUCTIONS).map((inst) => (
              <button
                key={inst.opcode}
                onClick={() => insertInstruction(inst.mnemonic, `${inst.mnemonic} `)}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-cyan-300">{inst.mnemonic}</div>
                <div className="text-[9px] text-slate-400 truncate">
                  {language === 'hu' ? inst.descriptionHu : inst.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Code Editor Body */}
      <div
        className={`relative flex-1 min-h-[340px] flex bg-[#0A0B0E] rounded-xl border border-slate-800 overflow-hidden font-mono ${getFontSizeClass()}`}
      >
        {/* Line Gutter & Breakpoints */}
        <div className="w-12 bg-slate-900/80 border-r border-slate-800 py-3 flex flex-col select-none text-slate-500">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isBp = breakpoints.has(lineNum);
            const isCurrentPcLine = activeLine === lineNum;

            return (
              <div
                key={lineNum}
                onClick={() => onToggleBreakpoint(lineNum)}
                className={`h-6 px-1 flex items-center justify-between cursor-pointer transition-colors group ${
                  isCurrentPcLine
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'hover:bg-slate-800/80'
                }`}
                title={
                  language === 'hu'
                    ? `Töréspont kapcsolása (Sor ${lineNum})`
                    : `Toggle breakpoint (Line ${lineNum})`
                }
              >
                <span className="text-[10px] pl-1">{lineNum}</span>
                <div className="flex items-center">
                  {isBp && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500 animate-pulse" />
                  )}
                  {isCurrentPcLine && (
                    <span className="text-cyan-400 font-bold text-xs">▶</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Textarea Editor */}
        <div className="relative flex-1 flex flex-col">
          <textarea
            id="assembly-code-editor"
            value={sourceCode}
            onChange={(e) => onChangeSourceCode(e.target.value)}
            spellCheck={false}
            wrap="off"
            placeholder={
              language === 'hu'
                ? '; Írj ide Assembly programkódot...\n; Például:\nMOV A, 10\nMOV B, 20\nADD A, B\nOUT 1, A\nHLT'
                : '; Type your assembly code here...\n; Example:\nMOV A, 10\nMOV B, 20\nADD A, B\nOUT 1, A\nHLT'
            }
            className="w-full h-full p-3 bg-transparent text-slate-200 outline-none resize-none leading-6 overflow-auto selection:bg-cyan-500/30 selection:text-cyan-100 whitespace-pre font-mono"
          />
        </div>
      </div>
    </div>
  );
};
