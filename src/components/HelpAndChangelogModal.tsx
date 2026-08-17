import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { VERSION_HISTORY, CURRENT_APP_VERSION } from '../core/versionHistory';
import { HELP_TOPICS } from '../core/helpContent';
import { HelpTopic, VersionEntry } from '../types/version';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  History,
  Info,
  Layers,
  LayoutGrid,
  Monitor,
  Radio,
  Search,
  Sparkles,
  Tag,
  Terminal,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface HelpAndChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'help' | 'changelog' | 'pinouts';
  initialTopicId?: string;
}

export const HelpAndChangelogModal: React.FC<HelpAndChangelogModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'help',
  initialTopicId,
}) => {
  const { language, t } = useI18n();
  const [activeTab, setActiveTab] = useState<'help' | 'changelog' | 'pinouts'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<string>('ALL');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || HELP_TOPICS[0].id
  );
  const [selectedVersion, setSelectedVersion] = useState<string>(CURRENT_APP_VERSION);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);
  const [copiedChangelog, setCopiedChangelog] = useState(false);

  // Sync initial tab if changed from outside
  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialTopicId) setSelectedTopicId(initialTopicId);
    }
  }, [isOpen, initialTab, initialTopicId]);

  // Filtered Help Topics
  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const matchesCategory =
        selectedHelpCategory === 'ALL' || topic.category === selectedHelpCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (language === 'hu' ? topic.titleHu : topic.title).toLowerCase();
      const summary = (language === 'hu' ? topic.summaryHu : topic.summary).toLowerCase();
      const content = (language === 'hu' ? topic.contentHu : topic.content).toLowerCase();
      const termMatch = topic.keyTerms?.some((k) =>
        (language === 'hu' ? k.termHu + k.definitionHu : k.term + k.definition)
          .toLowerCase()
          .includes(q)
      );

      return title.includes(q) || summary.includes(q) || content.includes(q) || termMatch;
    });
  }, [searchQuery, selectedHelpCategory, language]);

  // Active topic object
  const activeTopic = useMemo(() => {
    return (
      HELP_TOPICS.find((t) => t.id === selectedTopicId) ||
      filteredTopics[0] ||
      HELP_TOPICS[0]
    );
  }, [selectedTopicId, filteredTopics]);

  // Active version object for changelog
  const activeVersionEntry = useMemo(() => {
    return (
      VERSION_HISTORY.find((v) => v.version === selectedVersion) || VERSION_HISTORY[0]
    );
  }, [selectedVersion]);

  // Filtered changes for active version
  const filteredChanges = useMemo(() => {
    if (selectedModuleFilter === 'ALL') return activeVersionEntry.changes;
    return activeVersionEntry.changes.filter((c) => c.module === selectedModuleFilter);
  }, [activeVersionEntry, selectedModuleFilter]);

  if (!isOpen) return null;

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIndex(index);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  const handleExportChangelogMarkdown = () => {
    let md = `# Interaktív CPU & Hardware Stúdió - Verziótörténet (Changelog)\n\n`;
    VERSION_HISTORY.forEach((ver) => {
      md += `## [v${ver.version}] - ${ver.releaseDate}\n`;
      md += `### ${language === 'hu' ? ver.titleHu : ver.title}\n\n`;
      md += `${language === 'hu' ? ver.summaryHu : ver.summary}\n\n`;
      md += `#### Kiemelt Újdonságok (Highlights):\n`;
      (language === 'hu' ? ver.highlights.hu : ver.highlights.en).forEach((h) => {
        md += `- ${h}\n`;
      });
      md += `\n#### Részletes Módosítások:\n`;
      ver.changes.forEach((c) => {
        md += `- **[${c.module}] ${language === 'hu' ? c.titleHu : c.title}** (${c.type}): ${
          language === 'hu' ? c.descriptionHu : c.description
        }\n`;
      });
      if (ver.technicalNotes) {
        md += `\n*Technikai megjegyzés*: ${
          language === 'hu' ? ver.technicalNotes.hu : ver.technicalNotes.en
        }\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHANGELOG_v${CURRENT_APP_VERSION}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedChangelog(true);
    setTimeout(() => setCopiedChangelog(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-text">
      <div
        id="help-and-changelog-modal"
        className="relative w-full max-w-6xl h-[92vh] bg-[#0A0E17] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800/80 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-900/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                  {language === 'hu'
                    ? 'Súgó, Kézikönyv & Verziókövetés'
                    : 'Help, Manual & Version History'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/50 text-cyan-300 font-mono text-[11px] font-bold">
                  v{CURRENT_APP_VERSION}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold uppercase">
                  MAJOR JUMP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hu'
                  ? 'Teljes körű interaktív dokumentáció, 74HC595 útmutató és kiadási napló'
                  : 'Comprehensive interactive documentation, 74HC595 manual, and release log'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Link to Export Changelog */}
            {activeTab === 'changelog' && (
              <button
                onClick={handleExportChangelogMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                title="Letöltés Markdown formátumban"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copiedChangelog ? '✓ Letöltve!' : 'Export CHANGELOG.md'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Bezárás (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Sub-Tabs Navigation */}
        <div className="flex items-center justify-between px-6 pt-2 border-b border-slate-800 bg-[#080B12] text-xs font-mono">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'help'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{language === 'hu' ? '📖 Átfogó Kézikönyv' : '📖 Knowledge Base'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                {HELP_TOPICS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'changelog'
                  ? 'border-indigo-400 text-indigo-300 bg-indigo-950/30 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>{language === 'hu' ? '📜 Verziókövetés & Changelog' : '📜 Release Notes & Changelog'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-700">
                v{CURRENT_APP_VERSION}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pinouts')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pinouts'
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hu' ? '⚡ Gyorskalauz & Lábkiosztások' : '⚡ Pinouts & Cheat Sheet'}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Interaktív Oktató Rendszer</span>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE HELP & KNOWLEDGE BASE */}
        {activeTab === 'help' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: Search & Topic List */}
            <div className="w-full md:w-80 border-r border-slate-800 bg-[#090D15] flex flex-col shrink-0">
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-800/80 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'hu' ? 'Keresés témákban, kódokban...' : 'Search topics, code...'
                    }
                    className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'ALL', label: language === 'hu' ? 'Mind' : 'All' },
                    { id: '74HC595', label: '74HC595' },
                    { id: 'ADC_PWM', label: 'ADC/PWM' },
                    { id: 'CPU_MMIO', label: 'CPU' },
                    { id: 'C64', label: 'C64' },
                    { id: 'SHORTCUTS', label: language === 'hu' ? 'Billentyűk' : 'Keys' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedHelpCategory(cat.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        selectedHelpCategory === cat.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics Scrollable List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredTopics.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    {language === 'hu'
                      ? 'Nincs találat a keresési feltételre.'
                      : 'No topics matched your search.'}
                  </div>
                ) : (
                  filteredTopics.map((topic) => {
                    const isSelected = topic.id === activeTopic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer group ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                            : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-mono text-xs font-bold truncate ${
                              isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-cyan-300'
                            }`}
                          >
                            {language === 'hu' ? topic.titleHu : topic.title}
                          </span>
                          {topic.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono font-semibold border border-slate-700 shrink-0">
                              {topic.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {language === 'hu' ? topic.summaryHu : topic.summary}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F18]">
              {/* Topic Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0E1524] to-slate-900 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-500/30">
                      {activeTopic.categoryHu}
                    </span>
                    {activeTopic.badge && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                        {activeTopic.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  {language === 'hu' ? activeTopic.titleHu : activeTopic.title}
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === 'hu' ? activeTopic.contentHu : activeTopic.content}
                </p>
              </div>

              {/* Special Interactive 74HC595 Quick Reference Widget if in 74HC595 topic */}
              {activeTopic.category === '74HC595' && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>74HC595 Működési Összefoglaló & Tipikus Bekötés</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="text-cyan-400 font-bold mb-1">1. Adat Beléptetés</div>
                      <div className="text-slate-400 text-[11px]">
                        Állítsd be a <code className="text-cyan-300">DS</code> (14) lábat, majd adj egy
                        felfutó impulzust a <code className="text-cyan-300">SH_CP</code> (11) lábra.
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="text-indigo-400 font-bold mb-1">2. Párhuzamos Reteszelés</div>
                      <div className="text-slate-400 text-[11px]">
                        Ha 8 bit átment, adj egy felfutó impulzust az <code className="text-indigo-300">ST_CP</code> (12)
                        retesz órajelre a QA..QH frissítéséhez.
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="text-emerald-400 font-bold mb-1">3. Kaszkádolás (QH')</div>
                      <div className="text-slate-400 text-[11px]">
                        Kössük a 9. lábat (<code className="text-emerald-300">QH'</code>) a következő 595 IC
                        <code className="text-emerald-300"> DS</code> lábára a 16-bites láncoláshoz!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Terms Table */}
              {activeTopic.keyTerms && activeTopic.keyTerms.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'hu' ? 'Kulcsfogalmak & Regiszterek' : 'Key Terms & Registers'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeTopic.keyTerms.map((term, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1"
                      >
                        <div className="font-mono text-xs font-bold text-cyan-300">
                          {language === 'hu' ? term.termHu : term.term}
                        </div>
                        <div className="text-xs text-slate-400 leading-relaxed">
                          {language === 'hu' ? term.definitionHu : term.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Snippets */}
              {activeTopic.codeSnippets && activeTopic.codeSnippets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>{language === 'hu' ? 'Gyakorlati Kódpéldák' : 'Practical Code Examples'}</span>
                  </h3>
                  <div className="space-y-3">
                    {activeTopic.codeSnippets.map((snippet, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-[#070A10] border border-slate-800 overflow-hidden shadow-md"
                      >
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
                          <span className="text-slate-300 font-semibold">{snippet.title}</span>
                          <button
                            onClick={() => handleCopyCode(snippet.code, idx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer text-[11px]"
                          >
                            {copiedSnippetIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Másolva!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Másolás</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#05070D]">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VERSION HISTORY & CHANGELOG */}
        {activeTab === 'changelog' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: Version Timeline Selector */}
            <div className="w-full md:w-80 border-r border-slate-800 bg-[#090D15] flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center justify-between">
                  <span>Kiadási Verziók</span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {VERSION_HISTORY.length} Kiadás
                  </span>
                </div>

                {/* Module filter tags */}
                <div className="flex flex-wrap gap-1">
                  {['ALL', '74HC595', 'ADC', 'PWM', 'CPU', 'C64', 'MMIO', 'BLOCKS'].map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setSelectedModuleFilter(mod)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        selectedModuleFilter === mod
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              {/* Version List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {VERSION_HISTORY.map((ver) => {
                  const isSelected = ver.version === activeVersionEntry.version;
                  const isCurrent = ver.version === CURRENT_APP_VERSION;
                  return (
                    <button
                      key={ver.version}
                      onClick={() => setSelectedVersion(ver.version)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isSelected ? 'text-indigo-300' : 'text-slate-200 group-hover:text-indigo-300'
                            }`}
                          >
                            v{ver.version}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{ver.releaseDate}</span>
                      </div>
                      <div className="text-[11px] font-mono font-medium text-slate-300 line-clamp-1">
                        {language === 'hu' ? ver.titleHu : ver.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                        {language === 'hu' ? ver.summaryHu : ver.summary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Changelog Content Pane */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F18]">
              {/* Version Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101426] to-slate-900 border border-indigo-500/40 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-indigo-300">
                      v{activeVersionEntry.version}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/40 uppercase">
                      {activeVersionEntry.category} Release
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {activeVersionEntry.releaseDate}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-100 font-mono">
                    {language === 'hu' ? activeVersionEntry.titleHu : activeVersionEntry.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {language === 'hu' ? activeVersionEntry.summaryHu : activeVersionEntry.summary}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === 'hu' ? 'Kiemelt Újdonságok' : 'Highlights'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(language === 'hu'
                      ? activeVersionEntry.highlights.hu
                      : activeVersionEntry.highlights.en
                    ).map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">▪</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Changes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span>
                      {language === 'hu' ? 'Részletes Változások & Modulok' : 'Detailed Changes'} (
                      {filteredChanges.length})
                    </span>
                  </h3>
                  {selectedModuleFilter !== 'ALL' && (
                    <button
                      onClick={() => setSelectedModuleFilter('ALL')}
                      className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                    >
                      Szűrő törlése
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {filteredChanges.map((change, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {change.module}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {language === 'hu' ? change.titleHu : change.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {change.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'hu' ? change.descriptionHu : change.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Notes */}
              {activeVersionEntry.technicalNotes && (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                    {language === 'hu' ? 'Architektúra & Technikai Részletek' : 'Technical Notes'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'hu'
                      ? activeVersionEntry.technicalNotes.hu
                      : activeVersionEntry.technicalNotes.en}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PINOUTS & QUICK CHEAT SHEET */}
        {activeTab === 'pinouts' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F18]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 74HC595 DIP-16 Pinout Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-mono text-sm font-bold text-cyan-300">
                      74HC595 DIP-16 Lábkiosztás & Funkciók
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    SIPO IC
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="space-y-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">Bal Oldal (1..8)</div>
                    <div><span className="text-cyan-400">1: QB</span> - Kimenet Bit 1</div>
                    <div><span className="text-cyan-400">2: QC</span> - Kimenet Bit 2</div>
                    <div><span className="text-cyan-400">3: QD</span> - Kimenet Bit 3</div>
                    <div><span className="text-cyan-400">4: QE</span> - Kimenet Bit 4</div>
                    <div><span className="text-cyan-400">5: QF</span> - Kimenet Bit 5</div>
                    <div><span className="text-cyan-400">6: QG</span> - Kimenet Bit 6</div>
                    <div><span className="text-cyan-400">7: QH</span> - Kimenet Bit 7</div>
                    <div><span className="text-slate-400">8: GND</span> - Test (0V)</div>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">Jobb Oldal (16..9)</div>
                    <div><span className="text-amber-400">16: VCC</span> - Tápfesz (+5V)</div>
                    <div><span className="text-cyan-400">15: QA</span> - Kimenet Bit 0 (LSB)</div>
                    <div><span className="text-emerald-400">14: DS</span> - Soros Adatbemenet</div>
                    <div><span className="text-rose-400">13: /OE</span> - Kimenet Eng. (PWM)</div>
                    <div><span className="text-indigo-400">12: ST_CP</span> - Retesz Órajel</div>
                    <div><span className="text-purple-400">11: SH_CP</span> - Léptető Órajel</div>
                    <div><span className="text-rose-400">10: /MR</span> - Reset (Aktív LOW)</div>
                    <div><span className="text-emerald-400">9: QH'</span> - Soros Túlcsorduló</div>
                  </div>
                </div>
              </div>

              {/* ATmega328P / Arduino Pinout Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-mono text-sm font-bold text-emerald-300">
                      ATmega328p / Arduino Uno Lábkiosztás
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    AVR RISC
                  </span>
                </div>

                <div className="space-y-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span>D2 (PD2)</span>
                    <span className="text-purple-300">SH_CP (Shift Clock / 74595)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span>D3 (PD3 / OC2B)</span>
                    <span className="text-indigo-300">ST_CP (Latch Clock) / Timer2 PWM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span>D4 (PD4)</span>
                    <span className="text-emerald-300">DS (Serial Data In / 74595)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span>D5 (PD5 / OC0B)</span>
                    <span className="text-rose-300">/OE Dimming PWM / Timer0 PWM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span>A0 (PC0 / ADC0)</span>
                    <span className="text-amber-300">SAR ADC 10-Bit Analóg Potméter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Globális Gyorsbillentyűk & Navigáció</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-xs">
                    Space
                  </kbd>
                  <span className="text-slate-400 text-[11px]">Órajel Start / Szünet</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-xs">
                    F8
                  </kbd>
                  <span className="text-slate-400 text-[11px]">Teljes Utasítás Lépés</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-purple-300 border border-slate-700 font-bold text-xs">
                    F7
                  </kbd>
                  <span className="text-slate-400 text-[11px]">Mikrolépés (Fetch/Dec)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold text-xs">
                    Ctrl + Z
                  </kbd>
                  <span className="text-slate-400 text-[11px]">Időutazó Visszalépés</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-slate-800 bg-[#0B0F19] text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              Interaktív CPU & Hardware Stúdió <strong className="text-slate-200">v{CURRENT_APP_VERSION}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              Rendben, Értem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
