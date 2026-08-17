import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  createInitialRiscvState,
  parseRiscvAssembly,
  RISCV_ABI_MAP,
  RISCV_SAMPLE_PROGRAMS,
  stepRiscvPipeline,
} from '../../core/riscvEngine';
import { RiscvInstruction, RiscvPipelineState } from '../../types/riscv';
import { useI18n } from '../../i18n/I18nContext';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FastForward,
  Layers,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export const RiscvPipelineStudio: React.FC = () => {
  const { language } = useI18n();
  const [selectedSampleId, setSelectedSampleId] = useState<string>('hazard_forwarding');
  const [code, setCode] = useState<string>(() => RISCV_SAMPLE_PROGRAMS[1].code);
  const [compiledProgram, setCompiledProgram] = useState<RiscvInstruction[]>(() =>
    parseRiscvAssembly(RISCV_SAMPLE_PROGRAMS[1].code)
  );
  const [state, setState] = useState<RiscvPipelineState>(() => createInitialRiscvState());
  const [clockSpeedHz, setClockSpeedHz] = useState<number>(2);
  const [activeRegTab, setActiveRegTab] = useState<'ABI' | 'NUMERIC'>('ABI');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load sample program
  const handleSelectSample = (id: string) => {
    const sample = RISCV_SAMPLE_PROGRAMS.find((p) => p.id === id);
    if (sample) {
      setSelectedSampleId(id);
      setCode(sample.code);
      const prog = parseRiscvAssembly(sample.code);
      setCompiledProgram(prog);
      setState(createInitialRiscvState());
    }
  };

  // Compile code
  const handleCompile = () => {
    const prog = parseRiscvAssembly(code);
    setCompiledProgram(prog);
    setState(createInitialRiscvState());
  };

  // Step 1 clock cycle
  const handleStepCycle = () => {
    setState((prev) => stepRiscvPipeline(prev, compiledProgram));
  };

  // Reset
  const handleReset = () => {
    setState(createInitialRiscvState());
  };

  // Run / Pause
  const handleToggleRun = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  useEffect(() => {
    if (state.isRunning && !state.isHalted) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev.isRunning || prev.isHalted) return prev;
          return stepRiscvPipeline(prev, compiledProgram);
        });
      }, 1000 / clockSpeedHz);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.isHalted, clockSpeedHz, compiledProgram]);

  const toHex = (val: number, bits = 8) =>
    `0x${(val >>> 0).toString(16).toUpperCase().padStart(bits / 4, '0')}`;

  const cpi =
    state.instructionsExecuted > 0
      ? (state.cycle / state.instructionsExecuted).toFixed(2)
      : '1.00';

  return (
    <div className="flex flex-col gap-5 p-2 sm:p-4 bg-[#07090E] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0D111A] rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-900/30 text-white">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">
                RISC-V (RV32I) 5-Stage Pipeline Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                32-BIT HARVARD PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? '5 fokozatú utasítás-futószalag (IF, ID, EX, MEM, WB), Hardveres Forwarding & Hazard Detektálás'
                : '5-Stage Instruction Pipeline (IF, ID, EX, MEM, WB), Hardware Forwarding & Hazard Detection'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleRun}
            disabled={state.isHalted}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              state.isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 disabled:opacity-50'
            }`}
          >
            {state.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{state.isRunning ? (language === 'hu' ? 'SZÜNET' : 'PAUSE') : (language === 'hu' ? 'FUTTATÁS' : 'RUN')}</span>
          </button>

          <button
            onClick={handleStepCycle}
            disabled={state.isRunning || state.isHalted}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hu' ? '1 CIKLUS LÉPÉS' : 'STEP 1 CYCLE'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer transition-all"
            title={language === 'hu' ? 'Futószalag és Regiszterek Újraindítása' : 'Reset Pipeline & Registers'}
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Forwarding Toggle */}
          <button
            onClick={() => setState((prev) => ({ ...prev, enableForwarding: !prev.enableForwarding }))}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              state.enableForwarding
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-900/20'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${state.enableForwarding ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            <span>Forwarding: {state.enableForwarding ? 'ON' : 'OFF'}</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs font-mono">
            <span className="text-slate-400 text-[10px]">Freq:</span>
            {[1, 2, 5, 10].map((hz) => (
              <button
                key={hz}
                onClick={() => setClockSpeedHz(hz)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  clockSpeedHz === hz ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hz}Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-[#0B0F17] rounded-xl border border-slate-800 text-xs font-mono">
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">CLOCK CYCLE</span>
          <span className="text-base font-bold text-cyan-300">#{state.cycle}</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">INSTRUCTIONS RETIRED</span>
          <span className="text-base font-bold text-emerald-300">{state.instructionsExecuted}</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">CPI (CYCLES / INST)</span>
          <span className="text-base font-bold text-purple-300">{cpi}</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] text-slate-400">STALLS (BUBBLES)</span>
          <span className="text-base font-bold text-amber-400">{state.stallsCount}</span>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400">BRANCH FLUSHES</span>
          <span className="text-base font-bold text-rose-400">{state.flushesCount}</span>
        </div>
      </div>

      {/* Live Hazard Detection Alert Banner */}
      {(state.hazard.loadUseHazard || state.hazard.controlHazard || state.hazard.forwardAppliedA || state.hazard.forwardAppliedB) && (
        <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all animate-fadeIn ${
          state.hazard.loadUseHazard || state.hazard.controlHazard
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
        }`}>
          {state.hazard.loadUseHazard || state.hazard.controlHazard ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
          ) : (
            <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-bold">
              {language === 'hu' ? state.hazard.descriptionHu : state.hazard.descriptionEn}
            </span>
            <div className="flex gap-3 mt-1 text-[11px] text-slate-300">
              {state.hazard.forwardAppliedA && <span>Forwarding RS1 &rarr; EX ALU InA</span>}
              {state.hazard.forwardAppliedB && <span>Forwarding RS2 &rarr; EX ALU InB</span>}
            </div>
          </div>
        </div>
      )}

      {/* 5-Stage Visual Pipeline Diagram */}
      <div className="p-4 bg-[#0A0D14] rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{language === 'hu' ? '5-FOKOZATÚ HARDVER FUTÓSZALAG ADATÚT' : '5-STAGE HARDWARE PIPELINE DATAPATH'}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            PC: <strong className="text-cyan-300">{toHex(state.pc)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Stage 1: IF */}
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            state.ifStage.isStalled
              ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/40'
              : state.ifStage.instruction
              ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-900/20'
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-300">1. IF (FETCH)</span>
              {state.ifStage.isStalled && <span className="text-[9px] font-mono px-1 bg-amber-500/20 text-amber-300 rounded">STALLED</span>}
              {state.ifStage.isFlushed && <span className="text-[9px] font-mono px-1 bg-rose-500/20 text-rose-300 rounded">FLUSHED</span>}
            </div>
            <div className="font-mono text-xs p-2 bg-[#06080C] rounded border border-purple-500/30 min-h-[48px] flex flex-col justify-center">
              <span className="text-purple-300 font-bold">
                {state.ifStage.instruction ? `${state.ifStage.instruction.mnemonic} ${state.ifStage.instruction.operands}` : '— (NOP / Bubble)'}
              </span>
              <span className="text-[10px] text-slate-500">PC: {toHex(state.ifStage.pc)}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Next PC:</span>
              <span className="text-slate-200">{toHex(state.ifStage.nextPc)}</span>
            </div>
          </div>

          {/* Stage 2: ID */}
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            state.idStage.isStalled
              ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/40'
              : state.idStage.instruction
              ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-900/20'
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-300">2. ID (DECODE)</span>
              {state.idStage.isStalled && <span className="text-[9px] font-mono px-1 bg-amber-500/20 text-amber-300 rounded">BUBBLE</span>}
            </div>
            <div className="font-mono text-xs p-2 bg-[#06080C] rounded border border-blue-500/30 min-h-[48px] flex flex-col justify-center">
              <span className="text-blue-300 font-bold">
                {state.idStage.instruction ? `${state.idStage.instruction.mnemonic} ${state.idStage.instruction.operands}` : '— (NOP)'}
              </span>
              <span className="text-[10px] text-slate-500">Type: {state.idStage.instruction?.type || '—'}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span>RS1 Val:</span>
                <span className="text-slate-200 font-bold">{state.idStage.rs1Val}</span>
              </div>
              <div className="flex justify-between">
                <span>RS2 Val:</span>
                <span className="text-slate-200 font-bold">{state.idStage.rs2Val}</span>
              </div>
            </div>
          </div>

          {/* Stage 3: EX */}
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            state.exStage.instruction
              ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-900/20'
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300">3. EX (ALU EXEC)</span>
              {(state.exStage.forwardA !== 'NONE' || state.exStage.forwardB !== 'NONE') && (
                <span className="text-[9px] font-mono px-1 bg-emerald-500/20 text-emerald-300 rounded animate-pulse">BYPASS</span>
              )}
            </div>
            <div className="font-mono text-xs p-2 bg-[#06080C] rounded border border-cyan-500/30 min-h-[48px] flex flex-col justify-center">
              <span className="text-cyan-300 font-bold">
                {state.exStage.instruction ? `${state.exStage.instruction.mnemonic} ${state.exStage.instruction.operands}` : '— (NOP)'}
              </span>
              <span className="text-[10px] text-slate-400">ALU Out: <strong className="text-emerald-300">{state.exStage.aluResult}</strong></span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span>InA (Fwd):</span>
                <span className="text-slate-200">{state.exStage.forwardValA} ({state.exStage.forwardA})</span>
              </div>
              <div className="flex justify-between">
                <span>InB (Fwd):</span>
                <span className="text-slate-200">{state.exStage.forwardValB} ({state.exStage.forwardB})</span>
              </div>
            </div>
          </div>

          {/* Stage 4: MEM */}
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            state.memStage.instruction
              ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-900/20'
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-300">4. MEM (DATA)</span>
              {state.memStage.memRead && <span className="text-[9px] font-mono px-1 bg-blue-500/20 text-blue-300 rounded">READ</span>}
              {state.memStage.memWrite && <span className="text-[9px] font-mono px-1 bg-rose-500/20 text-rose-300 rounded">WRITE</span>}
            </div>
            <div className="font-mono text-xs p-2 bg-[#06080C] rounded border border-amber-500/30 min-h-[48px] flex flex-col justify-center">
              <span className="text-amber-300 font-bold">
                {state.memStage.instruction ? `${state.memStage.instruction.mnemonic} ${state.memStage.instruction.operands}` : '— (NOP)'}
              </span>
              <span className="text-[10px] text-slate-400">Addr: {toHex(state.memStage.aluResult)}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Read/Write:</span>
              <span className="text-slate-200">{state.memStage.memRead ? state.memStage.readData : state.memStage.writeData}</span>
            </div>
          </div>

          {/* Stage 5: WB */}
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            state.wbStage.instruction
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-300">5. WB (REGS)</span>
              {state.wbStage.regWrite && <span className="text-[9px] font-mono px-1 bg-emerald-500/20 text-emerald-300 rounded">WRITE</span>}
            </div>
            <div className="font-mono text-xs p-2 bg-[#06080C] rounded border border-emerald-500/30 min-h-[48px] flex flex-col justify-center">
              <span className="text-emerald-300 font-bold">
                {state.wbStage.instruction ? `${state.wbStage.instruction.mnemonic} ${state.wbStage.instruction.operands}` : '— (NOP)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {state.wbStage.regWrite ? `x${state.wbStage.destReg} <- ${state.wbStage.destVal}` : 'No Reg Write'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Commit:</span>
              <span className="text-emerald-400 font-bold">{state.wbStage.regWrite ? 'RETIRED' : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Code Editor & Register File */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Editor & Sample Picker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>RV32I Assembly Editor</span>
              </div>
              <button
                onClick={handleCompile}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'hu' ? 'FORDÍTÁS' : 'ASSEMBLE'}</span>
              </button>
            </div>

            {/* Presets dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">
                {language === 'hu' ? 'Mintaprogramok:' : 'Sample Programs:'}
              </label>
              <select
                value={selectedSampleId}
                onChange={(e) => handleSelectSample(e.target.value)}
                className="w-full bg-[#06080C] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {RISCV_SAMPLE_PROGRAMS.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {language === 'hu' ? prog.titleHu : prog.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full bg-[#06080C] border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Cycle Gantt Pipeline Reservation History */}
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'hu' ? 'Ciklus Időzítési Tábla (Gantt)' : 'Pipeline Cycle History'}</span>
            </h3>
            <div className="overflow-x-auto max-h-48 scrollbar-thin">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1 px-1.5">Cyc</th>
                    <th className="py-1 px-1.5 text-purple-400">IF</th>
                    <th className="py-1 px-1.5 text-blue-400">ID</th>
                    <th className="py-1 px-1.5 text-cyan-400">EX</th>
                    <th className="py-1 px-1.5 text-amber-400">MEM</th>
                    <th className="py-1 px-1.5 text-emerald-400">WB</th>
                  </tr>
                </thead>
                <tbody>
                  {state.history.slice(0, 8).map((h) => (
                    <tr key={h.cycle} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                      <td className="py-1 px-1.5 font-bold text-slate-400">#{h.cycle}</td>
                      <td className="py-1 px-1.5 text-purple-300 truncate max-w-[90px]">{h.ifInst}</td>
                      <td className="py-1 px-1.5 text-blue-300 truncate max-w-[90px]">{h.idInst}</td>
                      <td className="py-1 px-1.5 text-cyan-300 truncate max-w-[90px]">{h.exInst}</td>
                      <td className="py-1 px-1.5 text-amber-300 truncate max-w-[90px]">{h.memInst}</td>
                      <td className="py-1 px-1.5 text-emerald-300 truncate max-w-[90px]">{h.wbInst}</td>
                    </tr>
                  ))}
                  {state.history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-slate-500">
                        {language === 'hu' ? 'Indítsa el a futtatást vagy lépjen ciklust.' : 'Step cycle to view execution flow.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Register File & RAM (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>RV32I Register File (32 x 32-bit Registers)</span>
              </div>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setActiveRegTab('ABI')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    activeRegTab === 'ABI' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ABI Names
                </button>
                <button
                  onClick={() => setActiveRegTab('NUMERIC')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    activeRegTab === 'NUMERIC' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  x0-x31
                </button>
              </div>
            </div>

            {/* Register Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {RISCV_ABI_MAP.map((r) => {
                const val = state.registers[r.index] || 0;
                const isModified = state.wbStage.regWrite && state.wbStage.destReg === r.index && r.index !== 0;
                return (
                  <div
                    key={r.index}
                    className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      isModified
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-900/30'
                        : val !== 0
                        ? 'bg-[#0E131F] border-slate-700/80 text-slate-200'
                        : 'bg-[#06080C] border-slate-800/80 text-slate-400'
                    }`}
                    title={language === 'hu' ? r.descHu : r.descEn}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-300">
                        {activeRegTab === 'ABI' ? r.abi : r.name}
                      </span>
                      <span className="text-[10px] text-slate-500">x{r.index}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{toHex(val)}</span>
                      <span className="text-xs font-bold text-slate-100">{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 32-bit Word Data RAM View */}
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>32-bit Data Memory (RAM)</span>
              </span>
              <span className="text-[10px] text-slate-500">Word Aligned [0x00 .. 0x3C]</span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-xs">
              {Array.from({ length: 16 }, (_, i) => {
                const addr = i * 4;
                const val = state.memory[i] || 0;
                return (
                  <div key={i} className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                    <span className="text-[9px] text-slate-500">+{addr}</span>
                    <span className="text-xs font-bold text-amber-300 truncate">{val}</span>
                    <span className="text-[9px] text-slate-400 truncate">{toHex(val, 8)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
