import React from 'react';
import {
  AddressDecoderState,
  AddressDecodingMode,
  IoDeviceMapping,
  IoMappingMode,
} from '../../../types/ioEmulator';
import { calculateFoldbackMirrors } from '../../../core/ioEmulatorEngine';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Binary,
  Cpu,
  Layers,
  Network,
  Sparkles,
  Split,
  ToggleLeft,
  Zap,
} from 'lucide-react';

interface IoAddressDecoderViewProps {
  devices: IoDeviceMapping[];
  config: {
    mappingMode: IoMappingMode;
    memoryBaseAddress: number;
    addressDecoding: AddressDecoderState;
  };
  onUpdateDecoder: (updates: Partial<AddressDecoderState>) => void;
  activeAddress?: number;
  activeChipSelect?: string;
}

export const IoAddressDecoderView: React.FC<IoAddressDecoderViewProps> = ({
  devices,
  config,
  onUpdateDecoder,
  activeAddress = 0xe000,
  activeChipSelect,
}) => {
  const { language } = useI18n();
  const { addressDecoding, mappingMode } = config;

  const toHex = (v: number) => `0x${(v & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
  const toBin16 = (v: number) => (v & 0xffff).toString(2).padStart(16, '0');

  const binAddr = toBin16(activeAddress);
  const top4Bits = binAddr.slice(0, 4); // A15..A12
  const mid4Bits = binAddr.slice(4, 8); // A11..A8
  const low8Bits = binAddr.slice(8, 16); // A7..A0

  const isEPage = (activeAddress & 0xf000) === 0xe000;
  const isDecoderEnabled = addressDecoding.enableG1 && !addressDecoding.enableG2A && !addressDecoding.enableG2B;

  // Compute foldback mirrors
  const foldbackList = calculateFoldbackMirrors(config.memoryBaseAddress, addressDecoding.highAddressBitsMask);

  // 74LS138 Output Lines (/Y0 to /Y7)
  const decoderOutputs = [
    { pin: '/Y0', addr: 0xe000, label: 'LED Bar (0xE000)', deviceId: 'dev-led-bar', color: 'text-emerald-400' },
    { pin: '/Y1', addr: 0xe001, label: 'Push Buttons (0xE001)', deviceId: 'dev-push-buttons', color: 'text-cyan-400' },
    { pin: '/Y2', addr: 0xe002, label: '7-Seg Digit 1 (0xE002)', deviceId: 'dev-seven-seg', color: 'text-rose-400' },
    { pin: '/Y3', addr: 0xe003, label: '7-Seg Digit 2 (0xE003)', deviceId: 'dev-seven-seg', color: 'text-rose-400' },
    { pin: '/Y4', addr: 0xe004, label: 'DIP Switches (0xE004)', deviceId: 'dev-dip-switches', color: 'text-amber-400' },
    { pin: '/Y5', addr: 0xe005, label: 'Matrix Keypad (0xE005-06)', deviceId: 'dev-matrix-keypad', color: 'text-purple-400' },
    { pin: '/Y6', addr: 0xe008, label: '16x2 LCD (0xE008-09)', deviceId: 'dev-char-lcd', color: 'text-teal-400' },
    { pin: '/Y7', addr: 0xe00a, label: 'ADC / DAC (0xE00A-0B)', deviceId: 'dev-adc-pot', color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Decoding Mode Selector & Configuration Toolbar */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-200">
              {language === 'hu' ? 'Hardver Címdekóder Architektúra' : 'Hardware Address Decoder Architecture'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? '74LS138 3-to-8 Dekóder & Cím-Tükröződés (Foldback) Szimulátor'
                : '74LS138 3-to-8 Decoder & Address Aliasing / Foldback Simulator'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() =>
              onUpdateDecoder({
                decodingMode: 'FULL_DECODING',
                highAddressBitsMask: 0xffff,
              })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              addressDecoding.decodingMode === 'FULL_DECODING'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? 'Teljes Dekódolás (Full)' : 'Full Decoding'}
          </button>
          <button
            onClick={() =>
              onUpdateDecoder({
                decodingMode: 'PARTIAL_DECODING',
                highAddressBitsMask: 0xf000,
              })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              addressDecoding.decodingMode === 'PARTIAL_DECODING'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hu' ? 'Részleges Dekódolás (Foldback)' : 'Partial Decoding (Foldback)'}
          </button>
        </div>
      </div>

      {/* Interactive 74LS138 Address Decoder Schematic Graphic */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? '74LS138 IC KAPCSOLÁSI RAJZ & JELSZINTEK' : '74LS138 IC SCHEMATIC & LOGIC LEVELS'}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Vizsgált Cím (Bus):</span>
            <span className="text-cyan-300 font-bold">{toHex(activeAddress)}</span>
          </div>
        </div>

        {/* Address Bus Breakdown Diagram */}
        <div className="mb-5 p-3.5 bg-black/60 rounded-xl border border-slate-900">
          <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>A15..A0 16-BITES CÍMBUSZ BONTÁSA</span>
            <span>
              Cím: <strong className="text-purple-300 font-mono">{toHex(activeAddress)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Top 4 bits (Page Select: 0xE = 1110) */}
            <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/80 flex flex-col items-center">
              <span className="text-[10px] text-purple-300 font-bold mb-1">A15 - A12 (Felsõ Nibble)</span>
              <span className="text-sm font-extrabold text-purple-200 tracking-widest">{top4Bits}</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {isEPage ? '0xE lap kiválasztva (/CS aktív)' : 'Nem 0xE lap'}
              </span>
            </div>

            {/* Middle 4 bits (A11 - A8) */}
            <div
              className={`p-2.5 rounded-lg border flex flex-col items-center transition-all ${
                addressDecoding.decodingMode === 'PARTIAL_DECODING'
                  ? 'bg-amber-950/30 border-amber-600/80'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <span className="text-[10px] text-slate-300 font-bold mb-1">A11 - A8 (Al-lap)</span>
              <span className="text-sm font-extrabold text-slate-200 tracking-widest">{mid4Bits}</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {addressDecoding.decodingMode === 'PARTIAL_DECODING'
                  ? '⚠️ Figyelmen kívül hagyva (Foldback!)'
                  : 'Dekódolva'}
              </span>
            </div>

            {/* Low 8 bits (A7 - A0) */}
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-300 font-bold mb-1">A7 - A0 (Periféria Index)</span>
              <span className="text-sm font-extrabold text-slate-200 tracking-widest">{low8Bits}</span>
              <span className="text-[9px] text-slate-400 mt-1">Offset: 0x{low8Bits}</span>
            </div>
          </div>
        </div>

        {/* Decoder Chip & Output Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Input pins */}
          <div className="lg:col-span-4 flex flex-col gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Bemenetek (Inputs)
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">A, B, C (Címvonalak A0..A2):</span>
              <span className="text-cyan-400 font-bold">{activeAddress & 0x07}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">G1 (Engedélyező HIGH):</span>
              <span className={addressDecoding.enableG1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                {addressDecoding.enableG1 ? 'HIGH (1)' : 'LOW (0)'}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">/G2A, /G2B (Engedélyező LOW):</span>
              <span className="text-emerald-400 font-bold">GND (0)</span>
            </div>
          </div>

          {/* Center: 74LS138 IC Body */}
          <div className="lg:col-span-4 p-4 bg-gradient-to-br from-purple-950/80 to-slate-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono text-purple-300 font-extrabold uppercase tracking-widest mb-1">
              TEXAS INSTRUMENTS
            </span>
            <h3 className="text-lg font-mono font-extrabold text-white">74LS138</h3>
            <span className="text-[11px] font-mono text-purple-200">3-to-8 Line Decoder / Demux</span>
            <div className="mt-3 px-3 py-1 bg-black/60 rounded-full border border-purple-800 text-[10px] font-mono text-slate-300">
              {isDecoderEnabled ? 'IC ÁLLAPOT: AKTÍV' : 'IC ÁLLAPOT: TILTVA'}
            </div>
          </div>

          {/* Right: Output Lines /Y0 .. /Y7 */}
          <div className="lg:col-span-4 flex flex-col gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kimeneti Vonalak (/Y0 - /Y7)
            </div>
            {decoderOutputs.map((out) => {
              const isSelected = activeAddress === out.addr || (activeChipSelect && activeChipSelect.includes(out.pin));
              return (
                <div
                  key={out.pin}
                  className={`flex items-center justify-between p-1.5 rounded border transition-all ${
                    isSelected
                      ? 'bg-purple-900/40 border-purple-500 shadow-md text-white font-bold'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${isSelected ? 'text-purple-300' : 'text-slate-500'}`}>
                      {out.pin}
                    </span>
                    <span className="text-[10px]">{out.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {isSelected ? 'LOW (0) [AKTÍV]' : 'HIGH (1)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Partial Decoding Foldback / Mirroring Analysis Section */}
      {addressDecoding.decodingMode === 'PARTIAL_DECODING' && (
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-bold text-amber-300">
              {language === 'hu'
                ? 'RÉSZLEGES CÍMDEKÓDOLÁS & TÜKRÖZÖTT CÍMEK (FOLDBACK / ALIASING)'
                : 'PARTIAL DECODING & ADDRESS MIRRORS (FOLDBACK / ALIASING)'}
            </h4>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            {language === 'hu'
              ? 'Mivel az A8..A11 címvonalak nincsenek bekötve, a perifériák az alábbi tükrözött címeken is pontosan ugyanúgy elérhetőek:'
              : 'Because address lines A8..A11 are left floating/unconnected, the peripherals respond identically on all the following mirrored addresses:'}
          </p>

          <div className="flex flex-wrap gap-2">
            {foldbackList.slice(0, 8).map((m, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/50 font-mono text-xs text-amber-300"
              >
                {toHex(m.mirrorAddress)} ↔ {toHex(m.originalAddress)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
