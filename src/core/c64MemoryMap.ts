export interface C64MemoryRegion {
  name: string;
  nameHu: string;
  startAddr: number;
  endAddr: number;
  category: 'io' | 'ram' | 'rom' | 'video' | 'sound' | 'system' | 'stack';
  color: string;
  description: string;
  descriptionHu: string;
}

export const C64_MEMORY_REGIONS: C64MemoryRegion[] = [
  {
    name: 'Zero Page',
    nameHu: 'Nullás Lap (Zero Page)',
    startAddr: 0x0000,
    endAddr: 0x00ff,
    category: 'system',
    color: '#06b6d4',
    description: '$0000-$00FF: 6510 processor port, system pointers, BASIC variables index',
    descriptionHu: '$0000-$00FF: 6510 processzor I/O port, rendszer mutatók, BASIC változó mutatók',
  },
  {
    name: 'Stack',
    nameHu: 'CPU Veremtár (Stack)',
    startAddr: 0x0100,
    endAddr: 0x01ff,
    category: 'stack',
    color: '#8b5cf6',
    description: '$0100-$01FF: 6502/6510 Hardware Subroutine & Interrupt Stack Area',
    descriptionHu: '$0100-$01FF: 6502/6510 hardveres alprogram és megszakítási veremtár',
  },
  {
    name: 'OS Buffers & Vectors',
    nameHu: 'Rendszer Bufferek & Vektorok',
    startAddr: 0x0200,
    endAddr: 0x03ff,
    category: 'system',
    color: '#3b82f6',
    description: '$0200-$03FF: Keyboard queue, tape buffer, IRQ ($0314), NMI ($0318), USR vectors',
    descriptionHu: '$0200-$03FF: Billentyűzet sor, magnó buffer, IRQ ($0314), NMI ($0318) vektorok',
  },
  {
    name: 'Screen RAM',
    nameHu: 'Képernyő RAM (VIC-II)',
    startAddr: 0x0400,
    endAddr: 0x07e7,
    category: 'video',
    color: '#10b981',
    description: '$0400-$07E7 (1024-2023): Default 40x25 Character Matrix (1000 Screen Codes)',
    descriptionHu: '$0400-$07E7 (1024-2023): Alapértelmezett 40x25 karakteres mátrix (1000 kód)',
  },
  {
    name: 'Sprite Pointers',
    nameHu: 'Sprite Mutatók',
    startAddr: 0x07f8,
    endAddr: 0x07ff,
    category: 'video',
    color: '#f59e0b',
    description: '$07F8-$07FF: Sprite 0-7 64-byte block data pointers',
    descriptionHu: '$07F8-$07FF: Sprite 0-7 64-bájtos blokk adatmutatók',
  },
  {
    name: 'BASIC RAM',
    nameHu: 'BASIC Program Terület',
    startAddr: 0x0801,
    endAddr: 0x9fff,
    category: 'ram',
    color: '#a855f7',
    description: '$0801-$9FFF (2049-40959): 38,911 bytes free for BASIC V2 programs and variables',
    descriptionHu: '$0801-$9FFF (2049-40959): 38,911 bájt szabad BASIC programok és változók számára',
  },
  {
    name: 'BASIC V2 ROM',
    nameHu: 'BASIC V2 ROM',
    startAddr: 0xa000,
    endAddr: 0xbfff,
    category: 'rom',
    color: '#ec4899',
    description: '$A000-$BFFF: 8KB Commodore BASIC V2 Interpreter ROM (Bank switched)',
    descriptionHu: '$A000-$BFFF: 8KB Commodore BASIC V2 Interpreter ROM (Bankváltós)',
  },
  {
    name: 'Free RAM / ML Code',
    nameHu: 'Szabad RAM / Gépi Kód',
    startAddr: 0xc000,
    endAddr: 0xcfff,
    category: 'ram',
    color: '#14b8a6',
    description: '$C000-$CFFF (49152-53247): 4KB Free RAM for Machine Language routines and music',
    descriptionHu: '$C000-$CFFF (49152-53247): 4KB Szabad RAM gépi kódú rutinokhoz és zenékhez',
  },
  {
    name: 'VIC-II Registers',
    nameHu: 'VIC-II Videó Regiszterek',
    startAddr: 0xd000,
    endAddr: 0xd3ff,
    category: 'video',
    color: '#f43f5e',
    description: '$D000-$D3FF (53248-54271): 6567/6569 Video Chip (Border $D020, Bg $D021, Sprites)',
    descriptionHu: '$D000-$D3FF (53248-54271): 6567/6569 Grafikus chip (Keret $D020, Háttér $D021)',
  },
  {
    name: 'SID Sound Chip',
    nameHu: 'SID Hangchip (6581)',
    startAddr: 0xd400,
    endAddr: 0xd7ff,
    category: 'sound',
    color: '#e11d48',
    description: '$D400-$D7FF (54272-55295): 6581 Sound Interface Device (3 Voices, Filters, ADSR)',
    descriptionHu: '$D400-$D7FF (54272-55295): 6581 Sound Interface Device (3 csatorna, szűrők, ADSR)',
  },
  {
    name: 'Color RAM',
    nameHu: 'Szín RAM (Color RAM)',
    startAddr: 0xd800,
    endAddr: 0xdbe7,
    category: 'video',
    color: '#f97316',
    description: '$D800-$DBE7 (55296-56295): 1000 Nibbles (4-bit) for 40x25 character colors (0-15)',
    descriptionHu: '$D800-$DBE7 (55296-56295): 1000 4-bites nibble a 40x25 karakter színéhez (0-15)',
  },
  {
    name: 'CIA 1 & CIA 2',
    nameHu: 'CIA 1 & CIA 2 I/O',
    startAddr: 0xdc00,
    endAddr: 0xddff,
    category: 'io',
    color: '#84cc16',
    description: '$DC00-$DDFF: Complex Interface Adapters (Keyboard, Joysticks, Timers, Bank Select)',
    descriptionHu: '$DC00-$DDFF: CIA I/O illesztők (Billentyűzet, botkormányok, időzítők, bankválasztás)',
  },
  {
    name: 'KERNAL ROM',
    nameHu: 'KERNAL Operációs Rendszer',
    startAddr: 0xe000,
    endAddr: 0xffff,
    category: 'rom',
    color: '#6366f1',
    description: '$E000-$FFFF: 8KB Commodore KERNAL OS ROM & Hardware Vectors ($FFFC, $FFFE)',
    descriptionHu: '$E000-$FFFF: 8KB Commodore KERNAL OS ROM & Hardveres vektorok ($FFFC, $FFFE)',
  },
];

export const C64_KNOWN_REGISTERS: Record<number, { name: string; nameHu: string; desc: string; descHu: string }> = {
  0x0000: {
    name: '6510 Direction Register',
    nameHu: '6510 I/O Port Irány Regiszter',
    desc: 'Controls data direction for the on-chip 6510 I/O port',
    descHu: 'A 6510 processzor belső portjának adatirányát vezérli',
  },
  0x0001: {
    name: '6510 I/O Port (Banking)',
    nameHu: '6510 I/O Port (Memória Bankváltás)',
    desc: 'Bit 0: LORAM (BASIC ROM), Bit 1: HIRAM (KERNAL ROM), Bit 2: CHAREN (Char ROM/IO)',
    descHu: 'Bit 0: LORAM (BASIC), Bit 1: HIRAM (KERNAL), Bit 2: CHAREN (Karakter ROM/IO)',
  },
  0x002b: {
    name: 'TXTTAB (Low)',
    nameHu: 'TXTTAB (Alsó bájt)',
    desc: 'Pointer to start of BASIC program text ($0801 low)',
    descHu: 'Mutató a BASIC program szövegének elejére ($0801 alsó bájt)',
  },
  0x002c: {
    name: 'TXTTAB (High)',
    nameHu: 'TXTTAB (Felső bájt)',
    desc: 'Pointer to start of BASIC program text ($0801 high)',
    descHu: 'Mutató a BASIC program szövegének elejére ($0801 felső bájt)',
  },
  0x002d: {
    name: 'VARTAB (Low)',
    nameHu: 'VARTAB (Alsó bájt)',
    desc: 'Pointer to start of BASIC simple variables',
    descHu: 'Mutató a BASIC egyszerű változóinak elejére',
  },
  0x002e: {
    name: 'VARTAB (High)',
    nameHu: 'VARTAB (Felső bájt)',
    desc: 'Pointer to start of BASIC simple variables',
    descHu: 'Mutató a BASIC egyszerű változóinak elejére',
  },
  0x007a: {
    name: 'TXTPTR (Low)',
    nameHu: 'TXTPTR (Alsó bájt)',
    desc: 'Current pointer within executing BASIC program line',
    descHu: 'Aktuális mutató a futó BASIC program sorában',
  },
  0x007b: {
    name: 'TXTPTR (High)',
    nameHu: 'TXTPTR (Felső bájt)',
    desc: 'Current pointer within executing BASIC program line',
    descHu: 'Aktuális mutató a futó BASIC program sorában',
  },
  0x00d3: {
    name: 'Cursor Column (PNTR)',
    nameHu: 'Kurzor Oszlop (PNTR)',
    desc: 'Current cursor column on screen (0 to 39)',
    descHu: 'Aktuális kurzor oszlop a képernyőn (0-tól 39-ig)',
  },
  0x00d6: {
    name: 'Cursor Row (LNMX)',
    nameHu: 'Kurzor Sor (LNMX)',
    desc: 'Current cursor line on screen (0 to 24)',
    descHu: 'Aktuális kurzor sor a képernyőn (0-tól 24-ig)',
  },
  0x0286: {
    name: 'Current Text Color (COLOR)',
    nameHu: 'Aktuális Szövegszín (COLOR)',
    desc: 'Current text color index for printing to screen (0 to 15, default: 14 Light Blue)',
    descHu: 'Képernyőre írás aktuális szövegszíne (0-15, alapértelmezett: 14 Világoskék)',
  },
  0x0314: {
    name: 'IRQ Vector (Low)',
    nameHu: 'IRQ Megszakítás Vektor (Alsó)',
    desc: 'Kernal hardware interrupt service routine vector ($EA31 low)',
    descHu: 'Kernal hardveres megszakítás rutin vektor ($EA31 alsó)',
  },
  0x0315: {
    name: 'IRQ Vector (High)',
    nameHu: 'IRQ Megszakítás Vektor (Felső)',
    desc: 'Kernal hardware interrupt service routine vector ($EA31 high)',
    descHu: 'Kernal hardveres megszakítás rutin vektor ($EA31 felső)',
  },
  0x0400: {
    name: 'Screen RAM Start ($0400)',
    nameHu: 'Képernyő RAM Kezdete ($0400)',
    desc: 'Screen position Row 0, Col 0 character code (1024 in decimal)',
    descHu: 'Képernyő 0. sor, 0. oszlop karakterkódja (1024 decimálisan)',
  },
  0x0801: {
    name: 'BASIC Program Start ($0801)',
    nameHu: 'BASIC Program Kezdete ($0801)',
    desc: 'Standard entry point for BASIC programs (2049 in decimal)',
    descHu: 'BASIC programok standard kezdőcíme (2049 decimálisan)',
  },
  0xd000: {
    name: 'Sprite 0 X Coordinate',
    nameHu: 'Sprite 0 X Koordináta',
    desc: 'Lower 8 bits of Sprite 0 horizontal position',
    descHu: 'Sprite 0 vízszintes pozíciójának alsó 8 bitje',
  },
  0xd001: {
    name: 'Sprite 0 Y Coordinate',
    nameHu: 'Sprite 0 Y Koordináta',
    desc: 'Sprite 0 vertical screen position (0-255)',
    descHu: 'Sprite 0 függőleges képernyő pozíciója (0-255)',
  },
  0xd011: {
    name: 'VIC-II Control Register 1',
    nameHu: 'VIC-II Vezérlő Regiszter 1',
    desc: 'Bit 3: 24/25 rows, Bit 4: Screen On/Off, Bit 5: Bitmap Mode, Bit 7: Raster line Bit 8',
    descHu: 'Bit 3: 24/25 sor, Bit 4: Képernyő ki/be, Bit 5: Bitkép mód, Bit 7: Raszter 8. bit',
  },
  0xd012: {
    name: 'VIC-II Raster Line',
    nameHu: 'VIC-II Raszter Vonal',
    desc: 'Current CRT beam raster line (0-255, plus 8th bit in $D011)',
    descHu: 'Aktuális katódsugár raszter sor (0-255, plusz 8. bit $D011-ben)',
  },
  0xd015: {
    name: 'Sprite Enable Register',
    nameHu: 'Sprite Bekapcsoló Regiszter',
    desc: 'Bits 0-7: Enable display for Sprite 0 through Sprite 7',
    descHu: 'Bitek 0-7: Sprite 0-7 megjelenítésének engedélyezése',
  },
  0xd020: {
    name: 'Border Color Register (POKE 53280)',
    nameHu: 'Keret Szín Regiszter (POKE 53280)',
    desc: 'VIC-II exterior border color (0-15: 0=Black, 1=White, 14=Light Blue...)',
    descHu: 'VIC-II képernyőkeret színe (0-15: 0=Fekete, 1=Fehér, 14=Világoskék...)',
  },
  0xd021: {
    name: 'Background Color 0 (POKE 53281)',
    nameHu: 'Háttér Szín 0 (POKE 53281)',
    desc: 'VIC-II primary background color (0-15: default 6=Blue)',
    descHu: 'VIC-II elsődleges háttérszín (0-15: alapértelmezett 6=Kék)',
  },
  0xd022: {
    name: 'Background Color 1 (Multi-color)',
    nameHu: 'Háttér Szín 1 (Multi-color)',
    desc: 'Extra background color for multi-color text and bitmap modes',
    descHu: 'Extra háttérszín multi-color szöveges és grafikus módhoz',
  },
  0xd400: {
    name: 'SID Voice 1 Freq Low',
    nameHu: 'SID 1. Hang Frekvencia Alsó',
    desc: 'SID 6581 Voice 1 Frequency divisor lower 8 bits',
    descHu: 'SID 6581 1. hangcsatorna frekvencia osztó alsó 8 bitje',
  },
  0xd401: {
    name: 'SID Voice 1 Freq High',
    nameHu: 'SID 1. Hang Frekvencia Felső',
    desc: 'SID 6581 Voice 1 Frequency divisor upper 8 bits',
    descHu: 'SID 6581 1. hangcsatorna frekvencia osztó felső 8 bitje',
  },
  0xd404: {
    name: 'SID Voice 1 Control',
    nameHu: 'SID 1. Hang Vezérlés',
    desc: 'Bit 0: Gate (Note on/off), Bit 4: Triangle, Bit 5: Sawtooth, Bit 6: Pulse, Bit 7: Noise',
    descHu: 'Bit 0: Gate (Hang indítás), Bit 4: Háromszög, Bit 5: Fűrészfog, Bit 6: Négyszög, Bit 7: Zaj',
  },
  0xd405: {
    name: 'SID Voice 1 Attack / Decay',
    nameHu: 'SID 1. Hang Attack / Decay',
    desc: 'Upper 4 bits: Attack (2ms-8s), Lower 4 bits: Decay (6ms-24s)',
    descHu: 'Felső 4 bit: Felfutás (2ms-8s), Alsó 4 bit: Lecsengés (6ms-24s)',
  },
  0xd406: {
    name: 'SID Voice 1 Sustain / Release',
    nameHu: 'SID 1. Hang Sustain / Release',
    desc: 'Upper 4 bits: Sustain Volume (0-15), Lower 4 bits: Release Time (6ms-24s)',
    descHu: 'Felső 4 bit: Kitartási szint (0-15), Alsó 4 bit: Elengedési idő (6ms-24s)',
  },
  0xd418: {
    name: 'SID Volume & Filter Mode',
    nameHu: 'SID Hangerő & Szűrő Mód',
    desc: 'Bits 0-3: Master Volume (0-15), Bit 4: Low-Pass, Bit 5: Band-Pass, Bit 6: High-Pass',
    descHu: 'Bitek 0-3: Fő hangerő (0-15), Bit 4: Aluláteresztő, Bit 5: Sávszűrő, Bit 6: Felüláteresztő',
  },
  0xd800: {
    name: 'Color RAM Start ($D800)',
    nameHu: 'Szín RAM Kezdete ($D800)',
    desc: 'Color for Row 0, Col 0 character (0-15, POKE 55296)',
    descHu: 'A 0. sor, 0. oszlop karakterének színe (0-15, POKE 55296)',
  },
  0xdc00: {
    name: 'CIA 1 Data Port A (Joy 2)',
    nameHu: 'CIA 1 Adatport A (Botkormány 2)',
    desc: 'Keyboard matrix column outputs and Joystick Port 2 inputs',
    descHu: 'Billentyűzet oszlop kimenetek és 2. Botkormány port bemenetek',
  },
  0xdc01: {
    name: 'CIA 1 Data Port B (Joy 1)',
    nameHu: 'CIA 1 Adatport B (Botkormány 1)',
    desc: 'Keyboard matrix row inputs and Joystick Port 1 inputs',
    descHu: 'Billentyűzet sor bemenetek és 1. Botkormány port bemenetek',
  },
  0xfffc: {
    name: 'CPU RESET Vector Low',
    nameHu: 'CPU RESET Vektor Alsó',
    desc: '6502 Hardware Reset pointer ($FCE2 low byte = $E2)',
    descHu: '6502 Hardveres Újraindítás mutató ($FCE2 alsó bájt = $E2)',
  },
  0xfffd: {
    name: 'CPU RESET Vector High',
    nameHu: 'CPU RESET Vektor Felső',
    desc: '6502 Hardware Reset pointer ($FCE2 high byte = $FC)',
    descHu: '6502 Hardveres Újraindítás mutató ($FCE2 felső bájt = $FC)',
  },
};

/** Convert C64 Screen Code to a readable ASCII character or glyph */
export function petsciiScreenCodeToChar(code: number): string {
  const c = code & 0xff;
  if (c >= 1 && c <= 26) {
    return String.fromCharCode(64 + c); // A-Z
  }
  if (c >= 48 && c <= 57) {
    return String.fromCharCode(c); // 0-9
  }
  if (c === 0) return '@';
  if (c === 32) return ' ';
  if (c >= 33 && c <= 47) return String.fromCharCode(c);
  if (c >= 58 && c <= 63) return String.fromCharCode(c);
  if (c === 64) return '─';
  if (c === 65) return '♠';
  if (c === 66) return '│';
  if (c === 81) return '●';
  if (c === 83) return '♥';
  if (c === 87) return '♣';
  if (c === 90) return '♦';
  if (c === 91) return '┼';
  if (c === 92) return '┌';
  if (c === 93) return '└';
  if (c === 94) return '┐';
  if (c === 95) return '┘';
  if (c >= 128) {
    // Inverted character
    const base = c & 0x7f;
    return petsciiScreenCodeToChar(base);
  }
  return '.';
}
