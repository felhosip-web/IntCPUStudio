import {
  AluOperation,
  CpuFlags,
  CpuRegisters,
  CpuState,
  MicroStepPhase,
  RegisterName,
} from '../types/cpu';
import { CpuCoreType, HardwareSetupConfig } from '../types/hardware';
import { INSTRUCTIONS } from './isa';
import { playAluChime, playClockTick, playHaltTone, playPortBeep } from './audio';

export const INITIAL_REGISTERS: CpuRegisters = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  PC: 0,
  SP: 0xff,
  IR: 0,
  MAR: 0,
  MBR: 0,
  X: 0,
  Y: 0,
  H: 0,
  L: 0,
};

export const INITIAL_FLAGS: CpuFlags = {
  Z: false,
  C: false,
  N: false,
  V: false,
  E: false,
  G: false,
  L: false,
  I: false,
  D: false,
};

export const DEFAULT_HARDWARE_CONFIG: HardwareSetupConfig = {
  coreConfig: {
    coreType: 'EDU8',
    addressBusBits: 8,
    allowZeroPage: true,
    interruptsEnabled: true,
    busGrantSupported: true,
    stackSize: 256,
    clockPrescaler: 1,
  },
  portMappings: {
    0: 'DIP_SWITCHES',
    1: 'LEDS_KEYPAD',
    2: 'TERMINAL',
    3: 'SEVEN_SEGMENT',
    4: 'BEEPER',
    5: 'MATRIX_DISPLAY',
    6: 'TIMER_RTC',
    7: 'AUDIO_PSG',
    8: 'UART_SERIAL',
    9: 'MATH_COPROCESSOR',
  },
  memoryProtection: {
    romStart: 0,
    romEnd: 0,
    isRomProtected: false,
  },
  customModules: [],
};

export function createInitialCpuState(coreType: CpuCoreType = 'EDU8'): CpuState {
  return {
    coreType,
    coreConfig: {
      coreType,
      addressBusBits: coreType === 'MOS6502' || coreType === 'Z80' ? 16 : 8,
      allowZeroPage: true,
      interruptsEnabled: true,
      busGrantSupported: true,
      stackSize: 256,
      clockPrescaler: 1,
    },
    hardwareConfig: {
      ...DEFAULT_HARDWARE_CONFIG,
      coreConfig: {
        ...DEFAULT_HARDWARE_CONFIG.coreConfig,
        coreType,
      },
    },
    registers: { ...INITIAL_REGISTERS },
    flags: { ...INITIAL_FLAGS },
    memory: new Uint8Array(coreType === 'MOS6502' || coreType === 'Z80' ? 65536 : 256),
    codeMemory: coreType === 'HARVARD8' ? new Uint8Array(256) : undefined,
    alu: {
      operandA: 0,
      operandB: 0,
      operation: 'NOP',
      result: 0,
      flags: { ...INITIAL_FLAGS },
      isActive: false,
    },
    bus: {
      dataBus: 0,
      addressBus: 0,
      controlLines: [],
      activeSource: 'NONE',
      activeDestination: 'NONE',
      lastActivityTime: Date.now(),
    },
    peripherals: {
      leds: 0,
      sevenSegment: 0,
      terminalOutput: '',
      dipSwitches: 0b00101010, // Default 42 for fun
      keypadValue: 0,
      beeperActive: false,
      matrixLeds: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    timerState: {
      enabled: true,
      counter: 0,
      reloadValue: 255,
      prescaler: 1,
      interruptOnOverflow: true,
      irqPending: false,
      realTimeSeconds: 0,
      ticks: 0,
    },
    audioPsgState: {
      enabled: true,
      channel1Freq: 440,
      channel1Wave: 'SQUARE',
      channel1Vol: 12,
      channel2Freq: 880,
      channel2Wave: 'TRIANGLE',
      channel2Vol: 8,
      noiseFreq: 100,
      masterVolume: 80,
      lastPlayedTime: Date.now(),
    },
    uartState: {
      enabled: true,
      baudRate: 9600,
      loopback: false,
      txBuffer: [],
      rxBuffer: [0x48, 0x45, 0x4c, 0x4c, 0x4f], // 'HELLO'
      txBusy: false,
      rxReady: true,
      dataBits: 8,
      parity: 'NONE',
      historyLog: ['[UART] Ready on Port 8 (9600 Baud, 8N1)'],
    },
    picState: {
      enabled: true,
      masterMask: false,
      inServiceRegister: 0,
      interruptRequestRegister: 0,
      interruptMaskRegister: 0b0000,
      lines: [
        { irq: 0, source: 'TIMER_RTC', sourceHu: 'Hardver Időzítő / RTC', vectorAddress: 0xf0, priority: 0, isMasked: false, isPending: false, isActive: false },
        { irq: 1, source: 'UART_RX', sourceHu: 'UART Soros Vétel (RX)', vectorAddress: 0xf4, priority: 1, isMasked: false, isPending: false, isActive: false },
        { irq: 2, source: 'DMA_DONE', sourceHu: 'DMA Átvitel Kész', vectorAddress: 0xf8, priority: 2, isMasked: false, isPending: false, isActive: false },
        { irq: 3, source: 'EXT_BUTTON', sourceHu: 'Külső Gomb / NMI', vectorAddress: 0xfc, priority: 3, isMasked: false, isPending: false, isActive: false },
      ],
    },
    mathState: {
      enabled: true,
      operandA: 12,
      operandB: 5,
      resultProduct: 60,
      resultQuotient: 2,
      resultRemainder: 2,
      operation: 'MUL',
      accumulator16: 60,
      cycleCost: 1,
    },
    dmaState: {
      enabled: true,
      isBusMaster: false,
      channels: [
        {
          channelId: 0,
          enabled: true,
          sourceAddress: 0x80,
          destAddress: 0xc0,
          transferLength: 16,
          transferredBytes: 0,
          direction: 'MEM_TO_MEM',
          port: 0,
          isBusy: false,
          autoIncrement: true,
        },
      ],
      lastTransferTime: Date.now(),
    },
    microStep: 'FETCH_MAR',
    microStepIndex: 0,
    isHalted: false,
    cycleCount: 0,
    instructionCount: 0,
    currentInstructionName: 'NOP',
    currentInstructionExplanation: 'Ready to execute program.',
    currentInstructionExplanationHu: 'Készen áll a program végrehajtására.',
    lastChangedRegister: null,
    lastChangedMemoryAddress: null,
  };
}

export function cloneCpuState(state: CpuState): CpuState {
  const initial = createInitialCpuState(state.coreType || 'EDU8');

  return {
    coreType: state.coreType || 'EDU8',
    coreConfig: { ...(state.coreConfig || initial.coreConfig) },
    hardwareConfig: {
      ...(state.hardwareConfig || initial.hardwareConfig),
      coreConfig: { ...(state.hardwareConfig?.coreConfig || initial.hardwareConfig.coreConfig) },
      portMappings: { ...(state.hardwareConfig?.portMappings || initial.hardwareConfig.portMappings) },
      memoryProtection: { ...(state.hardwareConfig?.memoryProtection || initial.hardwareConfig.memoryProtection) },
      customModules: [...(state.hardwareConfig?.customModules || initial.hardwareConfig.customModules)],
    },
    registers: { ...(state.registers || initial.registers) },
    flags: { ...(state.flags || initial.flags) },
    memory: state.memory ? new Uint8Array(state.memory) : new Uint8Array(256),
    codeMemory: state.codeMemory ? new Uint8Array(state.codeMemory) : undefined,
    alu: {
      ...(state.alu || initial.alu),
      flags: { ...(state.alu?.flags || initial.alu.flags) },
    },
    bus: {
      ...(state.bus || initial.bus),
      controlLines: [...(state.bus?.controlLines || initial.bus.controlLines)],
    },
    peripherals: {
      ...(state.peripherals || initial.peripherals),
      matrixLeds: [...(state.peripherals?.matrixLeds || initial.peripherals.matrixLeds)],
    },
    timerState: { ...(state.timerState || initial.timerState) },
    audioPsgState: { ...(state.audioPsgState || initial.audioPsgState) },
    uartState: {
      ...(state.uartState || initial.uartState),
      txBuffer: [...(state.uartState?.txBuffer || initial.uartState.txBuffer)],
      rxBuffer: [...(state.uartState?.rxBuffer || initial.uartState.rxBuffer)],
      historyLog: [...(state.uartState?.historyLog || initial.uartState.historyLog)],
    },
    picState: {
      ...(state.picState || initial.picState),
      lines: (state.picState?.lines || initial.picState.lines).map((l) => ({ ...l })),
    },
    mathState: { ...(state.mathState || initial.mathState) },
    dmaState: {
      ...(state.dmaState || initial.dmaState),
      channels: (state.dmaState?.channels || initial.dmaState.channels).map((c) => ({ ...c })),
    },
    microStep: state.microStep || initial.microStep,
    microStepIndex: state.microStepIndex ?? 0,
    isHalted: !!state.isHalted,
    cycleCount: state.cycleCount ?? 0,
    instructionCount: state.instructionCount ?? 0,
    currentInstructionName: state.currentInstructionName || 'NOP',
    currentInstructionExplanation: state.currentInstructionExplanation || '',
    currentInstructionExplanationHu: state.currentInstructionExplanationHu || '',
    lastChangedRegister: state.lastChangedRegister ?? null,
    lastChangedMemoryAddress: state.lastChangedMemoryAddress ?? null,
  };
}

const REG_KEYS: RegisterName[] = ['A', 'B', 'C', 'D'];

export function calculateAlu(
  op: AluOperation,
  a: number,
  b: number,
  prevFlags: CpuFlags
): { result: number; flags: CpuFlags } {
  let res = 0;
  let carry = false;
  let overflow = false;

  a = a & 0xff;
  b = b & 0xff;

  switch (op) {
    case 'NOP':
    case 'PASS_A':
      res = a;
      break;
    case 'PASS_B':
      res = b;
      break;
    case 'ADD':
      res = a + b;
      carry = res > 255;
      overflow = Boolean((~(a ^ b) & (a ^ res)) & 0x80);
      res = res & 0xff;
      break;
    case 'ADC':
      res = a + b + (prevFlags.C ? 1 : 0);
      carry = res > 255;
      overflow = Boolean((~(a ^ b) & (a ^ res)) & 0x80);
      res = res & 0xff;
      break;
    case 'SUB':
    case 'CMP':
      res = a - b;
      carry = a < b; // Borrow
      overflow = Boolean(((a ^ b) & (a ^ res)) & 0x80);
      res = (res + 256) % 256;
      break;
    case 'SBB':
      res = a - b - (prevFlags.C ? 1 : 0);
      carry = a < b + (prevFlags.C ? 1 : 0);
      overflow = Boolean(((a ^ b) & (a ^ res)) & 0x80);
      res = (res + 256) % 256;
      break;
    case 'INC':
      res = (a + 1) & 0xff;
      carry = a === 255;
      break;
    case 'DEC':
      res = (a - 1 + 256) % 256;
      carry = a === 0;
      break;
    case 'AND':
      res = (a & b) & 0xff;
      break;
    case 'OR':
      res = (a | b) & 0xff;
      break;
    case 'XOR':
      res = (a ^ b) & 0xff;
      break;
    case 'NOT':
      res = ~a & 0xff;
      break;
    case 'SHL':
      carry = (a & 0x80) !== 0;
      res = (a << 1) & 0xff;
      break;
    case 'SHR':
      carry = (a & 0x01) !== 0;
      res = (a >> 1) & 0xff;
      break;
  }

  const zero = res === 0;
  const negative = (res & 0x80) !== 0;
  const equal = a === b;
  const greater = a > b;
  const less = a < b;

  return {
    result: res,
    flags: {
      Z: zero,
      C: carry,
      N: negative,
      V: overflow,
      E: equal,
      G: greater,
      L: less,
    },
  };
}

export function stepMicroCycle(state: CpuState): CpuState {
  if (state.isHalted) {
    return state;
  }

  playClockTick();
  const next = cloneCpuState(state);
  next.cycleCount++;
  next.lastChangedRegister = null;
  next.lastChangedMemoryAddress = null;
  next.peripherals.beeperActive = false;

  const currentOpcode = next.registers.IR;
  const def = INSTRUCTIONS[currentOpcode];

  switch (next.microStep) {
    // 1. FETCH_MAR: Put PC onto Address Bus, latch into MAR
    case 'FETCH_MAR': {
      next.registers.MAR = next.registers.PC;
      next.bus.addressBus = next.registers.PC;
      next.bus.dataBus = 0;
      next.bus.controlLines = ['PC_OUT', 'MAR_IN', 'ADDR_BUS_ACT'];
      next.bus.activeSource = 'PC';
      next.bus.activeDestination = 'MAR';

      next.microStep = 'FETCH_IR';
      next.microStepIndex = 1;
      next.currentInstructionExplanation = `Cycle 1 (Fetch): PC (0x${next.registers.PC.toString(16).toUpperCase().padStart(2, '0')}) placed on Address Bus, latched into MAR.`;
      next.currentInstructionExplanationHu = `1. Ciklus (Betöltés): A PC (0x${next.registers.PC.toString(16).toUpperCase().padStart(2, '0')}) a Címbuszra kerül, és a MAR címregiszterbe tárolódik.`;
      break;
    }

    // 2. FETCH_IR: Read byte from RAM[MAR], latch into IR, increment PC
    case 'FETCH_IR': {
      const fetchedByte = next.memory[next.registers.MAR];
      next.registers.MBR = fetchedByte;
      next.registers.IR = fetchedByte;
      next.registers.PC = (next.registers.PC + 1) & 0xff;

      next.bus.addressBus = next.registers.MAR;
      next.bus.dataBus = fetchedByte;
      next.bus.controlLines = ['MEM_READ', 'DATA_BUS_ACT', 'IR_IN', 'PC_INC'];
      next.bus.activeSource = 'RAM';
      next.bus.activeDestination = 'IR';

      const instrDef = INSTRUCTIONS[fetchedByte];
      next.currentInstructionName = instrDef ? instrDef.mnemonic : `UNK(0x${fetchedByte.toString(16).toUpperCase()})`;

      next.microStep = 'DECODE';
      next.microStepIndex = 2;
      next.currentInstructionExplanation = `Cycle 2 (Fetch IR): Read opcode 0x${fetchedByte.toString(16).toUpperCase()} (${next.currentInstructionName}) from RAM to IR. PC incremented to 0x${next.registers.PC.toString(16).toUpperCase().padStart(2, '0')}.`;
      next.currentInstructionExplanationHu = `2. Ciklus (Utasításregiszter): Opkód 0x${fetchedByte.toString(16).toUpperCase()} (${next.currentInstructionName}) beolvasása a RAM-ból az IR-be. PC növelve: 0x${next.registers.PC.toString(16).toUpperCase().padStart(2, '0')}.`;
      break;
    }

    // 3. DECODE: Control Unit decodes IR and prepares execution signals
    case 'DECODE': {
      const instrDef = INSTRUCTIONS[next.registers.IR];
      next.bus.controlLines = ['CTRL_DECODE', 'CU_ACTIVE'];
      next.bus.activeSource = 'IR';
      next.bus.activeDestination = 'CONTROL_UNIT';

      if (!instrDef) {
        // Unknown opcode, halt
        next.isHalted = true;
        playHaltTone();
        next.currentInstructionExplanation = `Unknown opcode 0x${next.registers.IR.toString(16).toUpperCase()}. CPU Halted.`;
        next.currentInstructionExplanationHu = `Ismeretlen utasításkód (0x${next.registers.IR.toString(16).toUpperCase()}). A CPU leállt.`;
        return next;
      }

      if (instrDef.mnemonic === 'HLT') {
        next.isHalted = true;
        playHaltTone();
        next.bus.controlLines = ['HALT_SIGNAL'];
        next.currentInstructionExplanation = 'HLT instruction decoded. Execution stopped.';
        next.currentInstructionExplanationHu = 'HLT utasítás dekódolva. A végrehajtás leállt.';
        return next;
      }

      next.microStep = 'EXECUTE_OPERANDS';
      next.microStepIndex = 3;
      next.currentInstructionExplanation = `Cycle 3 (Decode): Decoded ${instrDef.mnemonic} - ${instrDef.description}. Preparing operands.`;
      next.currentInstructionExplanationHu = `3. Ciklus (Dekódolás): Utasítás felismerve: ${instrDef.mnemonic} (${instrDef.descriptionHu}). Operanduszok előkészítése.`;
      break;
    }

    // 4. EXECUTE_OPERANDS: Read operands (from immediate bytes or registers)
    case 'EXECUTE_OPERANDS': {
      const instrDef = INSTRUCTIONS[next.registers.IR];
      const mnem = instrDef ? instrDef.mnemonic : '';

      // Execute operand preparation
      if (['ADD', 'SUB', 'AND', 'OR', 'XOR', 'CMP'].includes(mnem)) {
        const dstIdx = next.memory[next.registers.PC];
        const srcIdx = next.memory[(next.registers.PC + 1) & 0xff];
        const dstName = REG_KEYS[dstIdx] || 'A';
        const srcName = REG_KEYS[srcIdx] || 'B';
        const valA = next.registers[dstName];
        const valB = next.registers[srcName];

        next.alu.operandA = valA;
        next.alu.operandB = valB;
        next.alu.operation = mnem as AluOperation;
        next.alu.isActive = true;

        next.bus.dataBus = valB;
        next.bus.controlLines = [`REG_${srcName}_OUT`, 'ALU_OP_B_IN', 'ALU_ACTIVE'];
        next.bus.activeSource = `REG_${srcName}`;
        next.bus.activeDestination = 'ALU';

        next.microStep = 'EXECUTE_ALU';
        next.microStepIndex = 4;
        next.currentInstructionExplanation = `Cycle 4 (Operands): Loaded Reg ${dstName} (${valA}) and Reg ${srcName} (${valB}) into ALU inputs.`;
        next.currentInstructionExplanationHu = `4. Ciklus (Operandus): ${dstName} (${valA}) és ${srcName} (${valB}) regiszterek betöltve az ALU bemeneteire.`;
      } else if (['ADDI', 'SUBI', 'ANDI', 'ORI', 'XORI', 'CMPI'].includes(mnem)) {
        const regIdx = next.memory[next.registers.PC];
        const imm = next.memory[(next.registers.PC + 1) & 0xff];
        const regName = REG_KEYS[regIdx] || 'A';
        const valA = next.registers[regName];

        const aluOp = mnem.replace('I', '') as AluOperation;
        next.alu.operandA = valA;
        next.alu.operandB = imm;
        next.alu.operation = aluOp;
        next.alu.isActive = true;

        next.bus.dataBus = imm;
        next.bus.controlLines = ['MEM_READ', 'ALU_OP_B_IN', 'ALU_ACTIVE'];
        next.bus.activeSource = 'RAM';
        next.bus.activeDestination = 'ALU';

        next.microStep = 'EXECUTE_ALU';
        next.microStepIndex = 4;
        next.currentInstructionExplanation = `Cycle 4 (Operands): Loaded Reg ${regName} (${valA}) and Immediate (${imm}) into ALU inputs.`;
        next.currentInstructionExplanationHu = `4. Ciklus (Operandus): ${regName} (${valA}) és közvetlen érték (${imm}) betöltve az ALU bemenetére.`;
      } else if (['INC', 'DEC', 'NOT', 'SHL', 'SHR'].includes(mnem)) {
        const regIdx = next.memory[next.registers.PC];
        const regName = REG_KEYS[regIdx] || 'A';
        const valA = next.registers[regName];

        next.alu.operandA = valA;
        next.alu.operandB = 1;
        next.alu.operation = mnem as AluOperation;
        next.alu.isActive = true;

        next.bus.dataBus = valA;
        next.bus.controlLines = [`REG_${regName}_OUT`, 'ALU_ACTIVE'];
        next.bus.activeSource = `REG_${regName}`;
        next.bus.activeDestination = 'ALU';

        next.microStep = 'EXECUTE_ALU';
        next.microStepIndex = 4;
        next.currentInstructionExplanation = `Cycle 4 (Operands): Loaded Reg ${regName} (${valA}) into ALU for ${mnem}.`;
        next.currentInstructionExplanationHu = `4. Ciklus (Operandus): ${regName} (${valA}) betöltve az ALU-ba a(z) ${mnem} művelethez.`;
      } else {
        // Direct jump to writeback
        next.microStep = 'WRITEBACK';
        next.microStepIndex = 5;
        next.currentInstructionExplanation = `Cycle 4: Moving directly to execution and writeback.`;
        next.currentInstructionExplanationHu = `4. Ciklus: Továbbhaladás a végrehajtásra és mentésre.`;
      }
      break;
    }

    // 5. EXECUTE_ALU: ALU calculates result and updates internal status
    case 'EXECUTE_ALU': {
      playAluChime();
      const calc = calculateAlu(next.alu.operation, next.alu.operandA, next.alu.operandB, next.flags);
      next.alu.result = calc.result;
      next.alu.flags = calc.flags;
      next.flags = calc.flags;

      next.bus.dataBus = calc.result;
      next.bus.controlLines = ['ALU_OUT', 'FLAGS_IN', 'DATA_BUS_ACT'];
      next.bus.activeSource = 'ALU';
      next.bus.activeDestination = 'FLAGS';

      next.microStep = 'WRITEBACK';
      next.microStepIndex = 5;
      next.currentInstructionExplanation = `Cycle 5 (ALU Execute): Computed ${next.alu.operation}(${next.alu.operandA}, ${next.alu.operandB}) = ${calc.result}. Flags updated (Z:${calc.flags.Z ? 1 : 0}, C:${calc.flags.C ? 1 : 0}, N:${calc.flags.N ? 1 : 0}).`;
      next.currentInstructionExplanationHu = `5. Ciklus (ALU Végrehajtás): ${next.alu.operation}(${next.alu.operandA}, ${next.alu.operandB}) kiszámolva = ${calc.result}. Jelzőbitek (Z:${calc.flags.Z ? 1 : 0}, C:${calc.flags.C ? 1 : 0}, N:${calc.flags.N ? 1 : 0}).`;
      break;
    }

    // 6. WRITEBACK: Complete write to target register, RAM, or PC, finish instruction
    case 'WRITEBACK': {
      executeCompleteInstruction(next);
      next.instructionCount++;

      // Reset for next instruction
      next.microStep = 'FETCH_MAR';
      next.microStepIndex = 0;
      next.alu.isActive = false;
      break;
    }
  }

  return next;
}

function executeCompleteInstruction(state: CpuState) {
  const instrDef = INSTRUCTIONS[state.registers.IR];
  if (!instrDef) return;

  const mnem = instrDef.mnemonic;
  const p1 = state.memory[state.registers.PC];
  const p2 = state.memory[(state.registers.PC + 1) & 0xff];

  switch (mnem) {
    case 'NOP': {
      state.bus.controlLines = ['NOP_EXEC'];
      state.currentInstructionExplanation = 'NOP: No change to registers or memory.';
      state.currentInstructionExplanationHu = 'NOP: Nincs változás a regiszterekben vagy memóriában.';
      break;
    }
    case 'SLEEP': {
      state.registers.PC = (state.registers.PC + 1) & 0xff;
      state.currentInstructionExplanation = `SLEEP: Waited ${p1} cycles.`;
      state.currentInstructionExplanationHu = `SLEEP: Várakozás ${p1} cikluson át.`;
      break;
    }
    case 'MOV': {
      const dst = REG_KEYS[p1] || 'A';
      const src = REG_KEYS[p2] || 'B';
      state.registers[dst] = state.registers[src];
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.dataBus = state.registers[dst];
      state.bus.controlLines = [`REG_${src}_OUT`, `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = `REG_${src}`;
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `MOV: Copied ${state.registers[src]} from ${src} to ${dst}.`;
      state.currentInstructionExplanationHu = `MOV: ${src} értéke (${state.registers[src]}) átmásolva a(z) ${dst} regiszterbe.`;
      break;
    }
    case 'LDI': {
      const dst = REG_KEYS[p1] || 'A';
      const val = p2;
      state.registers[dst] = val;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.dataBus = val;
      state.bus.controlLines = ['MEM_READ', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'RAM';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `LDI: Loaded immediate value ${val} (0x${val.toString(16).toUpperCase()}) into ${dst}.`;
      state.currentInstructionExplanationHu = `LDI: Közvetlen szám (${val}, 0x${val.toString(16).toUpperCase()}) betöltve a(z) ${dst} regiszterbe.`;
      break;
    }
    case 'LDA': {
      const addr = p1;
      const val = state.memory[addr];
      state.registers.A = val;
      state.lastChangedRegister = 'A';
      state.registers.PC = (state.registers.PC + 1) & 0xff;

      state.bus.addressBus = addr;
      state.bus.dataBus = val;
      state.bus.controlLines = ['MEM_READ', 'REG_A_IN', 'DATA_BUS_ACT'];
      state.bus.activeSource = 'RAM';
      state.bus.activeDestination = 'REG_A';

      state.currentInstructionExplanation = `LDA: Loaded ${val} from RAM[0x${addr.toString(16).toUpperCase()}] into A.`;
      state.currentInstructionExplanationHu = `LDA: Érték (${val}) betöltve a RAM[0x${addr.toString(16).toUpperCase()}] címről az A regiszterbe.`;
      break;
    }
    case 'STA': {
      const addr = p1;
      const val = state.registers.A;
      state.memory[addr] = val;
      state.lastChangedMemoryAddress = addr;
      state.registers.PC = (state.registers.PC + 1) & 0xff;

      state.bus.addressBus = addr;
      state.bus.dataBus = val;
      state.bus.controlLines = ['REG_A_OUT', 'MEM_WRITE', 'DATA_BUS_ACT'];
      state.bus.activeSource = 'REG_A';
      state.bus.activeDestination = 'RAM';

      state.currentInstructionExplanation = `STA: Stored A (${val}) into RAM[0x${addr.toString(16).toUpperCase()}].`;
      state.currentInstructionExplanationHu = `STA: A regiszter (${val}) elmentve a RAM[0x${addr.toString(16).toUpperCase()}] címre.`;
      break;
    }
    case 'LDR': {
      const dst = REG_KEYS[p1] || 'A';
      const srcReg = REG_KEYS[p2] || 'B';
      const addr = state.registers[srcReg];
      const val = state.memory[addr];

      state.registers[dst] = val;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.addressBus = addr;
      state.bus.dataBus = val;
      state.bus.controlLines = ['MEM_READ', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'RAM';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `LDR: Read RAM[${srcReg}=0x${addr.toString(16).toUpperCase()}] (${val}) into ${dst}.`;
      state.currentInstructionExplanationHu = `LDR: RAM[${srcReg}=0x${addr.toString(16).toUpperCase()}] címe (${val}) beolvasva a(z) ${dst}-be.`;
      break;
    }
    case 'STR': {
      const dstReg = REG_KEYS[p1] || 'B';
      const src = REG_KEYS[p2] || 'A';
      const addr = state.registers[dstReg];
      const val = state.registers[src];

      state.memory[addr] = val;
      state.lastChangedMemoryAddress = addr;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.addressBus = addr;
      state.bus.dataBus = val;
      state.bus.controlLines = [`REG_${src}_OUT`, 'MEM_WRITE', 'DATA_BUS_ACT'];
      state.bus.activeSource = `REG_${src}`;
      state.bus.activeDestination = 'RAM';

      state.currentInstructionExplanation = `STR: Stored ${src} (${val}) into RAM[${dstReg}=0x${addr.toString(16).toUpperCase()}].`;
      state.currentInstructionExplanationHu = `STR: ${src} értéke (${val}) elmentve a RAM[${dstReg}=0x${addr.toString(16).toUpperCase()}] címre.`;
      break;
    }
    case 'PUSH': {
      const src = REG_KEYS[p1] || 'A';
      const val = state.registers[src];
      state.memory[state.registers.SP] = val;
      state.lastChangedMemoryAddress = state.registers.SP;
      state.registers.SP = (state.registers.SP - 1 + 256) % 256;
      state.registers.PC = (state.registers.PC + 1) & 0xff;

      state.bus.addressBus = state.registers.SP;
      state.bus.dataBus = val;
      state.bus.controlLines = [`REG_${src}_OUT`, 'SP_DEC', 'MEM_WRITE', 'DATA_BUS_ACT'];
      state.bus.activeSource = `REG_${src}`;
      state.bus.activeDestination = 'STACK';

      state.currentInstructionExplanation = `PUSH: Pushed ${src} (${val}) to Stack, SP now 0x${state.registers.SP.toString(16).toUpperCase()}.`;
      state.currentInstructionExplanationHu = `PUSH: ${src} (${val}) elmentve a verembe, új SP: 0x${state.registers.SP.toString(16).toUpperCase()}.`;
      break;
    }
    case 'POP': {
      state.registers.SP = (state.registers.SP + 1) & 0xff;
      const dst = REG_KEYS[p1] || 'A';
      const val = state.memory[state.registers.SP];
      state.registers[dst] = val;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 1) & 0xff;

      state.bus.addressBus = state.registers.SP;
      state.bus.dataBus = val;
      state.bus.controlLines = ['SP_INC', 'MEM_READ', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'STACK';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `POP: Popped ${val} from Stack into ${dst}, SP now 0x${state.registers.SP.toString(16).toUpperCase()}.`;
      state.currentInstructionExplanationHu = `POP: ${val} kivéve a veremből a(z) ${dst} regiszterbe, új SP: 0x${state.registers.SP.toString(16).toUpperCase()}.`;
      break;
    }
    case 'ADD':
    case 'SUB':
    case 'AND':
    case 'OR':
    case 'XOR': {
      const dst = REG_KEYS[p1] || 'A';
      state.registers[dst] = state.alu.result;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.dataBus = state.alu.result;
      state.bus.controlLines = ['ALU_OUT', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'ALU';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `${mnem}: Wrote ALU result (${state.alu.result}) into ${dst}.`;
      state.currentInstructionExplanationHu = `${mnem}: ALU eredmény (${state.alu.result}) beírva a(z) ${dst} regiszterbe.`;
      break;
    }
    case 'CMP': {
      // Flags already updated during EXECUTE_ALU
      state.registers.PC = (state.registers.PC + 2) & 0xff;
      state.currentInstructionExplanation = `CMP: Compared operands. Flags: Z=${state.flags.Z ? 1 : 0}, C=${state.flags.C ? 1 : 0}, E=${state.flags.E ? 1 : 0}, G=${state.flags.G ? 1 : 0}, L=${state.flags.L ? 1 : 0}.`;
      state.currentInstructionExplanationHu = `CMP: Összehasonlítás kész. Jelzőbitek: Z=${state.flags.Z ? 1 : 0}, C=${state.flags.C ? 1 : 0}, E=${state.flags.E ? 1 : 0}, G=${state.flags.G ? 1 : 0}, L=${state.flags.L ? 1 : 0}.`;
      break;
    }
    case 'ADDI':
    case 'SUBI':
    case 'ANDI':
    case 'ORI':
    case 'XORI': {
      const dst = REG_KEYS[p1] || 'A';
      state.registers[dst] = state.alu.result;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.dataBus = state.alu.result;
      state.bus.controlLines = ['ALU_OUT', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'ALU';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `${mnem}: Wrote ALU result (${state.alu.result}) into ${dst}.`;
      state.currentInstructionExplanationHu = `${mnem}: ALU eredmény (${state.alu.result}) beírva a(z) ${dst} regiszterbe.`;
      break;
    }
    case 'CMPI': {
      state.registers.PC = (state.registers.PC + 2) & 0xff;
      state.currentInstructionExplanation = `CMPI: Compared with immediate value. Flags set.`;
      state.currentInstructionExplanationHu = `CMPI: Összehasonlítás közvetlen értékkel kész. Jelzőbitek beállítva.`;
      break;
    }
    case 'INC':
    case 'DEC':
    case 'NOT':
    case 'SHL':
    case 'SHR': {
      const dst = REG_KEYS[p1] || 'A';
      state.registers[dst] = state.alu.result;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 1) & 0xff;

      state.bus.dataBus = state.alu.result;
      state.bus.controlLines = ['ALU_OUT', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = 'ALU';
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `${mnem}: Result (${state.alu.result}) written to ${dst}.`;
      state.currentInstructionExplanationHu = `${mnem}: Eredmény (${state.alu.result}) beírva a(z) ${dst} regiszterbe.`;
      break;
    }
    case 'RAND': {
      const dst = REG_KEYS[p1] || 'A';
      const r = Math.floor(Math.random() * 256);
      state.registers[dst] = r;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 1) & 0xff;
      state.currentInstructionExplanation = `RAND: Generated random number ${r} into ${dst}.`;
      state.currentInstructionExplanationHu = `RAND: Véletlenszám (${r}) generálva a(z) ${dst}-be.`;
      break;
    }
    case 'JMP': {
      const target = p1;
      state.registers.PC = target;
      state.bus.controlLines = ['PC_LOAD', 'JMP_EXEC'];
      state.currentInstructionExplanation = `JMP: Jumped to address 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
      state.currentInstructionExplanationHu = `JMP: Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} memóriacímre.`;
      break;
    }
    case 'JZ': {
      const target = p1;
      if (state.flags.Z) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JZ: Zero flag is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JZ: Z jelzőbit aktív (1) -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JZ: Zero flag is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JZ: Z jelzőbit inaktív (0) -> Ugrás kihagyva, folytatás.`;
      }
      break;
    }
    case 'JNZ': {
      const target = p1;
      if (!state.flags.Z) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JNZ: Zero flag is CLEAR -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JNZ: Z jelzőbit inaktív (0) -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JNZ: Zero flag is SET -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JNZ: Z jelzőbit aktív (1) -> Ugrás kihagyva, folytatás.`;
      }
      break;
    }
    case 'JC': {
      const target = p1;
      if (state.flags.C) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JC: Carry is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JC: Carry jelzőbit aktív (1) -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JC: Carry is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JC: Carry inaktív -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'JNC': {
      const target = p1;
      if (!state.flags.C) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JNC: Carry is CLEAR -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JNC: Carry inaktív (0) -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JNC: Carry is SET -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JNC: Carry aktív (1) -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'JN': {
      const target = p1;
      if (state.flags.N) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JN: Negative is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JN: Negatív jelző aktív -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JN: Negative is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JN: Negatív jelző inaktív -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'JG': {
      const target = p1;
      if (state.flags.G) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JG: Greater is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JG: Nagyobb jelző aktív -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JG: Greater is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JG: Nem nagyobb -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'JL': {
      const target = p1;
      if (state.flags.L) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JL: Less is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JL: Kisebb jelző aktív -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JL: Less is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JL: Nem kisebb -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'JE': {
      const target = p1;
      if (state.flags.E) {
        state.registers.PC = target;
        state.currentInstructionExplanation = `JE: Equal is SET -> Jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
        state.currentInstructionExplanationHu = `JE: Egyenlő jelző aktív -> Ugrás a 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      } else {
        state.registers.PC = (state.registers.PC + 1) & 0xff;
        state.currentInstructionExplanation = `JE: Equal is CLEAR -> Jump NOT taken.`;
        state.currentInstructionExplanationHu = `JE: Nem egyenlő -> Ugrás kihagyva.`;
      }
      break;
    }
    case 'CALL': {
      const target = p1;
      const returnAddr = (state.registers.PC + 1) & 0xff;
      // Push return address to Stack
      state.memory[state.registers.SP] = returnAddr;
      state.lastChangedMemoryAddress = state.registers.SP;
      state.registers.SP = (state.registers.SP - 1 + 256) % 256;
      state.registers.PC = target;

      state.bus.controlLines = ['PUSH_PC', 'JMP_EXEC', 'SP_DEC'];
      state.currentInstructionExplanation = `CALL: Pushed return address (0x${returnAddr.toString(16).toUpperCase().padStart(2, '0')}) to Stack, jumped to 0x${target.toString(16).toUpperCase().padStart(2, '0')}.`;
      state.currentInstructionExplanationHu = `CALL: Visszatérési cím (0x${returnAddr.toString(16).toUpperCase().padStart(2, '0')}) mentve a verembe, ugrás a(z) 0x${target.toString(16).toUpperCase().padStart(2, '0')} címre.`;
      break;
    }
    case 'RET': {
      // Pop return address from Stack
      state.registers.SP = (state.registers.SP + 1) & 0xff;
      const returnAddr = state.memory[state.registers.SP];
      state.registers.PC = returnAddr;

      state.bus.controlLines = ['POP_PC', 'SP_INC'];
      state.currentInstructionExplanation = `RET: Popped return address (0x${returnAddr.toString(16).toUpperCase().padStart(2, '0')}) from Stack.`;
      state.currentInstructionExplanationHu = `RET: Visszatérési cím (0x${returnAddr.toString(16).toUpperCase().padStart(2, '0')}) betöltve a veremből, visszatérés.`;
      break;
    }
    case 'OUT': {
      const port = p1;
      const src = REG_KEYS[p2] || 'A';
      const val = state.registers[src];
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      writeToPort(state, port, val);
      state.currentInstructionExplanation = `OUT: Sent ${src} (${val}) to Port ${port}.`;
      state.currentInstructionExplanationHu = `OUT: ${src} értéke (${val}) kiírva a(z) ${port}. portra.`;
      break;
    }
    case 'OUTI': {
      const port = p1;
      const val = p2;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      writeToPort(state, port, val);
      state.currentInstructionExplanation = `OUTI: Sent immediate value ${val} to Port ${port}.`;
      state.currentInstructionExplanationHu = `OUTI: Közvetlen érték (${val}) kiírva a(z) ${port}. portra.`;
      break;
    }
    case 'IN': {
      const dst = REG_KEYS[p1] || 'A';
      const port = p2;
      const val = readFromPort(state, port);
      state.registers[dst] = val;
      state.lastChangedRegister = dst;
      state.registers.PC = (state.registers.PC + 2) & 0xff;

      state.bus.dataBus = val;
      state.bus.controlLines = ['PORT_READ', `REG_${dst}_IN`, 'DATA_BUS_ACT'];
      state.bus.activeSource = `PORT_${port}`;
      state.bus.activeDestination = `REG_${dst}`;

      state.currentInstructionExplanation = `IN: Read value ${val} from Port ${port} into ${dst}.`;
      state.currentInstructionExplanationHu = `IN: Érték (${val}) beolvasva a(z) ${port}. portról a(z) ${dst} regiszterbe.`;
      break;
    }
  }
}

function writeToPort(state: CpuState, port: number, val: number) {
  val = val & 0xff;
  switch (port) {
    case 1: // 8-bit LEDs
      state.peripherals.leds = val;
      break;
    case 2: // ASCII Terminal
      if (val === 10 || val === 13) {
        state.peripherals.terminalOutput += '\n';
      } else if (val >= 32 && val <= 126) {
        state.peripherals.terminalOutput += String.fromCharCode(val);
      }
      break;
    case 3: // 7-Segment Display
      state.peripherals.sevenSegment = val;
      break;
    case 4: // Beeper
      state.peripherals.beeperActive = true;
      playPortBeep(val > 0 ? 440 + val * 4 : 440, 0.08);
      break;
    case 5: { // 8x8 LED Matrix Display (stores into row)
      const matrix = [...state.peripherals.matrixLeds];
      matrix.shift();
      matrix.push(val);
      state.peripherals.matrixLeds = matrix;
      break;
    }
    case 6: // Hardware Timer / RTC reload value or control
      state.timerState.reloadValue = val;
      state.timerState.counter = val;
      break;
    case 7: { // Audio PSG (Chiptune Synthesizer)
      state.audioPsgState.channel1Freq = 100 + val * 8;
      state.audioPsgState.lastPlayedTime = Date.now();
      playPortBeep(state.audioPsgState.channel1Freq, 0.1);
      break;
    }
    case 8: { // UART Serial TX
      state.uartState.txBuffer.push(val);
      state.uartState.txBusy = true;
      const char = val >= 32 && val <= 126 ? String.fromCharCode(val) : `[0x${val.toString(16).toUpperCase()}]`;
      state.uartState.historyLog.push(`[TX] Sent byte 0x${val.toString(16).toUpperCase()} ('${char}')`);
      if (state.uartState.historyLog.length > 25) state.uartState.historyLog.shift();
      setTimeout(() => {
        state.uartState.txBusy = false;
      }, 50);
      break;
    }
    case 9: { // Math Co-Processor (Sets Operand A and triggers calculation)
      state.mathState.operandA = val;
      state.mathState.resultProduct = (state.mathState.operandA * state.mathState.operandB) & 0xffff;
      state.mathState.resultQuotient = state.mathState.operandB > 0 ? Math.floor(state.mathState.operandA / state.mathState.operandB) : 0;
      state.mathState.resultRemainder = state.mathState.operandB > 0 ? state.mathState.operandA % state.mathState.operandB : 0;
      state.mathState.accumulator16 = (state.mathState.accumulator16 + state.mathState.resultProduct) & 0xffff;
      break;
    }
  }
}

function readFromPort(state: CpuState, port: number): number {
  switch (port) {
    case 0: // DIP switches
      return state.peripherals.dipSwitches & 0xff;
    case 1: // Keypad value
      return state.peripherals.keypadValue & 0xff;
    case 6: // Hardware Timer counter read
      return state.timerState.counter & 0xff;
    case 7: // Audio PSG volume/status
      return state.audioPsgState.channel1Vol & 0x0f;
    case 8: { // UART RX read
      if (state.uartState.rxBuffer.length > 0) {
        const byte = state.uartState.rxBuffer.shift()!;
        state.uartState.rxReady = state.uartState.rxBuffer.length > 0;
        return byte & 0xff;
      }
      return 0;
    }
    case 9: // Math Co-Processor Product low-byte
      return state.mathState.resultProduct & 0xff;
    default:
      return 0;
  }
}

export function stepSingleInstruction(state: CpuState): CpuState {
  let curr = cloneCpuState(state);
  if (curr.isHalted) return curr;

  // Complete the current instruction through all its microsteps until we reach FETCH_MAR of next instruction
  let safety = 0;
  do {
    curr = stepMicroCycle(curr);
    safety++;
  } while (curr.microStep !== 'FETCH_MAR' && !curr.isHalted && safety < 10);

  return curr;
}
