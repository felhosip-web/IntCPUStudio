import {
  ControlSignalMeta,
  CustomInstructionDraft,
  HardwareControlSignal,
  MicrocodeSimulationState,
  MicroInstructionStep,
  OpcodeMicrocodeEntry,
} from '../types/microcode';

export const CONTROL_SIGNALS_CATALOG: ControlSignalMeta[] = [
  // Bus & PC
  {
    id: 'PC_OUT',
    name: 'PC_OUT (CO)',
    category: 'BUS',
    descriptionHu: 'A Program Counter értéke a címbuszra kerül.',
    descriptionEn: 'Program Counter value output onto address bus.',
    color: '#818CF8', // Indigo
  },
  {
    id: 'PC_INC',
    name: 'PC_INC (CE)',
    category: 'BUS',
    descriptionHu: 'A Program Counter növelése 1-gyel (PC = PC + 1).',
    descriptionEn: 'Program Counter increment by 1 (PC = PC + 1).',
    color: '#6366F1',
  },
  {
    id: 'PC_LD',
    name: 'PC_LD (J)',
    category: 'BUS',
    descriptionHu: 'A Program Counter betöltése az adatbuszról (Ugrás).',
    descriptionEn: 'Load Program Counter from data bus (Jump).',
    color: '#4F46E5',
  },
  {
    id: 'MAR_IN',
    name: 'MAR_IN (MI)',
    category: 'BUS',
    descriptionHu: 'Memóriacím Regiszter (MAR) betöltése a címbuszról.',
    descriptionEn: 'Memory Address Register (MAR) load from address bus.',
    color: '#A855F7', // Purple
  },
  {
    id: 'MEM_RD',
    name: 'MEM_RD (RO)',
    category: 'BUS',
    descriptionHu: 'RAM olvasás: a MAR által címzett bájt az adatbuszra kerül.',
    descriptionEn: 'RAM read: byte at address MAR placed on data bus.',
    color: '#EC4899', // Pink
  },
  {
    id: 'MEM_WR',
    name: 'MEM_WR (RI)',
    category: 'BUS',
    descriptionHu: 'RAM írás: az adatbuszon lévő bájt a RAM[MAR]-ba íródik.',
    descriptionEn: 'RAM write: byte on data bus written into RAM[MAR].',
    color: '#F43F5E', // Rose
  },
  {
    id: 'MBR_IN',
    name: 'MBR_IN',
    category: 'BUS',
    descriptionHu: 'Memória Puffer Regiszter (MBR) betöltése az adatbuszról.',
    descriptionEn: 'Memory Buffer Register (MBR) load from data bus.',
    color: '#FB923C',
  },
  {
    id: 'MBR_OUT',
    name: 'MBR_OUT',
    category: 'BUS',
    descriptionHu: 'MBR regiszter tartalmának kiadása az adatbuszra.',
    descriptionEn: 'Output MBR register content onto data bus.',
    color: '#F97316',
  },
  {
    id: 'IR_IN',
    name: 'IR_IN (II)',
    category: 'BUS',
    descriptionHu: 'Utasítás Regiszter (IR) betöltése az adatbuszról.',
    descriptionEn: 'Instruction Register (IR) load from data bus.',
    color: '#06B6D4', // Cyan
  },

  // General Registers
  {
    id: 'REG_A_IN',
    name: 'REG_A_IN (AI)',
    category: 'REGISTERS',
    descriptionHu: 'Akkumulátor (A) betöltése az adatbuszról.',
    descriptionEn: 'Load Accumulator (A) from data bus.',
    color: '#10B981', // Emerald
  },
  {
    id: 'REG_A_OUT',
    name: 'REG_A_OUT (AO)',
    category: 'REGISTERS',
    descriptionHu: 'Akkumulátor (A) értéke az adatbuszra kerül.',
    descriptionEn: 'Output Accumulator (A) value onto data bus.',
    color: '#059669',
  },
  {
    id: 'REG_B_IN',
    name: 'REG_B_IN (BI)',
    category: 'REGISTERS',
    descriptionHu: 'B regiszter betöltése az adatbuszról.',
    descriptionEn: 'Load Register B from data bus.',
    color: '#14B8A6', // Teal
  },
  {
    id: 'REG_B_OUT',
    name: 'REG_B_OUT (BO)',
    category: 'REGISTERS',
    descriptionHu: 'B regiszter értéke az adatbuszra kerül.',
    descriptionEn: 'Output Register B value onto data bus.',
    color: '#0D9488',
  },
  {
    id: 'REG_C_IN',
    name: 'REG_C_IN',
    category: 'REGISTERS',
    descriptionHu: 'C számláló regiszter betöltése az adatbuszról.',
    descriptionEn: 'Load Counter Register C from data bus.',
    color: '#3B82F6', // Blue
  },
  {
    id: 'REG_C_OUT',
    name: 'REG_C_OUT',
    category: 'REGISTERS',
    descriptionHu: 'C regiszter értéke az adatbuszra kerül.',
    descriptionEn: 'Output Register C value onto data bus.',
    color: '#2563EB',
  },
  {
    id: 'REG_D_IN',
    name: 'REG_D_IN',
    category: 'REGISTERS',
    descriptionHu: 'D adatregiszter betöltése az adatbuszról.',
    descriptionEn: 'Load Data Register D from data bus.',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'REG_D_OUT',
    name: 'REG_D_OUT',
    category: 'REGISTERS',
    descriptionHu: 'D regiszter értéke az adatbuszra kerül.',
    descriptionEn: 'Output Register D value onto data bus.',
    color: '#7C3AED',
  },

  // ALU Control
  {
    id: 'ALU_ADD',
    name: 'ALU_ADD (EO)',
    category: 'ALU',
    descriptionHu: 'ALU összeadás (A + B) végrehajtása és buszra küldése.',
    descriptionEn: 'ALU execute addition (A + B) and output to bus.',
    color: '#EAB308', // Amber
  },
  {
    id: 'ALU_SUB',
    name: 'ALU_SUB (SU)',
    category: 'ALU',
    descriptionHu: 'ALU kivonás (A - B) végrehajtása és buszra küldése.',
    descriptionEn: 'ALU execute subtraction (A - B) and output to bus.',
    color: '#CA8A04',
  },
  {
    id: 'ALU_AND',
    name: 'ALU_AND',
    category: 'ALU',
    descriptionHu: 'ALU bitenkénti ÉS művelet (A & B).',
    descriptionEn: 'ALU bitwise AND operation (A & B).',
    color: '#F59E0B',
  },
  {
    id: 'ALU_OR',
    name: 'ALU_OR',
    category: 'ALU',
    descriptionHu: 'ALU bitenkénti VAGY művelet (A | B).',
    descriptionEn: 'ALU bitwise OR operation (A | B).',
    color: '#D97706',
  },
  {
    id: 'ALU_XOR',
    name: 'ALU_XOR',
    category: 'ALU',
    descriptionHu: 'ALU bitenkénti KIZÁRÓ VAGY művelet (A ^ B).',
    descriptionEn: 'ALU bitwise XOR operation (A ^ B).',
    color: '#B45309',
  },
  {
    id: 'ALU_NOT',
    name: 'ALU_NOT',
    category: 'ALU',
    descriptionHu: 'ALU bitenkénti invertálás (~A).',
    descriptionEn: 'ALU bitwise NOT operation (~A).',
    color: '#FBBF24',
  },
  {
    id: 'ALU_SHL',
    name: 'ALU_SHL',
    category: 'ALU',
    descriptionHu: 'ALU logikai balra léptetés (A << 1).',
    descriptionEn: 'ALU logical shift left (A << 1).',
    color: '#FDE047',
  },
  {
    id: 'ALU_SHR',
    name: 'ALU_SHR',
    category: 'ALU',
    descriptionHu: 'ALU logikai jobbra léptetés (A >> 1).',
    descriptionEn: 'ALU logical shift right (A >> 1).',
    color: '#FEF08A',
  },
  {
    id: 'ALU_CMP',
    name: 'ALU_CMP',
    category: 'ALU',
    descriptionHu: 'ALU összehasonlítás (A - B eredmény nélkül, csak flag frissítés).',
    descriptionEn: 'ALU compare (A - B without storing result, flags only).',
    color: '#FACC15',
  },
  {
    id: 'FLAGS_EN',
    name: 'FLAGS_EN (FI)',
    category: 'ALU',
    descriptionHu: 'ALU állapotbitek (Z, C, N, V) beírása a Flag regiszterbe.',
    descriptionEn: 'Enable updating Status Flags (Z, C, N, V) from ALU.',
    color: '#E11D48',
  },

  // Stack & Misc
  {
    id: 'SP_INC',
    name: 'SP_INC',
    category: 'STACK',
    descriptionHu: 'Veremmutató (SP) növelése (POP műveletnél).',
    descriptionEn: 'Increment Stack Pointer (POP operation).',
    color: '#0284C7',
  },
  {
    id: 'SP_DEC',
    name: 'SP_DEC',
    category: 'STACK',
    descriptionHu: 'Veremmutató (SP) csökkentése (PUSH műveletnél).',
    descriptionEn: 'Decrement Stack Pointer (PUSH operation).',
    color: '#0369A1',
  },
  {
    id: 'IO_RD',
    name: 'IO_RD (IN)',
    category: 'IO_CTRL',
    descriptionHu: 'I/O Periféria olvasása az adatbuszra.',
    descriptionEn: 'Read I/O Peripheral port onto data bus.',
    color: '#84CC16',
  },
  {
    id: 'IO_WR',
    name: 'IO_WR (OUT)',
    category: 'IO_CTRL',
    descriptionHu: 'Adatbusz kiírása az I/O Periféria portra.',
    descriptionEn: 'Write data bus byte to I/O Peripheral port.',
    color: '#65A30D',
  },
  {
    id: 'HLT',
    name: 'HLT',
    category: 'IO_CTRL',
    descriptionHu: 'Processzor leállítása (Órajel generátor felfüggesztése).',
    descriptionEn: 'Halt CPU execution (stop clock generator).',
    color: '#EF4444',
  },
  {
    id: 'STEP_RST',
    name: 'STEP_RST',
    category: 'IO_CTRL',
    descriptionHu: 'Mikrolépés számláló nullázása (visszatérés T0-ra).',
    descriptionEn: 'Reset microstep counter back to T0.',
    color: '#94A3B8',
  },
];

export const STANDARD_OPCODE_MICROCODE: OpcodeMicrocodeEntry[] = [
  {
    opcode: 0x01,
    mnemonic: 'MOV A, B',
    isStandard: true,
    isCustom: false,
    category: 'DATA_TRANSFER',
    operandsDesc: 'Reg <- Reg',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'RAM olvasása az Utasítás Regiszterbe, PC++', descriptionEn: 'RAM read to IR, PC increment' },
      { step: 2, stepNameHu: 'T2: Dekódolás', stepNameEn: 'T2: Decode', activeSignals: [], descriptionHu: 'Opcode dekódolása', descriptionEn: 'Opcode decode' },
      { step: 3, stepNameHu: 'T3: Átvitel', stepNameEn: 'T3: Transfer', activeSignals: ['REG_B_OUT', 'REG_A_IN', 'STEP_RST'], descriptionHu: 'B regiszter az adatbuszra, A regiszter beolvassa', descriptionEn: 'Register B out to bus, Register A in' },
      { step: 4, stepNameHu: 'T4: NOP', stepNameEn: 'T4: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x02,
    mnemonic: 'ADD A, B',
    isStandard: true,
    isCustom: false,
    category: 'ARITHMETIC',
    operandsDesc: 'A <- A + B',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'RAM olvasása az Utasítás Regiszterbe, PC++', descriptionEn: 'RAM read to IR, PC increment' },
      { step: 2, stepNameHu: 'T2: Dekódolás', stepNameEn: 'T2: Decode', activeSignals: [], descriptionHu: 'Opcode dekódolása', descriptionEn: 'Opcode decode' },
      { step: 3, stepNameHu: 'T3: ALU Művelet', stepNameEn: 'T3: ALU Exec', activeSignals: ['ALU_ADD', 'REG_A_IN', 'FLAGS_EN', 'STEP_RST'], descriptionHu: 'ALU kiszámolja az A+B-t, visszaírja A-ba és frissíti a flag-eket', descriptionEn: 'ALU computes A+B, writes into A, updates flags' },
      { step: 4, stepNameHu: 'T4: NOP', stepNameEn: 'T4: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x03,
    mnemonic: 'SUB A, B',
    isStandard: true,
    isCustom: false,
    category: 'ARITHMETIC',
    operandsDesc: 'A <- A - B',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'RAM olvasása az Utasítás Regiszterbe, PC++', descriptionEn: 'RAM read to IR, PC increment' },
      { step: 2, stepNameHu: 'T2: Dekódolás', stepNameEn: 'T2: Decode', activeSignals: [], descriptionHu: 'Opcode dekódolása', descriptionEn: 'Opcode decode' },
      { step: 3, stepNameHu: 'T3: ALU Kivonás', stepNameEn: 'T3: ALU Sub', activeSignals: ['ALU_SUB', 'REG_A_IN', 'FLAGS_EN', 'STEP_RST'], descriptionHu: 'ALU kiszámolja az A-B-t, visszaírja A-ba és frissíti a flag-eket', descriptionEn: 'ALU computes A-B, writes into A, updates flags' },
      { step: 4, stepNameHu: 'T4: NOP', stepNameEn: 'T4: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x04,
    mnemonic: 'LDA [addr]',
    isStandard: true,
    isCustom: false,
    category: 'DATA_TRANSFER',
    operandsDesc: 'A <- RAM[addr]',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'Utasítás lehívása, PC++', descriptionEn: 'Instruction fetch, PC++' },
      { step: 2, stepNameHu: 'T2: Operandus Címzés', stepNameEn: 'T2: Operand Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC (operandus címe) a MAR-ba', descriptionEn: 'PC to MAR' },
      { step: 3, stepNameHu: 'T3: Cím Lehívás & PC+1', stepNameEn: 'T3: Addr Fetch & PC+1', activeSignals: ['MEM_RD', 'MAR_IN', 'PC_INC'], descriptionHu: 'A memóriacím közvetlenül a MAR-ba kerül, PC++', descriptionEn: 'Target address directly into MAR, PC++' },
      { step: 4, stepNameHu: 'T4: Adat Beolvasása', stepNameEn: 'T4: Data Read', activeSignals: ['MEM_RD', 'REG_A_IN', 'STEP_RST'], descriptionHu: 'A megcímzett adat beolvasása az Akkumulátorba', descriptionEn: 'Read memory data into Accumulator' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x05,
    mnemonic: 'STA [addr]',
    isStandard: true,
    isCustom: false,
    category: 'DATA_TRANSFER',
    operandsDesc: 'RAM[addr] <- A',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'Utasítás lehívása, PC++', descriptionEn: 'Instruction fetch, PC++' },
      { step: 2, stepNameHu: 'T2: Operandus Címzés', stepNameEn: 'T2: Operand Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a MAR-ba', descriptionEn: 'PC to MAR' },
      { step: 3, stepNameHu: 'T3: Cím Lehívás & PC+1', stepNameEn: 'T3: Addr Fetch & PC+1', activeSignals: ['MEM_RD', 'MAR_IN', 'PC_INC'], descriptionHu: 'Célcím a MAR-ba, PC++', descriptionEn: 'Target address to MAR, PC++' },
      { step: 4, stepNameHu: 'T4: Adat Kiírás', stepNameEn: 'T4: Data Write', activeSignals: ['REG_A_OUT', 'MEM_WR', 'STEP_RST'], descriptionHu: 'Akkumulátor kiírása a RAM[MAR]-ba', descriptionEn: 'Write Accumulator into RAM[MAR]' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x06,
    mnemonic: 'JMP addr',
    isStandard: true,
    isCustom: false,
    category: 'BRANCH',
    operandsDesc: 'PC <- addr',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'Utasítás lehívása, PC++', descriptionEn: 'Instruction fetch, PC++' },
      { step: 2, stepNameHu: 'T2: Ugrási Cím MAR', stepNameEn: 'T2: Jump Addr Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a MAR-ba', descriptionEn: 'PC to MAR' },
      { step: 3, stepNameHu: 'T3: Ugrás Végrehajtás', stepNameEn: 'T3: Execute Jump', activeSignals: ['MEM_RD', 'PC_LD', 'STEP_RST'], descriptionHu: 'Ugrási célcím betöltése a Program Counterbe (PC_LD)', descriptionEn: 'Load target address into Program Counter (PC_LD)' },
      { step: 4, stepNameHu: 'T4: NOP', stepNameEn: 'T4: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
      { step: 5, stepNameHu: 'T5: NOP', stepNameEn: 'T5: NOP', activeSignals: ['STEP_RST'], descriptionHu: 'Befejezve', descriptionEn: 'Done' },
    ],
  },
  {
    opcode: 0x0F,
    mnemonic: 'HLT',
    isStandard: true,
    isCustom: false,
    category: 'IO',
    operandsDesc: 'Halt execution',
    steps: [
      { step: 0, stepNameHu: 'T0: Címzés', stepNameEn: 'T0: Address Fetch', activeSignals: ['PC_OUT', 'MAR_IN'], descriptionHu: 'PC a címbuszra, MAR betöltése', descriptionEn: 'PC to address bus, MAR load' },
      { step: 1, stepNameHu: 'T1: Kódlehívás & PC+1', stepNameEn: 'T1: Code Fetch & PC+1', activeSignals: ['MEM_RD', 'IR_IN', 'PC_INC'], descriptionHu: 'Utasítás lehívása, PC++', descriptionEn: 'Instruction fetch, PC++' },
      { step: 2, stepNameHu: 'T2: Leállítás', stepNameEn: 'T2: Halt Signal', activeSignals: ['HLT'], descriptionHu: 'HLT vezérlőjel aktiválása: órajel megáll', descriptionEn: 'Activate HLT signal: clock halts' },
      { step: 3, stepNameHu: 'T3: HLT', stepNameEn: 'T3: HLT', activeSignals: ['HLT'], descriptionHu: 'Leállva', descriptionEn: 'Halted' },
      { step: 4, stepNameHu: 'T4: HLT', stepNameEn: 'T4: HLT', activeSignals: ['HLT'], descriptionHu: 'Leállva', descriptionEn: 'Halted' },
      { step: 5, stepNameHu: 'T5: HLT', stepNameEn: 'T5: HLT', activeSignals: ['HLT'], descriptionHu: 'Leállva', descriptionEn: 'Halted' },
    ],
  },
];

export const createInitialMicrocodeSimState = (): MicrocodeSimulationState => {
  const memory = new Uint8Array(256);
  memory[0] = 0x01; // MOV A, B
  memory[1] = 0x02; // ADD A, B
  memory[2] = 0x0F; // HLT

  return {
    selectedOpcode: 0x02, // ADD A, B
    currentStep: 0,
    activeSignals: ['PC_OUT', 'MAR_IN'],
    registers: {
      A: 15,
      B: 27,
      C: 0,
      D: 0,
      PC: 0,
      SP: 255,
      MAR: 0,
      MBR: 0,
      IR: 0x02,
      FLAGS: { Z: false, C: false, N: false, V: false },
    },
    memory,
    busData: 0,
    busAddress: 0,
    isSimulating: false,
  };
};

export const stepMicrocodeSimulation = (
  state: MicrocodeSimulationState,
  customEntries: OpcodeMicrocodeEntry[] = []
): MicrocodeSimulationState => {
  const allEntries = [...STANDARD_OPCODE_MICROCODE, ...customEntries];
  const currentOpcode = state.registers.IR || state.selectedOpcode;
  const entry = allEntries.find((e) => e.opcode === currentOpcode) || STANDARD_OPCODE_MICROCODE[0];

  const currentStepDef = entry.steps.find((s) => s.step === state.currentStep) || entry.steps[0];
  const signals = currentStepDef.activeSignals;

  const nextRegs = { ...state.registers, FLAGS: { ...state.registers.FLAGS } };
  const nextMem = new Uint8Array(state.memory);
  let busData = state.busData;
  let busAddr = state.busAddress;

  // Execute signals
  if (signals.includes('PC_OUT')) busAddr = nextRegs.PC;
  if (signals.includes('MAR_IN')) nextRegs.MAR = busAddr & 0xff;
  if (signals.includes('MEM_RD')) busData = nextMem[nextRegs.MAR] || 0;
  if (signals.includes('IR_IN')) nextRegs.IR = busData;
  if (signals.includes('PC_INC')) nextRegs.PC = (nextRegs.PC + 1) & 0xff;
  if (signals.includes('PC_LD')) nextRegs.PC = busData;
  if (signals.includes('REG_A_OUT')) busData = nextRegs.A;
  if (signals.includes('REG_B_OUT')) busData = nextRegs.B;
  if (signals.includes('REG_C_OUT')) busData = nextRegs.C;
  if (signals.includes('REG_D_OUT')) busData = nextRegs.D;

  if (signals.includes('ALU_ADD')) {
    const sum = nextRegs.A + nextRegs.B;
    busData = sum & 0xff;
    if (signals.includes('FLAGS_EN')) {
      nextRegs.FLAGS.Z = (busData === 0);
      nextRegs.FLAGS.C = sum > 0xff;
      nextRegs.FLAGS.N = (busData & 0x80) !== 0;
      nextRegs.FLAGS.V = ((nextRegs.A ^ busData) & (nextRegs.B ^ busData) & 0x80) !== 0;
    }
  } else if (signals.includes('ALU_SUB')) {
    const diff = nextRegs.A - nextRegs.B;
    busData = diff & 0xff;
    if (signals.includes('FLAGS_EN')) {
      nextRegs.FLAGS.Z = (busData === 0);
      nextRegs.FLAGS.C = diff < 0;
      nextRegs.FLAGS.N = (busData & 0x80) !== 0;
      nextRegs.FLAGS.V = ((nextRegs.A ^ nextRegs.B) & (nextRegs.A ^ busData) & 0x80) !== 0;
    }
  } else if (signals.includes('ALU_AND')) {
    busData = (nextRegs.A & nextRegs.B) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  } else if (signals.includes('ALU_OR')) {
    busData = (nextRegs.A | nextRegs.B) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  } else if (signals.includes('ALU_XOR')) {
    busData = (nextRegs.A ^ nextRegs.B) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  } else if (signals.includes('ALU_NOT')) {
    busData = (~nextRegs.A) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  } else if (signals.includes('ALU_SHL')) {
    busData = (nextRegs.A << 1) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  } else if (signals.includes('ALU_SHR')) {
    busData = (nextRegs.A >> 1) & 0xff;
    if (signals.includes('FLAGS_EN')) nextRegs.FLAGS.Z = busData === 0;
  }

  if (signals.includes('REG_A_IN')) nextRegs.A = busData;
  if (signals.includes('REG_B_IN')) nextRegs.B = busData;
  if (signals.includes('REG_C_IN')) nextRegs.C = busData;
  if (signals.includes('REG_D_IN')) nextRegs.D = busData;
  if (signals.includes('MEM_WR')) nextMem[nextRegs.MAR] = busData;

  const isReset = signals.includes('STEP_RST');
  const nextStep = isReset ? 0 : ((state.currentStep + 1) % 6) as 0 | 1 | 2 | 3 | 4 | 5;

  return {
    ...state,
    currentStep: nextStep,
    activeSignals: signals,
    registers: nextRegs,
    memory: nextMem,
    busData,
    busAddress: busAddr,
  };
};
