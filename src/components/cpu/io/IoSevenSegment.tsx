import React from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { BCD_TO_7SEG_TABLE } from '../../../core/ioEmulatorEngine';
import { useI18n } from '../../../i18n/I18nContext';
import { Binary, Monitor } from 'lucide-react';

interface IoSevenSegmentProps {
  device: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

export const IoSevenSegment: React.FC<IoSevenSegmentProps> = ({
  device,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();
  const segState = device.sevenSegState || {
    mode: 'BCD_DECODER',
    digit1: 0,
    digit2: 0,
    commonAnode: false,
  };

  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  // Helper to render an authentic 7-segment digit
  const renderDigit = (value: number, isDigit2: boolean = false) => {
    let segmentBits = 0;
    if (segState.mode === 'BCD_DECODER') {
      const nibble = value & 0x0f;
      segmentBits = BCD_TO_7SEG_TABLE[nibble] || 0;
    } else {
      segmentBits = value & 0xff;
    }

    // Segment active booleans (bit 0 = a, 1 = b, 2 = c, 3 = d, 4 = e, 5 = f, 6 = g, 7 = dp)
    const segA = (segmentBits & (1 << 0)) !== 0;
    const segB = (segmentBits & (1 << 1)) !== 0;
    const segC = (segmentBits & (1 << 2)) !== 0;
    const segD = (segmentBits & (1 << 3)) !== 0;
    const segE = (segmentBits & (1 << 4)) !== 0;
    const segF = (segmentBits & (1 << 5)) !== 0;
    const segG = (segmentBits & (1 << 6)) !== 0;
    const segDP = (segmentBits & (1 << 7)) !== 0;

    const onColor = '#f43f5e'; // Ruby red glow
    const offColor = '#24080e';

    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative p-2.5 bg-black/90 rounded-xl border border-rose-950/80 shadow-[inset_0_0_15px_rgba(244,63,94,0.15)]">
          <svg width="60" height="96" viewBox="0 0 60 96" className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
            {/* a (top) */}
            <polygon
              points="12,8 48,8 42,14 18,14"
              fill={segA ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* b (top right) */}
            <polygon
              points="49,10 55,16 51,44 45,39 48,15"
              fill={segB ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* c (bottom right) */}
            <polygon
              points="45,51 51,46 47,82 41,76 43,53"
              fill={segC ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* d (bottom) */}
            <polygon
              points="14,84 38,84 42,90 10,90"
              fill={segD ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* e (bottom left) */}
            <polygon
              points="9,46 15,51 13,76 7,82 5,50"
              fill={segE ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* f (top left) */}
            <polygon
              points="13,16 19,10 17,39 11,44 7,14"
              fill={segF ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* g (middle) */}
            <polygon
              points="15,46 41,46 45,49 41,52 15,52 11,49"
              fill={segG ? onColor : offColor}
              className="transition-colors duration-100"
            />
            {/* dp (decimal point) */}
            <circle
              cx="54"
              cy="87"
              r="3.5"
              fill={segDP ? onColor : offColor}
              className="transition-colors duration-100"
            />
          </svg>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max={segState.mode === 'BCD_DECODER' ? '15' : '255'}
            value={value}
            onChange={(e) => {
              const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
              onUpdateDevice({
                ...device,
                sevenSegState: {
                  ...segState,
                  digit1: isDigit2 ? segState.digit1 : val,
                  digit2: isDigit2 ? val : segState.digit2,
                },
              });
            }}
            className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
          />
          <span className="text-[10px] font-mono text-slate-500">
            {toHex(value)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {isBusActive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? device.nameHu : device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-rose-400 font-semibold">
                {toHex(device.baseAddress)} & {toHex(device.baseAddress + 1)}
              </span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                {device.chipSelectLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Decoder Mode Toggle (74LS47 BCD vs Raw Bits) */}
        <button
          onClick={() =>
            onUpdateDevice({
              ...device,
              sevenSegState: {
                ...segState,
                mode: segState.mode === 'BCD_DECODER' ? 'RAW_SEGMENTS' : 'BCD_DECODER',
              },
            })
          }
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-rose-300 transition-all cursor-pointer"
        >
          <Binary className="w-3 h-3 text-rose-400" />
          <span>{segState.mode === 'BCD_DECODER' ? '74LS47 BCD' : 'Raw (a-g,dp)'}</span>
        </button>
      </div>

      {/* Dual Digits */}
      <div className="flex items-center justify-center gap-5 p-3 bg-black/40 rounded-xl border border-slate-900 mb-3">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-slate-500 mb-1">
            {language === 'hu' ? '1. Digit (Tízesek - ' : 'Digit 1 (Tens - '}
            <span className="text-rose-400 font-bold">{toHex(device.baseAddress)}</span>)
          </span>
          {renderDigit(segState.digit1, false)}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-slate-500 mb-1">
            {language === 'hu' ? '2. Digit (Egyesek - ' : 'Digit 2 (Units - '}
            <span className="text-rose-400 font-bold">{toHex(device.baseAddress + 1)}</span>)
          </span>
          {renderDigit(segState.digit2, true)}
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="text-slate-500">
          {segState.mode === 'BCD_DECODER'
            ? language === 'hu'
              ? 'BCD 0..9 Auto-Dekóder'
              : 'BCD 0..9 Hardware Decoder'
            : language === 'hu'
            ? 'Direkt a-g,dp Szegmens Maszk'
            : 'Direct a-g,dp Segment Mask'}
        </span>
        <div className="flex items-center gap-1.5 text-slate-300 font-mono font-bold">
          <span>Dec: {segState.digit1 * 10 + segState.digit2}</span>
        </div>
      </div>
    </div>
  );
};
