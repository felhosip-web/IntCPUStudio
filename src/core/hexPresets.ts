import { HexPreset } from '../types/hexEditor';

export const HEX_PRESETS: HexPreset[] = [
  {
    id: '6502_fibonacci',
    title: '6502 Machine Code (Fibonacci Routine)',
    titleHu: '6502 Gépi Kód (Fibonacci Szekvencia)',
    category: 'code',
    description:
      'Classic 6502 machine code binary with opcodes (LDA, STA, ADC, TAX, BNE) and zero-page memory variables.',
    descriptionHu:
      'Klasszikus 6502 gépi kódú assembly bináris opkódokkal (LDA, STA, ADC, TAX, BNE) és nullás lapú változókkal.',
    baseAddress: 0x0000,
    data: [
      // Zero Page Variables ($00-$07)
      0x00, 0x01, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // Machine Code at $0010:
      // A9 00 = LDA #$00, 85 00 = STA $00
      0xa9, 0x00, 0x85, 0x00,
      // A9 01 = LDA #$01, 85 01 = STA $01
      0xa9, 0x01, 0x85, 0x01,
      // A2 0A = LDX #$0A (Loop 10 times)
      0xa2, 0x0a,
      // LOOP: 18 = CLC, A5 00 = LDA $00, 65 01 = ADC $01
      0x18, 0xa5, 0x00, 0x65, 0x01, 0x85, 0x02,
      // A5 01 = LDA $01, 85 00 = STA $00
      0xa5, 0x01, 0x85, 0x00,
      // A5 02 = LDA $02, 85 01 = STA $01
      0xa5, 0x02, 0x85, 0x01,
      // CA = DEX, D0 F0 = BNE Loop, 60 = RTS
      0xca, 0xd0, 0xf0, 0x60,
    ],
    highlights: [
      { start: 0x00, length: 5, label: 'Variables (A, B, Res, Counter)', labelHu: 'Változók (A, B, Eredmény, Számláló)', color: '#38bdf8' },
      { start: 0x10, length: 10, label: 'Init Regs & Counters', labelHu: 'Regiszterek Inicializálása', color: '#34d399' },
      { start: 0x1a, length: 15, label: 'Addition & Shift Loop', labelHu: 'Összeadás és Léptetés Ciklus', color: '#fbbf24' },
      { start: 0x29, length: 3, label: 'DEX & Branch RTS', labelHu: 'Ciklusszámláló & Visszatérés', color: '#f43f5e' },
    ],
  },
  {
    id: 'retro_sprite_bitmap',
    title: 'Retro 8x8 & 16x16 Pixel Sprite Bitmaps',
    titleHu: 'Retro 8x8 & 16x16 Pixel Sprite Grafika',
    category: 'graphics',
    description:
      'Raw monochrome pixel bitmaps where each 1 bit is a foreground pixel and 0 is background. Includes Space Invader alien and Pac-Ghost.',
    descriptionHu:
      'Nyers monokróm pixel bittérkép, ahol minden 1-es bit egy világító pixelt, a 0 pedig hátteret jelent. Space Invader és Szellem mintákkal.',
    baseAddress: 0x0000,
    data: [
      // Sprite 1: Space Invader Alien (8x8)
      // 00011000 = 0x18  ..##....
      // 00111100 = 0x3C  .####...
      // 01111110 = 0x7E  ######..
      // 11011011 = 0xDB  ##.##.##
      // 11111111 = 0xFF  ########
      // 00100100 = 0x24  ..#..#..
      // 01011010 = 0x5A  .#.##.#.
      // 10100101 = 0xA5  #.#..#.#
      0x18, 0x3c, 0x7e, 0xdb, 0xff, 0x24, 0x5a, 0xa5,
      // Padding
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

      // Sprite 2: Retro Ghost (8x8)
      // 00111100 = 0x3C  .####...
      // 01111110 = 0x7E  ######..
      // 11010111 = 0xD7  ##.#.###
      // 11111111 = 0xFF  ########
      // 11111111 = 0xFF  ########
      // 11111111 = 0xFF  ########
      // 11011011 = 0xDB  ##.##.##
      // 10010010 = 0x92  #..#..#.
      0x3c, 0x7e, 0xd7, 0xff, 0xff, 0xff, 0xdb, 0x92,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

      // Sprite 3: Font Letter 'A' (8x8)
      0x18, 0x3c, 0x66, 0x7e, 0x66, 0x66, 0x66, 0x00,
      // Sprite 4: Font Letter 'B' (8x8)
      0x7c, 0x66, 0x66, 0x7c, 0x66, 0x66, 0x7c, 0x00,
    ],
    highlights: [
      { start: 0x00, length: 8, label: 'Space Invader 8x8 (0x18, 0x3C...)', labelHu: 'Space Invader 8x8 (0x18, 0x3C...)', color: '#a855f7' },
      { start: 0x10, length: 8, label: 'Ghost Sprite 8x8 (0x3C, 0x7E...)', labelHu: 'Szellem Sprite 8x8 (0x3C, 0x7E...)', color: '#ec4899' },
      { start: 0x20, length: 8, label: "Font Glyphs 'A' & 'B'", labelHu: "Betűkészlet 'A' & 'B' Glikfek", color: '#06b6d4' },
    ],
  },
  {
    id: 'c_string_table',
    title: 'C-Strings & Pointer Table (Null-Terminated)',
    titleHu: 'C-String Szövegtábla & Mutatók (0x00 Zárójel)',
    category: 'text',
    description:
      'Demonstrates ASCII character representation in hex dump, string pointer table addresses, and 0x00 null terminators.',
    descriptionHu:
      'Bemutatja az ASCII karakterek hexadecimális kódjait, a string-mutatók címzését és a 0x00 lezáró bájtok (null-terminator) szerepét.',
    baseAddress: 0x0000,
    data: [
      // 16-bit Pointers Table (Little Endian):
      // Pointer 0: $0008, Pointer 1: $0018, Pointer 2: $0029, Pointer 3: $0038
      0x08, 0x00, 0x18, 0x00, 0x29, 0x00, 0x38, 0x00,

      // String 0 at $0008: "CPU SIMULATOR" + NULL
      0x43, 0x50, 0x55, 0x20, 0x53, 0x49, 0x4d, 0x55, 0x4c, 0x41, 0x54, 0x4f, 0x52, 0x00,
      0x00, 0x00,

      // String 1 at $0018: "COMMODORE 64 1982" + NULL
      0x43, 0x4f, 0x4d, 0x4d, 0x4f, 0x44, 0x4f, 0x52, 0x45, 0x20, 0x36, 0x34, 0x20, 0x31, 0x39, 0x38, 0x32, 0x00,

      // String 2 at $0029: "HEX DUMP & ASM" + NULL
      0x48, 0x45, 0x58, 0x20, 0x44, 0x55, 0x4d, 0x50, 0x20, 0x26, 0x20, 0x41, 0x53, 0x4d, 0x00,

      // String 3 at $0038: "READY." + NULL
      0x52, 0x45, 0x41, 0x44, 0x59, 0x2e, 0x00,
    ],
    highlights: [
      { start: 0x00, length: 8, label: 'String Pointer Index Table (16-bit)', labelHu: 'String Mutató Index Táblázat (16-bit)', color: '#38bdf8' },
      { start: 0x08, length: 14, label: 'Str 0: "CPU SIMULATOR\\0"', labelHu: 'Str 0: "CPU SIMULATOR\\0"', color: '#34d399' },
      { start: 0x18, length: 18, label: 'Str 1: "COMMODORE 64 1982\\0"', labelHu: 'Str 1: "COMMODORE 64 1982\\0"', color: '#fbbf24' },
      { start: 0x29, length: 15, label: 'Str 2: "HEX DUMP & ASM\\0"', labelHu: 'Str 2: "HEX DUMP & ASM\\0"', color: '#f43f5e' },
      { start: 0x38, length: 7, label: 'Str 3: "READY.\\0"', labelHu: 'Str 3: "READY.\\0"', color: '#a855f7' },
    ],
  },
  {
    id: 'file_magic_headers',
    title: 'File Magic Numbers & Signatures',
    titleHu: 'Fájl Mágikus Számok & Aláírások (Signatures)',
    category: 'magic',
    description:
      'Header signatures used by operating systems to identify binary formats (C64 PRG, ELF, PNG, ZIP, BMP).',
    descriptionHu:
      'A fájlformátumok beazonosítására szolgáló klasszikus fejlécaláírások (C64 PRG, ELF, PNG, ZIP, BMP).',
    baseAddress: 0x0000,
    data: [
      // 1. C64 PRG Header ($0801 = BASIC start)
      0x01, 0x08, 0x0b, 0x08, 0x0a, 0x00, 0x9e, 0x32, 0x30, 0x36, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00,

      // 2. Linux ELF Header (0x7F 'E' 'L' 'F', 32-bit, Little Endian)
      0x7f, 0x45, 0x4c, 0x46, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

      // 3. PNG Image Header (\x89 P N G \r \n \x1a \n)
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,

      // 4. ZIP Archive Signature ('P' 'K' 0x03 0x04)
      0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x54, 0x6e, 0x22, 0x58, 0x00, 0x00,

      // 5. Windows BMP Signature ('B' 'M')
      0x42, 0x4d, 0x36, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x00, 0x00, 0x00, 0x28, 0x00,
    ],
    highlights: [
      { start: 0x00, length: 2, label: 'C64 PRG ($0801 Load Addr)', labelHu: 'C64 PRG ($0801 Betöltési Cím)', color: '#38bdf8' },
      { start: 0x10, length: 4, label: "ELF Header ('\\x7FELF')", labelHu: "ELF Fejléc ('\\x7FELF')", color: '#34d399' },
      { start: 0x20, length: 8, label: "PNG Magic ('\\x89PNG\\r\\n\\x1a\\n')", labelHu: "PNG Mágikus Fejléc", color: '#fbbf24' },
      { start: 0x30, length: 4, label: "ZIP Archive ('PK\\x03\\x04')", labelHu: "ZIP Archívum ('PK\\x03\\x04')", color: '#f43f5e' },
      { start: 0x40, length: 2, label: "Windows BMP ('BM')", labelHu: "Windows BMP Kép ('BM')", color: '#a855f7' },
    ],
  },
  {
    id: 'buffer_overflow_stack',
    title: 'Stack Frame & Buffer Overflow Security Exploit',
    titleHu: 'Veremkeret & Puffer Túlcsordulás Biztonsági Minta',
    category: 'security',
    description:
      'Educational breakdown of a stack frame: 8-byte local buffer, saved frame pointer (EBP), and overwritten return address (EIP hijack).',
    descriptionHu:
      'A veremkeret oktató célú felépítése: 8 bájtos helyi puffer, mentett keretmutató (EBP), és felülírt visszatérési cím (EIP eltérítés).',
    baseAddress: 0x0000,
    data: [
      // 8-Byte local buffer filled with 'A' (0x41)
      0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
      // Buffer Overflow: 4 bytes of 'B' (0x42) overwriting Saved Frame Pointer
      0x42, 0x42, 0x42, 0x42,
      // Target Shellcode Return Address (Little Endian: $00008048 -> 0x48, 0x80, 0x00, 0x00)
      0x48, 0x80, 0x00, 0x00,

      // Shellcode / NOP Sled starting at $0010:
      // 0x90 = NOP (No Operation sled)
      0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90,
      // Payload: Jump to injected function
      0x31, 0xc0, 0x50, 0x68, 0x2f, 0x2f, 0x73, 0x68,
      0x68, 0x2f, 0x62, 0x69, 0x6e, 0x89, 0xe3, 0x50,
      0xcd, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    highlights: [
      { start: 0x00, length: 8, label: "Local Buffer: 'AAAAAAAA'", labelHu: "Helyi Puffer: 'AAAAAAAA'", color: '#38bdf8' },
      { start: 0x08, length: 4, label: "Overflown Saved Frame: 'BBBB'", labelHu: "Túlcsordult Keretmutató: 'BBBB'", color: '#f43f5e' },
      { start: 0x0c, length: 4, label: 'Hijacked Return Addr ($8048)', labelHu: 'Eltérített Visszatérési Cím ($8048)', color: '#ec4899' },
      { start: 0x10, length: 8, label: 'NOP Sled (0x90 0x90...)', labelHu: 'NOP Csúszda (0x90 0x90...)', color: '#fbbf24' },
      { start: 0x18, length: 16, label: 'Injected Executable Shellcode', labelHu: 'Injektált Végrehajtható Shellcode', color: '#34d399' },
    ],
  },
];
