import React, { useState, useMemo } from 'react';
import {
  CpuBlockCategory,
  CpuBlockDefinition,
  CpuPlacedBlock,
} from '../../types/cpuBlock';
import { CPU_BLOCK_DEFINITIONS } from '../../core/cpuBlockCatalog';
import { compileCpuBlocksToAssembly } from '../../core/cpuBlockCompiler';
import { CPU_BLOCK_PRESETS } from '../../core/cpuBlockPresets';
import { useI18n } from '../../i18n/I18nContext';
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Binary,
  Blocks,
  BookOpen,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Code2,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  Cpu,
  Database,
  Download,
  FastForward,
  FileCode,
  GitBranch,
  Layers,
  LogIn,
  LogOut,
  MessageSquare,
  Minus,
  MinusCircle,
  Play,
  Plus,
  PlusCircle,
  Radio,
  RotateCcw,
  Save,
  Scale,
  Search,
  Sliders,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Tv,
  Wand2,
  Zap,
} from 'lucide-react';

interface CpuBlockStudioProps {
  onAssembleAndLoad?: (assemblyCode: string) => void;
  onClose?: () => void;
}

const CATEGORY_MAP: Record<
  CpuBlockCategory | 'ALL',
  {
    label: string;
    labelHu: string;
    color: string;
    accentColor: string;
    activeClass: string;
    icon: any;
  }
> = {
  ALL: {
    label: 'All Blocks',
    labelHu: 'Összes Blokk',
    color: 'border-slate-700 bg-slate-800 text-slate-200',
    accentColor: '#94A3B8',
    activeClass: 'bg-slate-700 text-white border-slate-500 shadow-sm shadow-slate-500/20',
    icon: Blocks,
  },
  ALU: {
    label: 'ALU & Arithmetic (Blue)',
    labelHu: 'ALU Aritmetika (Kék)',
    color: 'border-blue-500/60 bg-blue-950/40 text-blue-200',
    accentColor: '#3B82F6',
    activeClass: 'bg-blue-500/25 text-blue-200 border-blue-400 shadow-sm shadow-blue-500/30',
    icon: Binary,
  },
  DATA: {
    label: 'Memory & Data (Green)',
    labelHu: 'Memória & Adatmozgatás (Zöld)',
    color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200',
    accentColor: '#10B981',
    activeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-sm shadow-emerald-500/30',
    icon: Database,
  },
  FLOW: {
    label: 'Flow Control & Jumps (Yellow)',
    labelHu: 'Vezérlés & Ugrások (Sárga)',
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-200',
    accentColor: '#F59E0B',
    activeClass: 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-sm shadow-amber-500/30',
    icon: GitBranch,
  },
  HIGH_LEVEL: {
    label: 'Loops & Logic (Yellow)',
    labelHu: 'Ciklusok & Magas Szintű (Sárga)',
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-200',
    accentColor: '#F59E0B',
    activeClass: 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-sm shadow-amber-500/30',
    icon: RotateCcw,
  },
  STACK: {
    label: 'Stack & Functions (Purple)',
    labelHu: 'Verem & Alprogramok (Lila)',
    color: 'border-purple-500/60 bg-purple-950/40 text-purple-200',
    accentColor: '#A855F7',
    activeClass: 'bg-purple-500/25 text-purple-200 border-purple-400 shadow-sm shadow-purple-500/30',
    icon: Layers,
  },
  IO: {
    label: 'I/O Peripherals (Cyan)',
    labelHu: 'I/O Perifériák (Cián)',
    color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200',
    accentColor: '#06B6D4',
    activeClass: 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/30',
    icon: Tv,
  },
  SYSTEM: {
    label: 'System & Halt (Red)',
    labelHu: 'Rendszer & Leállítás (Piros)',
    color: 'border-rose-500/60 bg-rose-950/40 text-rose-200',
    accentColor: '#F43F5E',
    activeClass: 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-sm shadow-rose-500/30',
    icon: Square,
  },
};

export const CpuBlockStudio: React.FC<CpuBlockStudioProps> = ({
  onAssembleAndLoad,
  onClose,
}) => {
  const { language } = useI18n();

  // State
  const [selectedCategory, setSelectedCategory] = useState<CpuBlockCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [placedBlocks, setPlacedBlocks] = useState<CpuPlacedBlock[]>(
    () => CPU_BLOCK_PRESETS[0].blocks
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_arithmetic');
  const [copied, setCopied] = useState(false);
  const [flashedSuccess, setFlashedSuccess] = useState(false);

  // Dragging state for reordering & insertion
  const [draggedDefinition, setDraggedDefinition] = useState<CpuBlockDefinition | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);

  // Catalog definition lookup map
  const catalogMap = useMemo(() => {
    const map = new Map<string, CpuBlockDefinition>();
    CPU_BLOCK_DEFINITIONS.forEach((def) => map.set(def.type, def));
    return map;
  }, []);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return CPU_BLOCK_DEFINITIONS.filter((def) => {
      const matchesCat = selectedCategory === 'ALL' || def.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const matchesSearch =
        def.type.toLowerCase().includes(query) ||
        (def.mnemonic && def.mnemonic.toLowerCase().includes(query)) ||
        def.name.toLowerCase().includes(query) ||
        def.nameHu.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.descriptionHu.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Real-time compilation of placed blocks
  const compilation = useMemo(() => {
    return compileCpuBlocksToAssembly(placedBlocks, language as 'hu' | 'en');
  }, [placedBlocks, language]);

  // Handlers for modifying workspace
  const handleAddBlock = (def: CpuBlockDefinition, parentBlockId?: string) => {
    const newBlock: CpuPlacedBlock = {
      instanceId: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      blockType: def.type,
      params: { ...def.defaultParams },
      children: def.hasChildren ? [] : undefined,
    };

    if (parentBlockId) {
      setPlacedBlocks((prev) =>
        prev.map((blk) => {
          if (blk.instanceId === parentBlockId) {
            return {
              ...blk,
              children: [...(blk.children || []), newBlock],
            };
          }
          return blk;
        })
      );
    } else {
      setPlacedBlocks((prev) => [...prev, newBlock]);
    }
  };

  const handleUpdateParam = (
    instanceId: string,
    key: string,
    value: any,
    isChild?: boolean,
    parentId?: string
  ) => {
    if (isChild && parentId) {
      setPlacedBlocks((prev) =>
        prev.map((parent) => {
          if (parent.instanceId === parentId) {
            return {
              ...parent,
              children: (parent.children || []).map((child) =>
                child.instanceId === instanceId
                  ? { ...child, params: { ...child.params, [key]: value } }
                  : child
              ),
            };
          }
          return parent;
        })
      );
    } else {
      setPlacedBlocks((prev) =>
        prev.map((blk) =>
          blk.instanceId === instanceId
            ? { ...blk, params: { ...blk.params, [key]: value } }
            : blk
        )
      );
    }
  };

  const handleRemoveBlock = (instanceId: string, parentId?: string) => {
    if (parentId) {
      setPlacedBlocks((prev) =>
        prev.map((parent) => {
          if (parent.instanceId === parentId) {
            return {
              ...parent,
              children: (parent.children || []).filter(
                (child) => child.instanceId !== instanceId
              ),
            };
          }
          return parent;
        })
      );
    } else {
      setPlacedBlocks((prev) => prev.filter((blk) => blk.instanceId !== instanceId));
    }
  };

  const handleDuplicateBlock = (block: CpuPlacedBlock, parentId?: string) => {
    const clone: CpuPlacedBlock = {
      ...block,
      instanceId: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      params: { ...block.params },
      children: block.children
        ? block.children.map((c) => ({
            ...c,
            instanceId: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            params: { ...c.params },
          }))
        : undefined,
    };

    if (parentId) {
      setPlacedBlocks((prev) =>
        prev.map((parent) => {
          if (parent.instanceId === parentId) {
            const idx = (parent.children || []).findIndex(
              (c) => c.instanceId === block.instanceId
            );
            const nextChildren = [...(parent.children || [])];
            nextChildren.splice(idx + 1, 0, clone);
            return { ...parent, children: nextChildren };
          }
          return parent;
        })
      );
    } else {
      const idx = placedBlocks.findIndex((b) => b.instanceId === block.instanceId);
      const next = [...placedBlocks];
      next.splice(idx + 1, 0, clone);
      setPlacedBlocks(next);
    }
  };

  const handleMoveBlock = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= placedBlocks.length) return;
    const next = [...placedBlocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setPlacedBlocks(next);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = CPU_BLOCK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setPlacedBlocks(JSON.parse(JSON.stringify(preset.blocks)));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compilation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([compilation.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpu_program_${Date.now()}.asm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFlashToCpu = () => {
    if (onAssembleAndLoad) {
      onAssembleAndLoad(compilation.code);
      setFlashedSuccess(true);
      setTimeout(() => setFlashedSuccess(false), 2500);
    }
  };

  // Helper icon renderer
  const renderBlockIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'RotateCcw':
        return <RotateCcw className={className} />;
      case 'GitBranch':
        return <GitBranch className={className} />;
      case 'MessageSquare':
        return <MessageSquare className={className} />;
      case 'Download':
        return <Download className={className} />;
      case 'ArrowRightLeft':
        return <ArrowRightLeft className={className} />;
      case 'Database':
        return <Database className={className} />;
      case 'Save':
        return <Save className={className} />;
      case 'CornerDownRight':
        return <CornerDownRight className={className} />;
      case 'CornerDownLeft':
        return <CornerDownLeft className={className} />;
      case 'Plus':
        return <Plus className={className} />;
      case 'PlusCircle':
        return <PlusCircle className={className} />;
      case 'Minus':
        return <Minus className={className} />;
      case 'ArrowUp':
        return <ArrowUp className={className} />;
      case 'ArrowDown':
        return <ArrowDown className={className} />;
      case 'Scale':
        return <Scale className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'ChevronsLeft':
        return <ChevronsLeft className={className} />;
      case 'ChevronsRight':
        return <ChevronsRight className={className} />;
      case 'Binary':
        return <Binary className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Tag':
        return <Tag className={className} />;
      case 'FastForward':
        return <FastForward className={className} />;
      case 'LogIn':
        return <LogIn className={className} />;
      case 'LogOut':
        return <LogOut className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Tv':
        return <Tv className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Square':
        return <Square className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  // Render inline parameter inputs
  const renderParamInputs = (
    def: CpuBlockDefinition,
    placedBlock: CpuPlacedBlock,
    isChild = false,
    parentId?: string
  ) => {
    if (!def.paramSchema || def.paramSchema.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-700/40">
        {def.paramSchema.map((field) => {
          const val = placedBlock.params[field.key] ?? def.defaultParams[field.key];

          if (field.type === 'select') {
            return (
              <div key={field.key} className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'hu' ? field.labelHu : field.label}:
                </span>
                <select
                  value={val}
                  onChange={(e) =>
                    handleUpdateParam(
                      placedBlock.instanceId,
                      field.key,
                      e.target.value,
                      isChild,
                      parentId
                    )
                  }
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {language === 'hu' ? opt.labelHu : opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'number') {
            return (
              <div key={field.key} className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'hu' ? field.labelHu : field.label}:
                </span>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={val}
                  onChange={(e) =>
                    handleUpdateParam(
                      placedBlock.instanceId,
                      field.key,
                      parseInt(e.target.value, 10) || 0,
                      isChild,
                      parentId
                    )
                  }
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold outline-none focus:border-cyan-400"
                />
              </div>
            );
          }

          if (field.type === 'text') {
            return (
              <div key={field.key} className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'hu' ? field.labelHu : field.label}:
                </span>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={val}
                  onChange={(e) =>
                    handleUpdateParam(
                      placedBlock.instanceId,
                      field.key,
                      e.target.value,
                      isChild,
                      parentId
                    )
                  }
                  className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold outline-none focus:border-cyan-400"
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // Render a placed single block (or compound block with children)
  const renderPlacedBlock = (
    block: CpuPlacedBlock,
    index: number,
    isChild = false,
    parentId?: string
  ) => {
    const def = catalogMap.get(block.blockType);
    if (!def) return null;

    const isCompound = def.hasChildren;

    return (
      <div
        key={block.instanceId}
        draggable={!isChild}
        onDragStart={() => setDraggedBlockIndex(index)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedBlockIndex !== null && draggedBlockIndex !== index && !isChild) {
            const next = [...placedBlocks];
            const item = next.splice(draggedBlockIndex, 1)[0];
            next.splice(index, 0, item);
            setPlacedBlocks(next);
            setDraggedBlockIndex(null);
          }
        }}
        className={`relative group rounded-2xl border transition-all shadow-md ${def.color} ${
          isChild ? 'ml-6 my-1.5 p-3' : 'p-3.5 my-2.5'
        }`}
        style={{
          borderLeftWidth: '6px',
          borderLeftColor: def.accentColor,
        }}
      >
        {/* Puzzle Notch Visual Element (Blockly Style) */}
        {!isChild && (
          <div className="absolute -top-2 left-6 w-5 h-2 bg-[#0B0F17] border-b-2 border-slate-700 rounded-b-md" />
        )}

        {/* Top Header Bar of the Block */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg shrink-0 flex items-center justify-center"
              style={{ backgroundColor: `${def.accentColor}25`, color: def.accentColor }}
            >
              {renderBlockIcon(def.iconName, 'w-4 h-4')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white font-mono">
                  {language === 'hu' ? def.nameHu : def.name}
                </span>
                {def.mnemonic && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${def.accentColor}30`, color: def.accentColor }}
                  >
                    {def.mnemonic}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-md hidden sm:block">
                {language === 'hu' ? def.descriptionHu : def.description}
              </p>
            </div>
          </div>

          {/* Action buttons: Move, Duplicate, Delete */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {!isChild && (
              <>
                <button
                  disabled={index === 0}
                  onClick={() => handleMoveBlock(index, 'UP')}
                  className="p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title={language === 'hu' ? 'Mozgatás felfelé' : 'Move Up'}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === placedBlocks.length - 1}
                  onClick={() => handleMoveBlock(index, 'DOWN')}
                  className="p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title={language === 'hu' ? 'Mozgatás lefelé' : 'Move Down'}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDuplicateBlock(block, parentId)}
              className="p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title={language === 'hu' ? 'Megkettőzés' : 'Duplicate'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRemoveBlock(block.instanceId, parentId)}
              className="p-1 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-300 cursor-pointer"
              title={language === 'hu' ? 'Törlés' : 'Delete'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline Parameters */}
        {renderParamInputs(def, block, isChild, parentId)}

        {/* Compound Block Children (C-shaped nesting area) */}
        {isCompound && (
          <div className="mt-3 pl-3 pt-2 border-l-2 border-dashed border-amber-500/50 bg-black/30 rounded-r-xl">
            <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center justify-between pr-2">
              <span>{language === 'hu' ? 'Belső Utasítások' : 'Inner Instructions'}</span>
              <span className="text-slate-400 font-normal">
                ({(block.children || []).length} {language === 'hu' ? 'blokk' : 'blocks'})
              </span>
            </div>

            {block.children && block.children.length > 0 ? (
              block.children.map((child, cIdx) =>
                renderPlacedBlock(child, cIdx, true, block.instanceId)
              )
            ) : (
              <div className="py-3 px-2 text-center text-xs text-slate-500 italic">
                {language === 'hu'
                  ? 'Üres ciklusmag. Húzz vagy adj hozzá belső utasítást!'
                  : 'Empty body. Drag or add inner instructions here!'}
              </div>
            )}

            {/* Quick add inside child */}
            <div className="mt-2 pb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400">
                {language === 'hu' ? '+ Hozzáadás ide:' : '+ Add inner:'}
              </span>
              <button
                onClick={() => {
                  const incDef = catalogMap.get('INC');
                  if (incDef) handleAddBlock(incDef, block.instanceId);
                }}
                className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 cursor-pointer"
              >
                + INC
              </button>
              <button
                onClick={() => {
                  const outDef = catalogMap.get('OUT');
                  if (outDef) handleAddBlock(outDef, block.instanceId);
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-[10px] font-mono border border-cyan-500/40 cursor-pointer"
              >
                + OUT
              </button>
              <button
                onClick={() => {
                  const sleepDef = catalogMap.get('SLEEP');
                  if (sleepDef) handleAddBlock(sleepDef, block.instanceId);
                }}
                className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] font-mono border border-rose-500/40 cursor-pointer"
              >
                + SLEEP
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20">
            <Blocks className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Vizuális CPU Blokk-Programozó (Blockly Assembly Stúdió)'
                  : 'Visual CPU Block Studio (Blockly Assembly)'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                v3.4.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Építs CPU utasításokat és ciklusokat vizuális puzzle-blokkokkal, majd fordítsd valós Assembly kóddá és töltsd be a CPU-ba!'
                : 'Assemble CPU instructions and loops with visual blocks, compile to native Assembly, and flash into the CPU simulator!'}
            </p>
          </div>
        </div>

        {/* Top Controls: Preset selector, Assemble & Flash */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {language === 'hu' ? 'Minták:' : 'Presets:'}
            </span>
            <select
              value={selectedPresetId}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="bg-transparent text-xs font-bold text-amber-300 outline-none cursor-pointer"
            >
              {CPU_BLOCK_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {language === 'hu' ? p.titleHu : p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Flash / Assemble & Load Button */}
          {onAssembleAndLoad && (
            <button
              onClick={handleFlashToCpu}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95"
            >
              {flashedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>{language === 'hu' ? 'Betöltve a CPU-ba!' : 'Loaded into CPU!'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>
                    {language === 'hu' ? '⚡ Összeállítás & Betöltés' : '⚡ Assemble & Load to CPU'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Clear Workspace */}
          <button
            onClick={() => setPlacedBlocks([])}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-colors"
            title={language === 'hu' ? 'Munkaterület törlése' : 'Clear Workspace'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Educational Color-Coded Categories Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-slate-800/90 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'hu' ? 'Színkódolt Kategóriák:' : 'Color-Coded Categories:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {/* Blue - ALU / Arithmetic */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'ALU' ? 'ALL' : 'ALU')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'ALU'
                ? 'bg-blue-500/25 border-blue-400 text-blue-100 ring-1 ring-blue-500/50'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Kék:' : 'Blue:'}</span>
            <span>{language === 'hu' ? 'Aritmetika (ADD, SUB, CMP, SHL...)' : 'ALU Arithmetic (ADD, SUB, CMP...)'}</span>
          </button>

          {/* Green - Memory & Data */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'DATA' ? 'ALL' : 'DATA')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'DATA'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 ring-1 ring-emerald-500/50'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Zöld:' : 'Green:'}</span>
            <span>{language === 'hu' ? 'Memória & Adat (LDI, MOV, LDA, STA...)' : 'Memory & Data (LDI, MOV, LDA...)'}</span>
          </button>

          {/* Yellow - Flow Control & Loops */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'FLOW' ? 'ALL' : 'FLOW')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'FLOW' || selectedCategory === 'HIGH_LEVEL'
                ? 'bg-amber-500/25 border-amber-400 text-amber-100 ring-1 ring-amber-500/50'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Sárga:' : 'Yellow:'}</span>
            <span>{language === 'hu' ? 'Vezérlés (JMP, JNZ, JC, Ciklusok...)' : 'Flow Control (JMP, JNZ, Loops...)'}</span>
          </button>

          {/* Purple - Stack & Subroutines */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'STACK' ? 'ALL' : 'STACK')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'STACK'
                ? 'bg-purple-500/25 border-purple-400 text-purple-100 ring-1 ring-purple-500/50'
                : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Lila:' : 'Purple:'}</span>
            <span>{language === 'hu' ? 'Verem & Alprogramok (CALL, RET, PUSH...)' : 'Stack & Functions (CALL, RET...)'}</span>
          </button>

          {/* Cyan - I/O Peripherals */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'IO' ? 'ALL' : 'IO')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'IO'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100 ring-1 ring-cyan-500/50'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-xs shadow-cyan-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Cián:' : 'Cyan:'}</span>
            <span>{language === 'hu' ? 'I/O Perifériák (Port 0-5, LED, Kijelző...)' : 'I/O Peripherals (Port 0-5, LEDs...)'}</span>
          </button>

          {/* Rose - System */}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'SYSTEM' ? 'ALL' : 'SYSTEM')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedCategory === 'SYSTEM'
                ? 'bg-rose-500/25 border-rose-400 text-rose-100 ring-1 ring-rose-500/50'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-950/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50 inline-block shrink-0" />
            <span className="font-bold">{language === 'hu' ? 'Piros:' : 'Red:'}</span>
            <span>{language === 'hu' ? 'Rendszer (HLT, SLEEP, NOP)' : 'System & Halt (HLT, SLEEP...)'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid: (1) Block Palette / (2) Visual Assembly Canvas / (3) Live Code & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ================= COLUMN 1: BLOCK PALETTE (TOOLBOX) ================= */}
        <div className="lg:col-span-4 bg-[#0B0F17] border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Blocks className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs font-mono uppercase text-white">
                {language === 'hu' ? 'Utasítás & Blokk Eszköztár' : 'Instruction Toolbox'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredCatalog.length} {language === 'hu' ? 'blokk' : 'blocks'}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                language === 'hu'
                  ? 'Keresés: LDI, ADD, OUT, Ciklus...'
                  : 'Search: LDI, ADD, OUT, Loop...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1">
            {(Object.keys(CATEGORY_MAP) as (CpuBlockCategory | 'ALL')[]).map((catKey) => {
              const cat = CATEGORY_MAP[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? cat.activeClass
                      : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  <span>{language === 'hu' ? cat.labelHu : cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Draggable Catalog Blocks List */}
          <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredCatalog.map((def) => (
              <div
                key={def.id}
                draggable
                onDragStart={() => setDraggedDefinition(def)}
                className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] flex items-center justify-between gap-2 shadow-sm ${def.color}`}
                style={{ borderLeftWidth: '4px', borderLeftColor: def.accentColor }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="p-1 rounded-md shrink-0"
                    style={{ backgroundColor: `${def.accentColor}25`, color: def.accentColor }}
                  >
                    {renderBlockIcon(def.iconName, 'w-3.5 h-3.5')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white font-mono truncate">
                        {language === 'hu' ? def.nameHu : def.name}
                      </span>
                      {def.mnemonic && (
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-900 text-slate-300">
                          {def.mnemonic}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {language === 'hu' ? def.descriptionHu : def.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAddBlock(def)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
                  title={language === 'hu' ? 'Hozzáadás a vászonhoz' : 'Add to Workspace'}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 2: WORKSPACE CANVAS ================= */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedDefinition) {
              handleAddBlock(draggedDefinition);
              setDraggedDefinition(null);
            }
          }}
          className="lg:col-span-5 bg-[#0B0F17] border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3 min-h-[640px]"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs font-mono uppercase text-white">
                {language === 'hu' ? 'Összeállított Program Váz' : 'Visual Assembly Canvas'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {placedBlocks.length} {language === 'hu' ? 'fő utasítás' : 'top instructions'}
            </span>
          </div>

          {/* Placed Blocks List */}
          <div className="flex-1 flex flex-col overflow-y-auto max-h-[580px] pr-1">
            {placedBlocks.length > 0 ? (
              placedBlocks.map((block, idx) => renderPlacedBlock(block, idx))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 gap-3">
                <Blocks className="w-10 h-10 text-slate-600 animate-pulse" />
                <div>
                  <p className="font-bold text-sm text-slate-400">
                    {language === 'hu'
                      ? 'A vizuális munkaterület még üres'
                      : 'Visual workspace is empty'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {language === 'hu'
                      ? 'Kattints egy blokkra a bal oldali eszköztárban a program felépítéséhez, vagy válassz egy kész mintát!'
                      : 'Click a block from the toolbox on the left to start assembling, or choose a preset!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: LIVE ASSEMBLY CODE & METRICS ================= */}
        <div className="lg:col-span-3 bg-[#0B0F17] border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs font-mono uppercase text-white">
                {language === 'hu' ? 'Generált Assembly' : 'Generated Assembly'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title={language === 'hu' ? 'Másolás' : 'Copy'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadCode}
                className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title={language === 'hu' ? 'Letöltés .asm' : 'Download .asm'}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compilation Metrics Banner */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px]">
                {language === 'hu' ? 'Utasítások:' : 'Instructions:'}
              </span>
              <div className="font-bold text-cyan-300">{compilation.instructionCount}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">
                {language === 'hu' ? 'Becsült méret:' : 'Est. Bytes:'}
              </span>
              <div className="font-bold text-emerald-300">{compilation.estimatedBytes} B</div>
            </div>
          </div>

          {/* Code Text Viewer */}
          <div className="relative flex-1 min-h-[440px] max-h-[500px] bg-[#07090E] border border-slate-800/80 rounded-xl p-3 overflow-y-auto font-mono text-xs text-slate-300 select-text leading-5">
            <pre className="whitespace-pre-wrap font-mono">
              {compilation.code}
            </pre>
          </div>

          {/* Direct Flash CTA */}
          {onAssembleAndLoad && (
            <button
              onClick={handleFlashToCpu}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {language === 'hu'
                  ? 'Betöltés a CPU Memóriájába'
                  : 'Flash into CPU Memory'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
