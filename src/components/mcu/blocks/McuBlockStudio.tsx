import React, { useState } from 'react';
import {
  BlockCategory,
  BlockDefinition,
  PlacedBlock,
} from '../../../types/mcuBlock';
import { BLOCK_DEFINITIONS } from '../../../core/mcuBlockCatalog';
import { BLOCK_PRESETS } from '../../../core/mcuBlockPresets';
import { compileBlocksToArduinoCode } from '../../../core/mcuBlockCompiler';
import { McuMemoryVisualizer } from './McuMemoryVisualizer';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Copy,
  Cpu,
  Database,
  Download,
  FastForward,
  Flame,
  Gauge,
  GitBranch,
  Layers,
  MemoryStick,
  Network,
  Palette,
  Play,
  Plus,
  Power,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  Tv,
  Variable,
  Volume2,
  Zap,
} from 'lucide-react';

interface McuBlockStudioProps {
  onFlashToMcuA?: (code: string) => void;
  onFlashToMcuB?: (code: string) => void;
  onFlashToBreadboard?: (code: string) => void;
}

export const McuBlockStudio: React.FC<McuBlockStudioProps> = ({
  onFlashToMcuA,
  onFlashToMcuB,
  onFlashToBreadboard,
}) => {
  const { language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'BLOCKS' | 'MEMORY' | 'SPLIT'>('BLOCKS');
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>(() => [
    ...BLOCK_PRESETS[0].blocks,
  ]);
  const [selectedTarget, setSelectedTarget] = useState<'MCU_A' | 'MCU_B' | 'BREADBOARD'>('MCU_A');
  const [copied, setCopied] = useState(false);
  const [flashSuccessMsg, setFlashSuccessMsg] = useState<string | null>(null);

  // Dragging state for HTML5 Drag & Drop
  const [draggedDefId, setDraggedDefId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Categories list
  const categories: { id: BlockCategory | 'ALL'; name: string; nameHu: string; icon: any; color: string }[] = [
    { id: 'ALL', name: 'All Blocks', nameHu: 'Minden Blokk', icon: Layers, color: 'text-slate-200' },
    { id: 'CONTROL', name: 'Control & Loops', nameHu: 'Vezérlés & Ciklusok', icon: RotateCcw, color: 'text-amber-400' },
    { id: 'VARIABLES', name: 'Variables & Types', nameHu: 'Változók & Típusok', icon: Variable, color: 'text-emerald-400' },
    { id: 'ARRAYS', name: 'Arrays & Buffers', nameHu: 'Tömbök & Pufferek', icon: Database, color: 'text-teal-400' },
    { id: 'ADC', name: 'ADC & Analog', nameHu: 'ADC & Analóg Mérés', icon: Activity, color: 'text-emerald-400' },
    { id: 'PWM', name: 'PWM & Timers', nameHu: 'PWM & Időzítők', icon: FastForward, color: 'text-purple-400' },
    { id: 'SHIFT_REGISTER', name: 'Shift Register (74HC595)', nameHu: 'Shift-Regiszter (74595)', icon: Cpu, color: 'text-cyan-400' },
    { id: 'IO', name: 'Digital I/O', nameHu: 'Digitális I/O', icon: Cpu, color: 'text-blue-400' },
    { id: 'PROTOCOLS', name: 'Wireless & Bus', nameHu: 'Rádió & Busz Hidak', icon: Radio, color: 'text-cyan-400' },
    { id: 'ACTUATORS', name: 'Actuators & OLED', nameHu: 'Beavatkozók & Kijelző', icon: Gauge, color: 'text-purple-400' },
    { id: 'LOGIC', name: 'Logic & Math', nameHu: 'Logika & Matematika', icon: Sliders, color: 'text-emerald-400' },
  ];

  // Filtered block definitions
  const filteredDefs = BLOCK_DEFINITIONS.filter(
    (def) => selectedCategory === 'ALL' || def.category === selectedCategory
  );

  // Add block to workspace
  const handleAddBlock = (def: BlockDefinition, index?: number) => {
    const newBlock: PlacedBlock = {
      instanceId: 'blk-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      blockType: def.type,
      params: { ...def.defaultParams },
      children: def.hasChildren ? [] : undefined,
    };

    setPlacedBlocks((prev) => {
      if (typeof index === 'number' && index >= 0 && index <= prev.length) {
        const copy = [...prev];
        copy.splice(index, 0, newBlock);
        return copy;
      }
      return [...prev, newBlock];
    });
  };

  // Remove block
  const handleRemoveBlock = (instanceId: string) => {
    setPlacedBlocks((prev) => prev.filter((b) => b.instanceId !== instanceId));
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPlacedBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index >= placedBlocks.length - 1) return;
    setPlacedBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Update block parameter
  const handleUpdateParam = (instanceId: string, key: string, value: any) => {
    setPlacedBlocks((prev) =>
      prev.map((b) => {
        if (b.instanceId === instanceId) {
          return {
            ...b,
            params: { ...b.params, [key]: value },
          };
        }
        return b;
      })
    );
  };

  // Load preset
  const handleLoadPreset = (presetId: string) => {
    const p = BLOCK_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setPlacedBlocks(JSON.parse(JSON.stringify(p.blocks)));
      setSelectedTarget(p.targetMcu);
    }
  };

  // Compile code in real time
  const compilation = compileBlocksToArduinoCode(placedBlocks, selectedTarget);

  // Flash code to selected target
  const handleFlash = () => {
    if (selectedTarget === 'MCU_A' && onFlashToMcuA) {
      onFlashToMcuA(compilation.code);
      setFlashSuccessMsg(
        language === 'hu'
          ? 'Kód sikeresen feltöltve: MCU A (Mester / Adó) Flash Memóriába!'
          : 'Code successfully flashed to MCU A (Master / Transmitter) Flash!'
      );
    } else if (selectedTarget === 'MCU_B' && onFlashToMcuB) {
      onFlashToMcuB(compilation.code);
      setFlashSuccessMsg(
        language === 'hu'
          ? 'Kód sikeresen feltöltve: MCU B (Szolga / Vevő Robot) Flash Memóriába!'
          : 'Code successfully flashed to MCU B (Slave / Receiver) Flash!'
      );
    } else if (onFlashToBreadboard) {
      onFlashToBreadboard(compilation.code);
      setFlashSuccessMsg(
        language === 'hu'
          ? 'Kód sikeresen feltöltve: Breadboard ATmega328P Flash Memóriába!'
          : 'Code successfully flashed to Breadboard ATmega328P Flash!'
      );
    }

    setTimeout(() => {
      setFlashSuccessMsg(null);
    }, 4000);
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(compilation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .ino file
  const handleDownloadCode = () => {
    const blob = new Blob([compilation.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcu_block_program_${selectedTarget.toLowerCase()}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono select-none">
      {/* Top Banner & Preset Selector Bar */}
      <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {language === 'hu'
                    ? 'Vizuális Blokk-Programozó Stúdió (Drag & Drop)'
                    : 'Visual Block Programming Studio (Drag & Drop)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-[10px] font-bold">
                  Blockly / Scratch Style • C++ Generator
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {language === 'hu'
                  ? 'Építs beágyazott programokat grafikus blokkokkal, generálj valós idejű Arduino C kódot, és töltsd be azonnal az MCU-ba!'
                  : 'Build embedded programs visually, generate authentic Arduino C code in real time, and flash directly to any MCU target!'}
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              {language === 'hu' ? 'Sablonok:' : 'Presets:'}
            </span>
            {BLOCK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset.id)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all hover:border-cyan-500/60 shadow-sm"
              >
                {language === 'hu' ? preset.titleHu : preset.title}
              </button>
            ))}
            <button
              onClick={() => setPlacedBlocks([])}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-colors"
              title="Munkaterület ürítése"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Flash Target Selector Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">
              {language === 'hu' ? 'Cél Mikrokontroller:' : 'Flash Target:'}
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedTarget('MCU_A')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedTarget === 'MCU_A'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MCU A (Mester / Adó)
              </button>
              <button
                onClick={() => setSelectedTarget('MCU_B')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedTarget === 'MCU_B'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MCU B (Szolga / Vevő Robot)
              </button>
              <button
                onClick={() => setSelectedTarget('BREADBOARD')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedTarget === 'BREADBOARD'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Breadboard ATmega328P
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFlash}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40 transition-all scale-100 active:scale-95"
            >
              <Flame className="w-4 h-4" />
              <span>
                {language === 'hu' ? 'Flash Betöltés az MCU-ba' : 'Flash Code to MCU'}
              </span>
            </button>
          </div>
        </div>

        {/* Flash Success Notification Toast */}
        {flashSuccessMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 p-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{flashSuccessMsg}</span>
          </div>
        )}

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('BLOCKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'BLOCKS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? '1. Blokk Tervező & Kód' : '1. Block Builder & Code'}</span>
            </button>

            <button
              onClick={() => setActiveTab('MEMORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'MEMORY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? '2. SRAM Memória & Változók/Tömbök' : '2. SRAM Memory & Variables/Arrays'}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
                EDU
              </span>
            </button>

            <button
              onClick={() => setActiveTab('SPLIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'SPLIT'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? '3. Osztott Munkaterület' : '3. Split View'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>{language === 'hu' ? 'Elhelyezett blokkok:' : 'Active blocks:'} <strong className="text-white">{placedBlocks.length}</strong></span>
          </div>
        </div>
      </div>

      {/* When MEMORY tab is active, show the memory inspector */}
      {activeTab === 'MEMORY' && (
        <McuMemoryVisualizer blocks={placedBlocks} />
      )}

      {/* Main 3-Column Studio Grid: Palette (Left 3.5 cols) <-> Canvas (Center 5 cols) <-> Live C Code (Right 3.5 cols) */}
      {(activeTab === 'BLOCKS' || activeTab === 'SPLIT') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 1. Palette: Block ToolBox (Left 3.5 Cols) */}
        <div className="lg:col-span-4 bg-[#080D1A] border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'hu' ? 'Blokk Eszköztár (Paletta)' : 'Block Palette'}
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {filteredDefs.length} {language === 'hu' ? 'elem' : 'types'}
            </span>
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSel = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{language === 'hu' ? cat.nameHu : cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Available Blocks List (Draggable Cards) */}
          <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredDefs.map((def) => {
              return (
                <div
                  key={def.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', def.type);
                    setDraggedDefId(def.type);
                  }}
                  className={`p-2.5 rounded-xl border ${def.color} cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all shadow-md flex flex-col gap-1.5 group select-none`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="truncate">{language === 'hu' ? def.nameHu : def.name}</span>
                    <button
                      onClick={() => handleAddBlock(def)}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                      title="Hozzáadás a munkaterülethez"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                    {language === 'hu' ? def.descriptionHu : def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Canvas: Assembled Blocks Sequence Workspace (Center 4.5 Cols) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const bType = e.dataTransfer.getData('text/plain') || draggedDefId;
            if (bType) {
              const def = BLOCK_DEFINITIONS.find((d) => d.type === bType);
              if (def) {
                handleAddBlock(def);
              }
            }
            setDraggedDefId(null);
          }}
          className="lg:col-span-4 bg-[#090D17] border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-2xl p-3.5 shadow-xl flex flex-col gap-3 min-h-[580px] transition-colors"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'hu' ? 'Munkaterület (Blokk Füzér)' : 'Workspace Flow'}
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              {placedBlocks.length} {language === 'hu' ? 'blokk összekapcsolva' : 'blocks connected'}
            </span>
          </div>

          {/* Assembled Blocks List */}
          <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {placedBlocks.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs font-sans max-w-xs">
                  {language === 'hu'
                    ? 'Húzz ide blokkokat a bal oldali palettáról vagy válassz egy kész sablont a felső menüből!'
                    : 'Drag blocks here from the palette or select a preset from the top bar!'}
                </p>
              </div>
            ) : (
              placedBlocks.map((block, index) => {
                const def = BLOCK_DEFINITIONS.find((d) => d.type === block.blockType);
                if (!def) return null;

                return (
                  <div
                    key={block.instanceId}
                    className={`rounded-2xl border ${def.color} p-3 shadow-lg flex flex-col gap-2 transition-all group`}
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between gap-2 text-xs font-bold pb-1 border-b border-white/10">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300 font-mono">
                          #{index + 1}
                        </span>
                        <span className="truncate">{language === 'hu' ? def.nameHu : def.name}</span>
                      </div>

                      {/* Control buttons: Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded-lg bg-black/30 hover:bg-black/60 disabled:opacity-30 text-slate-300 cursor-pointer"
                          title="Mozgatás fel"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === placedBlocks.length - 1}
                          className="p-1 rounded-lg bg-black/30 hover:bg-black/60 disabled:opacity-30 text-slate-300 cursor-pointer"
                          title="Mozgatás le"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveBlock(block.instanceId)}
                          className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 cursor-pointer ml-1"
                          title="Blokk törlése"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Parameter Fields */}
                    {def.paramSchema.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {def.paramSchema.map((field) => {
                          const currentVal = block.params[field.key] ?? '';

                          return (
                            <div key={field.key} className="flex flex-col gap-1 text-[11px]">
                              <label className="text-slate-400 text-[10px] font-bold">
                                {language === 'hu' ? field.labelHu : field.label}
                              </label>

                              {field.type === 'select' ? (
                                <select
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleUpdateParam(block.instanceId, field.key, e.target.value)
                                  }
                                  className="bg-[#05070D] border border-slate-800 rounded-lg p-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                                >
                                  {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {language === 'hu' ? opt.labelHu : opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === 'number' ? (
                                <input
                                  type="number"
                                  min={field.min}
                                  max={field.max}
                                  step={field.step || 1}
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleUpdateParam(
                                      block.instanceId,
                                      field.key,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="bg-[#05070D] border border-slate-800 rounded-lg p-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleUpdateParam(block.instanceId, field.key, e.target.value)
                                  }
                                  className="bg-[#05070D] border border-slate-800 rounded-lg p-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Live Arduino C++ Code Output (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-[#0A0D17] border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'hu' ? 'Generált Arduino C++ Kód' : 'Live Generated C++ Code'}
              </h3>
            </div>

            {/* Code Actions (Copy, Download) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                title="Kód másolása"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadCode}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                title="Letöltés .ino fájlként"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-time Code Preview */}
          <div className="bg-[#04060B] border border-slate-800/80 rounded-xl p-3 shadow-inner max-h-[500px] overflow-y-auto">
            <pre className="text-[11px] font-mono text-cyan-300 leading-relaxed whitespace-pre-wrap">
              {compilation.code}
            </pre>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Includes: <strong className="text-slate-200">{compilation.includes.length}</strong></span>
            <span>Globals: <strong className="text-slate-200">{compilation.globals.length}</strong></span>
            <span>Target: <strong className="text-cyan-400">{selectedTarget}</strong></span>
          </div>
        </div>
      </div>
      )}

      {/* Split Mode: Memory Visualizer rendered beneath */}
      {activeTab === 'SPLIT' && (
        <div className="pt-4 border-t border-slate-800/80">
          <McuMemoryVisualizer blocks={placedBlocks} />
        </div>
      )}
    </div>
  );
};
