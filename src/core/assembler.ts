import {
  AssembledProgram,
  AssemblyLineInfo,
} from '../types/cpu';
import { INSTRUCTIONS, MNEMONIC_TO_OPCODE, REGISTER_INDEX } from './isa';

function parseNumber(token: string): number | null {
  token = token.trim();
  if (!token) return null;

  // Hexadecimal: 0x1F, $1F, 1Fh
  if (token.startsWith('0x') || token.startsWith('0X')) {
    const val = parseInt(token.slice(2), 16);
    return isNaN(val) ? null : val & 0xff;
  }
  if (token.startsWith('$')) {
    const val = parseInt(token.slice(1), 16);
    return isNaN(val) ? null : val & 0xff;
  }
  if (token.endsWith('h') || token.endsWith('H')) {
    const val = parseInt(token.slice(0, -1), 16);
    return isNaN(val) ? null : val & 0xff;
  }

  // Binary: 0b1010, %1010
  if (token.startsWith('0b') || token.startsWith('0B')) {
    const val = parseInt(token.slice(2), 2);
    return isNaN(val) ? null : val & 0xff;
  }
  if (token.startsWith('%')) {
    const val = parseInt(token.slice(1), 2);
    return isNaN(val) ? null : val & 0xff;
  }

  // Character literal: 'A'
  if (token.startsWith("'") && token.endsWith("'") && token.length === 3) {
    return token.charCodeAt(1) & 0xff;
  }

  // Decimal
  const dec = parseInt(token, 10);
  if (!isNaN(dec)) {
    return ((dec % 256) + 256) % 256;
  }

  return null;
}

function cleanToken(token: string): string {
  return token.trim().replace(/^\[|\]$/g, '');
}

export function assemble(source: string): AssembledProgram {
  const machineCode = new Uint8Array(256);
  const lineMapping: Record<number, number> = {};
  const addressMapping: Record<number, number> = {};
  const symbolTable: Record<string, number> = {};
  const lines: AssemblyLineInfo[] = [];
  const errors: Array<{ line: number; message: string; messageHu: string }> = [];

  const rawLines = source.split('\n');

  // PASS 1: Parse structure, labels, allocate addresses
  let currentAddress = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const lineNumber = i + 1;

    // Strip comments
    let codePart = rawLine;
    const commentIdx = codePart.search(/;|(\/\/)/);
    if (commentIdx !== -1) {
      codePart = codePart.substring(0, commentIdx);
    }
    codePart = codePart.trim();

    if (codePart === '') {
      lines.push({
        lineNumber,
        rawText: rawLine,
        byteCount: 0,
        bytes: [],
        isComment: rawLine.trim().startsWith(';') || rawLine.trim().startsWith('//'),
      });
      continue;
    }

    // Check for label definition: e.g. "start:" or "loop: MOV A, B"
    let labelMatch = codePart.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
    let labelName: string | undefined = undefined;

    if (labelMatch) {
      labelName = labelMatch[1].toLowerCase();
      symbolTable[labelName] = currentAddress;
      codePart = labelMatch[2].trim();
    }

    if (codePart === '') {
      lines.push({
        lineNumber,
        rawText: rawLine,
        address: currentAddress,
        byteCount: 0,
        bytes: [],
        isLabel: true,
        labelName,
      });
      continue;
    }

    // Handle directives
    const parts = codePart.split(/[\s,]+/).filter(Boolean);
    const directiveOrMnemonic = parts[0].toUpperCase();

    if (directiveOrMnemonic === 'ORG') {
      const orgAddr = parseNumber(parts[1]);
      if (orgAddr !== null && orgAddr >= 0 && orgAddr < 256) {
        currentAddress = orgAddr;
      } else {
        errors.push({
          line: lineNumber,
          message: `Invalid ORG address: ${parts[1]}`,
          messageHu: `Érvénytelen ORG memóriacím: ${parts[1]}`,
        });
      }
      lines.push({
        lineNumber,
        rawText: rawLine,
        address: currentAddress,
        byteCount: 0,
        bytes: [],
      });
      continue;
    }

    if (directiveOrMnemonic === 'DB') {
      const dbTokens = codePart.substring(2).trim().split(',').map((s) => s.trim());
      const count = dbTokens.length;
      lines.push({
        lineNumber,
        rawText: rawLine,
        address: currentAddress,
        byteCount: count,
        bytes: [],
        mnemonic: 'DB',
        operands: dbTokens,
      });
      currentAddress += count;
      continue;
    }

    if (directiveOrMnemonic === 'STRING') {
      const strMatch = codePart.match(/STRING\s+"([^"]*)"/i);
      if (strMatch) {
        const text = strMatch[1].replace(/\\n/g, '\n').replace(/\\0/g, '\0');
        const count = text.length + 1; // null-terminated
        lines.push({
          lineNumber,
          rawText: rawLine,
          address: currentAddress,
          byteCount: count,
          bytes: [],
          mnemonic: 'STRING',
          operands: [text],
        });
        currentAddress += count;
        continue;
      }
    }

    // Standard instruction
    const mnemonic = directiveOrMnemonic;
    const opcode = MNEMONIC_TO_OPCODE[mnemonic];

    if (opcode === undefined) {
      errors.push({
        line: lineNumber,
        message: `Unknown instruction or directive: '${mnemonic}'`,
        messageHu: `Ismeretlen utasítás vagy direktíva: '${mnemonic}'`,
      });
      lines.push({
        lineNumber,
        rawText: rawLine,
        address: currentAddress,
        byteCount: 0,
        bytes: [],
        error: `Unknown instruction '${mnemonic}'`,
      });
      continue;
    }

    const def = INSTRUCTIONS[opcode];
    const byteCount = def.operands;
    const operands = parts.slice(1);

    lines.push({
      lineNumber,
      rawText: rawLine,
      address: currentAddress,
      byteCount,
      bytes: [],
      mnemonic,
      operands,
    });

    currentAddress += byteCount;
  }

  // PASS 2: Encode bytes and resolve labels / operands
  for (const lineInfo of lines) {
    if (!lineInfo.mnemonic || lineInfo.byteCount === 0) {
      continue;
    }

    const { lineNumber, mnemonic, operands = [], address = 0 } = lineInfo;
    const addr = address;

    if (mnemonic === 'DB') {
      const byteList: number[] = [];
      for (const op of operands) {
        const num = parseNumber(op);
        if (num !== null) {
          byteList.push(num);
        } else {
          errors.push({
            line: lineNumber,
            message: `Invalid DB byte literal: ${op}`,
            messageHu: `Érvénytelen DB bájt érték: ${op}`,
          });
          byteList.push(0);
        }
      }
      lineInfo.bytes = byteList;
      for (let j = 0; j < byteList.length; j++) {
        if (addr + j < 256) {
          machineCode[addr + j] = byteList[j];
          lineMapping[addr + j] = lineNumber;
        }
      }
      addressMapping[lineNumber] = addr;
      continue;
    }

    if (mnemonic === 'STRING') {
      const str = operands[0] || '';
      const byteList: number[] = [];
      for (let j = 0; j < str.length; j++) {
        byteList.push(str.charCodeAt(j) & 0xff);
      }
      byteList.push(0); // Null terminator
      lineInfo.bytes = byteList;
      for (let j = 0; j < byteList.length; j++) {
        if (addr + j < 256) {
          machineCode[addr + j] = byteList[j];
          lineMapping[addr + j] = lineNumber;
        }
      }
      addressMapping[lineNumber] = addr;
      continue;
    }

    const opcode = MNEMONIC_TO_OPCODE[mnemonic];
    if (opcode === undefined) continue;

    const bytes: number[] = [opcode];

    // Helper to resolve an operand as a number, register, or label
    const resolveValue = (op: string | undefined): number => {
      if (!op) return 0;
      op = cleanToken(op);
      // Check register
      const regUpper = op.toUpperCase();
      if (REGISTER_INDEX[regUpper] !== undefined) {
        return REGISTER_INDEX[regUpper];
      }
      // Check number literal
      const num = parseNumber(op);
      if (num !== null) {
        return num;
      }
      // Check label
      const lowerOp = op.toLowerCase();
      if (symbolTable[lowerOp] !== undefined) {
        return symbolTable[lowerOp];
      }

      errors.push({
        line: lineNumber,
        message: `Undefined symbol or invalid operand: '${op}'`,
        messageHu: `Nem definiált szimbólum vagy érvénytelen operandus: '${op}'`,
      });
      return 0;
    };

    switch (mnemonic) {
      // 1-byte opcodes
      case 'NOP':
      case 'HLT':
      case 'RET':
        break;

      // 2-byte opcodes
      case 'SLEEP':
      case 'LDA':
      case 'STA':
      case 'PUSH':
      case 'POP':
      case 'INC':
      case 'DEC':
      case 'NOT':
      case 'SHL':
      case 'SHR':
      case 'RAND':
      case 'JMP':
      case 'JZ':
      case 'JNZ':
      case 'JC':
      case 'JNC':
      case 'JN':
      case 'JG':
      case 'JL':
      case 'JE':
      case 'CALL': {
        const val = resolveValue(operands[0]);
        bytes.push(val);
        break;
      }

      // 3-byte opcodes
      case 'MOV':
      case 'LDI':
      case 'LDR':
      case 'STR':
      case 'ADD':
      case 'ADDI':
      case 'SUB':
      case 'SUBI':
      case 'AND':
      case 'ANDI':
      case 'OR':
      case 'ORI':
      case 'XOR':
      case 'XORI':
      case 'CMP':
      case 'CMPI':
      case 'OUT':
      case 'OUTI':
      case 'IN': {
        const op1 = resolveValue(operands[0]);
        const op2 = resolveValue(operands[1]);
        bytes.push(op1);
        bytes.push(op2);
        break;
      }
    }

    lineInfo.bytes = bytes;
    for (let j = 0; j < bytes.length; j++) {
      if (addr + j < 256) {
        machineCode[addr + j] = bytes[j];
        lineMapping[addr + j] = lineNumber;
      }
    }
    addressMapping[lineNumber] = addr;
  }

  return {
    machineCode,
    lineMapping,
    addressMapping,
    symbolTable,
    lines,
    errors,
    codeSize: currentAddress,
  };
}
