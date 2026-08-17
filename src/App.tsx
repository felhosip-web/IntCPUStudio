import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AluOperation,
  AssembledProgram,
  BoardModule,
  CpuFlags,
  CpuState,
  ModuleType,
  RegisterName,
  SampleProgram,
} from './types/cpu';
import {
  AudioPsgState,
  CpuCoreConfig,
  CpuCoreType,
  DmaState,
  HardwareConflict,
  HardwareSetupConfig,
  MathCoprocessorState,
  PicState,
  TimerRtcState,
  UartState,
} from './types/hardware';
import {
  cloneCpuState,
  createInitialCpuState,
  stepMicroCycle,
  stepSingleInstruction,
} from './core/cpuEngine';
import { CPU_CORES } from './core/cpuCores';
import { checkHardwareCompatibility } from './core/hardwareCompatibility';
import { assemble } from './core/assembler';
import { SAMPLE_PROGRAMS } from './core/samplePrograms';
import { getAudioMuted, setAudioMuted } from './core/audio';
import { Navbar } from './components/Navbar';
import { CircuitBoard } from './components/CircuitBoard';
import { LessonsModal } from './components/LessonsModal';
import { AddModuleModal } from './components/AddModuleModal';
import { SettingsModal } from './components/SettingsModal';
import { HardwareConflictModal } from './components/HardwareConflictModal';
import { HelpAndChangelogModal } from './components/HelpAndChangelogModal';
import { C64StudioView } from './components/c64/C64StudioView';
import { McuStudioView } from './components/mcu/McuStudioView';
import { CpuStudioSubTab, CpuStudioTabs } from './components/cpu/CpuStudioTabs';
import { CpuBlockStudio } from './components/cpu/CpuBlockStudio';
import { RiscvPipelineStudio } from './components/cpu/RiscvPipelineStudio';
import { CacheSimulatorStudio } from './components/cpu/CacheSimulatorStudio';
import { MicrocodeStudio } from './components/cpu/MicrocodeStudio';
import { IoEmulatorStudio } from './components/cpu/io/IoEmulatorStudio';
import { HexEditorStudio } from './components/cpu/HexEditorStudio';
import { TimingDiagramModule } from './components/modules/TimingDiagramModule';
import { TimingSample } from './types/timing';
import { extractTimingSample, MAX_TIMING_SAMPLES } from './core/timingDiagramEngine';
import { useI18n } from './i18n/I18nContext';

const DEFAULT_MODULES: BoardModule[] = [
  {
    id: 'mod-hw-config',
    type: 'HARDWARE_CONFIG',
    title: 'Hardware & CPU Core',
    titleHu: 'Hardver & CPU Mag Konfigurátor',
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 1,
  },
  {
    id: 'mod-registers',
    type: 'REGISTERS',
    title: 'Register File',
    titleHu: 'Regisztertár (Registers & Flags)',
    x: 0,
    y: 1,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 2,
  },
  {
    id: 'mod-alu',
    type: 'ALU',
    title: 'ALU Unit',
    titleHu: 'ALU (Aritmetikai és Logikai Egység)',
    x: 1,
    y: 1,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 3,
  },
  {
    id: 'mod-control',
    type: 'CONTROL_UNIT',
    title: 'Control Unit & Sequencer',
    titleHu: 'Vezérlőegység & Órajel Szekvenszer',
    x: 2,
    y: 1,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 4,
  },
  {
    id: 'mod-editor',
    type: 'CODE_EDITOR',
    title: 'Assembly Editor & Debugger',
    titleHu: 'Assembly Kódszerkesztő & Hibakereső',
    x: 0,
    y: 2,
    width: 2,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 5,
  },
  {
    id: 'mod-io',
    type: 'IO_PERIPHERALS',
    title: 'I/O Peripherals',
    titleHu: 'I/O Alap-Perifériák (LED, 7-Seg, DIP)',
    x: 2,
    y: 2,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 6,
  },
  {
    id: 'mod-bus',
    type: 'BUS_MONITOR',
    title: 'Bus Interconnect',
    titleHu: 'Adat- és Címbusz Monitor',
    x: 0,
    y: 3,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 7,
  },
  {
    id: 'mod-timing',
    type: 'TIMING_DIAGRAM',
    title: 'Timing Diagram & Logic Analyzer',
    titleHu: 'Valós Idejű Időzítési Diagram & Logikai Analizátor',
    x: 0,
    y: 4,
    width: 3,
    height: 2,
    isMinimized: false,
    isVisible: true,
    zIndex: 8,
  },
  {
    id: 'mod-memory',
    type: 'MEMORY',
    title: 'RAM Memory Map',
    titleHu: 'RAM Memória Térkép (256 Bájt)',
    x: 1,
    y: 3,
    width: 2,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 8,
  },
  {
    id: 'mod-pipeline',
    type: 'PIPELINE_FLOW',
    title: 'Datapath Flow',
    titleHu: 'Adatút Vonalak és Von Neumann Folyamat',
    x: 0,
    y: 4,
    width: 2,
    height: 1,
    isMinimized: false,
    isVisible: true,
    zIndex: 9,
  },
  {
    id: 'mod-matrix',
    type: 'MATRIX_DISPLAY',
    title: '8x8 LED Matrix',
    titleHu: '8x8 Grafikus LED Mátrix Kijelző',
    x: 2,
    y: 4,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 10,
  },
  {
    id: 'mod-stack',
    type: 'STACK_VIEW',
    title: 'Call Stack',
    titleHu: 'Verem Memória (Call Stack)',
    x: 2,
    y: 5,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 11,
  },
  {
    id: 'mod-timer',
    type: 'TIMER_RTC',
    title: 'Hardware Timer & RTC',
    titleHu: 'Hardver Időzítő & RTC Óra (Port 6)',
    x: 0,
    y: 6,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 12,
  },
  {
    id: 'mod-audio',
    type: 'AUDIO_DAC_PSG',
    title: 'PSG Chiptune Audio',
    titleHu: 'PSG Chiptune Hanggenerátor (Port 7)',
    x: 1,
    y: 6,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 13,
  },
  {
    id: 'mod-uart',
    type: 'UART_SERIAL',
    title: 'Hardware UART Serial',
    titleHu: 'Hardver Soros Port UART (Port 8)',
    x: 2,
    y: 6,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 14,
  },
  {
    id: 'mod-pic',
    type: 'INTERRUPT_CONTROLLER',
    title: 'PIC Interrupt Controller',
    titleHu: 'PIC Megszakításvezérlő (8259)',
    x: 0,
    y: 7,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 15,
  },
  {
    id: 'mod-math',
    type: 'MATH_COPROCESSOR',
    title: 'Math Co-Processor & MAC',
    titleHu: 'Matematikai Koprocesszor MAC (Port 9)',
    x: 1,
    y: 7,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 16,
  },
  {
    id: 'mod-dma',
    type: 'DMA_CONTROLLER',
    title: 'DMA Controller',
    titleHu: 'DMA Közvetlen Memóriahozzáférés',
    x: 2,
    y: 7,
    width: 1,
    height: 1,
    isMinimized: false,
    isVisible: false,
    zIndex: 17,
  },
];

export default function App() {
  const { language, t, settings } = useI18n();
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_PROGRAMS[0].code);
  const [assembledProgram, setAssembledProgram] = useState<AssembledProgram | null>(null);
  const [cpu, setCpu] = useState<CpuState>(() => createInitialCpuState('EDU8'));
  const [history, setHistory] = useState<CpuState[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [clockSpeedHz, setClockSpeedHz] = useState<number>(() => settings.clockSpeedHz || 2);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [modules, setModules] = useState<BoardModule[]>(DEFAULT_MODULES);
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [isLessonsOpen, setIsLessonsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isHelpAndChangelogOpen, setIsHelpAndChangelogOpen] = useState(false);
  const [helpModalInitialTab, setHelpModalInitialTab] = useState<'help' | 'changelog' | 'pinouts'>('help');
  const [viewMode, setViewMode] = useState<'cpu-board' | 'c64-studio' | 'mcu-studio'>('cpu-board');
  const [cpuStudioSubTab, setCpuStudioSubTab] = useState<CpuStudioSubTab>('MODULAR_BOARD');
  const [timingHistory, setTimingHistory] = useState<TimingSample[]>(() => [extractTimingSample(cpu, 1)]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timing diagram history with CPU execution (last 100 clock cycles)
  useEffect(() => {
    setTimingHistory((prev) => {
      const lastCycle = prev.length > 0 ? prev[prev.length - 1].cycle : -1;
      if (cpu.cycleCount !== lastCycle) {
        const sample = extractTimingSample(cpu);
        const updated = [...prev, sample];
        if (updated.length > MAX_TIMING_SAMPLES) {
          return updated.slice(updated.length - MAX_TIMING_SAMPLES);
        }
        return updated;
      }
      return prev;
    });
  }, [cpu.cycleCount, cpu.microStep, cpu.bus, cpu.registers]);

  const handleClearTimingHistory = useCallback(() => {
    setTimingHistory([extractTimingSample(cpu, 1)]);
  }, [cpu]);

  // Switch CPU Core
  const handleSwitchCore = useCallback((coreType: CpuCoreType) => {
    setCpu((prev) => {
      const next = createInitialCpuState(coreType);
      next.memory.set(prev.memory);
      next.peripherals = { ...prev.peripherals };
      next.timerState = { ...prev.timerState };
      next.audioPsgState = { ...prev.audioPsgState };
      next.uartState = { ...prev.uartState };
      next.picState = { ...prev.picState };
      next.mathState = { ...prev.mathState };
      next.dmaState = { ...prev.dmaState };
      next.hardwareConfig = { ...prev.hardwareConfig, coreType };
      return next;
    });
    setHistory([]);
    setIsRunning(false);
  }, []);

  // Update Core Config
  const handleUpdateCoreConfig = useCallback((config: Partial<CpuCoreConfig>) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.coreConfig = { ...next.coreConfig, ...config };
      return next;
    });
  }, []);

  // Update Hardware Config
  const handleUpdateHardwareConfig = useCallback((config: Partial<HardwareSetupConfig>) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.hardwareConfig = { ...next.hardwareConfig, ...config };
      return next;
    });
  }, []);

  // Update Timer State
  const handleUpdateTimer = useCallback((updater: (prev: TimerRtcState) => TimerRtcState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.timerState = updater(prev.timerState);
      return next;
    });
  }, []);

  // Update Audio State
  const handleUpdateAudio = useCallback((updater: (prev: AudioPsgState) => AudioPsgState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.audioPsgState = updater(prev.audioPsgState);
      return next;
    });
  }, []);

  // Update UART State
  const handleUpdateUart = useCallback((updater: (prev: UartState) => UartState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.uartState = updater(prev.uartState);
      return next;
    });
  }, []);

  // Update PIC State
  const handleUpdatePic = useCallback((updater: (prev: PicState) => PicState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.picState = updater(prev.picState);
      return next;
    });
  }, []);

  // Update Math State
  const handleUpdateMath = useCallback((updater: (prev: MathCoprocessorState) => MathCoprocessorState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.mathState = updater(prev.mathState);
      return next;
    });
  }, []);

  // Update DMA State
  const handleUpdateDma = useCallback((updater: (prev: DmaState) => DmaState) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.dmaState = updater(prev.dmaState);
      return next;
    });
  }, []);

  // Update Full CPU State directly
  const handleUpdateCpuState = useCallback((updater: (prev: CpuState) => CpuState) => {
    setCpu((prev) => updater(prev));
  }, []);

  // Calculate Hardware Conflicts
  const conflicts: HardwareConflict[] = useMemo(() => {
    return checkHardwareCompatibility({
      cpu,
      modules,
      sourceCode,
      onSwitchCore: handleSwitchCore,
      onUpdateCpuState: handleUpdateCpuState,
    });
  }, [cpu, modules, sourceCode, handleSwitchCore, handleUpdateCpuState]);

  // Compile and load program into RAM
  const handleAssembleAndLoad = useCallback(() => {
    const assembled = assemble(sourceCode);
    setAssembledProgram(assembled);

    if (assembled.errors.length === 0) {
      setCpu((prev) => {
        const next = createInitialCpuState(prev.coreConfig.coreType);
        for (let i = 0; i < assembled.machineCode.length; i++) {
          next.memory[i] = assembled.machineCode[i];
        }
        next.peripherals = { ...prev.peripherals };
        next.timerState = { ...prev.timerState };
        next.audioPsgState = { ...prev.audioPsgState };
        next.uartState = { ...prev.uartState };
        next.picState = { ...prev.picState };
        next.mathState = { ...prev.mathState };
        next.dmaState = { ...prev.dmaState };
        next.hardwareConfig = { ...prev.hardwareConfig };
        next.coreConfig = { ...prev.coreConfig };
        return next;
      });
      setHistory([]);
      setIsRunning(false);
    }
  }, [sourceCode]);

  // Initial compile on mount
  useEffect(() => {
    handleAssembleAndLoad();
  }, []);

  // Single micro-step action
  const handleStepMicro = useCallback(() => {
    setCpu((prev) => {
      if (prev.isHalted) return prev;
      setHistory((h) => [...h.slice(-50), cloneCpuState(prev)]);
      return stepMicroCycle(prev);
    });
  }, []);

  // Single full instruction step action
  const handleStepInstruction = useCallback(() => {
    setCpu((prev) => {
      if (prev.isHalted) return prev;
      setHistory((h) => [...h.slice(-50), cloneCpuState(prev)]);
      return stepSingleInstruction(prev);
    });
  }, []);

  // Step back (time-travel debugging)
  const handleStepBack = useCallback(() => {
    if (history.length === 0) return;
    setIsRunning(false);
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCpu(last);
  }, [history]);

  // Reset CPU
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setHistory([]);
    setCpu((prev) => {
      const next = createInitialCpuState(prev.coreConfig.coreType);
      if (assembledProgram && assembledProgram.machineCode.length > 0) {
        for (let i = 0; i < assembledProgram.machineCode.length; i++) {
          next.memory[i] = assembledProgram.machineCode[i];
        }
      }
      next.peripherals = { ...prev.peripherals };
      next.hardwareConfig = { ...prev.hardwareConfig };
      next.coreConfig = { ...prev.coreConfig };
      return next;
    });
  }, [assembledProgram]);

  // Play / Pause toggle
  const handleToggleRun = useCallback(() => {
    if (cpu.isHalted) {
      handleReset();
      setIsRunning(true);
      return;
    }
    setIsRunning((r) => !r);
  }, [cpu.isHalted, handleReset]);

  // Clock loop execution
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(10, Math.floor(1000 / clockSpeedHz));

    timerRef.current = setInterval(() => {
      setCpu((prev) => {
        if (prev.isHalted) {
          setIsRunning(false);
          return prev;
        }

        // Check breakpoints on instruction fetch boundaries
        if (prev.microStepIndex === 0 && assembledProgram) {
          const currentLine = assembledProgram.debugMap[prev.registers.PC];
          if (currentLine !== undefined && breakpoints.has(currentLine)) {
            setIsRunning(false);
            return prev;
          }
        }

        return stepSingleInstruction(prev);
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, clockSpeedHz, breakpoints, assembledProgram]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleRun();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleStepInstruction();
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleStepMicro();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleStepBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleRun, handleStepInstruction, handleStepMicro, handleStepBack]);

  // Load sample program
  const handleSelectSampleProgram = (prog: SampleProgram) => {
    setIsRunning(false);
    setSourceCode(prog.code);
    const assembled = assemble(prog.code);
    setAssembledProgram(assembled);

    if (assembled.errors.length === 0) {
      setCpu((prev) => {
        const next = createInitialCpuState(prev.coreConfig.coreType);
        for (let i = 0; i < assembled.machineCode.length; i++) {
          next.memory[i] = assembled.machineCode[i];
        }
        next.peripherals = { ...prev.peripherals };
        next.hardwareConfig = { ...prev.hardwareConfig };
        next.coreConfig = { ...prev.coreConfig };
        return next;
      });
      setHistory([]);
    }
  };

  // Direct manual register edit
  const handleUpdateRegister = (reg: RegisterName, value: number) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.registers[reg] = value & 0xff;
      next.lastChangedRegister = reg;
      return next;
    });
  };

  // Direct manual flag toggle
  const handleUpdateFlag = (key: keyof CpuFlags, value: boolean) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.flags[key] = value;
      return next;
    });
  };

  // Direct memory byte edit
  const handleUpdateMemoryByte = (addr: number, value: number) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.memory[addr] = value & 0xff;
      next.lastChangedMemoryAddress = addr;
      return next;
    });
  };

  // Clear memory
  const handleClearMemory = () => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.memory = new Uint8Array(256);
      return next;
    });
  };

  // Toggle DIP Switch
  const handleToggleDipSwitch = (bitIndex: number) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      const mask = 1 << bitIndex;
      next.peripherals.dipSwitches ^= mask;
      return next;
    });
  };

  // Clear Terminal
  const handleClearTerminal = () => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.peripherals.terminalOutput = '';
      return next;
    });
  };

  // Clear Matrix
  const handleClearMatrix = () => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.peripherals.matrixLeds = [0, 0, 0, 0, 0, 0, 0, 0];
      return next;
    });
  };

  // Manual ALU execution playground
  const handleManualAluExecute = (op: AluOperation, a: number, b: number) => {
    setCpu((prev) => {
      const next = cloneCpuState(prev);
      next.alu.operandA = a & 0xff;
      next.alu.operandB = b & 0xff;
      next.alu.operation = op;
      return next;
    });
  };

  // Breakpoint toggle
  const handleToggleBreakpoint = (lineNum: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(lineNum)) {
        next.delete(lineNum);
      } else {
        next.add(lineNum);
      }
      return next;
    });
  };

  // Module management
  const handleToggleMinimizeModule = (id: string) => {
    setModules((mods) =>
      mods.map((m) => (m.id === id ? { ...m, isMinimized: !m.isMinimized } : m))
    );
  };

  const handleCloseModule = (id: string) => {
    setModules((mods) =>
      mods.map((m) => (m.id === id ? { ...m, isVisible: false } : m))
    );
  };

  const handleToggleModuleVisibility = (type: ModuleType) => {
    setModules((mods) => {
      const existing = mods.find((m) => m.type === type);
      if (existing) {
        return mods.map((m) => (m.type === type ? { ...m, isVisible: !m.isVisible } : m));
      }
      return mods;
    });
  };

  const handleReorderModules = (startIndex: number, endIndex: number) => {
    setModules((prev) => {
      const visible = prev.filter((m) => m.isVisible);
      const hidden = prev.filter((m) => !m.isVisible);
      const [moved] = visible.splice(startIndex, 1);
      visible.splice(endIndex, 0, moved);
      return [...visible, ...hidden];
    });
  };

  const handleApplyLayoutPreset = (
    preset: 'EDUCATIONAL' | 'FULL_CIRCUIT' | 'DEBUGGER' | 'MINIMAL' | 'RETRO_WORKSTATION'
  ) => {
    switch (preset) {
      case 'EDUCATIONAL':
        setModules((mods) =>
          mods.map((m) => ({
            ...m,
            isVisible: [
              'HARDWARE_CONFIG',
              'REGISTERS',
              'ALU',
              'CONTROL_UNIT',
              'CODE_EDITOR',
              'IO_PERIPHERALS',
              'BUS_MONITOR',
              'TIMING_DIAGRAM',
              'MEMORY',
            ].includes(m.type),
          }))
        );
        break;
      case 'FULL_CIRCUIT':
        setModules((mods) => mods.map((m) => ({ ...m, isVisible: true })));
        break;
      case 'DEBUGGER':
        setModules((mods) =>
          mods.map((m) => ({
            ...m,
            isVisible: [
              'CODE_EDITOR',
              'REGISTERS',
              'MEMORY',
              'STACK_VIEW',
              'CONTROL_UNIT',
              'BUS_MONITOR',
              'TIMING_DIAGRAM',
            ].includes(m.type),
          }))
        );
        break;
      case 'MINIMAL':
        setModules((mods) =>
          mods.map((m) => ({
            ...m,
            isVisible: ['REGISTERS', 'ALU', 'CODE_EDITOR'].includes(m.type),
          }))
        );
        break;
      case 'RETRO_WORKSTATION':
        setModules((mods) =>
          mods.map((m) => ({
            ...m,
            isVisible: [
              'HARDWARE_CONFIG',
              'CODE_EDITOR',
              'TIMER_RTC',
              'AUDIO_DAC_PSG',
              'UART_SERIAL',
              'INTERRUPT_CONTROLLER',
              'MATH_COPROCESSOR',
              'DMA_CONTROLLER',
            ].includes(m.type),
          }))
        );
        break;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setAudioMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-200 flex flex-col font-sans select-none antialiased">
      {/* Top Navigation & Stepper Bar */}
      <Navbar
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        activeCoreType={cpu.coreConfig?.coreType || 'EDU8'}
        onSwitchCore={handleSwitchCore}
        conflictCount={conflicts.length}
        onOpenConflictModal={() => setIsConflictModalOpen(true)}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onStepInstruction={handleStepInstruction}
        onStepMicro={handleStepMicro}
        onStepBack={handleStepBack}
        canStepBack={history.length > 0}
        historyLength={history.length}
        onReset={handleReset}
        clockSpeedHz={clockSpeedHz}
        onChangeClockSpeed={setClockSpeedHz}
        onSelectSampleProgram={handleSelectSampleProgram}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLessons={() => setIsLessonsOpen(true)}
        onOpenModulePalette={() => setIsPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelpAndChangelog={(tab) => {
          if (tab) setHelpModalInitialTab(tab);
          setIsHelpAndChangelogOpen(true);
        }}
      />

      {/* Main Workspace: Either 8-bit Modular CPU Board or Commodore 64 Studio */}
      <main className="flex-1 pb-12">
        {viewMode === 'cpu-board' ? (
          <div className="p-2 sm:p-4 max-w-[1920px] mx-auto flex flex-col gap-4">
            <CpuStudioTabs
              activeTab={cpuStudioSubTab}
              onChangeTab={setCpuStudioSubTab}
            />

            {cpuStudioSubTab === 'MODULAR_BOARD' ? (
              <CircuitBoard
                cpu={cpu}
                modules={modules}
                sourceCode={sourceCode}
                onChangeSourceCode={setSourceCode}
                assembledProgram={assembledProgram}
                onAssembleAndLoad={handleAssembleAndLoad}
                breakpoints={breakpoints}
                onToggleBreakpoint={handleToggleBreakpoint}
                onUpdateRegister={handleUpdateRegister}
                onUpdateFlag={handleUpdateFlag}
                onUpdateMemoryByte={handleUpdateMemoryByte}
                onClearMemory={handleClearMemory}
                onToggleDipSwitch={handleToggleDipSwitch}
                onClearTerminal={handleClearTerminal}
                onClearMatrix={handleClearMatrix}
                onManualAluExecute={handleManualAluExecute}
                onToggleMinimizeModule={handleToggleMinimizeModule}
                onCloseModule={handleCloseModule}
                onReorderModules={handleReorderModules}
                onSwitchCore={handleSwitchCore}
                onUpdateCoreConfig={handleUpdateCoreConfig}
                onUpdateHardwareConfig={handleUpdateHardwareConfig}
                onUpdateTimer={handleUpdateTimer}
                onUpdateAudio={handleUpdateAudio}
                onUpdateUart={handleUpdateUart}
                onUpdatePic={handleUpdatePic}
                onUpdateMath={handleUpdateMath}
                onUpdateDma={handleUpdateDma}
                onUpdateCpuState={handleUpdateCpuState}
                timingHistory={timingHistory}
                onClearTimingHistory={handleClearTimingHistory}
              />
            ) : cpuStudioSubTab === 'HEX_STUDIO' ? (
              <HexEditorStudio
                memory={cpu.memory}
                pc={cpu.registers.PC}
                sp={cpu.registers.SP}
                mar={cpu.registers.MAR}
                lastChangedAddress={cpu.lastChangedMemoryAddress}
                onUpdateMemoryByte={handleUpdateMemoryByte}
                onClearMemory={handleClearMemory}
              />
            ) : cpuStudioSubTab === 'IO_PERIPHERAL_STUDIO' ? (
              <IoEmulatorStudio
                onLoadProgramCode={(code) => {
                  setSourceCode(code);
                  setTimeout(() => {
                    handleAssembleAndLoad();
                    setCpuStudioSubTab('MODULAR_BOARD');
                  }, 50);
                }}
              />
            ) : cpuStudioSubTab === 'TIMING_STUDIO' ? (
              <TimingDiagramModule
                cpu={cpu}
                timingHistory={timingHistory}
                onClearHistory={handleClearTimingHistory}
              />
            ) : cpuStudioSubTab === 'BLOCK_STUDIO' ? (
              <CpuBlockStudio
                onAssembleAndLoad={(code) => {
                  setSourceCode(code);
                  setTimeout(() => {
                    handleAssembleAndLoad();
                    setCpuStudioSubTab('MODULAR_BOARD');
                  }, 50);
                }}
              />
            ) : cpuStudioSubTab === 'RISCV_PIPELINE' ? (
              <RiscvPipelineStudio />
            ) : cpuStudioSubTab === 'CACHE_HIERARCHY' ? (
              <CacheSimulatorStudio />
            ) : (
              <MicrocodeStudio />
            )}
          </div>
        ) : viewMode === 'c64-studio' ? (
          <C64StudioView />
        ) : (
          <McuStudioView />
        )}
      </main>

      {/* Bottom Status Bar (Only active in CPU Board view) */}
      {viewMode === 'cpu-board' && (
        <footer className="fixed bottom-0 left-0 right-0 h-8 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] font-mono z-30 shadow-2xl">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  cpu.isHalted
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : isRunning
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="text-slate-300 font-semibold">
                {cpu.isHalted ? 'HALTED' : isRunning ? 'RUNNING' : 'IDLE'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>{language === 'hu' ? 'MAG:' : 'CORE:'}</span>
              <span className="text-cyan-300 font-bold">
                {CPU_CORES[cpu.coreConfig?.coreType || 'EDU8']?.name || 'EDU-8'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>{language === 'hu' ? 'ÁLLAPOT:' : 'STATUS:'}</span>
              <span className="text-purple-300 font-medium">{cpu.microStep}</span>
            </div>

            <div className="flex items-center gap-1">
              <span>PC:</span>
              <span className="text-amber-300 font-bold">
                0x{cpu.registers.PC.toString(16).padStart(2, '0').toUpperCase()}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <span>{language === 'hu' ? 'CIKLUSOK:' : 'CYCLES:'}</span>
              <span className="text-slate-200">{cpu.cycleCount}</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <span>{language === 'hu' ? 'UTASÍTÁSOK:' : 'INSTRUCTIONS:'}</span>
              <span className="text-slate-200">{cpu.instructionCount}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-slate-500 text-[10px]">
            {conflicts.length > 0 && (
              <button
                onClick={() => setIsConflictModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>⚠️ {conflicts.length} {language === 'hu' ? 'ütközés' : 'conflicts'}</span>
              </button>
            )}
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Space</kbd> {language === 'hu' ? 'Start/Stop' : 'Start/Pause'}</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">F8</kbd> {language === 'hu' ? 'Utasítás' : 'Instruction'}</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">F7</kbd> {language === 'hu' ? 'Mikrolépés' : 'Microstep'}</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Ctrl+Z</kbd> {language === 'hu' ? 'Vissza' : 'Step Back'} ({history.length})</span>
          </div>
        </footer>
      )}

      {/* Modals */}
      <LessonsModal
        isOpen={isLessonsOpen}
        onClose={() => setIsLessonsOpen(false)}
        cpu={cpu}
        onLoadLessonCode={(code) => {
          setSourceCode(code);
          handleAssembleAndLoad();
        }}
      />

      <AddModuleModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={modules}
        onToggleModule={handleToggleModuleVisibility}
        onApplyLayoutPreset={handleApplyLayoutPreset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HardwareConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={conflicts}
      />

      <HelpAndChangelogModal
        isOpen={isHelpAndChangelogOpen}
        onClose={() => setIsHelpAndChangelogOpen(false)}
        initialTab={helpModalInitialTab}
      />
    </div>
  );
}
