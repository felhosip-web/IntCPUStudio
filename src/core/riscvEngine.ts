import {
  ExStageState,
  IdStageState,
  IfStageState,
  MemStageState,
  PipelineCycleRecord,
  PipelineHazardState,
  RiscvAbiName,
  RiscvInstruction,
  RiscvPipelineState,
  RiscvRegisterInfo,
  RiscvRegisterName,
  RiscvSampleProgram,
  WbStageState,
} from '../types/riscv';

export const RISCV_ABI_MAP: { index: number; name: RiscvRegisterName; abi: RiscvAbiName; descHu: string; descEn: string }[] = [
  { index: 0, name: 'x0', abi: 'zero', descHu: 'Konstans nulla (hardveresen földelve)', descEn: 'Hardwired constant zero' },
  { index: 1, name: 'x1', abi: 'ra', descHu: 'Függvény visszatérési cím (Return Address)', descEn: 'Return Address' },
  { index: 2, name: 'x2', abi: 'sp', descHu: 'Veremmutató (Stack Pointer)', descEn: 'Stack Pointer' },
  { index: 3, name: 'x3', abi: 'gp', descHu: 'Globális mutató (Global Pointer)', descEn: 'Global Pointer' },
  { index: 4, name: 'x4', abi: 'tp', descHu: 'Szál mutató (Thread Pointer)', descEn: 'Thread Pointer' },
  { index: 5, name: 'x5', abi: 't0', descHu: 'Ideiglenes regiszter 0', descEn: 'Temporary register 0' },
  { index: 6, name: 'x6', abi: 't1', descHu: 'Ideiglenes regiszter 1', descEn: 'Temporary register 1' },
  { index: 7, name: 'x7', abi: 't2', descHu: 'Ideiglenes regiszter 2', descEn: 'Temporary register 2' },
  { index: 8, name: 'x8', abi: 's0/fp', descHu: 'Mentett regiszter 0 / Keretmutató (Frame Pointer)', descEn: 'Saved register 0 / Frame Pointer' },
  { index: 9, name: 'x9', abi: 's1', descHu: 'Mentett regiszter 1', descEn: 'Saved register 1' },
  { index: 10, name: 'x10', abi: 'a0', descHu: 'Függvény argumentum 0 / Visszatérési érték', descEn: 'Function argument 0 / Return value' },
  { index: 11, name: 'x11', abi: 'a1', descHu: 'Függvény argumentum 1 / Visszatérési érték', descEn: 'Function argument 1 / Return value' },
  { index: 12, name: 'x12', abi: 'a2', descHu: 'Függvény argumentum 2', descEn: 'Function argument 2' },
  { index: 13, name: 'x13', abi: 'a3', descHu: 'Függvény argumentum 3', descEn: 'Function argument 3' },
  { index: 14, name: 'x14', abi: 'a4', descHu: 'Függvény argumentum 4', descEn: 'Function argument 4' },
  { index: 15, name: 'x15', abi: 'a5', descHu: 'Függvény argumentum 5', descEn: 'Function argument 5' },
  { index: 16, name: 'x16', abi: 'a6', descHu: 'Függvény argumentum 6', descEn: 'Function argument 6' },
  { index: 17, name: 'x17', abi: 'a7', descHu: 'Függvény argumentum 7 / Rendszerhívás kód', descEn: 'Function argument 7 / Syscall ID' },
  { index: 18, name: 'x18', abi: 's2', descHu: 'Mentett regiszter 2', descEn: 'Saved register 2' },
  { index: 19, name: 'x19', abi: 's3', descHu: 'Mentett regiszter 3', descEn: 'Saved register 3' },
  { index: 20, name: 'x20', abi: 's4', descHu: 'Mentett regiszter 4', descEn: 'Saved register 4' },
  { index: 21, name: 'x21', abi: 's5', descHu: 'Mentett regiszter 5', descEn: 'Saved register 5' },
  { index: 22, name: 'x22', abi: 's6', descHu: 'Mentett regiszter 6', descEn: 'Saved register 6' },
  { index: 23, name: 'x23', abi: 's7', descHu: 'Mentett regiszter 7', descEn: 'Saved register 7' },
  { index: 24, name: 'x24', abi: 's8', descHu: 'Mentett regiszter 8', descEn: 'Saved register 8' },
  { index: 25, name: 'x25', abi: 's9', descHu: 'Mentett regiszter 9', descEn: 'Saved register 9' },
  { index: 26, name: 'x26', abi: 's10', descHu: 'Mentett regiszter 10', descEn: 'Saved register 10' },
  { index: 27, name: 'x27', abi: 's11', descHu: 'Mentett regiszter 11', descEn: 'Saved register 11' },
  { index: 28, name: 'x28', abi: 't3', descHu: 'Ideiglenes regiszter 3', descEn: 'Temporary register 3' },
  { index: 29, name: 'x29', abi: 't4', descHu: 'Ideiglenes regiszter 4', descEn: 'Temporary register 4' },
  { index: 30, name: 'x30', abi: 't5', descHu: 'Ideiglenes regiszter 5', descEn: 'Temporary register 5' },
  { index: 31, name: 'x31', abi: 't6', descHu: 'Ideiglenes regiszter 6', descEn: 'Temporary register 6' },
];

export const parseRiscvRegister = (str: string): number => {
  const clean = str.trim().toLowerCase();
  if (clean.startsWith('x')) {
    const num = parseInt(clean.slice(1), 10);
    if (!isNaN(num) && num >= 0 && num <= 31) return num;
  }
  const match = RISCV_ABI_MAP.find((r) => r.abi.toLowerCase() === clean || (r.abi.includes('/') && r.abi.toLowerCase().split('/').includes(clean)));
  if (match) return match.index;
  return 0;
};

export const getRegisterName = (idx: number): string => {
  if (idx >= 0 && idx < RISCV_ABI_MAP.length) {
    return `${RISCV_ABI_MAP[idx].abi} (${RISCV_ABI_MAP[idx].name})`;
  }
  return `x${idx}`;
};

export const RISCV_SAMPLE_PROGRAMS: RiscvSampleProgram[] = [
  {
    id: 'fibonacci',
    titleHu: '1. Fibonacci Sorozat Számítás (RV32I)',
    titleEn: '1. Fibonacci Sequence Generator (RV32I)',
    descHu: 'Klasszikus Fibonacci számítás t0, t1, t2 regiszterekkel és ciklussal. Bemutatja a regiszteres adatfüggőséget és az elágazást.',
    descEn: 'Classic Fibonacci generator using t0, t1, t2 registers in a loop. Demonstrates register data dependency and branching.',
    code: `# Fibonacci sorozat szamitas RV32I
# Inicializalas
ADDI t0, zero, 0    # Fib(0) = 0
ADDI t1, zero, 1    # Fib(1) = 1
ADDI a0, zero, 8    # Ciklusszam (N = 8)
ADDI a1, zero, 0    # Ciklusszamlalo i = 0

loop:
ADD t2, t0, t1      # t2 = Fib(i) + Fib(i+1)
ADD t0, zero, t1    # t0 = t1
ADD t1, zero, t2    # t1 = t2
ADDI a1, a1, 1      # i++
BLT a1, a0, loop    # if (i < N) goto loop

# Eredmeny eltarolasa a memoriaba
SW t2, 0(zero)      # RAM[0] = Fib(8)
`,
  },
  {
    id: 'hazard_forwarding',
    titleHu: '2. Adat-előrehozás (Data Forwarding & Bypass) Demo',
    titleEn: '2. Data Forwarding & Bypass Demo',
    descHu: 'Közvetlen egymás utáni adatfüggőségek (RAW). Bekapcsolt Forwarding egységgel 0 stall ciklus keletkezik!',
    descEn: 'Back-to-back RAW data dependencies. With Forwarding Unit enabled, executes with zero stall cycles!',
    code: `# Data Forwarding & ALU Bypass Demo
ADDI t0, zero, 10   # t0 = 10 (WB fázisban ír vissza)
ADD  t1, t0, t0     # RAW: t1 azonnal hasznalja t0-t (EX/MEM Forwarding!)
ADD  t2, t1, t0     # RAW: t2 hasznalja t1-et es t0-t (MEM/WB Forwarding!)
SUB  t3, t2, t1     # RAW: t3 hasznalja t2-t
SW   t3, 4(zero)    # RAM[4] = t3
`,
  },
  {
    id: 'load_use_hazard',
    titleHu: '3. Load-Use Adatütközés és Buborék (Stall)',
    titleEn: '3. Load-Use Data Hazard & Bubble Stall',
    descHu: 'A memóriából betöltött adat (LW) csak a MEM fázis után áll rendelkezésre. A processzor automatikusan beszúr egy NOP buborékot.',
    descEn: 'Memory loaded data (LW) is only available after MEM stage. CPU automatically inserts a 1-cycle NOP bubble.',
    code: `# Load-Use Hazard & Pipeline Stall Demo
ADDI t0, zero, 42
SW   t0, 8(zero)     # RAM[8] = 42
LW   t1, 8(zero)     # t1 betoltese a memoriabol (MEM fazisban erkezik!)
ADD  t2, t1, t0      # <-- LOAD-USE HAZARD! 1 ciklus STALL (Buborek) szukseges
ADDI t3, t2, 1       # Tovabbi vegrehajtas
`,
  },
  {
    id: 'branch_flush',
    titleHu: '4. Elágazás Vezérlési Ütközés & Flush (Kiürítés)',
    titleEn: '4. Branch Control Hazard & Pipeline Flush',
    descHu: 'Feltételes ugrás teljesülésekor az IF és ID fázisban már lehívott helytelen utasítások kiürítésre (FLUSH) kerülnek.',
    descEn: 'When a conditional branch is taken, speculative instructions fetched into IF/ID are flushed with NOP bubbles.',
    code: `# Branch Flush & Control Hazard Demo
ADDI t0, zero, 5
ADDI t1, zero, 5
BEQ  t0, t1, target  # Elagazas teljesul! (Branch Taken az EX fazisban)
ADDI s0, zero, 999   # Ez az utasitas KIORLESRE KERUL (FLUSH!)
ADDI s1, zero, 999   # Ez az utasitas szinten FLUSH!

target:
ADDI a0, zero, 100   # Sikeres ugras celpontja
SW   a0, 12(zero)
`,
  },
];

export const parseRiscvAssembly = (code: string): RiscvInstruction[] => {
  const lines = code.split('\n');
  const instructions: RiscvInstruction[] = [];
  const labelAddresses: Record<string, number> = {};

  let currentAddr = 0;

  // Pass 1: find labels
  for (const rawLine of lines) {
    let line = rawLine.split('#')[0].trim();
    if (!line) continue;

    if (line.includes(':')) {
      const parts = line.split(':');
      const label = parts[0].trim();
      labelAddresses[label] = currentAddr;
      line = parts.slice(1).join(':').trim();
      if (!line) continue;
    }
    currentAddr += 4;
  }

  // Pass 2: generate instructions
  currentAddr = 0;
  for (const rawLine of lines) {
    let line = rawLine.split('#')[0].trim();
    const comment = rawLine.includes('#') ? rawLine.split('#').slice(1).join('#').trim() : undefined;
    if (!line) continue;

    if (line.includes(':')) {
      line = line.split(':').slice(1).join(':').trim();
      if (!line) continue;
    }

    const tokens = line.split(/[\s,()]+/).filter(Boolean);
    if (tokens.length === 0) continue;

    const mnemonic = tokens[0].toUpperCase();
    const operands = line.substring(tokens[0].length).trim();

    let inst: RiscvInstruction = {
      address: currentAddr,
      raw: 0,
      mnemonic,
      operands,
      type: 'I',
      opcode: 0x13,
      comment,
    };

    if (mnemonic === 'ADDI') {
      const rd = parseRiscvRegister(tokens[1]);
      const rs1 = parseRiscvRegister(tokens[2]);
      const imm = parseInt(tokens[3], 10) || 0;
      inst = { ...inst, type: 'I', opcode: 0x13, rd, rs1, imm, funct3: 0 };
    } else if (mnemonic === 'ADD' || mnemonic === 'SUB' || mnemonic === 'AND' || mnemonic === 'OR' || mnemonic === 'XOR' || mnemonic === 'SLL' || mnemonic === 'SRL' || mnemonic === 'SLT') {
      const rd = parseRiscvRegister(tokens[1]);
      const rs1 = parseRiscvRegister(tokens[2]);
      const rs2 = parseRiscvRegister(tokens[3]);
      let funct3 = 0;
      let funct7 = 0;
      if (mnemonic === 'SUB') funct7 = 0x20;
      if (mnemonic === 'AND') funct3 = 0x7;
      if (mnemonic === 'OR') funct3 = 0x6;
      if (mnemonic === 'XOR') funct3 = 0x4;
      if (mnemonic === 'SLL') funct3 = 0x1;
      if (mnemonic === 'SRL') funct3 = 0x5;
      if (mnemonic === 'SLT') funct3 = 0x2;
      inst = { ...inst, type: 'R', opcode: 0x33, rd, rs1, rs2, funct3, funct7 };
    } else if (mnemonic === 'LW') {
      const rd = parseRiscvRegister(tokens[1]);
      const imm = parseInt(tokens[2], 10) || 0;
      const rs1 = parseRiscvRegister(tokens[3] || 'zero');
      inst = { ...inst, type: 'I', opcode: 0x03, rd, rs1, imm, funct3: 0x2 };
    } else if (mnemonic === 'SW') {
      const rs2 = parseRiscvRegister(tokens[1]);
      const imm = parseInt(tokens[2], 10) || 0;
      const rs1 = parseRiscvRegister(tokens[3] || 'zero');
      inst = { ...inst, type: 'S', opcode: 0x23, rs1, rs2, imm, funct3: 0x2 };
    } else if (mnemonic === 'BEQ' || mnemonic === 'BNE' || mnemonic === 'BLT' || mnemonic === 'BGE') {
      const rs1 = parseRiscvRegister(tokens[1]);
      const rs2 = parseRiscvRegister(tokens[2]);
      const targetLabel = tokens[3];
      let targetAddr = labelAddresses[targetLabel] ?? (parseInt(targetLabel, 10) || currentAddr + 4);
      let imm = targetAddr - currentAddr;
      let funct3 = 0;
      if (mnemonic === 'BNE') funct3 = 0x1;
      if (mnemonic === 'BLT') funct3 = 0x4;
      if (mnemonic === 'BGE') funct3 = 0x5;
      inst = { ...inst, type: 'B', opcode: 0x63, rs1, rs2, imm, funct3 };
    } else if (mnemonic === 'JAL') {
      const rd = parseRiscvRegister(tokens[1]);
      const targetLabel = tokens[2];
      let targetAddr = labelAddresses[targetLabel] ?? (parseInt(targetLabel, 10) || currentAddr + 4);
      let imm = targetAddr - currentAddr;
      inst = { ...inst, type: 'J', opcode: 0x6f, rd, imm };
    } else if (mnemonic === 'NOP') {
      inst = { ...inst, type: 'I', opcode: 0x13, rd: 0, rs1: 0, imm: 0, funct3: 0 };
    }

    instructions.push(inst);
    currentAddr += 4;
  }

  return instructions;
};

export const createInitialRiscvState = (): RiscvPipelineState => {
  return {
    cycle: 0,
    pc: 0,
    registers: new Array(32).fill(0),
    memory: new Uint32Array(256), // 1KB RAM
    ifStage: { pc: 0, nextPc: 4, instruction: null, isStalled: false, isFlushed: false },
    idStage: { pc: 0, instruction: null, rs1Val: 0, rs2Val: 0, immVal: 0, isStalled: false, isFlushed: false },
    exStage: {
      pc: 0,
      instruction: null,
      aluResult: 0,
      branchTaken: false,
      branchTarget: 0,
      forwardA: 'NONE',
      forwardB: 'NONE',
      forwardValA: 0,
      forwardValB: 0,
      isStalled: false,
      isFlushed: false,
    },
    memStage: { pc: 0, instruction: null, aluResult: 0, readData: 0, writeData: 0, memRead: false, memWrite: false },
    wbStage: { pc: 0, instruction: null, destReg: 0, destVal: 0, regWrite: false },
    hazard: {
      dataHazardDetected: false,
      loadUseHazard: false,
      controlHazard: false,
      branchMispredicted: false,
      forwardAppliedA: false,
      forwardAppliedB: false,
      descriptionHu: 'Minden futószalag fokozat normálisan üzemel.',
      descriptionEn: 'All pipeline stages operating normally.',
    },
    enableForwarding: true,
    enableBranchPrediction: false,
    history: [],
    instructionsExecuted: 0,
    stallsCount: 0,
    flushesCount: 0,
    isRunning: false,
    isHalted: false,
  };
};

export const stepRiscvPipeline = (
  state: RiscvPipelineState,
  program: RiscvInstruction[]
): RiscvPipelineState => {
  const next = {
    ...state,
    registers: [...state.registers],
    memory: new Uint32Array(state.memory),
    cycle: state.cycle + 1,
    hazard: { ...state.hazard, dataHazardDetected: false, loadUseHazard: false, controlHazard: false, branchMispredicted: false, forwardAppliedA: false, forwardAppliedB: false },
  };

  // 1. WB Stage (Write Back)
  if (state.wbStage.instruction && state.wbStage.regWrite && state.wbStage.destReg !== 0) {
    next.registers[state.wbStage.destReg] = state.wbStage.destVal >>> 0;
    next.instructionsExecuted++;
  }
  // Register x0 is always hardwired to 0
  next.registers[0] = 0;

  // 2. MEM Stage (Memory Access)
  const nextWbStage: WbStageState = {
    pc: state.memStage.pc,
    instruction: state.memStage.instruction,
    destReg: state.memStage.instruction?.rd ?? 0,
    destVal: 0,
    regWrite: false,
  };

  if (state.memStage.instruction) {
    const inst = state.memStage.instruction;
    if (inst.mnemonic === 'LW') {
      const wordAddr = Math.floor((state.memStage.aluResult & 0x3fc) / 4);
      const readVal = next.memory[wordAddr] || 0;
      nextWbStage.destVal = readVal;
      nextWbStage.regWrite = true;
    } else if (inst.mnemonic === 'SW') {
      const wordAddr = Math.floor((state.memStage.aluResult & 0x3fc) / 4);
      next.memory[wordAddr] = state.memStage.writeData >>> 0;
      nextWbStage.regWrite = false;
    } else if (inst.rd && inst.rd !== 0) {
      nextWbStage.destVal = state.memStage.aluResult;
      nextWbStage.regWrite = true;
    }
  }

  // 3. EX Stage (Execute & Branch Target Evaluation)
  let branchTaken = false;
  let branchTarget = 0;
  const nextMemStage: MemStageState = {
    pc: state.exStage.pc,
    instruction: state.exStage.instruction,
    aluResult: 0,
    readData: 0,
    writeData: 0,
    memRead: false,
    memWrite: false,
  };

  if (state.exStage.instruction) {
    const inst = state.exStage.instruction;
    let opA = state.exStage.forwardValA;
    let opB = state.exStage.forwardValB;

    if (inst.mnemonic === 'ADDI') {
      nextMemStage.aluResult = (opA + (inst.imm ?? 0)) | 0;
    } else if (inst.mnemonic === 'ADD') {
      nextMemStage.aluResult = (opA + opB) | 0;
    } else if (inst.mnemonic === 'SUB') {
      nextMemStage.aluResult = (opA - opB) | 0;
    } else if (inst.mnemonic === 'AND') {
      nextMemStage.aluResult = opA & opB;
    } else if (inst.mnemonic === 'OR') {
      nextMemStage.aluResult = opA | opB;
    } else if (inst.mnemonic === 'XOR') {
      nextMemStage.aluResult = opA ^ opB;
    } else if (inst.mnemonic === 'SLL') {
      nextMemStage.aluResult = (opA << (opB & 0x1f)) | 0;
    } else if (inst.mnemonic === 'SRL') {
      nextMemStage.aluResult = (opA >>> (opB & 0x1f)) | 0;
    } else if (inst.mnemonic === 'SLT') {
      nextMemStage.aluResult = (opA | 0) < (opB | 0) ? 1 : 0;
    } else if (inst.mnemonic === 'LW') {
      nextMemStage.aluResult = (opA + (inst.imm ?? 0)) | 0;
      nextMemStage.memRead = true;
    } else if (inst.mnemonic === 'SW') {
      nextMemStage.aluResult = (opA + (inst.imm ?? 0)) | 0;
      nextMemStage.writeData = opB;
      nextMemStage.memWrite = true;
    } else if (inst.mnemonic === 'BEQ') {
      if (opA === opB) {
        branchTaken = true;
        branchTarget = state.exStage.pc + (inst.imm ?? 0);
      }
    } else if (inst.mnemonic === 'BNE') {
      if (opA !== opB) {
        branchTaken = true;
        branchTarget = state.exStage.pc + (inst.imm ?? 0);
      }
    } else if (inst.mnemonic === 'BLT') {
      if ((opA | 0) < (opB | 0)) {
        branchTaken = true;
        branchTarget = state.exStage.pc + (inst.imm ?? 0);
      }
    } else if (inst.mnemonic === 'BGE') {
      if ((opA | 0) >= (opB | 0)) {
        branchTaken = true;
        branchTarget = state.exStage.pc + (inst.imm ?? 0);
      }
    }
  }

  // 4. Hazard Detection Unit (Load-Use Check)
  let isLoadUseHazard = false;
  if (
    state.exStage.instruction?.mnemonic === 'LW' &&
    state.idStage.instruction &&
    state.exStage.instruction.rd !== undefined &&
    state.exStage.instruction.rd !== 0 &&
    (state.idStage.instruction.rs1 === state.exStage.instruction.rd ||
      state.idStage.instruction.rs2 === state.exStage.instruction.rd)
  ) {
    isLoadUseHazard = true;
    next.hazard.loadUseHazard = true;
    next.hazard.dataHazardDetected = true;
    next.stallsCount++;
    next.hazard.descriptionHu = `⚠️ Load-Use adatütközés (x${state.exStage.instruction.rd})! 1 buborék (NOP) beillesztve a futószalagba.`;
    next.hazard.descriptionEn = `⚠️ Load-Use Data Hazard on x${state.exStage.instruction.rd}! 1 bubble stall (NOP) injected into pipeline.`;
  }

  // 5. Forwarding Unit (Bypass Logic into EX)
  let nextExStage: ExStageState = {
    pc: state.idStage.pc,
    instruction: isLoadUseHazard ? null : state.idStage.instruction,
    aluResult: 0,
    branchTaken: false,
    branchTarget: 0,
    forwardA: 'NONE',
    forwardB: 'NONE',
    forwardValA: state.idStage.rs1Val,
    forwardValB: state.idStage.rs2Val,
    isStalled: isLoadUseHazard,
    isFlushed: branchTaken,
  };

  if (!isLoadUseHazard && state.idStage.instruction) {
    const rs1 = state.idStage.instruction.rs1;
    const rs2 = state.idStage.instruction.rs2;
    let opA = state.idStage.rs1Val;
    let opB = state.idStage.rs2Val;

    // Check Forwarding for RS1
    if (rs1 !== undefined && rs1 !== 0 && state.enableForwarding) {
      // EX/MEM hazard
      if (nextMemStage.instruction?.rd === rs1 && nextMemStage.instruction.rd !== 0 && nextMemStage.instruction.mnemonic !== 'SW') {
        opA = nextMemStage.aluResult;
        nextExStage.forwardA = 'EX_MEM';
        next.hazard.forwardAppliedA = true;
      }
      // MEM/WB hazard
      else if (nextWbStage.destReg === rs1 && nextWbStage.regWrite && nextWbStage.destReg !== 0) {
        opA = nextWbStage.destVal;
        nextExStage.forwardA = 'MEM_WB';
        next.hazard.forwardAppliedA = true;
      }
    }

    // Check Forwarding for RS2
    if (rs2 !== undefined && rs2 !== 0 && state.enableForwarding) {
      // EX/MEM hazard
      if (nextMemStage.instruction?.rd === rs2 && nextMemStage.instruction.rd !== 0 && nextMemStage.instruction.mnemonic !== 'SW') {
        opB = nextMemStage.aluResult;
        nextExStage.forwardB = 'EX_MEM';
        next.hazard.forwardAppliedB = true;
      }
      // MEM/WB hazard
      else if (nextWbStage.destReg === rs2 && nextWbStage.regWrite && nextWbStage.destReg !== 0) {
        opB = nextWbStage.destVal;
        nextExStage.forwardB = 'MEM_WB';
        next.hazard.forwardAppliedB = true;
      }
    }

    nextExStage.forwardValA = opA;
    nextExStage.forwardValB = opB;
  }

  // 6. ID Stage (Decode)
  const nextIdStage: IdStageState = {
    pc: state.ifStage.pc,
    instruction: branchTaken ? null : (isLoadUseHazard ? state.idStage.instruction : state.ifStage.instruction),
    rs1Val: 0,
    rs2Val: 0,
    immVal: 0,
    isStalled: isLoadUseHazard,
    isFlushed: branchTaken,
  };

  const idInst = isLoadUseHazard ? state.idStage.instruction : state.ifStage.instruction;
  if (idInst && !branchTaken) {
    const rs1 = idInst.rs1 ?? 0;
    const rs2 = idInst.rs2 ?? 0;
    nextIdStage.rs1Val = rs1 === 0 ? 0 : next.registers[rs1];
    nextIdStage.rs2Val = rs2 === 0 ? 0 : next.registers[rs2];
    nextIdStage.immVal = idInst.imm ?? 0;
  }

  // 7. IF Stage (Fetch)
  let nextPc = state.pc;
  if (branchTaken) {
    nextPc = branchTarget;
    next.hazard.controlHazard = true;
    next.hazard.branchMispredicted = true;
    next.flushesCount += 2;
    next.hazard.descriptionHu = `⚡ Elágazás teljesült (PC -> 0x${branchTarget.toString(16).toUpperCase()})! IF és ID fázisok kiürítve (FLUSH).`;
    next.hazard.descriptionEn = `⚡ Branch Taken (PC -> 0x${branchTarget.toString(16).toUpperCase()})! IF & ID stages flushed.`;
  } else if (!isLoadUseHazard) {
    nextPc = state.pc + 4;
  }

  const fetchedInst = program.find((p) => p.address === state.pc) || null;
  const nextIfStage: IfStageState = {
    pc: state.pc,
    nextPc: nextPc,
    instruction: branchTaken ? null : (isLoadUseHazard ? state.ifStage.instruction : fetchedInst),
    isStalled: isLoadUseHazard,
    isFlushed: branchTaken,
  };

  if (branchTaken) {
    // Flush IF and ID
    nextIfStage.instruction = null;
    nextIdStage.instruction = null;
  }

  // History tracking
  const fmtInst = (inst: RiscvInstruction | null) => (inst ? `${inst.mnemonic} ${inst.operands}` : '— (NOP)');
  const record: PipelineCycleRecord = {
    cycle: next.cycle,
    ifInst: fmtInst(nextIfStage.instruction),
    idInst: fmtInst(nextIdStage.instruction),
    exInst: fmtInst(nextExStage.instruction),
    memInst: fmtInst(nextMemStage.instruction),
    wbInst: fmtInst(nextWbStage.instruction),
  };

  const newHistory = [record, ...state.history.slice(0, 15)];

  // Check if finished
  const isPipelineEmpty =
    !nextIfStage.instruction &&
    !nextIdStage.instruction &&
    !nextExStage.instruction &&
    !nextMemStage.instruction &&
    !nextWbStage.instruction;

  return {
    ...next,
    pc: nextPc,
    ifStage: nextIfStage,
    idStage: nextIdStage,
    exStage: nextExStage,
    memStage: nextMemStage,
    wbStage: nextWbStage,
    history: newHistory,
    isHalted: isPipelineEmpty && nextPc >= program.length * 4,
    isRunning: isPipelineEmpty && nextPc >= program.length * 4 ? false : state.isRunning,
  };
};
