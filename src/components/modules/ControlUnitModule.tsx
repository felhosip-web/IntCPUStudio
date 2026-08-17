import React from 'react';
import { MicroStepPhase } from '../../types/cpu';
import { useI18n } from '../../i18n/I18nContext';
import {
  CheckCircle,
  Clock,
  Cpu,
  Layers,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ControlUnitModuleProps {
  microStep: MicroStepPhase;
  microStepIndex: number;
  cycleCount: number;
  instructionCount: number;
  currentInstructionName: string;
  explanationHu: string;
  explanationEn: string;
  controlLines: string[];
}

const PHASES: Array<{
  id: MicroStepPhase;
  nameHu: string;
  nameEn: string;
  descHu: string;
  descEn: string;
  signals: string[];
}> = [
  {
    id: 'FETCH_MAR',
    nameHu: '1. Cím Betöltése (MAR <- PC)',
    nameEn: '1. Load Address (MAR <- PC)',
    descHu: 'PC a címbuszra kerül, MAR regiszterbe töltődik',
    descEn: 'PC is placed onto address bus, latched into MAR',
    signals: ['PC_OUT', 'MAR_IN', 'ADDR_BUS_ACT'],
  },
  {
    id: 'FETCH_IR',
    nameHu: '2. Opkód Beolvasása (IR <- RAM)',
    nameEn: '2. Fetch Opcode (IR <- RAM)',
    descHu: 'Utasításkód olvasása a RAM-ból az IR-be, PC++',
    descEn: 'Instruction opcode fetched from RAM into IR, PC increments',
    signals: ['MEM_READ', 'DATA_BUS_ACT', 'IR_IN', 'PC_INC'],
  },
  {
    id: 'DECODE',
    nameHu: '3. Utasítás Dekódolása (CU)',
    nameEn: '3. Decode Instruction (CU)',
    descHu: 'Vezérlőmű felismeri az utasítást és aktiválja a vonalakat',
    descEn: 'Control unit decodes opcode and asserts hardware control signals',
    signals: ['CTRL_DECODE', 'CU_ACTIVE'],
  },
  {
    id: 'EXECUTE_OPERANDS',
    nameHu: '4. Operanduszok Előkészítése',
    nameEn: '4. Prepare Operands',
    descHu: 'Adatok betöltése az ALU vagy belső busz bemeneteire',
    descEn: 'Load operands onto internal bus or ALU inputs',
    signals: ['REG_OUT', 'ALU_OP_IN', 'DATA_BUS_ACT'],
  },
  {
    id: 'EXECUTE_ALU',
    nameHu: '5. Művelet Végrehajtása (ALU)',
    nameEn: '5. Execute ALU Operation',
    descHu: 'Számítás elvégzése és a jelzőbitek frissítése',
    descEn: 'Arithmetic/logical computation performed & flags updated',
    signals: ['ALU_OUT', 'FLAGS_IN'],
  },
  {
    id: 'WRITEBACK',
    nameHu: '6. Eredmény Mentése (Writeback)',
    nameEn: '6. Result Writeback',
    descHu: 'Végeredmény beírása a regiszterbe vagy memóriába',
    descEn: 'Result latched back into destination register or RAM',
    signals: ['REG_IN', 'MEM_WRITE'],
  },
];

const ALL_CONTROL_LINES = [
  'PC_OUT',
  'PC_INC',
  'PC_LOAD',
  'MAR_IN',
  'MEM_READ',
  'MEM_WRITE',
  'DATA_BUS_ACT',
  'ADDR_BUS_ACT',
  'IR_IN',
  'CTRL_DECODE',
  'ALU_ACTIVE',
  'ALU_OUT',
  'FLAGS_IN',
  'REG_A_IN',
  'REG_A_OUT',
  'REG_B_IN',
  'REG_B_OUT',
  'REG_C_IN',
  'REG_C_OUT',
  'REG_D_IN',
  'REG_D_OUT',
  'SP_INC',
  'SP_DEC',
];

export const ControlUnitModule: React.FC<ControlUnitModuleProps> = ({
  microStep,
  microStepIndex,
  cycleCount,
  instructionCount,
  currentInstructionName,
  explanationHu,
  explanationEn,
  controlLines,
}) => {
  const { language, t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      {/* Counters & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 bg-[#0A0B0E]/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-400">
              {language === 'hu' ? 'ÓRAJELCIKLUS' : 'CYCLES'}
            </div>
            <div className="font-mono text-sm font-bold text-slate-100">{cycleCount}</div>
          </div>
        </div>

        <div className="p-2 bg-[#0A0B0E]/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-400">
              {language === 'hu' ? 'UTASÍTÁSSZÁM' : 'INSTRUCTIONS'}
            </div>
            <div className="font-mono text-sm font-bold text-slate-100">{instructionCount}</div>
          </div>
        </div>

        <div className="p-2 bg-[#0A0B0E]/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-400">
              {language === 'hu' ? 'AKTÍV UTASÍTÁS' : 'CURRENT OPCODE'}
            </div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {currentInstructionName}
            </div>
          </div>
        </div>

        <div className="p-2 bg-[#0A0B0E]/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-400">
              {language === 'hu' ? 'AL-CIKLUS FÁZIS' : 'MICROSTEP PHASE'}
            </div>
            <div className="font-mono text-xs font-bold text-purple-300">
              {microStepIndex + 1} / 6
            </div>
          </div>
        </div>
      </div>

      {/* Live Explanation Banner */}
      <div className="p-3 bg-gradient-to-r from-cyan-950/40 via-[#0A0B0E] to-purple-950/40 rounded-xl border border-cyan-500/30">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {language === 'hu'
              ? 'Folyamatban lévő hardveres művelet:'
              : 'Active Hardware Operation:'}
          </span>
        </div>
        <p className="text-xs text-slate-100 font-medium leading-relaxed">
          {language === 'hu' ? explanationHu || explanationEn : explanationEn || explanationHu}
        </p>
      </div>

      {/* 6 Microstep Phase Progress Bar */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2">
          {t('cuMicroStepPhases')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {PHASES.map((phase, idx) => {
            const isActive = microStep === phase.id;
            const isPassed = idx < microStepIndex;

            return (
              <div
                key={phase.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/50'
                    : isPassed
                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-70'
                    : 'bg-[#0A0B0E]/40 border-slate-800/40 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className="truncate">
                    {language === 'hu' ? phase.nameHu : phase.nameEn}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">
                  {language === 'hu' ? phase.descHu : phase.descEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Control Lines Matrix */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>{t('cuActiveControlSignals')}</span>
          <span className="text-[9px] text-slate-500">
            {language === 'hu'
              ? `${controlLines.length} aktív jelvezeték`
              : `${controlLines.length} active lines`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-[#0A0B0E]/80 rounded-xl border border-slate-800">
          {ALL_CONTROL_LINES.map((sig) => {
            const isAsserted = controlLines.includes(sig);
            return (
              <span
                key={sig}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  isAsserted
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm shadow-cyan-500/20 animate-pulse'
                    : 'bg-slate-900/40 text-slate-600 border border-slate-800/50'
                }`}
              >
                {sig}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
