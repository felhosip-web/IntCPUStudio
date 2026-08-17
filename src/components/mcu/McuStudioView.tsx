import React, { useEffect, useRef, useState } from 'react';
import { BreadboardState, McuRegisters, McuState } from '../../types/mcu';
import {
  cloneMcuState,
  createInitialMcuState,
  stepMcu,
  updatePeripheralsAndPins,
} from '../../core/mcuEngine';
import { MCU_SAMPLE_PROGRAMS } from '../../core/mcuSamplePrograms';
import { McuBreadboardLab } from './McuBreadboardLab';
import { McuChipPinout } from './McuChipPinout';
import { McuRegisterInspector } from './McuRegisterInspector';
import { McuLogicAnalyzer } from './McuLogicAnalyzer';
import { McuSerialConsole } from './McuSerialConsole';
import { McuEditor } from './McuEditor';
import { McuProtocolLab } from './protocols/McuProtocolLab';
import { McuBridgeStudio } from './bridge/McuBridgeStudio';
import { McuBlockStudio } from './blocks/McuBlockStudio';
import { McuAdcStudio } from './adc/McuAdcStudio';
import { McuPwmStudio } from './pwm/McuPwmStudio';
import { McuShiftRegisterStudio } from './shift595/McuShiftRegisterStudio';
import { McuEepromStudio } from './eeprom/McuEepromStudio';
import { McuStackStudio } from './stack/McuStackStudio';
import { McuCodeSyncStudio } from './sync/McuCodeSyncStudio';
import { McuInterruptStudio } from './interrupts/McuInterruptStudio';
import { McuAvr8jsStudio } from './avr8js/McuAvr8jsStudio';
import { useI18n } from '../../i18n/I18nContext';
import {
  Activity,
  ArrowRightLeft,
  Blocks,
  Cpu,
  Database,
  FastForward,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Network,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  Terminal,
  Waves,
  Zap,
} from 'lucide-react';

export const McuStudioView: React.FC = () => {
  const { language } = useI18n();
  const [mcuState, setMcuState] = useState<McuState>(() => createInitialMcuState('ATmega328p'));
  const [sourceCode, setSourceCode] = useState<string>(() => MCU_SAMPLE_PROGRAMS[0].code);
  const [mainStudioTab, setMainStudioTab] = useState<
    | 'AVR8JS_PRO_STUDIO'
    | 'STACK_STUDIO'
    | 'CODE_SYNC_STUDIO'
    | 'INTERRUPT_STUDIO'
    | 'EEPROM_STUDIO'
    | 'SHIFT_REGISTER_595'
    | 'BREADBOARD_STUDIO'
    | 'ADC_STUDIO'
    | 'PWM_STUDIO'
    | 'DUAL_MCU_BRIDGE'
    | 'BLOCK_STUDIO'
    | 'PROTOCOL_LAB'
  >('AVR8JS_PRO_STUDIO');

  // Simulation execution loop ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Single step execution
  const handleStep = () => {
    setMcuState((prev) => stepMcu(prev));
  };

  // Toggle run / pause
  const handleToggleRun = () => {
    setMcuState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  // Hardware Reset
  const handleReset = () => {
    setMcuState((prev) => {
      const fresh = createInitialMcuState(prev.mcuModel);
      fresh.flashMemory = sourceCode.split('\n');
      fresh.isRunning = false;
      return fresh;
    });
  };

  // Flash code to memory
  const handleFlashCode = (code: string) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      next.flashMemory = code.split('\n');
      next.registers.pc = 0;
      next.instructionCount = 0;
      next.serialLogs.push({
        id: 'flash-' + Date.now(),
        type: 'SYS',
        text: `Flashing ${code.split('\n').length} lines to Flash ROM (32KB)... Done. Resetting PC=0x0000.`,
        timestamp: new Date().toLocaleTimeString(),
      });
      return next;
    });
  };

  // Periodic clock loop
  useEffect(() => {
    if (mcuState.isRunning) {
      const intervalMs = Math.max(20, Math.floor(1000 / mcuState.clockHz));
      timerRef.current = setInterval(() => {
        setMcuState((prev) => stepMcu(prev));
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mcuState.isRunning, mcuState.clockHz]);

  // Handle manual register tweak
  const handleUpdateRegister = (name: keyof McuRegisters, value: number) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      (next.registers as any)[name] = value;
      updatePeripheralsAndPins(next);
      return next;
    });
  };

  // Handle EEPROM Updates
  const handleUpdateEepromByte = (address: number, value: number) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      if (address >= 0 && address < 1024) {
        next.eeprom[address] = value & 0xff;
      }
      return next;
    });
  };

  const handleBulkUpdateEeprom = (updates: { address: number; value: number }[]) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      updates.forEach(({ address, value }) => {
        if (address >= 0 && address < 1024) {
          next.eeprom[address] = value & 0xff;
        }
      });
      return next;
    });
  };

  const handleClearEeprom = () => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      next.eeprom.fill(0xff);
      next.serialLogs.push({
        id: 'eeprom-erase-' + Date.now(),
        type: 'SYS',
        text: 'EEPROM Mass Erase: All 1024 bytes reset to default unprogrammed state (0xFF).',
        timestamp: new Date().toLocaleTimeString(),
      });
      return next;
    });
  };

  // Handle Breadboard State Updates
  const handleUpdateBreadboard = (updater: (prev: BreadboardState) => BreadboardState) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      next.breadboard = updater(next.breadboard);
      updatePeripheralsAndPins(next);
      return next;
    });
  };

  // Trigger Hardware Interrupt (INT0 / INT1)
  const handleTriggerInterrupt = (vector: 'INT0' | 'INT1') => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      if (next.registers.sreg.I) {
        // Global interrupt enabled
        next.serialLogs.push({
          id: 'isr-' + Date.now(),
          type: 'SYS',
          text: `[ISR TRIGGERED] Vector: ${vector} -> JMP 0x0002. Saving PC onto SRAM stack.`,
          timestamp: new Date().toLocaleTimeString(),
        });
        next.registers.pc = 0; // Jump to ISR entry or search label
      }
      return next;
    });
  };

  // Send Serial string from console
  const handleSendSerial = (text: string) => {
    setMcuState((prev) => {
      const next = cloneMcuState(prev);
      next.serialLogs.push({
        id: 'rx-' + Date.now(),
        type: 'RX',
        text: text,
        timestamp: new Date().toLocaleTimeString(),
      });
      // Parse commands like LED ON, LED OFF, 255
      const upper = text.toUpperCase().trim();
      if (upper === 'LED ON' || upper === '1') {
        next.registers.PORTB |= 0x20;
      } else if (upper === 'LED OFF' || upper === '0') {
        next.registers.PORTB &= ~0x20;
      }
      updatePeripheralsAndPins(next);
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12">
      {/* Top MCU Studio Toolbar */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* MCU Title & Architecture Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-white tracking-wide">
                AVR & Microcontroller Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-mono font-semibold">
                ATmega328P • 8-Bit RISC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Valós idejű mikrokontroller szimuláció: GPIO, Timerek, PWM, ADC és Breadboard labor'
                : 'Real-time microcontroller simulation: GPIO, Timers, PWM, ADC, and Breadboard lab'}
            </p>
          </div>
        </div>

        {/* Master Run / Step / Clock Controls */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* Frequency Speed Slider */}
          <div className="flex items-center gap-2 bg-[#05070A] px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] font-bold">Speed:</span>
            <input
              type="range"
              min={1}
              max={100}
              value={mcuState.clockHz}
              onChange={(e) =>
                setMcuState((prev) => ({ ...prev, clockHz: Number(e.target.value) }))
              }
              className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-cyan-300 font-bold min-w-[50px]">{mcuState.clockHz} Hz</span>
          </div>

          {/* Step Button */}
          <button
            onClick={handleStep}
            disabled={mcuState.isRunning}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Egyetlen utasítás végrehajtása (Step)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hu' ? 'Lépés' : 'Step'}</span>
          </button>

          {/* Run / Pause Button */}
          <button
            onClick={handleToggleRun}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
              mcuState.isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
            }`}
          >
            {mcuState.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>{language === 'hu' ? 'Szünet' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{language === 'hu' ? 'Futtatás' : 'Run'}</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-colors"
            title="MCU Hardveres Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Master Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-slate-800 rounded-2xl p-2 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab: avr8js Hardware Pro Emulator (PRIMARY HIGHLIGHT) */}
          <button
            onClick={() => setMainStudioTab('AVR8JS_PRO_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'AVR8JS_PRO_STUDIO'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-900/50 ring-2 ring-emerald-400/80 scale-[1.02]'
                : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/40 border border-emerald-800/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-300 animate-spin" />
            <span>
              {language === 'hu'
                ? '⚡ avr8js 16 MHz Ciklus-Pontos Motor'
                : '⚡ avr8js 16 MHz Hardware Emulator'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500 uppercase tracking-wider">
              PRO CORE
            </span>
          </button>

          {/* Tab: Stack Visualizer Studio */}
          <button
            onClick={() => setMainStudioTab('STACK_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'STACK_STUDIO'
                ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl shadow-indigo-900/40 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-300" />
            <span>
              {language === 'hu'
                ? '📚 Verem (Stack) Stúdió'
                : '📚 Stack & Call Frame Studio'}
            </span>
          </button>

          {/* Tab: Assembly <-> C Synchronized Studio (NEW PRIMARY) */}
          <button
            onClick={() => setMainStudioTab('CODE_SYNC_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'CODE_SYNC_STUDIO'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>
              {language === 'hu'
                ? '🔄 C ⟷ ASM Szinkron Kódszerkesztő'
                : '🔄 C ⟷ ASM Code Sync Studio'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700 uppercase">
              NEW
            </span>
          </button>

          {/* Tab: Interrupts Visual Lab (NEW PRIMARY) */}
          <button
            onClick={() => setMainStudioTab('INTERRUPT_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'INTERRUPT_STUDIO'
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-xl shadow-purple-900/40 ring-1 ring-purple-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>
              {language === 'hu'
                ? '⚡ Megszakítások (Interrupts) & Vektortábla'
                : '⚡ Interrupts & Vector Table Studio'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-700 uppercase">
              NEW
            </span>
          </button>

          {/* Tab: EEPROM Studio */}
          <button
            onClick={() => setMainStudioTab('EEPROM_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'EEPROM_STUDIO'
                ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-xl shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-300" />
            <span>
              {language === 'hu'
                ? '💾 EEPROM Stúdió (1KB)'
                : '💾 EEPROM Studio (1KB)'}
            </span>
          </button>

          {/* Tab: 74HC595 Shift Register Studio */}
          <button
            onClick={() => setMainStudioTab('SHIFT_REGISTER_595')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'SHIFT_REGISTER_595'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            <span>
              {language === 'hu'
                ? '🕹️ 74HC595 Shift-Regiszter'
                : '🕹️ 74HC595 Shift Register'}
            </span>
          </button>

          {/* Tab 0: ADC Studio & Timing Analyzer */}
          <button
            onClick={() => setMainStudioTab('ADC_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'ADC_STUDIO'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>
              {language === 'hu'
                ? '🔬 ADC Stúdió (SAR)'
                : '🔬 ADC Studio (SAR)'}
            </span>
          </button>

          {/* Tab 0.5: PWM & Timer Studio */}
          <button
            onClick={() => setMainStudioTab('PWM_STUDIO')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'PWM_STUDIO'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-purple-900/40 ring-1 ring-purple-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Waves className="w-4 h-4 text-purple-300" />
            <span>
              {language === 'hu'
                ? '⚡ PWM & Időzítő Stúdió'
                : '⚡ PWM & Timer Studio'}
            </span>
          </button>

          {/* Tab 1: Breadboard Lab */}
          <button
            onClick={() => setMainStudioTab('BREADBOARD_STUDIO')}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'BREADBOARD_STUDIO'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{language === 'hu' ? '⚡ MCU Breadboard Labor' : '⚡ MCU Breadboard Lab'}</span>
          </button>

          {/* Tab 2: Dual MCU Bridge Studio */}
          <button
            onClick={() => setMainStudioTab('DUAL_MCU_BRIDGE')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'DUAL_MCU_BRIDGE'
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-300" />
            <span>
              {language === 'hu'
                ? '🔗 Dual MCU Bridge'
                : '🔗 Dual MCU Bridge'}
            </span>
          </button>

          {/* Tab 3: Visual Block Programming */}
          <button
            onClick={() => setMainStudioTab('BLOCK_STUDIO')}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'BLOCK_STUDIO'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/40 ring-1 ring-amber-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Blocks className="w-4 h-4 text-amber-300" />
            <span>
              {language === 'hu'
                ? '🧩 Vizuális Blokk'
                : '🧩 Visual Blocks'}
            </span>
          </button>

          {/* Tab 4: Protocol Lab */}
          <button
            onClick={() => setMainStudioTab('PROTOCOL_LAB')}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              mainStudioTab === 'PROTOCOL_LAB'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Network className="w-4 h-4 text-purple-300" />
            <span>
              {language === 'hu'
                ? '📡 Protokoll Labor'
                : '📡 Protocol Lab'}
            </span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden xl:inline px-3">
          {mainStudioTab === 'AVR8JS_PRO_STUDIO'
            ? language === 'hu'
              ? 'avr8js 16 MHz ciklus-pontos emulátor, valódi Intel HEX futtatás & Soros Monitor'
              : 'avr8js 16 MHz cycle-accurate emulator, real Intel HEX execution & Serial Terminal'
            : mainStudioTab === 'STACK_STUDIO'
            ? language === 'hu'
              ? 'Verem dinamikus növekedése és ürülése, SP mutató, call frame-ek & overflow védelem'
              : 'Dynamic stack growth/shrinkage, SP pointer, call frames & overflow protection'
            : mainStudioTab === 'CODE_SYNC_STUDIO'
            ? language === 'hu'
              ? 'Soronkénti Arduino C és AVR Assembly szinkronizált kiemelés'
              : 'Line-by-line synchronized Arduino C and AVR Assembly highlighting'
            : mainStudioTab === 'INTERRUPT_STUDIO'
            ? language === 'hu'
              ? '26 Hardveres Megszakítási Vektor (IVT) & 5-fázisú folyamat'
              : '26 Hardware Interrupt Vectors (IVT) & 5-phase execution flow'
            : language === 'hu'
            ? 'ATmega328P I/O, Timerek & Virtuális Modulok'
            : 'ATmega328P I/O, Timers & Virtual Modules'}
        </span>
      </div>

      {mainStudioTab === 'AVR8JS_PRO_STUDIO' ? (
        <McuAvr8jsStudio />
      ) : mainStudioTab === 'STACK_STUDIO' ? (
        <McuStackStudio
          mcuState={mcuState}
          onUpdateState={setMcuState}
          onFlashCode={(code) => {
            setSourceCode(code);
            handleFlashCode(code);
          }}
        />
      ) : mainStudioTab === 'CODE_SYNC_STUDIO' ? (
        <McuCodeSyncStudio
          mcuState={mcuState}
          onFlashCode={(code) => {
            setSourceCode(code);
            handleFlashCode(code);
            setMainStudioTab('BREADBOARD_STUDIO');
          }}
        />
      ) : mainStudioTab === 'INTERRUPT_STUDIO' ? (
        <McuInterruptStudio
          mcuState={mcuState}
          onUpdateState={setMcuState}
          onFlashCode={(code) => {
            setSourceCode(code);
            handleFlashCode(code);
          }}
        />
      ) : mainStudioTab === 'EEPROM_STUDIO' ? (
        <McuEepromStudio
          eepromData={mcuState.eeprom}
          onUpdateByte={handleUpdateEepromByte}
          onBulkUpdate={handleBulkUpdateEeprom}
          onClearAll={handleClearEeprom}
          onFlashGeneratedCode={(code) => {
            setSourceCode(code);
            handleFlashCode(code);
            setMainStudioTab('BREADBOARD_STUDIO');
          }}
        />
      ) : mainStudioTab === 'SHIFT_REGISTER_595' ? (
        <McuShiftRegisterStudio
          onOpenBlockStudioWithPreset={(presetId) => {
            setMainStudioTab('BLOCK_STUDIO');
          }}
        />
      ) : mainStudioTab === 'ADC_STUDIO' ? (
        <McuAdcStudio potVoltage={mcuState.breadboard.potentiometerVoltage} />
      ) : mainStudioTab === 'PWM_STUDIO' ? (
        <McuPwmStudio />
      ) : mainStudioTab === 'DUAL_MCU_BRIDGE' ? (
        <McuBridgeStudio />
      ) : mainStudioTab === 'BLOCK_STUDIO' ? (
        <McuBlockStudio
          onFlashToBreadboard={(code) => {
            setSourceCode(code);
            handleFlashCode(code);
          }}
          onFlashToMcuA={(code) => {
            // Can be flashed directly or switched
            setSourceCode(code);
          }}
          onFlashToMcuB={(code) => {
            setSourceCode(code);
          }}
        />
      ) : mainStudioTab === 'PROTOCOL_LAB' ? (
        <McuProtocolLab />
      ) : (
        /* Main Responsive Layout Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Code Editor & I/O Registers (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <McuEditor
              sourceCode={sourceCode}
              onChangeSourceCode={setSourceCode}
              onFlashCode={handleFlashCode}
              currentPc={mcuState.registers.pc}
              currentExplanation={mcuState.currentExplanation}
              currentExplanationHu={mcuState.currentExplanationHu}
            />
            <McuRegisterInspector
              registers={mcuState.registers}
              onUpdateRegister={handleUpdateRegister}
            />
          </div>

          {/* Right Column: Virtual Breadboard Lab, DIP-28 Pinout, Oscilloscope & Serial (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Breadboard Lab */}
            <McuBreadboardLab
              breadboard={mcuState.breadboard}
              onUpdateBreadboard={handleUpdateBreadboard}
              onTriggerInterrupt={handleTriggerInterrupt}
            />

            {/* DIP-28 Physical Chip Pinout Diagram */}
            <McuChipPinout
              pins={mcuState.pins}
              mcuModel={mcuState.mcuModel}
            />

            {/* Dual Panel: 4-Channel Oscilloscope & UART Serial Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <McuLogicAnalyzer
                channels={mcuState.logicChannels}
                isRunning={mcuState.isRunning}
              />
              <McuSerialConsole
                serialLogs={mcuState.serialLogs}
                serialPlotData={mcuState.serialPlotData}
                onSendSerial={handleSendSerial}
                onClearLogs={() => setMcuState((prev) => ({ ...prev, serialLogs: [] }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
