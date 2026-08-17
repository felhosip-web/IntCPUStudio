import { C64DiskFile, C64DiskImage, PrgParseResult } from '../types/c64Floppy';

/**
 * Commodore 64 BASIC V2 Token Map ($80 - $FE)
 */
export const C64_BASIC_TOKENS: Record<number, string> = {
  0x80: 'END',
  0x81: 'FOR',
  0x82: 'NEXT',
  0x83: 'DATA',
  0x84: 'INPUT#',
  0x85: 'INPUT',
  0x86: 'DIM',
  0x87: 'READ',
  0x88: 'LET',
  0x89: 'GOTO',
  0x8a: 'RUN',
  0x8b: 'IF',
  0x8c: 'RESTORE',
  0x8d: 'GOSUB',
  0x8e: 'RETURN',
  0x8f: 'REM',
  0x90: 'STOP',
  0x91: 'ON',
  0x92: 'WAIT',
  0x93: 'LOAD',
  0x94: 'SAVE',
  0x95: 'VERIFY',
  0x96: 'DEF',
  0x97: 'POKE',
  0x98: 'PRINT#',
  0x99: 'PRINT',
  0x9a: 'CONT',
  0x9b: 'LIST',
  0x9c: 'CLR',
  0x9d: 'CMD',
  0x9e: 'SYS',
  0x9f: 'OPEN',
  0xa0: 'CLOSE',
  0xa1: 'GET',
  0xa2: 'NEW',
  0xa3: 'TAB(',
  0xa4: 'TO',
  0xa5: 'FN',
  0xa6: 'SPC(',
  0xa7: 'THEN',
  0xa8: 'NOT',
  0xa9: 'STEP',
  0xaa: '+',
  0xab: '-',
  0xac: '*',
  0xad: '/',
  0xae: '^',
  0xaf: 'AND',
  0xb0: 'OR',
  0xb1: '>',
  0xb2: '=',
  0xb3: '<',
  0xb4: 'SGN',
  0xb5: 'INT',
  0xb6: 'ABS',
  0xb7: 'USR',
  0xb8: 'FRE',
  0xb9: 'POS',
  0xba: 'SQR',
  0xbb: 'RND',
  0xbc: 'LOG',
  0xbd: 'EXP',
  0xbe: 'COS',
  0xbf: 'SIN',
  0xc0: 'TAN',
  0xc1: 'ATN',
  0xc2: 'PEEK',
  0xc3: 'LEN',
  0xc4: 'STR$',
  0xc5: 'VAL',
  0xc6: 'ASC',
  0xc7: 'CHR$',
  0xc8: 'LEFT$',
  0xc9: 'RIGHT$',
  0xca: 'MID$',
  0xcb: 'GO',
};

// Reverse map for tokenizing
export const C64_BASIC_KEYWORDS_REVERSE: Record<string, number> = Object.entries(
  C64_BASIC_TOKENS
).reduce((acc, [hexKey, keyword]) => {
  acc[keyword] = parseInt(hexKey, 10);
  return acc;
}, {} as Record<string, number>);

/**
 * Parse a Commodore 64 .PRG Binary File
 */
export function parsePrgBinary(buffer: ArrayBuffer | Uint8Array): PrgParseResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const warnings: string[] = [];

  if (bytes.length < 2) {
    return {
      loadAddress: 0x0801,
      isBasic: false,
      rawData: bytes,
      sizeBytes: bytes.length,
      warnings: ['File too short to contain a valid 2-byte C64 PRG header'],
    };
  }

  // First 2 bytes (little-endian) is the Load Address
  const loadAddress = bytes[0] | (bytes[1] << 8);
  const payload = bytes.subarray(2);

  // Check if it starts at 0x0801 (standard C64 BASIC starting RAM address)
  const isLikelyBasic = loadAddress === 0x0801;
  let basicCode: string | undefined = undefined;

  if (isLikelyBasic) {
    try {
      basicCode = detokenizeBasic(payload, loadAddress);
    } catch {
      warnings.push('Could not cleanly detokenize as standard BASIC; may contain machine language stub');
    }
  }

  return {
    loadAddress,
    isBasic: isLikelyBasic && !!basicCode && basicCode.trim().length > 0,
    basicCode,
    rawData: payload,
    sizeBytes: payload.length,
    entryPoint: loadAddress,
    warnings,
  };
}

/**
 * Detokenize C64 BASIC V2 binary payload into standard ASCII/PETSCII text
 */
export function detokenizeBasic(bytes: Uint8Array, startAddr: number = 0x0801): string {
  const lines: string[] = [];
  let offset = 0;

  while (offset + 4 < bytes.length) {
    // Next line link pointer (2 bytes)
    const nextLinePtr = bytes[offset] | (bytes[offset + 1] << 8);
    if (nextLinePtr === 0) {
      break; // End of BASIC program marker (0x0000)
    }

    // Line number (2 bytes, unsigned little-endian)
    const lineNum = bytes[offset + 2] | (bytes[offset + 3] << 8);
    offset += 4;

    let lineText = '';
    let inQuotes = false;

    while (offset < bytes.length) {
      const b = bytes[offset++];
      if (b === 0) {
        break; // End of current line
      }

      if (b === 34) {
        // Quote character '"'
        inQuotes = !inQuotes;
        lineText += '"';
      } else if (!inQuotes && b >= 0x80 && C64_BASIC_TOKENS[b]) {
        // Token keyword
        lineText += C64_BASIC_TOKENS[b];
      } else if (b >= 32 && b <= 126) {
        lineText += String.fromCharCode(b);
      } else if (b === 10 || b === 13) {
        // Ignored
      } else {
        // Fallback for PETSCII characters
        lineText += String.fromCharCode(b);
      }
    }

    lines.push(`${lineNum} ${lineText}`);
  }

  return lines.join('\n');
}

/**
 * Tokenize human-readable C64 BASIC code into a standard .PRG binary with 0x0801 header
 */
export function generatePrgFromBasic(code: string, startAddr: number = 0x0801): Uint8Array {
  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && /^\d+/.test(l));

  const sortedLines = lines
    .map((l) => {
      const match = l.match(/^(\d+)\s*(.*)$/);
      return match ? { num: parseInt(match[1], 10), text: match[2] } : null;
    })
    .filter((l): l is { num: number; text: string } => l !== null)
    .sort((a, b) => a.num - b.num);

  const buffer: number[] = [startAddr & 0xff, (startAddr >> 8) & 0xff];
  let currentMemoryAddr = startAddr;

  // Sort keywords by length descending so "PRINT#" matches before "PRINT"
  const sortedKeywords = Object.keys(C64_BASIC_KEYWORDS_REVERSE).sort(
    (a, b) => b.length - a.length
  );

  for (const line of sortedLines) {
    const lineBytes: number[] = [];
    let text = line.text;
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      if (text[i] === '"') {
        inQuotes = !inQuotes;
        lineBytes.push(34);
        i++;
        continue;
      }

      if (!inQuotes) {
        // Check for token keywords
        let matched = false;
        const upperSub = text.slice(i).toUpperCase();

        for (const kw of sortedKeywords) {
          if (upperSub.startsWith(kw)) {
            lineBytes.push(C64_BASIC_KEYWORDS_REVERSE[kw]);
            i += kw.length;
            matched = true;
            break;
          }
        }

        if (matched) continue;
      }

      // Standard character
      lineBytes.push(text.charCodeAt(i) & 0xff);
      i++;
    }

    lineBytes.push(0x00); // Line terminator

    // Calculate next line pointer
    const lineLength = 4 + lineBytes.length; // 2 byte pointer + 2 byte line num + bytes
    const nextPtr = currentMemoryAddr + lineLength;

    buffer.push(nextPtr & 0xff, (nextPtr >> 8) & 0xff);
    buffer.push(line.num & 0xff, (line.num >> 8) & 0xff);
    buffer.push(...lineBytes);

    currentMemoryAddr = nextPtr;
  }

  // End of program marker (two null bytes)
  buffer.push(0x00, 0x00);

  return new Uint8Array(buffer);
}

/**
 * 1541 Track Sector Geometry (Tracks 1-35)
 */
export const C64_1541_TRACK_SECTORS: number[] = [
  0, // Dummy index 0
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, // Tracks 1-17: 21 sectors
  19, 19, 19, 19, 19, 19, 19,                                          // Tracks 18-24: 19 sectors
  18, 18, 18, 18, 18, 18,                                              // Tracks 25-30: 18 sectors
  17, 17, 17, 17, 17                                                   // Tracks 31-35: 17 sectors
];

/**
 * Calculate D64 byte offset from track and sector
 */
export function getD64SectorOffset(track: number, sector: number): number {
  let offset = 0;
  for (let t = 1; t < track; t++) {
    offset += (C64_1541_TRACK_SECTORS[t] || 21) * 256;
  }
  offset += sector * 256;
  return offset;
}

/**
 * Clean Commodore PETSCII Filename to readable string
 */
function cleanPetsciiFilename(bytes: Uint8Array, start: number, len: number): string {
  let str = '';
  for (let i = 0; i < len; i++) {
    const b = bytes[start + i];
    if (b === 0xa0 || b === 0x00) break; // Padded with shifted space ($A0) or null
    if (b >= 32 && b <= 126) {
      str += String.fromCharCode(b);
    } else {
      str += '?';
    }
  }
  return str.trim();
}

/**
 * Parse a standard 1541 .D64 Disk Image (174,848 bytes or 175,104 bytes with errors)
 */
export function parseD64Image(buffer: ArrayBuffer | Uint8Array, defaultName?: string): C64DiskImage {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes.length < 174848) {
    // If smaller than a full D64 image, fallback to wrapping as single file disk
    const prg = parsePrgBinary(bytes);
    const fileName = (defaultName || 'PROGRAM').toUpperCase().replace(/\.[^/.]+$/, '').slice(0, 16);
    return {
      id: 'custom-disk-' + Date.now(),
      title: 'IMPORTED PRG',
      diskId: '64',
      dosType: '2A',
      files: [
        {
          id: 'file-1',
          name: fileName,
          type: 'PRG',
          sizeBlocks: Math.ceil(bytes.length / 254),
          data: bytes,
          loadAddress: prg.loadAddress,
          basicCode: prg.basicCode,
        },
      ],
      freeBlocks: 664 - Math.ceil(bytes.length / 254),
      isWriteProtected: false,
    };
  }

  // Track 18, Sector 0 is the BAM and Disk Header
  const bamOffset = getD64SectorOffset(18, 0);
  const diskTitle = cleanPetsciiFilename(bytes, bamOffset + 144, 16) || 'COMMODORE 64';
  const diskId = cleanPetsciiFilename(bytes, bamOffset + 162, 2) || '2A';
  const dosType = cleanPetsciiFilename(bytes, bamOffset + 165, 2) || '2A';

  // Calculate free blocks from BAM
  let freeBlocks = 0;
  for (let t = 1; t <= 35; t++) {
    if (t === 18) continue; // Directory track is reserved
    const bamEntryOffset = bamOffset + 4 + (t - 1) * 4;
    if (bamEntryOffset < bytes.length) {
      freeBlocks += bytes[bamEntryOffset] || 0;
    }
  }

  const files: C64DiskFile[] = [];

  // Traverse Directory starting at Track 18, Sector 1
  let dirTrack = bytes[bamOffset] || 18;
  let dirSector = bytes[bamOffset + 1] || 1;
  const visitedSectors = new Set<string>();

  while (dirTrack > 0 && dirTrack <= 35 && !visitedSectors.has(`${dirTrack}:${dirSector}`)) {
    visitedSectors.add(`${dirTrack}:${dirSector}`);
    const dirOffset = getD64SectorOffset(dirTrack, dirSector);
    if (dirOffset >= bytes.length) break;

    const nextTrack = bytes[dirOffset];
    const nextSector = bytes[dirOffset + 1];

    // Read 8 directory entries per 256-byte sector (32 bytes each)
    for (let entryIdx = 0; entryIdx < 8; entryIdx++) {
      const entryOffset = dirOffset + entryIdx * 32;
      const fileTypeByte = bytes[entryOffset + 2];
      if (fileTypeByte === 0) continue; // Scratched / empty entry

      const rawType = fileTypeByte & 0x07;
      let typeStr: 'PRG' | 'SEQ' | 'USR' | 'REL' | 'DEL' = 'PRG';
      if (rawType === 1) typeStr = 'SEQ';
      else if (rawType === 2) typeStr = 'PRG';
      else if (rawType === 3) typeStr = 'USR';
      else if (rawType === 4) typeStr = 'REL';
      else if (rawType === 0) typeStr = 'DEL';

      const isClosed = (fileTypeByte & 0x80) !== 0;
      const isLocked = (fileTypeByte & 0x40) !== 0;

      const firstTrack = bytes[entryOffset + 3];
      const firstSector = bytes[entryOffset + 4];
      const fileName = cleanPetsciiFilename(bytes, entryOffset + 5, 16);
      const sizeBlocks = bytes[entryOffset + 30] | (bytes[entryOffset + 31] << 8);

      if (firstTrack > 0 && firstTrack <= 35 && fileName.length > 0) {
        // Read file payload by following sector chain
        const fileBytes: number[] = [];
        let currT = firstTrack;
        let currS = firstSector;
        const fileSectorVisited = new Set<string>();

        while (currT > 0 && currT <= 35 && !fileSectorVisited.has(`${currT}:${currS}`)) {
          fileSectorVisited.add(`${currT}:${currS}`);
          const sOffset = getD64SectorOffset(currT, currS);
          if (sOffset >= bytes.length) break;

          const nxtT = bytes[sOffset];
          const nxtS = bytes[sOffset + 1];

          if (nxtT === 0) {
            // Last sector in chain: nxtS is the number of valid bytes in this sector + 1
            const lastByteCount = Math.min(254, nxtS > 0 ? nxtS - 1 : 254);
            for (let b = 2; b < 2 + lastByteCount; b++) {
              fileBytes.push(bytes[sOffset + b]);
            }
            break;
          } else {
            // Full 254 bytes of data
            for (let b = 2; b < 256; b++) {
              fileBytes.push(bytes[sOffset + b]);
            }
            currT = nxtT;
            currS = nxtS;
          }
        }

        const rawData = new Uint8Array(fileBytes);
        const prgInfo = parsePrgBinary(rawData);

        files.push({
          id: `d64-file-${files.length + 1}`,
          name: fileName,
          type: typeStr,
          sizeBlocks: sizeBlocks || Math.ceil(rawData.length / 254) || 1,
          data: rawData,
          loadAddress: prgInfo.loadAddress,
          basicCode: prgInfo.basicCode,
          isLocked,
          track: firstTrack,
          sector: firstSector,
        });
      }
    }

    dirTrack = nextTrack;
    dirSector = nextSector;
  }

  return {
    id: 'd64-' + Date.now(),
    title: diskTitle,
    diskId,
    dosType,
    files,
    freeBlocks: freeBlocks > 0 ? freeBlocks : 664 - files.reduce((acc, f) => acc + f.sizeBlocks, 0),
    isWriteProtected: false,
    rawD64: bytes,
  };
}

/**
 * Create a Blank 1541 C64 Floppy Disk (35 Tracks, 664 Blocks Free)
 */
export function createBlankDisk(title: string = 'NEW DISK', diskId: string = '64'): C64DiskImage {
  return {
    id: 'disk-' + Date.now(),
    title: title.toUpperCase().slice(0, 16),
    diskId: diskId.toUpperCase().slice(0, 2),
    dosType: '2A',
    files: [],
    freeBlocks: 664,
    isWriteProtected: false,
  };
}
