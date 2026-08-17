import React, { useState } from 'react';
import { CpuState, LessonStep } from '../types/cpu';
import { LESSONS } from '../core/lessons';
import { useI18n } from '../i18n/I18nContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';

interface LessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpu: CpuState;
  onLoadLessonCode: (code: string) => void;
}

export const LessonsModal: React.FC<LessonsModalProps> = ({
  isOpen,
  onClose,
  cpu,
  onLoadLessonCode,
}) => {
  const { language } = useI18n();
  const [activeLessonId, setActiveLessonId] = useState<string>(() => LESSONS?.[0]?.id || 'lesson-1');

  if (!isOpen) return null;

  const currentLesson: LessonStep = LESSONS.find((l) => l.id === activeLessonId) || LESSONS?.[0] || {
    id: 'lesson-fallback',
    title: 'Lesson 1',
    titleHu: '1. Lecke',
    concept: 'Registers',
    conceptHu: 'Regiszterek',
    explanation: 'Explanation',
    explanationHu: 'Magyarázat',
    suggestedCode: 'LDI A, 10\nHLT',
    tasks: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0B0E]/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>
                  {language === 'hu'
                    ? 'Interaktív CPU Oktatóanyag és Feladatok'
                    : 'Interactive CPU Lessons & Tasks'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {language === 'hu' ? 'Kezdőtől Haladóig' : 'Beginner to Advanced'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hu'
                  ? 'Tanuld meg a számítógépek és processzorok belső működését lépésről lépésre!'
                  : 'Learn how CPUs and modern computing works under the hood step by step!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Lessons Sidebar Navigation */}
          <div className="w-full md:w-72 bg-[#0A0B0E]/60 border-r border-slate-800 p-3 overflow-y-auto flex flex-col gap-1.5">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold px-2 py-1">
              {language === 'hu' ? 'Tananyagok & Leckék' : 'Lessons & Curriculum'}
            </div>
            {LESSONS.map((lesson, idx) => {
              const isSelected = lesson.id === activeLessonId;
              const allDone = lesson.tasks.every((t) => t.check(cpu));

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/50 text-cyan-200 font-bold'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {allDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-400 flex-shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs truncate">
                        {language === 'hu' ? lesson.titleHu : lesson.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {language === 'hu' ? lesson.conceptHu : lesson.concept}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Active Lesson Detail View */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <Lightbulb className="w-4 h-4" />
                <span>{language === 'hu' ? currentLesson.conceptHu : currentLesson.concept}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono">
                {language === 'hu' ? currentLesson.titleHu : currentLesson.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 p-3 bg-[#0A0B0E]/70 rounded-xl border border-slate-800">
                {language === 'hu' ? currentLesson.explanationHu : currentLesson.explanation}
              </p>
            </div>

            {/* Suggested Code Box */}
            {currentLesson.suggestedCode && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'hu'
                        ? 'Javasolt Assembly Példakód:'
                        : 'Suggested Assembly Sample Code:'}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      if (currentLesson.suggestedCode) {
                        onLoadLessonCode(currentLesson.suggestedCode);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-sm shadow-emerald-600/30"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {language === 'hu' ? 'Kód Betöltése a Szerkesztőbe' : 'Load Code into Editor'}
                    </span>
                  </button>
                </div>

                <pre className="p-3 bg-black/90 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {currentLesson.suggestedCode}
                </pre>
              </div>
            )}

            {/* Live Interactive Verification Tasks */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'hu'
                    ? 'Gyakorlati Ellenőrző Feladatok (Valós időben figyelve):'
                    : 'Practical Verification Tasks (Monitored in Real-time):'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {currentLesson.tasks.map((task, i) => {
                  const isDone = task.check(cpu);
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : 'bg-[#0A0B0E]/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-bounce" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium">
                          {language === 'hu' ? task.textHu : task.text}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone
                          ? language === 'hu'
                            ? 'SIKERES! ✓'
                            : 'PASSED! ✓'
                          : language === 'hu'
                          ? 'FOLYAMATBAN...'
                          : 'IN PROGRESS...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
