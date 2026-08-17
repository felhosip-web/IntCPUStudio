import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Hash,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const HexExplainerGuide: React.FC = () => {
  const { language } = useI18n();
  const [activeStep, setActiveStep] = useState<number>(0);

  // Interactive Address Calculator state
  const [calcRow, setCalcRow] = useState<number>(2); // 0x0020
  const [calcCol, setCalcCol] = useState<number>(7); // +0x07 -> 0x0027

  // Interactive Nibble Combiner
  const [highNibble, setHighNibble] = useState<number>(0x4);
  const [lowNibble, setLowNibble] = useState<number>(0x1);

  // Endianness demonstration value
  const [endianWord, setEndianWord] = useState<number>(0x1234);

  const calculatedAddr = calcRow * 16 + calcCol;
  const combinedByte = (highNibble << 4) | lowNibble;
  const highNibbleBin = highNibble.toString(2).padStart(4, '0');
  const lowNibbleBin = lowNibble.toString(2).padStart(4, '0');
  const asciiChar =
    combinedByte >= 32 && combinedByte <= 126
      ? String.fromCharCode(combinedByte)
      : '· (Nem nyomtatható / Control)';

  // Endian bytes
  const endianLow = endianWord & 0xff;
  const endianHigh = (endianWord >> 8) & 0xff;

  const STEPS = [
    {
      id: 'structure',
      icon: Layers,
      title: '1. A Hex Dump Felépítése (Cím, Hex, ASCII)',
      titleEn: '1. Anatomy of a Hex Dump (Address, Hex, ASCII)',
    },
    {
      id: 'hex_nibbles',
      icon: Hash,
      title: '2. Miért Hexadecimális? (Nibble & Bájtok)',
      titleEn: '2. Why Hexadecimal? (Nibbles & Bytes)',
    },
    {
      id: 'addressing',
      icon: Database,
      title: '3. Memóriacím Számítás (Offset + Oszlop)',
      titleEn: '3. Memory Address Math (Offset + Column)',
    },
    {
      id: 'endianness',
      icon: Cpu,
      title: '4. Bájtsorrend (Little-Endian vs Big-Endian)',
      titleEn: '4. Byte Order (Little-Endian vs Big-Endian)',
    },
  ];

  return (
    <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <span>
                {language === 'hu'
                  ? 'Hogyan Működik a Hex Dump & Memóriaszerkesztő?'
                  : 'How Hex Dumps & Memory Editors Work'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal border border-cyan-500/30">
                {language === 'hu' ? 'Interaktív Útmutató' : 'Interactive Guide'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Tanuld meg az alapoktól a memóriacímek, hexadecimális bájtok és bájtsorrendek olvasását és szerkesztését.'
                : 'Learn the fundamentals of memory addressing, hexadecimal bytes, and endianness from the ground up.'}
            </p>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 bg-[#080B11] p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {activeStep === 0 && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-cyan-300">
              {language === 'hu'
                ? '📌 A klasszikus Hex Dump 3 fő vizuális oszlopra tagolódik:'
                : '📌 A classic Hex Dump is structured into 3 distinct visual columns:'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <strong className="text-amber-400">
                  {language === 'hu' ? '1. Cím / Offset Oszlop (bal oldalon):' : '1. Address / Offset Column (left):'}
                </strong>{' '}
                {language === 'hu'
                  ? 'A sor legelső bájtjának fizikai memóriacíme (pl. $0000, $0010, $0020). Mindig 16 bájttal nő soronként.'
                  : 'The base physical memory address of the first byte in this row (e.g. $0000, $0010, $0020).'}
              </li>
              <li>
                <strong className="text-cyan-400">
                  {language === 'hu' ? '2. Hexadecimális Adatmező (középen):' : '2. Hexadecimal Data Area (center):'}
                </strong>{' '}
                {language === 'hu'
                  ? '16 darab 2-karakteres hex bájt (00-tól FF-ig), oszloponként jelölve (+0, +1, ... +F).'
                  : '16 two-digit hexadecimal bytes (from 00 to FF), labeled by column (+0, +1, ... +F).'}
              </li>
              <li>
                <strong className="text-emerald-400">
                  {language === 'hu' ? '3. ASCII Szöveges Oszlop (jobb oldalon):' : '3. ASCII Text Column (right):'}
                </strong>{' '}
                {language === 'hu'
                  ? 'A bájtok nyomtatható szöveges megfelelője (32..126 kódok). A nem nyomtatható vagy vezérlőbájtok pontként (.) jelennek meg.'
                  : 'The printable character representation (ASCII 32..126). Non-printable bytes appear as dots (.).'}
              </li>
            </ul>
          </div>

          {/* Interactive Simulated Sample Row Breakdown */}
          <div className="bg-[#06080D] border-2 border-dashed border-cyan-500/40 p-4 rounded-xl flex flex-col gap-3">
            <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'hu' ? 'Példa Hex Dump Sor Vizualizáció' : 'Sample Hex Dump Row Visualization'}</span>
              <span className="text-cyan-400 font-normal">{language === 'hu' ? 'Kattints bármelyik bájtra!' : 'Click any byte!'}</span>
            </div>

            <div className="overflow-x-auto">
              <div className="font-mono text-xs sm:text-sm flex items-center gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                {/* Offset */}
                <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold">
                  00000020:
                </div>

                {/* Hex Bytes */}
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-cyan-500/10 border border-cyan-500/40">
                  {[
                    { hex: '43', char: 'C' },
                    { hex: '50', char: 'P' },
                    { hex: '55', char: 'U' },
                    { hex: '20', char: ' ' },
                    { hex: '36', char: '6' },
                    { hex: '35', char: '5' },
                    { hex: '30', char: '0' },
                    { hex: '32', char: '2' },
                    { hex: '00', char: '.' },
                    { hex: 'A9', char: '.' },
                    { hex: 'FF', char: '.' },
                    { hex: '85', char: '.' },
                    { hex: '20', char: ' ' },
                    { hex: '60', char: '`' },
                    { hex: '00', char: '.' },
                    { hex: '00', char: '.' },
                  ].map((item, i) => (
                    <span
                      key={i}
                      className={`px-1 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        item.hex === '00'
                          ? 'text-slate-600 hover:bg-slate-800'
                          : item.char !== '.'
                          ? 'text-emerald-300 font-bold bg-emerald-950/40 hover:bg-emerald-900/60'
                          : 'text-cyan-300 hover:bg-cyan-900/40'
                      }`}
                      title={`Offset: $002${i.toString(16).toUpperCase()} | Hex: 0x${item.hex} | ASCII: '${item.char}'`}
                    >
                      {item.hex}
                    </span>
                  ))}
                </div>

                {/* ASCII */}
                <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold tracking-widest">
                  |CPU 6502..... `..|
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Nibble & Hex Explained */}
      {activeStep === 1 && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-cyan-300">
              {language === 'hu'
                ? '💡 Miért a 16-os (Hex) számrendszert használjuk a számítástechnikában?'
                : '💡 Why do we use Hexadecimal in Computer Science?'}
            </p>
            <p className="text-slate-400">
              {language === 'hu'
                ? 'Egy 8-bites bájt értéke binárisan 00000000 és 11111111 között van (256 különböző érték). Mivel 16 = 2⁴, pontosan 4 bit (egy fél-bájt vagy NIBBLE) írható le 1etlen hexadecimális számjeggyel (0-tól F-ig). Így 1 bájt mindig pontosan 2 hex karakter!'
                : 'An 8-bit byte ranges from 00000000 to 11111111 (256 values). Since 16 = 2⁴, exactly 4 bits (a NIBBLE) can be represented by 1 hex digit (0-F). Thus, 1 byte is always exactly 2 hex characters!'}
            </p>
          </div>

          {/* Interactive Nibble Combiner */}
          <div className="bg-[#0A0E18] border border-cyan-500/30 p-4 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-white uppercase">
                {language === 'hu' ? 'Interaktív Fél-bájt (Nibble) Összeállító' : 'Interactive Nibble Combiner'}
              </span>
              <span className="text-cyan-400 font-bold">1 Bájt = Felső 4-bit + Alsó 4-bit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* High Nibble */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold">
                    {language === 'hu' ? 'Felső 4 bit (High Nibble)' : 'High Nibble (Bits 7..4)'}
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    0x{highNibble.toString(16).toUpperCase()} ({highNibbleBin})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={highNibble}
                  onChange={(e) => setHighNibble(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0 (0000)</span>
                  <span>7 (0111)</span>
                  <span>F (1111)</span>
                </div>
              </div>

              {/* Low Nibble */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-bold">
                    {language === 'hu' ? 'Alsó 4 bit (Low Nibble)' : 'Low Nibble (Bits 3..0)'}
                  </span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    0x{lowNibble.toString(16).toUpperCase()} ({lowNibbleBin})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={lowNibble}
                  onChange={(e) => setLowNibble(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0 (0000)</span>
                  <span>7 (0111)</span>
                  <span>F (1111)</span>
                </div>
              </div>
            </div>

            {/* Combined Result */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
                <div className="text-[10px] text-slate-400">HEX BÁJT</div>
                <div className="text-lg font-black text-cyan-300">
                  0x{combinedByte.toString(16).toUpperCase().padStart(2, '0')}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40">
                <div className="text-[10px] text-slate-400">BINÁRIS (8-BIT)</div>
                <div className="text-sm font-black text-indigo-300 pt-1">
                  {highNibbleBin} {lowNibbleBin}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                <div className="text-[10px] text-slate-400">DECIMÁLIS</div>
                <div className="text-lg font-black text-emerald-300">{combinedByte}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40">
                <div className="text-[10px] text-slate-400">ASCII KARAKTER</div>
                <div className="text-lg font-black text-amber-300">'{asciiChar}'</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Address Math */}
      {activeStep === 2 && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-cyan-300">
              {language === 'hu'
                ? '📐 Hogyan határozzuk meg egy cella memóriacímét?'
                : '📐 How to calculate a memory cell physical address?'}
            </p>
            <p className="text-slate-400">
              {language === 'hu'
                ? 'Minden sor 16 bájtot tartalmaz (0x00-tól 0x0F eltolásig). A fizikai cím képlete: CÍM = (Sor Alapcím) + (Oszlop Index).'
                : 'Every row holds 16 bytes (offsets +0x00 to +0x0F). Formula: PHYSICAL ADDRESS = (Row Base Address) + (Column Index).'}
            </p>
          </div>

          {/* Interactive Calculator */}
          <div className="bg-[#0A0E18] border border-cyan-500/30 p-4 rounded-xl flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold">
                    {language === 'hu' ? 'Sor Alapcíme (Offset)' : 'Row Base Offset'}
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    0x{(calcRow * 16).toString(16).toUpperCase().padStart(4, '0')}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={calcRow}
                  onChange={(e) => setCalcRow(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  {language === 'hu' ? 'Sor index:' : 'Row index:'} {calcRow} (0x{calcRow.toString(16).toUpperCase()})
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-bold">
                    {language === 'hu' ? 'Oszlop Eltolás (+0 .. +F)' : 'Column Offset (+0 .. +F)'}
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    +0x{calcCol.toString(16).toUpperCase()} (+{calcCol})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={calcCol}
                  onChange={(e) => setCalcCol(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  {language === 'hu' ? 'Oszlop:' : 'Column:'} {calcCol}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">
                  {language === 'hu' ? 'Kiszámított Memóriacím' : 'Calculated Physical Address'}
                </div>
                <div className="text-xl font-mono font-black text-cyan-300">
                  0x{calculatedAddr.toString(16).toUpperCase().padStart(4, '0')} (${calculatedAddr.toString(16).toUpperCase().padStart(4, '0')})
                </div>
              </div>
              <div className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                0x{(calcRow * 16).toString(16).toUpperCase().padStart(4, '0')} + 0x{calcCol.toString(16).toUpperCase()} = <strong className="text-cyan-300">0x{calculatedAddr.toString(16).toUpperCase().padStart(4, '0')}</strong> ({calculatedAddr}. bájt a RAM-ban)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Endianness */}
      {activeStep === 3 && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-cyan-300">
              {language === 'hu'
                ? '🔄 Little-Endian vs Big-Endian: Miért fordulnak meg a bájtok a memóriában?'
                : '🔄 Little-Endian vs Big-Endian: Why do multi-byte integers swap order?'}
            </p>
            <p className="text-slate-400">
              {language === 'hu'
                ? 'A 8-bites processzorok (mint a MOS 6502 / 6510, Z80, x86) LITTLE-ENDIAN bájtsorrendet használnak: a 16-bites mutatók vagy értékek ALACSONYABB HELYIÉRTÉKŰ bájta (LSB) kerül az alacsonyabb memóriacímre! Ezzel szemben a BIG-ENDIAN (pl. Motorola 68000, hálózati csomagok) a magas helyiértéket (MSB) írja előre.'
                : '8-bit microprocessors (like 6502/6510, Z80, x86) use LITTLE-ENDIAN: the least significant byte (LSB) is stored first at the lower address! BIG-ENDIAN (Motorola 68000, network protocols) stores MSB first.'}
            </p>
          </div>

          <div className="bg-[#0A0E18] border border-cyan-500/30 p-4 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-white">
                {language === 'hu' ? '16-Bites Érték Kiválasztása' : 'Select 16-Bit Integer Value'}
              </span>
              <span className="text-cyan-300 font-bold">
                0x{endianWord.toString(16).toUpperCase().padStart(4, '0')} (${endianWord.toString(16).toUpperCase().padStart(4, '0')})
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[0x1234, 0x0801, 0xA000, 0xD020, 0xFFFE, 0x0400].map((val) => (
                <button
                  key={val}
                  onClick={() => setEndianWord(val)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                    endianWord === val
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  0x{val.toString(16).toUpperCase().padStart(4, '0')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Little Endian */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/40 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    LITTLE-ENDIAN (6502, C64, x86)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">LSB First</span>
                </div>
                <div className="flex items-center justify-center gap-3 font-mono text-center">
                  <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/50">
                    <div className="text-[9px] text-slate-400">CÍM $0000 (Low Byte)</div>
                    <div className="text-base font-bold text-cyan-300">
                      0x{endianLow.toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/50">
                    <div className="text-[9px] text-slate-400">CÍM $0001 (High Byte)</div>
                    <div className="text-base font-bold text-cyan-300">
                      0x{endianHigh.toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'hu'
                    ? 'A memóriában így néz ki a Hex Dumpban:'
                    : 'Appears in memory hex dump as:'}{' '}
                  <strong className="text-cyan-300 font-mono">
                    {endianLow.toString(16).toUpperCase().padStart(2, '0')}{' '}
                    {endianHigh.toString(16).toUpperCase().padStart(2, '0')}
                  </strong>
                </p>
              </div>

              {/* Big Endian */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/40 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    BIG-ENDIAN (Motorola, Network)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">MSB First</span>
                </div>
                <div className="flex items-center justify-center gap-3 font-mono text-center">
                  <div className="p-2 rounded bg-purple-950/60 border border-purple-500/50">
                    <div className="text-[9px] text-slate-400">CÍM $0000 (High Byte)</div>
                    <div className="text-base font-bold text-purple-300">
                      0x{endianHigh.toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="p-2 rounded bg-purple-950/60 border border-purple-500/50">
                    <div className="text-[9px] text-slate-400">CÍM $0001 (Low Byte)</div>
                    <div className="text-base font-bold text-purple-300">
                      0x{endianLow.toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'hu'
                    ? 'A memóriában így néz ki a Hex Dumpban:'
                    : 'Appears in memory hex dump as:'}{' '}
                  <strong className="text-purple-300 font-mono">
                    {endianHigh.toString(16).toUpperCase().padStart(2, '0')}{' '}
                    {endianLow.toString(16).toUpperCase().padStart(2, '0')}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
