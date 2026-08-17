import React, { useState, useMemo } from 'react';
import { PlacedBlock, McuMemoryItem, McuDataType } from '../../../types/mcuBlock';
import { useI18n } from '../../../i18n/I18nContext';
import {
  AlertTriangle,
  ArrowRight,
  Binary,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  Flame,
  HelpCircle,
  Info,
  Layers,
  MemoryStick,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface McuMemoryVisualizerProps {
  blocks: PlacedBlock[];
}

const TYPE_SIZES: Record<McuDataType, number> = {
  byte: 1,
  char: 1,
  bool: 1,
  int: 2,
  float: 4,
  long: 4,
};

// Convert value to little-endian bytes
function valueToLittleEndianBytes(val: any, type: McuDataType): number[] {
  const bytes: number[] = [];
  const numVal = typeof val === 'number' ? val : parseFloat(val) || 0;

  switch (type) {
    case 'byte':
    case 'char':
    case 'bool': {
      const b = typeof val === 'boolean' ? (val ? 1 : 0) : Math.floor(numVal) & 0xff;
      bytes.push(b);
      break;
    }
    case 'int': {
      const intVal = Math.floor(numVal) & 0xffff;
      bytes.push(intVal & 0xff); // Low byte
      bytes.push((intVal >> 8) & 0xff); // High byte
      break;
    }
    case 'float': {
      // IEEE-754 32-bit float to 4 bytes
      const buffer = new ArrayBuffer(4);
      const floatView = new Float32Array(buffer);
      const uint8View = new Uint8Array(buffer);
      floatView[0] = numVal;
      bytes.push(uint8View[0], uint8View[1], uint8View[2], uint8View[3]);
      break;
    }
    case 'long': {
      const lVal = Math.floor(numVal) & 0xffffffff;
      bytes.push(lVal & 0xff);
      bytes.push((lVal >> 8) & 0xff);
      bytes.push((lVal >> 16) & 0xff);
      bytes.push((lVal >> 24) & 0xff);
      break;
    }
    default:
      bytes.push(0);
  }
  return bytes;
}

export const McuMemoryVisualizer: React.FC<McuMemoryVisualizerProps> = ({ blocks }) => {
  const { language } = useI18n();

  // Interactive selected item / cell
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);

  // Pointer arithmetic explorer state
  const [selectedArrayIndex, setSelectedArrayIndex] = useState<number>(0);
  const [testOverflowIndex, setTestOverflowIndex] = useState<number>(8);

  // Live simulation simulation tick
  const [simStep, setSimStep] = useState<number>(0);
  const [simOverrides, setSimOverrides] = useState<Record<string, any>>({});

  // 1. Parse memory items from placed blocks
  const memoryItems: McuMemoryItem[] = useMemo(() => {
    const items: McuMemoryItem[] = [];
    let currentSramAddress = 0x0100; // ATmega328P SRAM starts at 0x0100 (after 32 regs + 64 SFRs + 160 ExtIO)
    const seenNames = new Set<string>();

    const traverse = (blks: PlacedBlock[]) => {
      blks.forEach((b) => {
        const p = b.params || {};

        if (b.blockType === 'VAR_DECLARE') {
          const varName = p.varName || 'sensorValue';
          if (!seenNames.has(varName)) {
            seenNames.add(varName);
            const dt = (p.dataType as McuDataType) || 'int';
            const size = TYPE_SIZES[dt] || 2;
            const initVal =
              simOverrides[varName] !== undefined
                ? simOverrides[varName]
                : p.initValue !== undefined && p.initValue !== ''
                ? p.initValue
                : 0;
            const bytes = valueToLittleEndianBytes(initVal, dt);

            items.push({
              id: `var-${varName}`,
              name: varName,
              kind: 'variable',
              dataType: dt,
              elementSize: size,
              totalSizeBytes: size,
              baseAddress: currentSramAddress,
              scope: p.scope === 'local' ? 'local' : 'global',
              location: p.scope === 'local' ? 'STACK' : 'SRAM',
              currentValues: [initVal],
              rawBytes: bytes,
              comment: `Declared as ${dt} (${size} Byte${size > 1 ? 's' : ''}) in ${p.scope || 'global'} memory`,
              commentHu: `Deklarálva mint ${dt} (${size} Bájt) a ${p.scope === 'local' ? 'veremtárban' : 'globális SRAM-ban'}`,
            });
            currentSramAddress += size;
          }
        } else if (b.blockType === 'ARRAY_DECLARE') {
          const arrName = p.arrayName || 'readings';
          if (!seenNames.has(arrName)) {
            seenNames.add(arrName);
            const dt = (p.dataType as McuDataType) || 'int';
            const elemSize = TYPE_SIZES[dt] || 2;
            const length = Math.max(1, Math.min(64, Number(p.size) || 8));
            const totalSize = elemSize * length;
            const isProgmem = p.location === 'PROGMEM';

            // Parse initial values
            const valList: any[] = [];
            const rawInits = (p.initValues || '').split(',').map((s: string) => s.trim());
            for (let i = 0; i < length; i++) {
              if (simOverrides[`${arrName}[${i}]`] !== undefined) {
                valList.push(simOverrides[`${arrName}[${i}]`]);
              } else if (rawInits[i] !== undefined && rawInits[i] !== '') {
                valList.push(Number(rawInits[i]) || 0);
              } else {
                valList.push(0);
              }
            }

            const allBytes: number[] = [];
            valList.forEach((v) => {
              allBytes.push(...valueToLittleEndianBytes(v, dt));
            });

            items.push({
              id: `arr-${arrName}`,
              name: arrName,
              kind: 'array',
              dataType: dt,
              elementSize: elemSize,
              arrayLength: length,
              totalSizeBytes: totalSize,
              baseAddress: isProgmem ? 0x0800 : currentSramAddress,
              scope: 'global',
              location: isProgmem ? 'PROGMEM' : 'SRAM',
              currentValues: valList,
              rawBytes: allBytes,
              comment: `Array of ${length} ${dt} elements (${totalSize} Bytes contiguous buffer)`,
              commentHu: `${length} darab ${dt} elemből álló tömb (${totalSize} Bájt folytonos memóriapuffer)`,
            });

            if (!isProgmem) {
              currentSramAddress += totalSize;
            }
          }
        } else if (b.blockType === 'ANALOG_READ_VAR') {
          const varName = p.varName || 'potValue';
          if (!seenNames.has(varName)) {
            seenNames.add(varName);
            const dt: McuDataType = 'int';
            const size = 2;
            const val = simOverrides[varName] !== undefined ? simOverrides[varName] : 512;
            const bytes = valueToLittleEndianBytes(val, dt);
            items.push({
              id: `var-${varName}`,
              name: varName,
              kind: 'variable',
              dataType: dt,
              elementSize: size,
              totalSizeBytes: size,
              baseAddress: currentSramAddress,
              scope: 'global',
              location: 'SRAM',
              currentValues: [val],
              rawBytes: bytes,
              comment: 'ADC 10-bit reading variable (0..1023)',
              commentHu: '10-bites Analóg ADC minta változó (0..1023)',
            });
            currentSramAddress += size;
          }
        } else if (b.blockType === 'MAP_RANGE') {
          const varName = p.targetVar || 'servoTarget';
          if (!seenNames.has(varName)) {
            seenNames.add(varName);
            const dt: McuDataType = 'int';
            const size = 2;
            const val = simOverrides[varName] !== undefined ? simOverrides[varName] : 90;
            const bytes = valueToLittleEndianBytes(val, dt);
            items.push({
              id: `var-${varName}`,
              name: varName,
              kind: 'variable',
              dataType: dt,
              elementSize: size,
              totalSizeBytes: size,
              baseAddress: currentSramAddress,
              scope: 'global',
              location: 'SRAM',
              currentValues: [val],
              rawBytes: bytes,
              comment: 'Calculated scaled target variable',
              commentHu: 'Skálázott kimeneti érték változója',
            });
            currentSramAddress += size;
          }
        } else if (b.blockType === 'ARRAY_ROLLING_AVG') {
          const arrName = p.arrayName || 'readings';
          if (!seenNames.has(arrName)) {
            seenNames.add(arrName);
            const dt: McuDataType = 'int';
            const elemSize = 2;
            const length = Number(p.size) || 8;
            const totalSize = elemSize * length;
            const valList = [120, 125, 130, 128, 132, 135, 129, 130].slice(0, length);
            while (valList.length < length) valList.push(0);

            const allBytes: number[] = [];
            valList.forEach((v) => allBytes.push(...valueToLittleEndianBytes(v, dt)));

            items.push({
              id: `arr-${arrName}`,
              name: arrName,
              kind: 'array',
              dataType: dt,
              elementSize: elemSize,
              arrayLength: length,
              totalSizeBytes: totalSize,
              baseAddress: currentSramAddress,
              scope: 'global',
              location: 'SRAM',
              currentValues: valList,
              rawBytes: allBytes,
              comment: `DSP Circular sample buffer for rolling average`,
              commentHu: `DSP körkörös mintavevő puffer a futóátlaghoz`,
            });
            currentSramAddress += totalSize;
          }

          const resVar = p.resultVar || 'smoothedAverage';
          if (!seenNames.has(resVar)) {
            seenNames.add(resVar);
            items.push({
              id: `var-${resVar}`,
              name: resVar,
              kind: 'variable',
              dataType: 'int',
              elementSize: 2,
              totalSizeBytes: 2,
              baseAddress: currentSramAddress,
              scope: 'global',
              location: 'SRAM',
              currentValues: [129],
              rawBytes: valueToLittleEndianBytes(129, 'int'),
              comment: 'Computed smoothed average value',
              commentHu: 'Kiszámított simított átlagérték',
            });
            currentSramAddress += 2;
          }
        }

        if (b.children && b.children.length > 0) {
          traverse(b.children);
        }
      });
    };

    traverse(blocks);

    // If empty, supply default educational showcase items
    if (items.length === 0) {
      items.push(
        {
          id: 'demo-var-flags',
          name: 'statusFlags',
          kind: 'variable',
          dataType: 'byte',
          elementSize: 1,
          totalSizeBytes: 1,
          baseAddress: 0x0100,
          scope: 'global',
          location: 'SRAM',
          currentValues: [0b00000001],
          rawBytes: [0x01],
          comment: '1-byte bitmask flags (0..255)',
          commentHu: '1-bájtos állapotjelző maszk (0..255)',
        },
        {
          id: 'demo-var-sensor',
          name: 'rawSensor',
          kind: 'variable',
          dataType: 'int',
          elementSize: 2,
          totalSizeBytes: 2,
          baseAddress: 0x0101,
          scope: 'global',
          location: 'SRAM',
          currentValues: [512],
          rawBytes: [0x00, 0x02], // 512 in Little-Endian: 0x0200 -> [0x00, 0x02]
          comment: '2-byte integer (16-bit ADC reading: 0x0200)',
          commentHu: '2-bájtos 16-bites előjeles egész (ADC minta)',
        },
        {
          id: 'demo-var-volt',
          name: 'voltage',
          kind: 'variable',
          dataType: 'float',
          elementSize: 4,
          totalSizeBytes: 4,
          baseAddress: 0x0103,
          scope: 'global',
          location: 'SRAM',
          currentValues: [3.3],
          rawBytes: valueToLittleEndianBytes(3.3, 'float'),
          comment: '4-byte IEEE-754 single precision float',
          commentHu: '4-bájtos IEEE-754 lebegőpontos feszültségérték',
        },
        {
          id: 'demo-arr-buf',
          name: 'readings',
          kind: 'array',
          dataType: 'int',
          elementSize: 2,
          arrayLength: 4,
          totalSizeBytes: 8,
          baseAddress: 0x0107,
          scope: 'global',
          location: 'SRAM',
          currentValues: [100, 250, 480, 890],
          rawBytes: [100, 0, 250, 0, 224, 1, 122, 3],
          comment: 'Contiguous 4-element int array buffer (8 Bytes total)',
          commentHu: 'Folytonos 4 elemű int tömb memória puffer (összesen 8 Bájt)',
        }
      );
    }

    return items;
  }, [blocks, simOverrides]);

  // Total allocated SRAM bytes for program variables
  const totalAllocatedBytes = useMemo(() => {
    return memoryItems.reduce((acc, item) => acc + item.totalSizeBytes, 0);
  }, [memoryItems]);

  // Selected item object
  const selectedItem = useMemo(() => {
    if (!selectedItemId && memoryItems.length > 0) return memoryItems[0];
    return memoryItems.find((i) => i.id === selectedItemId) || memoryItems[0];
  }, [selectedItemId, memoryItems]);

  // First array in program for interactive pointer explorer
  const activeArray = useMemo(() => {
    return memoryItems.find((i) => i.kind === 'array') || null;
  }, [memoryItems]);

  // Step simulation tick
  const handleStepSimulation = () => {
    setSimStep((prev) => prev + 1);
    const newOverrides: Record<string, any> = { ...simOverrides };

    memoryItems.forEach((item) => {
      if (item.kind === 'variable') {
        if (item.dataType === 'int' || item.dataType === 'byte') {
          const current = Number(item.currentValues[0]) || 0;
          newOverrides[item.name] = (current + 5) % (item.dataType === 'byte' ? 256 : 1024);
        } else if (item.dataType === 'float') {
          const current = Number(item.currentValues[0]) || 3.3;
          newOverrides[item.name] = Number((current + 0.15 > 5.0 ? 1.0 : current + 0.15).toFixed(2));
        }
      } else if (item.kind === 'array') {
        const arrLen = item.arrayLength || 4;
        for (let i = 0; i < arrLen; i++) {
          const prevVal = Number(item.currentValues[i]) || 0;
          newOverrides[`${item.name}[${i}]`] = (prevVal + (i + 1) * 7) % 1000;
        }
      }
    });

    setSimOverrides(newOverrides);
  };

  const handleResetSimulation = () => {
    setSimStep(0);
    setSimOverrides({});
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                {language === 'hu'
                  ? 'MCU Memória & Változók/Tömbök Szemléltető'
                  : 'MCU Memory & Variable/Array Visualizer'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {language === 'hu' ? 'Oktató Mód' : 'Educational'}
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'hu'
                ? 'Ismerd meg a mikrokontrollerek SRAM memóriatérképét, az adattípusok bájt-méretét, a Little-Endian elrendezést és a tömbök mutató-aritmetikáját.'
                : 'Explore MCU SRAM memory architecture, data type byte sizes, Little-Endian layout, contiguous array buffers, and pointer offset indexing.'}
            </p>
          </div>

          {/* Quick Stats & Interactive Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepSimulation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold transition-all shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? 'Lépés / Frissítés (Sim)' : 'Step Next (Sim)'}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-[10px]">#{simStep}</span>
            </button>

            {simStep > 0 && (
              <button
                onClick={handleResetSimulation}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title={language === 'hu' ? 'Alaphelyzet' : 'Reset'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Memory Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase">
              {language === 'hu' ? 'Lefoglalt Változók' : 'Allocated Variables'}
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <span>{memoryItems.filter((i) => i.kind === 'variable').length} db</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({memoryItems.filter((i) => i.kind === 'variable').reduce((a, b) => a + b.totalSizeBytes, 0)} Bytes)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase">
              {language === 'hu' ? 'Tömb Pufferek' : 'Array Buffers'}
            </div>
            <div className="text-sm font-bold text-teal-400 mt-0.5 flex items-center gap-1">
              <span>{memoryItems.filter((i) => i.kind === 'array').length} db</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({memoryItems.filter((i) => i.kind === 'array').reduce((a, b) => a + b.totalSizeBytes, 0)} Bytes)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase">
              {language === 'hu' ? 'Összes SRAM Terhelés' : 'Total SRAM Usage'}
            </div>
            <div className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
              <span>{totalAllocatedBytes} / 2048 Bytes</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({((totalAllocatedBytes / 2048) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase">
              {language === 'hu' ? 'Bájt Sorrend (Endianness)' : 'Byte Endianness'}
            </div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">
              Little-Endian (AVR/ARM)
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: (1) Architecture Memory Map & Variable List | (2) Byte Grid & Pointer Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= COLUMN 1: HARDWARE MEMORY MAP & DECLARED ITEMS (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hardware Memory Architecture Diagram */}
          <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'hu' ? 'ATmega / AVR SRAM Memóriatérkép' : 'AVR SRAM Hardware Memory Map'}</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">2 KB (0x0100 - 0x08FF)</span>
            </div>

            {/* Visual Vertical Memory Segments Stack */}
            <div className="space-y-1.5 font-mono text-[11px]">
              {/* Flash / PROGMEM (Constants & Code) */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <div>
                    <span className="font-bold">Flash ROM (.text / PROGMEM)</span>
                    <span className="text-[10px] text-purple-400/80 block">
                      {language === 'hu' ? 'Programkód & Konstans Táblák' : 'Program Code & Constant Lookup Tables'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-200">
                  0x0000 - 0x7FFF (32KB)
                </span>
              </div>

              {/* R0-R31 & I/O SFRs */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <div>
                    <span className="font-semibold text-slate-300">Registers & I/O SFRs</span>
                    <span className="text-[10px] text-slate-500 block">32x Regs (R0..R31) + 64 SFR Ports (DDR, PIN, PORT)</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                  0x0000 - 0x00FF
                </span>
              </div>

              {/* Active SRAM Static Data (.data & .bss) - Highlighted */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-xs">
                      {language === 'hu' ? 'SRAM Statikus Adatterület (.data & .bss)' : 'SRAM Static Data (.data / .bss)'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-bold">
                    0x0100 &rarr; +{totalAllocatedBytes} B
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 mt-1 pl-4.5">
                  {language === 'hu'
                    ? 'Itt foglal helyet az összes blokkban létrehozott változó és tömb!'
                    : 'This is where all variables and array buffers created in your blocks reside!'}
                </p>
              </div>

              {/* Free SRAM Margin */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-dashed border-slate-700/60 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <div>
                    <span className="font-medium text-slate-300">Free Heap / Stack Safety Margin</span>
                    <span className="text-[10px] text-slate-500 block">
                      {language === 'hu' ? 'Szabad memóriasáv (ütközésvédelem)' : 'Collision safety buffer'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{2048 - totalAllocatedBytes} B Free</span>
              </div>

              {/* Call Stack (Downwards from RAMEND) */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <div>
                    <span className="font-bold">Call Stack (Veremtár)</span>
                    <span className="text-[10px] text-amber-400/80 block">
                      {language === 'hu' ? 'Függvény visszatérési címek & lokális változók (lefelé nő)' : 'Return addresses & local vars (grows downwards)'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-900/50 px-1.5 py-0.5 rounded text-amber-200">
                  SP: RAMEND (0x08FF)
                </span>
              </div>
            </div>
          </div>

          {/* List of Declared Variables & Arrays in this Program */}
          <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hu' ? 'Program Változók & Tömbök Listája' : 'Active Variables & Arrays'}</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">{memoryItems.length} elements</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {memoryItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isArray = item.kind === 'array';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? isArray
                          ? 'bg-teal-950/40 border-teal-400/80 ring-1 ring-teal-400/30 text-white shadow-md'
                          : 'bg-emerald-950/40 border-emerald-400/80 ring-1 ring-emerald-400/30 text-white shadow-md'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg text-xs font-bold ${
                            isArray
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isArray ? 'TÖMB[]' : 'VAR'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isArray && (
                              <span className="text-teal-300 text-xs">[{item.arrayLength}]</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-amber-400 font-semibold">{item.dataType}</span>
                            <span>•</span>
                            <span>{item.totalSizeBytes} Byte{item.totalSizeBytes > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span className="text-emerald-400">0x{item.baseAddress.toString(16).toUpperCase().padStart(4, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Current Value Pill */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {language === 'hu' ? 'Érték' : 'Value'}
                        </span>
                        <span className="text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {isArray
                            ? `[${item.currentValues.slice(0, 3).join(', ')}${item.currentValues.length > 3 ? '...' : ''}]`
                            : String(item.currentValues[0])}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span>{language === 'hu' ? item.commentHu : item.comment}</span>
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {item.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: LIVE MEMORY CELL GRID & POINTER ARITHMETIC (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selected Item Detailed Inspector & Byte Representation */}
          {selectedItem && (
            <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <MemoryStick className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>{selectedItem.name}</span>
                      {selectedItem.kind === 'array' && (
                        <span className="text-xs text-teal-300">[{selectedItem.arrayLength}]</span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-sans">
                        {selectedItem.dataType} • {selectedItem.totalSizeBytes} Bytes
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="font-mono text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span>{language === 'hu' ? 'Kezdő Memóriacím:' : 'Base Address:'} </span>
                  <span className="text-emerald-400 font-bold">
                    0x{selectedItem.baseAddress.toString(16).toUpperCase().padStart(4, '0')}
                  </span>
                </div>
              </div>

              {/* Detailed Byte Layout Table (Little-Endian Demonstration) */}
              <div>
                <div className="text-[11px] font-mono font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>
                    {language === 'hu'
                      ? 'Bitenkénti / Bájtonkénti Memóriacellák (Little-Endian):'
                      : 'Byte-by-Byte Memory Layout (Little-Endian):'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {language === 'hu' ? 'Alacsony helyiértékű bájt van elöl (LSB)' : 'Least Significant Byte First (LSB)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  {selectedItem.rawBytes.map((byteVal, byteIdx) => {
                    const cellAddress = selectedItem.baseAddress + byteIdx;
                    const hexStr = '0x' + byteVal.toString(16).toUpperCase().padStart(2, '0');
                    const binStr = byteVal.toString(2).padStart(8, '0');
                    const elemIdx = Math.floor(byteIdx / selectedItem.elementSize);
                    const byteInElem = byteIdx % selectedItem.elementSize;

                    return (
                      <div
                        key={byteIdx}
                        onMouseEnter={() => setHoveredAddress(cellAddress)}
                        onMouseLeave={() => setHoveredAddress(null)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          hoveredAddress === cellAddress
                            ? 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400/40 scale-[1.02]'
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-emerald-400">
                            0x{cellAddress.toString(16).toUpperCase().padStart(4, '0')}
                          </span>
                          <span className="text-[9px] text-slate-500">+{byteIdx} B</span>
                        </div>

                        <div className="text-lg font-bold text-white text-center py-1 bg-slate-950 rounded-lg border border-slate-800/80 my-1">
                          {hexStr}
                        </div>

                        <div className="text-[10px] text-center text-cyan-300 font-mono">
                          {binStr.slice(0, 4)} {binStr.slice(4)}
                        </div>

                        <div className="text-[9px] text-center text-slate-400 mt-1 pt-1 border-t border-slate-800/60">
                          {selectedItem.kind === 'array' ? (
                            <span>
                              {selectedItem.name}[{elemIdx}] {selectedItem.elementSize > 1 ? `(Bájt ${byteInElem})` : ''}
                            </span>
                          ) : (
                            <span>
                              {byteInElem === 0 ? 'Low Byte (LSB)' : byteInElem === 1 ? 'High Byte (MSB)' : `Byte ${byteInElem}`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Pointer & Array Indexing Math Explorer */}
          {activeArray && (
            <div className="bg-[#0B0F17] border border-teal-900/50 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>{language === 'hu' ? 'Tömb Mutató-Aritmetika & Index Kiszámítás' : 'Array Pointer Arithmetic & Index Math'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      C / C++ Pointer Formula
                    </span>
                  </h3>
                </div>
              </div>

              {/* Formula Display Box */}
              <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl p-3 font-mono text-xs text-teal-200 mb-4">
                <div className="text-[11px] text-slate-400 mb-1">
                  {language === 'hu' ? 'A mikrokontroller így számítja ki az elem memóriacímét a háttérben:' : 'The MCU hardware computes memory address using this formula:'}
                </div>
                <div className="text-sm sm:text-base font-bold text-white bg-slate-950 p-2 rounded-lg border border-slate-800 text-center tracking-wide">
                  <span className="text-emerald-400">Address(&{activeArray.name}[i])</span> ={' '}
                  <span className="text-blue-400">BaseAddress</span> + (
                  <span className="text-amber-400">i</span> ×{' '}
                  <span className="text-purple-400">sizeof({activeArray.dataType})</span>)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400">BaseAddress: </span>
                    <span className="text-blue-400 font-bold">
                      0x{activeArray.baseAddress.toString(16).toUpperCase().padStart(4, '0')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Index (i): </span>
                    <span className="text-amber-400 font-bold">{selectedArrayIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Elemméret: </span>
                    <span className="text-purple-400 font-bold">{activeArray.elementSize} Bájt</span>
                  </div>
                </div>

                {/* Computed Address Output */}
                <div className="mt-3 p-2 rounded-lg bg-teal-950/50 border border-teal-500/40 text-center text-xs">
                  <span className="text-slate-300">
                    &{activeArray.name}[{selectedArrayIndex}] = 0x{activeArray.baseAddress.toString(16).toUpperCase()} + ({selectedArrayIndex} × {activeArray.elementSize}) ={' '}
                  </span>
                  <span className="text-emerald-300 font-bold text-sm">
                    0x{(activeArray.baseAddress + selectedArrayIndex * activeArray.elementSize).toString(16).toUpperCase().padStart(4, '0')}
                  </span>{' '}
                  <span className="text-amber-300 font-bold">
                    (Érték: {activeArray.currentValues[selectedArrayIndex] !== undefined ? activeArray.currentValues[selectedArrayIndex] : '0'})
                  </span>
                </div>
              </div>

              {/* Interactive Array Elements Slider / Picker */}
              <div>
                <div className="text-xs font-mono font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>{language === 'hu' ? 'Kattints vagy válassz tömbelemet a cím megtekintéséhez:' : 'Select array element to inspect address:'}</span>
                  <span className="text-teal-400 font-normal text-[11px]">
                    Index: {selectedArrayIndex} / {(activeArray.arrayLength || 8) - 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {Array.from({ length: activeArray.arrayLength || 8 }).map((_, idx) => {
                    const isSelected = selectedArrayIndex === idx;
                    const elemAddress = activeArray.baseAddress + idx * activeArray.elementSize;
                    const val = activeArray.currentValues[idx] !== undefined ? activeArray.currentValues[idx] : 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedArrayIndex(idx)}
                        className={`px-3 py-2 rounded-xl border font-mono transition-all cursor-pointer text-left flex-1 min-w-[70px] ${
                          isSelected
                            ? 'bg-teal-500/25 border-teal-400 text-white ring-2 ring-teal-400/40 shadow-lg scale-105'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 font-bold">[{idx}]</div>
                        <div className="text-sm font-bold text-white mt-0.5">{val}</div>
                        <div className="text-[9px] text-emerald-400 mt-1">
                          0x{elemAddress.toString(16).toUpperCase().padStart(4, '0')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buffer Overflow Vulnerability Educational Demo */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {language === 'hu'
                      ? 'Oktató Kísérlet: Mi történik Túlindexeléskor? (Buffer Overflow)'
                      : 'Educational Demonstration: Array Buffer Overflow'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {language === 'hu'
                    ? `A C/C++ és a mikrokontrollerek nem ellenőrzik automatikusan a tömbhatárokat sebesség okokból. Ha például a(z) ${activeArray.name}[${activeArray.arrayLength || 8}] elemre hivatkozol, az túlnyúlik a tömbön és felülírja a szomszédos változókat vagy a veremtárat!`
                    : `C/C++ does not perform boundary checks on MCUs. Accessing an index outside the array range will overwrite neighboring SRAM variables or the call stack, causing processor crashes.`}
                </p>

                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold">Próba Index: </span>
                    <input
                      type="number"
                      min="0"
                      max="32"
                      value={testOverflowIndex}
                      onChange={(e) => setTestOverflowIndex(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-rose-700/60 rounded px-2 py-0.5 text-white font-bold ml-2 text-center"
                    />
                    <span className="text-[10px] text-rose-400 ml-2">
                      (Tömb kapacitása: {activeArray.arrayLength || 8})
                    </span>
                  </div>

                  <div className="text-right">
                    {testOverflowIndex >= (activeArray.arrayLength || 8) ? (
                      <span className="px-2.5 py-1 rounded bg-rose-900/80 text-rose-100 font-bold border border-rose-500 text-[11px] animate-pulse">
                        ⚠️ BUFFER OVERFLOW! Memória Korrupció!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-emerald-900/80 text-emerald-100 font-bold border border-emerald-500 text-[11px]">
                        ✓ Biztonságos Index a tömbhatáron belül
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
