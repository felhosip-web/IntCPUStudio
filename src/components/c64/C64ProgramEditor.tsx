import React, { useState } from 'react';
import { BasicLine, C64SampleProgram, C64State } from '../../types/c64';
import { C64_SAMPLE_PROGRAMS } from '../../core/c64SamplePrograms';
import { useI18n } from '../../i18n/I18nContext';
import { sidAudio } from '../../core/c64Audio';
import {
  BookOpen,
  Code2,
  Download,
  FileCode,
  List,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface C64ProgramEditorProps {
  c64State: C64State;
  onLoadProgram: (code: string) => void;
  onRunProgram: () => void;
  onClearProgram: () => void;
  onSendCommand: (cmd: string) => void;
}

export const C64ProgramEditor: React.FC<C64ProgramEditorProps> = ({
  c64State,
  onLoadProgram,
  onRunProgram,
  onClearProgram,
  onSendCommand,
}) => {
  const { language } = useI18n();
  const [selectedSampleId, setSelectedSampleId] = useState<string>(() => C64_SAMPLE_PROGRAMS?.[0]?.id || 'matrix-rain');
  const [newLineNumber, setNewLineNumber] = useState<string>('100');
  const [newLineCode, setNewLineCode] = useState<string>('PRINT "HELLO C64"');
  const [isSampleListOpen, setIsSampleListOpen] = useState(false);

  const selectedSample: C64SampleProgram =
    C64_SAMPLE_PROGRAMS.find((p) => p.id === selectedSampleId) || C64_SAMPLE_PROGRAMS?.[0] || {
      id: 'sample-fallback',
      title: 'Sample',
      titleHu: 'Minta',
      category: 'Basic',
      description: '',
      descriptionHu: '',
      basicCode: '10 PRINT "COMMODORE 64"\n20 GOTO 10',
    };

  const handleApplySample = (sample: C64SampleProgram, autoRun: boolean = false) => {
    sidAudio.playLaser();
    onLoadProgram(sample.basicCode);
    if (autoRun) {
      setTimeout(() => {
        onRunProgram();
      }, 50);
    }
  };

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineNumber) return;
    onSendCommand(`${newLineNumber} ${newLineCode}`);
    setNewLineCode('');
    // Auto-increment line number by 10
    const nextNum = parseInt(newLineNumber, 10) + 10;
    setNewLineNumber(String(nextNum));
  };

  const handleDeleteLine = (lineNum: number) => {
    onSendCommand(`${lineNum}`);
  };

  const handleExportBas = () => {
    const text = c64State.programList.map((l) => `${l.lineNumber} ${l.code}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.bas';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sample Programs Quick Library Header */}
      <div className="bg-[#111622] rounded-2xl border border-slate-800/90 p-4 shadow-lg flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              {language === 'hu' ? 'C64 Mintaprogramok Könyvtára' : 'C64 Sample Programs'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplySample(selectedSample, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'hu' ? 'Betöltés & Futtatás' : 'Load & Run'}</span>
            </button>

            <button
              onClick={() => handleApplySample(selectedSample, false)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {language === 'hu' ? 'Csak Betöltés' : 'Load'}
            </button>
          </div>
        </div>

        {/* Preset Selector Dropdown & Info */}
        <div className="flex flex-col gap-2">
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="w-full bg-[#1A2234] border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-cyan-500 transition-colors"
          >
            {C64_SAMPLE_PROGRAMS.map((prog) => (
              <option key={prog.id} value={prog.id}>
                [{prog.category}] {language === 'hu' ? prog.titleHu : prog.title}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            {language === 'hu' ? selectedSample.descriptionHu : selectedSample.description}
          </p>
        </div>
      </div>

      {/* BASIC Code Explorer & Stored Program Lines */}
      <div className="bg-[#111622] rounded-2xl border border-slate-800/90 p-4 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              {language === 'hu' ? 'BASIC Programkód (Memória)' : 'BASIC Program in Memory'}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/50 font-mono">
              {c64State.programList.length} {language === 'hu' ? 'sor' : 'lines'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onRunProgram}
              disabled={c64State.programList.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>RUN</span>
            </button>

            <button
              onClick={() => onSendCommand('LIST')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              LIST
            </button>

            <button
              onClick={onClearProgram}
              title="NEW"
              className="p-1 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportBas}
              title="Export .BAS"
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lines Container */}
        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-3 max-h-[300px] overflow-y-auto space-y-1 font-mono text-xs">
          {c64State.programList.length === 0 ? (
            <div className="text-center py-6 text-slate-500 italic text-[11px]">
              {language === 'hu'
                ? 'Nincs tárolt BASIC program a memóriában. Válassz egy mintát fent, vagy írj be kódsorokat (pl. 10 PRINT "SZIA")!'
                : 'No BASIC program in memory. Select a sample above or enter code lines (e.g. 10 PRINT "HELLO")!'}
            </div>
          ) : (
            c64State.programList.map((line) => (
              <div
                key={line.lineNumber}
                className={`flex items-center justify-between group px-2 py-1 rounded hover:bg-slate-800/50 transition-colors ${
                  c64State.currentRunningLine === line.lineNumber
                    ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200'
                    : 'text-slate-300'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-cyan-400 font-bold w-10 text-right select-none">
                    {line.lineNumber}
                  </span>
                  <span className="font-mono">{line.code}</span>
                </div>

                <button
                  onClick={() => handleDeleteLine(line.lineNumber)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity cursor-pointer"
                  title="Delete line"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Add/Edit Line Form */}
        <form onSubmit={handleAddLine} className="flex items-center gap-2 pt-1">
          <input
            type="number"
            value={newLineNumber}
            onChange={(e) => setNewLineNumber(e.target.value)}
            placeholder="Sor"
            className="w-16 bg-[#1A2234] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-cyan-300 font-mono text-center outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={newLineCode}
            onChange={(e) => setNewLineCode(e.target.value.toUpperCase())}
            placeholder={language === 'hu' ? 'BASIC Kód (pl. PRINT "OK")' : 'BASIC code'}
            className="flex-1 bg-[#1A2234] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-cyan-500 uppercase"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Beszúrás' : 'Add'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
