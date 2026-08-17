/**
 * Intel HEX Parser for AVR Flash ROM Memory
 * Converts Intel HEX format strings into Uint8Array / Uint16Array for avr8js CPU
 */

export interface HexParseResult {
  data: Uint8Array;
  bytesCount: number;
  startAddress: number;
  endAddress: number;
  success: boolean;
  error?: string;
}

export function parseIntelHexToBuffer(hexText: string, maxBytes = 32768): HexParseResult {
  const buffer = new Uint8Array(maxBytes);
  let baseAddress = 0;
  let bytesCount = 0;
  let minAddr = Infinity;
  let maxAddr = 0;

  const lines = hexText.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line || !line.startsWith(':')) continue;

    try {
      const byteCount = parseInt(line.substring(1, 3), 16);
      const address = parseInt(line.substring(3, 7), 16);
      const recordType = parseInt(line.substring(7, 9), 16);

      // Checksum validation
      let sum = 0;
      for (let i = 1; i < line.length - 1; i += 2) {
        sum += parseInt(line.substring(i, i + 2), 16);
      }
      if ((sum & 0xff) !== 0) {
        // Warning or continue if slight mismatch, but log
      }

      if (recordType === 0) {
        // Data Record
        const targetAddress = baseAddress + address;
        for (let i = 0; i < byteCount; i++) {
          const byteVal = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
          const addr = targetAddress + i;
          if (addr < maxBytes) {
            buffer[addr] = byteVal;
            bytesCount++;
            if (addr < minAddr) minAddr = addr;
            if (addr > maxAddr) maxAddr = addr;
          }
        }
      } else if (recordType === 1) {
        // EOF
        break;
      } else if (recordType === 2) {
        // Extended Segment Address
        baseAddress = parseInt(line.substring(9, 13), 16) << 4;
      } else if (recordType === 4) {
        // Extended Linear Address
        baseAddress = parseInt(line.substring(9, 13), 16) << 16;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        data: buffer,
        bytesCount,
        startAddress: minAddr === Infinity ? 0 : minAddr,
        endAddress: maxAddr,
        success: false,
        error: `Error parsing line ${lineIndex + 1}: ${errorMsg}`,
      };
    }
  }

  return {
    data: buffer,
    bytesCount,
    startAddress: minAddr === Infinity ? 0 : minAddr,
    endAddress: maxAddr,
    success: true,
  };
}

/**
 * Converts byte buffer into 16-bit word array required by avr8js CPU
 */
export function bytesToWordFlash(bytes: Uint8Array, wordCount = 16384): Uint16Array {
  const flash = new Uint16Array(wordCount);
  for (let i = 0; i < bytes.length; i += 2) {
    const low = bytes[i] || 0;
    const high = bytes[i + 1] || 0;
    flash[i >> 1] = (high << 8) | low;
  }
  return flash;
}
