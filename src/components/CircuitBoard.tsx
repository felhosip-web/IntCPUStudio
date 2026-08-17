import React, { useState } from 'react';
import {
  AluOperation,
  AssembledProgram,
  BoardModule,
  CpuFlags,
  CpuState,
  ModuleType,
  RegisterName,
} from '../types/cpu';
import {
  AudioPsgState,
  CpuCoreConfig,
  CpuCoreType,
  DmaState,
  HardwareSetupConfig,
  MathCoprocessorState,
  PicState,
  TimerRtcState,
  UartState,
} from '../types/hardware';
import { useI18n } from '../i18n/I18nContext';
import { ModuleCard } from './ModuleCard';
import { RegistersModule } from './modules/RegistersModule';
import { ALUModule } from './modules/ALUModule';
import { MemoryModule } from './modules/MemoryModule';
import { ControlUnitModule } from './modules/ControlUnitModule';
import { BusMonitorModule } from './modules/BusMonitorModule';
import { IOPeripheralsModule } from './modules/IOPeripheralsModule';
import { CodeEditorModule } from './modules/CodeEditorModule';
import { PipelineFlowModule } from './modules/PipelineFlowModule';
import { MatrixDisplayModule } from './modules/MatrixDisplayModule';
import { StackViewModule } from './modules/StackViewModule';
import { HardwareConfigModule } from './modules/HardwareConfigModule';
import { TimerRtcModule } from './modules/TimerRtcModule';
import { AudioPsgModule } from './modules/AudioPsgModule';
import { UartSerialModule } from './modules/UartSerialModule';
import { InterruptControllerModule } from './modules/InterruptControllerModule';
import { MathCoprocessorModule } from './modules/MathCoprocessorModule';
import { DmaControllerModule } from './modules/DmaControllerModule';
import { TimingDiagramModule } from './modules/TimingDiagramModule';
import { TimingSample } from '../types/timing';
import {
  Activity,
  Cable,
  Cpu,
  Database,
  Grid,
  HardDrive,
  Layers,
  Sliders,
  Terminal,
  Clock,
  Music,
  Radio,
  Zap,
  Calculator,
  Wrench,
} from 'lucide-react';

interface CircuitBoardProps {
  cpu: CpuState;
  modules: BoardModule[];
  sourceCode: string;
  onChangeSourceCode: (code: string) => void;
  assembledProgram: AssembledProgram | null;
  onAssembleAndLoad: () => void;
  breakpoints: Set<number>;
  onToggleBreakpoint: (line: number) => void;
  onUpdateRegister: (reg: RegisterName, value: number) => void;
  onUpdateFlag: (key: keyof CpuFlags, value: boolean) => void;
  onUpdateMemoryByte: (addr: number, value: number) => void;
  onClearMemory: () => void;
  onToggleDipSwitch: (bit: number) => void;
  onClearTerminal: () => void;
  onClearMatrix: () => void;
  onManualAluExecute: (op: AluOperation, a: number, b: number) => void;
  onToggleMinimizeModule: (id: string) => void;
  onCloseModule: (id: string) => void;
  onReorderModules: (startIndex: number, endIndex: number) => void;
  onSwitchCore?: (core: CpuCoreType) => void;
  onUpdateCoreConfig?: (config: Partial<CpuCoreConfig>) => void;
  onUpdateHardwareConfig?: (config: Partial<HardwareSetupConfig>) => void;
  onUpdateTimer?: (updater: (prev: TimerRtcState) => TimerRtcState) => void;
  onUpdateAudio?: (updater: (prev: AudioPsgState) => AudioPsgState) => void;
  onUpdateUart?: (updater: (prev: UartState) => UartState) => void;
  onUpdatePic?: (updater: (prev: PicState) => PicState) => void;
  onUpdateMath?: (updater: (prev: MathCoprocessorState) => MathCoprocessorState) => void;
  onUpdateDma?: (updater: (prev: DmaState) => DmaState) => void;
  onUpdateCpuState?: (updater: (prev: CpuState) => CpuState) => void;
  timingHistory?: TimingSample[];
  onClearTimingHistory?: () => void;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({
  cpu,
  modules,
  sourceCode,
  onChangeSourceCode,
  assembledProgram,
  onAssembleAndLoad,
  breakpoints,
  onToggleBreakpoint,
  onUpdateRegister,
  onUpdateFlag,
  onUpdateMemoryByte,
  onClearMemory,
  onToggleDipSwitch,
  onClearTerminal,
  onClearMatrix,
  onManualAluExecute,
  onToggleMinimizeModule,
  onCloseModule,
  onReorderModules,
  onSwitchCore,
  onUpdateCoreConfig,
  onUpdateHardwareConfig,
  onUpdateTimer,
  onUpdateAudio,
  onUpdateUart,
  onUpdatePic,
  onUpdateMath,
  onUpdateDma,
  onUpdateCpuState,
  timingHistory,
  onClearTimingHistory,
}) => {
  const { language, settings } = useI18n();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const visibleModules = modules.filter((m) => m.isVisible);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderModules(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderModuleContent = (type: ModuleType) => {
    switch (type) {
      case 'HARDWARE_CONFIG':
        return (
          <HardwareConfigModule
            cpu={cpu}
            onSwitchCore={onSwitchCore || (() => {})}
            onUpdateCoreConfig={onUpdateCoreConfig || (() => {})}
            onUpdateHardwareConfig={onUpdateHardwareConfig || (() => {})}
          />
        );
      case 'REGISTERS':
        return (
          <RegistersModule
            registers={cpu.registers}
            flags={cpu.flags}
            lastChangedRegister={cpu.lastChangedRegister}
            onUpdateRegister={onUpdateRegister}
            onUpdateFlag={onUpdateFlag}
          />
        );
      case 'ALU':
        return (
          <ALUModule
            alu={cpu.alu}
            flags={cpu.flags}
            onManualAluExecute={onManualAluExecute}
          />
        );
      case 'CONTROL_UNIT':
        return (
          <ControlUnitModule
            microStep={cpu.microStep}
            microStepIndex={cpu.microStepIndex}
            cycleCount={cpu.cycleCount}
            instructionCount={cpu.instructionCount}
            currentInstructionName={cpu.currentInstructionName}
            explanationHu={cpu.currentInstructionExplanationHu}
            explanationEn={cpu.currentInstructionExplanation}
            controlLines={cpu.bus.controlLines}
          />
        );
      case 'MEMORY':
        return (
          <MemoryModule
            memory={cpu.memory}
            pc={cpu.registers.PC}
            sp={cpu.registers.SP}
            mar={cpu.registers.MAR}
            lastChangedAddress={cpu.lastChangedMemoryAddress}
            onUpdateMemoryByte={onUpdateMemoryByte}
            onClearMemory={onClearMemory}
          />
        );
      case 'BUS_MONITOR':
        return <BusMonitorModule bus={cpu.bus} />;
      case 'TIMING_DIAGRAM':
        return (
          <TimingDiagramModule
            cpu={cpu}
            timingHistory={timingHistory}
            onClearHistory={onClearTimingHistory}
          />
        );
      case 'IO_PERIPHERALS':
        return (
          <IOPeripheralsModule
            peripherals={cpu.peripherals}
            onToggleDipSwitch={onToggleDipSwitch}
            onClearTerminal={onClearTerminal}
          />
        );
      case 'CODE_EDITOR':
        return (
          <CodeEditorModule
            sourceCode={sourceCode}
            onChangeSourceCode={onChangeSourceCode}
            assembledProgram={assembledProgram}
            currentPc={cpu.registers.PC}
            onAssembleAndLoad={onAssembleAndLoad}
            breakpoints={breakpoints}
            onToggleBreakpoint={onToggleBreakpoint}
          />
        );
      case 'PIPELINE_FLOW':
        return <PipelineFlowModule cpu={cpu} />;
      case 'MATRIX_DISPLAY':
        return (
          <MatrixDisplayModule
            matrixLeds={cpu.peripherals.matrixLeds}
            onClearMatrix={onClearMatrix}
          />
        );
      case 'STACK_VIEW':
        return <StackViewModule memory={cpu.memory} sp={cpu.registers.SP} />;
      case 'TIMER_RTC':
        return (
          <TimerRtcModule
            timerState={cpu.timerState}
            onUpdateTimer={onUpdateTimer || (() => {})}
          />
        );
      case 'AUDIO_DAC_PSG':
        return (
          <AudioPsgModule
            audioState={cpu.audioPsgState}
            onUpdateAudio={onUpdateAudio || (() => {})}
          />
        );
      case 'UART_SERIAL':
        return (
          <UartSerialModule
            uartState={cpu.uartState}
            onUpdateUart={onUpdateUart || (() => {})}
          />
        );
      case 'INTERRUPT_CONTROLLER':
        return (
          <InterruptControllerModule
            picState={cpu.picState}
            onUpdatePic={onUpdatePic || (() => {})}
          />
        );
      case 'MATH_COPROCESSOR':
        return (
          <MathCoprocessorModule
            mathState={cpu.mathState}
            onUpdateMath={onUpdateMath || (() => {})}
          />
        );
      case 'DMA_CONTROLLER':
        return (
          <DmaControllerModule
            dmaState={cpu.dmaState}
            cpu={cpu}
            onUpdateDma={onUpdateDma || (() => {})}
            onUpdateCpuState={onUpdateCpuState || (() => {})}
          />
        );
      default:
        return null;
    }
  };

  const getModuleIcon = (type: ModuleType) => {
    switch (type) {
      case 'HARDWARE_CONFIG':
        return Wrench;
      case 'REGISTERS':
        return Cpu;
      case 'ALU':
        return Activity;
      case 'CONTROL_UNIT':
        return Sliders;
      case 'MEMORY':
        return Database;
      case 'BUS_MONITOR':
        return Cable;
      case 'TIMING_DIAGRAM':
        return Activity;
      case 'IO_PERIPHERALS':
        return HardDrive;
      case 'CODE_EDITOR':
        return Terminal;
      case 'PIPELINE_FLOW':
        return Layers;
      case 'MATRIX_DISPLAY':
        return Grid;
      case 'STACK_VIEW':
        return Layers;
      case 'TIMER_RTC':
        return Clock;
      case 'AUDIO_DAC_PSG':
        return Music;
      case 'UART_SERIAL':
        return Radio;
      case 'INTERRUPT_CONTROLLER':
        return Zap;
      case 'MATH_COPROCESSOR':
        return Calculator;
      case 'DMA_CONTROLLER':
        return Layers;
    }
  };

  const getModuleAccentColor = (type: ModuleType) => {
    switch (type) {
      case 'HARDWARE_CONFIG':
        return 'border-l-2 border-l-cyan-400';
      case 'REGISTERS':
        return 'border-l-2 border-l-purple-500';
      case 'ALU':
        return 'border-l-2 border-l-cyan-500';
      case 'CONTROL_UNIT':
        return 'border-l-2 border-l-rose-500';
      case 'MEMORY':
        return 'border-l-2 border-l-amber-500';
      case 'BUS_MONITOR':
        return 'border-l-2 border-l-blue-500';
      case 'TIMING_DIAGRAM':
        return 'border-l-2 border-l-cyan-400';
      case 'IO_PERIPHERALS':
        return 'border-l-2 border-l-emerald-500';
      case 'CODE_EDITOR':
        return 'border-l-2 border-l-cyan-400';
      case 'PIPELINE_FLOW':
        return 'border-l-2 border-l-indigo-500';
      case 'MATRIX_DISPLAY':
        return 'border-l-2 border-l-rose-400';
      case 'STACK_VIEW':
        return 'border-l-2 border-l-teal-500';
      case 'TIMER_RTC':
        return 'border-l-2 border-l-cyan-500';
      case 'AUDIO_DAC_PSG':
        return 'border-l-2 border-l-pink-500';
      case 'UART_SERIAL':
        return 'border-l-2 border-l-emerald-500';
      case 'INTERRUPT_CONTROLLER':
        return 'border-l-2 border-l-indigo-500';
      case 'MATH_COPROCESSOR':
        return 'border-l-2 border-l-orange-500';
      case 'DMA_CONTROLLER':
        return 'border-l-2 border-l-blue-500';
    }
  };

  const gridClass =
    settings.gridIntensity === 'none'
      ? 'bg-[#0A0B0E]'
      : settings.gridIntensity === 'high'
      ? 'circuit-bg'
      : 'circuit-bg';

  return (
    <div
      id="cpu-circuit-board"
      className={`relative min-h-[calc(100vh-64px)] w-full p-4 lg:p-6 ${gridClass} overflow-x-hidden`}
    >
      {/* Decorative ambient glowing circuit background lines */}
      {settings.gridIntensity !== 'none' && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#0ea5e910_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e910_1px,transparent_1px)] bg-[size:48px_48px]" />
      )}

      {/* Grid container of modules */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {visibleModules.map((mod, index) => {
          const Icon = getModuleIcon(mod.type);
          const accentColor = getModuleAccentColor(mod.type);
          const isEditor = mod.type === 'CODE_EDITOR';
          const isMemory = mod.type === 'MEMORY';
          const isPipeline = mod.type === 'PIPELINE_FLOW';
          const isHwConfig = mod.type === 'HARDWARE_CONFIG';

          // Span larger on desktop for editor, memory, and hardware configurator
          let colSpan = 'col-span-1';
          if (isEditor || isMemory || isPipeline || isHwConfig) {
            colSpan = 'col-span-1 md:col-span-2 xl:col-span-2';
          }

          const isOver = dragOverIndex === index;
          const displayTitle = language === 'hu' ? mod.titleHu : mod.title;

          return (
            <div
              key={mod.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`${colSpan} transition-transform duration-150 ${
                isOver ? 'scale-[1.01] ring-2 ring-cyan-500 rounded-xl' : ''
              }`}
            >
              <ModuleCard
                id={mod.id}
                title={displayTitle}
                icon={Icon}
                accentColor={accentColor}
                isMinimized={mod.isMinimized}
                onToggleMinimize={() => onToggleMinimizeModule(mod.id)}
                onClose={() => onCloseModule(mod.id)}
              >
                {renderModuleContent(mod.type)}
              </ModuleCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
