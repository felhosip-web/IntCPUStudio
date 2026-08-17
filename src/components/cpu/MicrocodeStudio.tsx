import React, { useState } from 'react';
import {
  CONTROL_SIGNALS_CATALOG,
  createInitialMicrocodeSimState,
  STANDARD_OPCODE_MICROCODE,
  stepMicrocodeSimulation,
} from '../../core/microcodeEngine';
import {
  CustomInstructionDraft,
  HardwareControlSignal,
  MicrocodeSimulationState,
  MicroStepIndex,
  OpcodeMicrocodeEntry,
} from '../../types/microcode';
import { useI18n } from '../../i18n/I18nContext';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  FastForward,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

export const MicrocodeStudio: React.FC = () => {
  const { language } = useI18n();
  const [customOpcodeEntries, setCustomOpcodeEntries] = useState<OpcodeMicrocodeEntry[]>([]);
  const [selectedOpcode, setSelectedOpcode] = useState<number>(0x02); // ADD A, B
  const [simState, setSimState] = useState<MicrocodeSimulationState>(() =>
    createInitialMicrocodeSimState()
  );

  // Custom instruction creation draft state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [draftMnemonic, setDraftMnemonic] = useState('SWAP A, B');
  const [draftOpcode, setDraftOpcode] = useState('0x20');
  const [draftCategory, setDraftCategory] = useState<'ARITHMETIC' | 'LOGIC' | 'DATA_TRANSFER' | 'CUSTOM'>('DATA_TRANSFER');
  const [draftDescHu, setDraftDescHu] = useState('Megcseréli az A és B regiszterek értékét.');
  const [draftDescEn, setDraftDescEn] = useState('Swaps the values of Register A and Register B.');
  const [draftSteps, setDraftSteps] = useState<Record<MicroStepIndex, HardwareControlSignal[]>>({
    0: ['PC_OUT', 'MAR_IN'],
    1: ['MEM_RD', 'IR_IN', 'PC_INC'],
    2: [],
    3: ['REG_A_OUT', 'REG_C_IN'],
    4: ['REG_B_OUT', 'REG_A_IN'],
    5: ['REG_C_OUT', 'REG_B_IN', 'STEP_RST'],
  });

  const allOpcodeEntries = [...STANDARD_OPCODE_MICROCODE, ...customOpcodeEntries];
  const activeEntry =
    allOpcodeEntries.find((e) => e.opcode === selectedOpcode) || STANDARD_OPCODE_MICROCODE[0];

  const handleSelectOpcode = (op: number) => {
    setSelectedOpcode(op);
    setSimState((prev) => ({
      ...prev,
      selectedOpcode: op,
      currentStep: 0,
      registers: { ...prev.registers, IR: op },
    }));
  };

  const handleStepSim = () => {
    setSimState((prev) => stepMicrocodeSimulation(prev, customOpcodeEntries));
  };

  const handleResetSim = () => {
    setSimState(createInitialMicrocodeSimState());
  };

  // Toggle signal in custom draft
  const handleToggleDraftSignal = (step: MicroStepIndex, sig: HardwareControlSignal) => {
    setDraftSteps((prev) => {
      const currentList = prev[step] || [];
      const exists = currentList.includes(sig);
      const nextList = exists
        ? currentList.filter((s) => s !== sig)
        : [...currentList, sig];
      return { ...prev, [step]: nextList };
    });
  };

  // Save custom instruction
  const handleSaveCustomInstruction = () => {
    const opNum = parseInt(draftOpcode, 16) || 0x20;
    const newEntry: OpcodeMicrocodeEntry = {
      opcode: opNum,
      mnemonic: draftMnemonic,
      isStandard: false,
      isCustom: true,
      category: draftCategory,
      operandsDesc: 'Custom Designed ISA',
      steps: ([0, 1, 2, 3, 4, 5] as MicroStepIndex[]).map((st) => ({
        step: st,
        stepNameHu: `T${st}: Mikrolépés`,
        stepNameEn: `T${st}: Microstep`,
        activeSignals: draftSteps[st] || [],
        descriptionHu: `T${st} vezérlőjelek aktiválása`,
        descriptionEn: `T${st} active control lines`,
      })),
    };

    setCustomOpcodeEntries((prev) => [...prev.filter((p) => p.opcode !== opNum), newEntry]);
    setSelectedOpcode(opNum);
    setIsCreatorOpen(false);
  };

  const toHex = (n: number) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-5 p-2 sm:p-4 bg-[#07090E] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0D111A] rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg shadow-amber-900/30 text-white">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Microcode Control Store ROM & Custom Instruction Designer
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HARDWARE CONTROL MATRIX
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'T0..T5 mikrolépések, hardveres vezérlővonalak mátrixa és egyedi gépi kódú utasítások tervezése'
                : 'T0..T5 microsteps, hardware control line ROM matrix & custom machine instruction design'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-amber-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'ÚJ EGYEDI UTASÍTÁS' : 'DESIGN CUSTOM INSTRUCTION'}</span>
          </button>
        </div>
      </div>

      {/* Opcode Selector Ribbon */}
      <div className="p-3 bg-[#0B0F17] rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 mr-2 font-bold">
          {language === 'hu' ? 'Válasszon Opcode-ot:' : 'Select Opcode:'}
        </span>
        {allOpcodeEntries.map((entry) => (
          <button
            key={entry.opcode}
            onClick={() => handleSelectOpcode(entry.opcode)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedOpcode === entry.opcode
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{entry.mnemonic}</span>
            <span className="text-[10px] opacity-75 font-normal">({toHex(entry.opcode)})</span>
            {entry.isCustom && (
              <span className="px-1 py-0.2 rounded bg-amber-400/30 text-amber-200 text-[9px]">CUSTOM</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Grid: Control Matrix & Execution Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: ROM Microcode Step Matrix (7 cols) */}
        <div className="lg:col-span-7 p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Control Store ROM Steps for [{activeEntry.mnemonic}]</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Opcode: <strong className="text-amber-300">{toHex(activeEntry.opcode)}</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {activeEntry.steps.map((stepDef) => {
              const isCurrentSimStep = simState.currentStep === stepDef.step;
              return (
                <div
                  key={stepDef.step}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrentSimStep
                      ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400 shadow-md shadow-amber-900/20'
                      : 'bg-[#06080C] border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <span className={isCurrentSimStep ? 'text-amber-300' : 'text-slate-300'}>
                        {language === 'hu' ? stepDef.stepNameHu : stepDef.stepNameEn}
                      </span>
                      {isCurrentSimStep && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] animate-pulse">
                          AKTÍV MIKROLÉPÉS
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {language === 'hu' ? stepDef.descriptionHu : stepDef.descriptionEn}
                    </span>
                  </div>

                  {/* Active signals in this step */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {stepDef.activeSignals.map((sig) => {
                      const meta = CONTROL_SIGNALS_CATALOG.find((s) => s.id === sig);
                      return (
                        <span
                          key={sig}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold border"
                          style={{
                            backgroundColor: `${meta?.color || '#F59E0B'}20`,
                            color: meta?.color || '#F59E0B',
                            borderColor: `${meta?.color || '#F59E0B'}40`,
                          }}
                        >
                          {meta?.name || sig}
                        </span>
                      );
                    })}
                    {stepDef.activeSignals.length === 0 && (
                      <span className="text-[11px] font-mono text-slate-600 italic">
                        (Nincs aktív vezérlővonal / Dekódolás)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Sandbox & Registers (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 bg-[#0B0F17] rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Microstep Execution Sandbox</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleStepSim}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                >
                  <FastForward className="w-3 h-3 text-cyan-300" />
                  <span>{language === 'hu' ? '1 MIKROLÉPÉS' : 'STEP T-CYCLE'}</span>
                </button>
                <button
                  onClick={handleResetSim}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Step Banner */}
            <div className="p-3 bg-[#06080C] rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">JELENLEGI FÁZIS</span>
                <span className="text-amber-400 font-bold text-sm">T{simState.currentStep}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CÍMBUSZ</span>
                <span className="text-cyan-300 font-bold">{toHex(simState.busAddress)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ADATBUSZ</span>
                <span className="text-emerald-300 font-bold">{toHex(simState.busData)}</span>
              </div>
            </div>

            {/* Sandbox Registers */}
            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">REG A</span>
                <span className="text-sm font-bold text-slate-100">{simState.registers.A}</span>
                <span className="text-[9px] text-slate-400">{toHex(simState.registers.A)}</span>
              </div>
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">REG B</span>
                <span className="text-sm font-bold text-slate-100">{simState.registers.B}</span>
                <span className="text-[9px] text-slate-400">{toHex(simState.registers.B)}</span>
              </div>
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">REG C</span>
                <span className="text-sm font-bold text-slate-100">{simState.registers.C}</span>
                <span className="text-[9px] text-slate-400">{toHex(simState.registers.C)}</span>
              </div>
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">REG D</span>
                <span className="text-sm font-bold text-slate-100">{simState.registers.D}</span>
                <span className="text-[9px] text-slate-400">{toHex(simState.registers.D)}</span>
              </div>
            </div>

            {/* Special Registers */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">PC</span>
                <span className="text-xs font-bold text-purple-300">{toHex(simState.registers.PC)}</span>
              </div>
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">MAR</span>
                <span className="text-xs font-bold text-cyan-300">{toHex(simState.registers.MAR)}</span>
              </div>
              <div className="p-2 bg-[#06080C] rounded-lg border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">IR</span>
                <span className="text-xs font-bold text-amber-300">{toHex(simState.registers.IR)}</span>
              </div>
            </div>

            {/* Flags */}
            <div className="p-2.5 bg-[#06080C] rounded-xl border border-slate-800 flex items-center justify-around font-mono text-xs">
              <span className={simState.registers.FLAGS.Z ? 'text-emerald-400 font-bold' : 'text-slate-600'}>Z: {simState.registers.FLAGS.Z ? '1' : '0'}</span>
              <span className={simState.registers.FLAGS.C ? 'text-emerald-400 font-bold' : 'text-slate-600'}>C: {simState.registers.FLAGS.C ? '1' : '0'}</span>
              <span className={simState.registers.FLAGS.N ? 'text-emerald-400 font-bold' : 'text-slate-600'}>N: {simState.registers.FLAGS.N ? '1' : '0'}</span>
              <span className={simState.registers.FLAGS.V ? 'text-emerald-400 font-bold' : 'text-slate-600'}>V: {simState.registers.FLAGS.V ? '1' : '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Instruction Creator Modal / Drawer */}
      {isCreatorOpen && (
        <div className="p-4 bg-[#0D111A] rounded-2xl border border-amber-500/50 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hu' ? 'Új Egyedi Utasítás Tervező Varázsló' : 'Custom Instruction Designer Wizard'}</span>
            </div>
            <button
              onClick={() => setIsCreatorOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Mégse / Bezárás
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold">Mnemonic:</label>
              <input
                type="text"
                value={draftMnemonic}
                onChange={(e) => setDraftMnemonic(e.target.value)}
                className="bg-[#06080C] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                placeholder="SWAP A, B"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold">Opcode (Hex):</label>
              <input
                type="text"
                value={draftOpcode}
                onChange={(e) => setDraftOpcode(e.target.value)}
                className="bg-[#06080C] border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500"
                placeholder="0x20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold">Kategória:</label>
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as any)}
                className="bg-[#06080C] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="DATA_TRANSFER">Adatátvitel (Data Transfer)</option>
                <option value="ARITHMETIC">Aritmetika (Arithmetic)</option>
                <option value="LOGIC">Logika (Bitwise Logic)</option>
                <option value="CUSTOM">Egyedi (Custom)</option>
              </select>
            </div>
          </div>

          {/* Microstep Control Line Picker */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-slate-300 font-bold">
              {language === 'hu' ? 'Vezérlőjelek kiválasztása mikrolépésenként (T0..T5):' : 'Configure Active Control Lines per Microstep:'}
            </span>

            {([0, 1, 2, 3, 4, 5] as MicroStepIndex[]).map((step) => (
              <div key={step} className="p-3 bg-[#06080C] rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-amber-400">T{step} Mikrolépés</span>
                  <span className="text-[10px] text-slate-500">
                    {step === 0 ? 'Fetch MAR' : step === 1 ? 'Fetch IR & PC++' : step === 2 ? 'Decode' : 'Execute / Transfer'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CONTROL_SIGNALS_CATALOG.map((meta) => {
                    const isSelected = (draftSteps[step] || []).includes(meta.id);
                    return (
                      <button
                        key={meta.id}
                        onClick={() => handleToggleDraftSignal(step, meta.id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/30 text-amber-200 border-amber-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {meta.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsCreatorOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-bold cursor-pointer"
            >
              Mégse
            </button>
            <button
              onClick={handleSaveCustomInstruction}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-mono text-xs font-bold cursor-pointer shadow-lg shadow-amber-900/30"
            >
              💾 Mentés & Bekapcsolás a Processzorba
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
