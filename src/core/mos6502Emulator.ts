// MOS 6502 / 6510 CPU Emulation and Disassembler for Commodore 64

import { Mos6502Registers } from '../types/c64';

export function createInitial6502State(): Mos6502Registers {
  return {
    A: 0x00,
    X: 0x00,
    Y: 0x00,
    PC: 0xe37b, // Standard C64 BASIC cold start vector / $C000 for user programs
    SP: 0xfd,   // Standard stack top in $0100 - $01FF
    flags: {
      N: false,
      V: false,
      B: false,
      D: false,
      I: true,
      Z: false,
      C: false,
    },
  };
}

export interface DisassembledInstruction {
  address: number;
  hexBytes: string;
  mnemonic: string;
  operands: string;
  comment?: string;
}

export function disassemble6502(
  memory: Uint8Array,
  startAddr: number,
  count: number = 16
): DisassembledInstruction[] {
  const result: DisassembledInstruction[] = [];
  let pc = startAddr & 0xffff;

  for (let i = 0; i < count && pc < 65536; i++) {
    const opcode = memory[pc];
    const item = decodeOpcode(memory, pc, opcode);
    result.push(item);
    // Advance pc by length
    const bytesCount = item.hexBytes.trim().split(' ').length;
    pc = (pc + bytesCount) & 0xffff;
  }

  return result;
}

function toHex8(v: number): string {
  return (v & 0xff).toString(16).toUpperCase().padStart(2, '0');
}

function toHex16(v: number): string {
  return (v & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function decodeOpcode(
  memory: Uint8Array,
  pc: number,
  opcode: number
): DisassembledInstruction {
  const b1 = memory[(pc + 1) & 0xffff] || 0;
  const b2 = memory[(pc + 2) & 0xffff] || 0;
  const word16 = (b2 << 8) | b1;

  switch (opcode) {
    // NOP / BRK / RTS
    case 0xea:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'NOP', operands: '' };
    case 0x00:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'BRK', operands: '', comment: 'Break / Halt' };
    case 0x60:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'RTS', operands: '', comment: 'Return from Subroutine' };
    case 0x40:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'RTI', operands: '', comment: 'Return from Interrupt' };

    // Register Transfers
    case 0xaa:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TAX', operands: '', comment: 'A -> X' };
    case 0x8a:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TXA', operands: '', comment: 'X -> A' };
    case 0xa8:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TAY', operands: '', comment: 'A -> Y' };
    case 0x98:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TYA', operands: '', comment: 'Y -> A' };
    case 0xba:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TSX', operands: '', comment: 'SP -> X' };
    case 0x9a:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'TXS', operands: '', comment: 'X -> SP' };

    // LDA
    case 0xa9:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'LDA', operands: `#$${toHex8(b1)}` };
    case 0xa5:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'LDA', operands: `$${toHex8(b1)}`, comment: 'Zero Page' };
    case 0xad:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'LDA', operands: `$${toHex16(word16)}` };

    // STA
    case 0x85:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'STA', operands: `$${toHex8(b1)}`, comment: 'Zero Page' };
    case 0x8d:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'STA', operands: `$${toHex16(word16)}` };

    // LDX / STX
    case 0xa2:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'LDX', operands: `#$${toHex8(b1)}` };
    case 0x8e:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'STX', operands: `$${toHex16(word16)}` };

    // LDY / STY
    case 0xa0:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'LDY', operands: `#$${toHex8(b1)}` };
    case 0x8c:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'STY', operands: `$${toHex16(word16)}` };

    // INX / DEX / INY / DEY
    case 0xe8:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'INX', operands: '', comment: 'X = X + 1' };
    case 0xca:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'DEX', operands: '', comment: 'X = X - 1' };
    case 0xc8:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'INY', operands: '', comment: 'Y = Y + 1' };
    case 0x88:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'DEY', operands: '', comment: 'Y = Y - 1' };

    // JMP / JSR
    case 0x4c:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'JMP', operands: `$${toHex16(word16)}` };
    case 0x20:
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)} ${toHex8(b2)}`, mnemonic: 'JSR', operands: `$${toHex16(word16)}`, comment: 'Call Subroutine' };

    // Branching
    case 0xf0: {
      const offset = (b1 & 0x80) ? b1 - 256 : b1;
      const target = (pc + 2 + offset) & 0xffff;
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'BEQ', operands: `$${toHex16(target)}`, comment: 'Branch if Z=1' };
    }
    case 0xd0: {
      const offset = (b1 & 0x80) ? b1 - 256 : b1;
      const target = (pc + 2 + offset) & 0xffff;
      return { address: pc, hexBytes: `${toHex8(opcode)} ${toHex8(b1)}`, mnemonic: 'BNE', operands: `$${toHex16(target)}`, comment: 'Branch if Z=0' };
    }

    // Flags
    case 0x18:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'CLC', operands: '', comment: 'Clear Carry' };
    case 0x38:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'SEC', operands: '', comment: 'Set Carry' };
    case 0x78:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'SEI', operands: '', comment: 'Set Interrupt Disable' };
    case 0x58:
      return { address: pc, hexBytes: `${toHex8(opcode)}`, mnemonic: 'CLI', operands: '', comment: 'Clear Interrupt Disable' };

    default:
      return {
        address: pc,
        hexBytes: `${toHex8(opcode)}`,
        mnemonic: `.BYTE`,
        operands: `$${toHex8(opcode)}`,
        comment: 'Data byte',
      };
  }
}

// Step single 6502 instruction
export function step6502Instruction(
  cpu: Mos6502Registers,
  memory: Uint8Array
): Mos6502Registers {
  const next: Mos6502Registers = {
    ...cpu,
    flags: { ...cpu.flags },
  };

  const opcode = memory[next.PC];
  const b1 = memory[(next.PC + 1) & 0xffff] || 0;
  const b2 = memory[(next.PC + 2) & 0xffff] || 0;
  const word16 = (b2 << 8) | b1;

  const updateNZ = (val: number) => {
    next.flags.Z = (val & 0xff) === 0;
    next.flags.N = (val & 0x80) !== 0;
  };

  switch (opcode) {
    case 0xea: // NOP
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0x00: // BRK
      next.flags.B = true;
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0xa9: // LDA #val
      next.A = b1;
      updateNZ(next.A);
      next.PC = (next.PC + 2) & 0xffff;
      break;

    case 0xa5: // LDA zeroPage
      next.A = memory[b1];
      updateNZ(next.A);
      next.PC = (next.PC + 2) & 0xffff;
      break;

    case 0xad: // LDA abs
      next.A = memory[word16];
      updateNZ(next.A);
      next.PC = (next.PC + 3) & 0xffff;
      break;

    case 0x85: // STA zeroPage
      memory[b1] = next.A;
      next.PC = (next.PC + 2) & 0xffff;
      break;

    case 0x8d: // STA abs
      memory[word16] = next.A;
      next.PC = (next.PC + 3) & 0xffff;
      break;

    case 0xa2: // LDX #val
      next.X = b1;
      updateNZ(next.X);
      next.PC = (next.PC + 2) & 0xffff;
      break;

    case 0xa0: // LDY #val
      next.Y = b1;
      updateNZ(next.Y);
      next.PC = (next.PC + 2) & 0xffff;
      break;

    case 0xe8: // INX
      next.X = (next.X + 1) & 0xff;
      updateNZ(next.X);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0xca: // DEX
      next.X = (next.X - 1 + 256) & 0xff;
      updateNZ(next.X);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0xc8: // INY
      next.Y = (next.Y + 1) & 0xff;
      updateNZ(next.Y);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0x88: // DEY
      next.Y = (next.Y - 1 + 256) & 0xff;
      updateNZ(next.Y);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0xaa: // TAX
      next.X = next.A;
      updateNZ(next.X);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0x8a: // TXA
      next.A = next.X;
      updateNZ(next.A);
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0x4c: // JMP abs
      next.PC = word16;
      break;

    case 0x20: // JSR abs
      // Push return PC - 1 onto stack
      {
        const returnPc = (next.PC + 2) & 0xffff;
        memory[0x0100 + next.SP] = (returnPc >> 8) & 0xff;
        next.SP = (next.SP - 1) & 0xff;
        memory[0x0100 + next.SP] = returnPc & 0xff;
        next.SP = (next.SP - 1) & 0xff;
        next.PC = word16;
      }
      break;

    case 0x60: // RTS
      {
        next.SP = (next.SP + 1) & 0xff;
        const low = memory[0x0100 + next.SP];
        next.SP = (next.SP + 1) & 0xff;
        const high = memory[0x0100 + next.SP];
        next.PC = (((high << 8) | low) + 1) & 0xffff;
      }
      break;

    case 0x18: // CLC
      next.flags.C = false;
      next.PC = (next.PC + 1) & 0xffff;
      break;

    case 0x38: // SEC
      next.flags.C = true;
      next.PC = (next.PC + 1) & 0xffff;
      break;

    default:
      next.PC = (next.PC + 1) & 0xffff;
      break;
  }

  return next;
}
