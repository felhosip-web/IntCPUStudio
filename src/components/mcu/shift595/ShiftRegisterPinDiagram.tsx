import React from 'react';
import { ShiftRegisterChipState } from '../../../types/mcuShiftRegister';
import { useI18n } from '../../../i18n/I18nContext';
import { Cpu, Zap } from 'lucide-react';

interface ShiftRegisterPinDiagramProps {
  chip: ShiftRegisterChipState;
  onTogglePin?: (pinName: 'ds' | 'shcp' | 'stcp' | 'oe_n' | 'mr_n') => void;
  isCascaded?: boolean;
}

export const ShiftRegisterPinDiagram: React.FC<ShiftRegisterPinDiagramProps> = ({
  chip,
  onTogglePin,
  isCascaded,
}) => {
  const { language } = useI18n();

  const getPinLevel = (pin: number): { name: string; labelHu: string; level: boolean | string; isInteractive?: boolean; key?: any } => {
    switch (pin) {
      case 1: return { name: 'QB (Q1)', labelHu: 'Kimenet B', level: chip.qOutputs[1] };
      case 2: return { name: 'QC (Q2)', labelHu: 'Kimenet C', level: chip.qOutputs[2] };
      case 3: return { name: 'QD (Q3)', labelHu: 'Kimenet D', level: chip.qOutputs[3] };
      case 4: return { name: 'QE (Q4)', labelHu: 'Kimenet E', level: chip.qOutputs[4] };
      case 5: return { name: 'QF (Q5)', labelHu: 'Kimenet F', level: chip.qOutputs[5] };
      case 6: return { name: 'QG (Q6)', labelHu: 'Kimenet G', level: chip.qOutputs[6] };
      case 7: return { name: 'QH (Q7)', labelHu: 'Kimenet H', level: chip.qOutputs[7] };
      case 8: return { name: 'GND (0V)', labelHu: 'Föld (0V)', level: 'GND' };

      case 9: return { name: "QH' / Q7S", labelHu: 'Kaszkád Soros Kimenet', level: chip.pins.q7s };
      case 10: return { name: '/MR (/SRCLR)', labelHu: 'Mester Törlés (LOW=Reset)', level: chip.pins.mr_n, isInteractive: true, key: 'mr_n' };
      case 11: return { name: 'SH_CP (SRCLK)', labelHu: 'Léptető Órajel (Shift Clock)', level: chip.pins.shcp, isInteractive: true, key: 'shcp' };
      case 12: return { name: 'ST_CP (RCLK)', labelHu: 'Tároló Órajel (Latch Clock)', level: chip.pins.stcp, isInteractive: true, key: 'stcp' };
      case 13: return { name: '/OE', labelHu: 'Kimenet Engedélyezés (LOW=Aktív)', level: chip.pins.oe_n, isInteractive: true, key: 'oe_n' };
      case 14: return { name: 'DS (SER)', labelHu: 'Soros Adat Bemenet', level: chip.pins.ds, isInteractive: true, key: 'ds' };
      case 15: return { name: 'QA (Q0)', labelHu: 'Kimenet A', level: chip.qOutputs[0] };
      case 16: return { name: 'VCC (+5V)', labelHu: 'Tápfeszültség (+5V)', level: 'VCC' };
      default: return { name: 'NC', labelHu: 'Nincs bekötve', level: false };
    }
  };

  const leftPins = [1, 2, 3, 4, 5, 6, 7, 8];
  const rightPins = [16, 15, 14, 13, 12, 11, 10, 9];

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono font-bold text-slate-200">
            74HC595 DIP-16 TOKOZÁS & LÁBKIOSZTÁS
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/80 text-cyan-300">
          8-Bit SIPO Shift Register
        </span>
      </div>

      {/* Physical DIP-16 IC Package */}
      <div className="relative flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-slate-900 w-full max-w-md">
        {/* Left Pins (1..8) */}
        <div className="flex flex-col gap-1.5 flex-1 pr-2">
          {leftPins.map((pinNum) => {
            const pinInfo = getPinLevel(pinNum);
            const isHigh = pinInfo.level === true || pinInfo.level === 'VCC';
            const isGnd = pinInfo.level === 'GND';

            return (
              <div
                key={pinNum}
                onClick={() => pinInfo.isInteractive && onTogglePin && onTogglePin(pinInfo.key)}
                className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition-all select-none ${
                  pinInfo.isInteractive ? 'cursor-pointer hover:bg-slate-800/80' : ''
                } ${
                  isGnd
                    ? 'bg-slate-900/40 text-slate-400'
                    : isHigh
                    ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
                title={language === 'hu' ? pinInfo.labelHu : pinInfo.name}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 font-bold w-3">{pinNum}</span>
                  <span className="font-semibold">{pinInfo.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHigh
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : isGnd
                        ? 'bg-slate-600'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-[9px] font-extrabold">
                    {pinInfo.level === 'VCC' ? '5V' : pinInfo.level === 'GND' ? '0V' : pinInfo.level ? '1' : '0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* IC Body Visual */}
        <div className="w-24 bg-gradient-to-b from-slate-900 via-[#131b2e] to-slate-900 border-2 border-slate-700 rounded-xl py-6 flex flex-col items-center justify-between shadow-2xl relative">
          {/* Half-moon Notch */}
          <div className="w-5 h-2.5 bg-slate-950 border-b border-slate-700 rounded-b-full absolute -top-0.5" />

          {/* IC Label */}
          <div className="text-center my-auto">
            <span className="text-[9px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest block">
              NXP / TI
            </span>
            <span className="text-xs font-mono font-extrabold text-white tracking-wider">
              74HC595N
            </span>
            <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
              SIPO LATCH
            </span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-slate-600 absolute bottom-2 left-2" />
        </div>

        {/* Right Pins (16..9) */}
        <div className="flex flex-col gap-1.5 flex-1 pl-2">
          {rightPins.map((pinNum) => {
            const pinInfo = getPinLevel(pinNum);
            const isHigh = pinInfo.level === true || pinInfo.level === 'VCC';
            const isGnd = pinInfo.level === 'GND';

            return (
              <div
                key={pinNum}
                onClick={() => pinInfo.isInteractive && onTogglePin && onTogglePin(pinInfo.key)}
                className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition-all select-none ${
                  pinInfo.isInteractive ? 'cursor-pointer hover:bg-slate-800/80' : ''
                } ${
                  isGnd
                    ? 'bg-slate-900/40 text-slate-400'
                    : isHigh
                    ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
                title={language === 'hu' ? pinInfo.labelHu : pinInfo.name}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHigh
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : isGnd
                        ? 'bg-slate-600'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-[9px] font-extrabold">
                    {pinInfo.level === 'VCC' ? '5V' : pinInfo.level === 'GND' ? '0V' : pinInfo.level ? '1' : '0'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{pinInfo.name}</span>
                  <span className="text-[9px] text-slate-500 font-bold w-3 text-right">{pinNum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between w-full text-[10px] font-mono text-slate-400 px-2">
        <span>Kattints a bemeneti lábakra (DS, SH_CP, ST_CP, /OE, /MR) a manuális teszteléshez!</span>
      </div>
    </div>
  );
};
