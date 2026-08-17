import React from 'react';
import { PwmLiveState, PwmSimulationConfig } from '../../../types/mcuPwm';
import { useI18n } from '../../../i18n/I18nContext';
import { Check, Cpu, Info, Layers, Sliders } from 'lucide-react';

interface PwmRegistersViewProps {
  liveState: PwmLiveState;
  config: PwmSimulationConfig;
  onUpdateConfig: (updates: Partial<PwmSimulationConfig>) => void;
}

export const PwmRegistersView: React.FC<PwmRegistersViewProps> = ({
  liveState,
  config,
  onUpdateConfig,
}) => {
  const { language } = useI18n();

  const regs = liveState.registers;

  const renderByteRow = (
    name: string,
    val: number,
    bitLabels: string[],
    desc: string
  ) => {
    return (
      <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-3.5 flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs">{name}</span>
            <span className="text-[10px] text-slate-500">{desc}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-xs">
              0x{val.toString(16).toUpperCase().padStart(2, '0')}
            </span>
            <span className="text-slate-500 text-[10px]">({val})</span>
          </div>
        </div>

        {/* 8 Bits Visual Grid */}
        <div className="grid grid-cols-8 gap-1 text-center">
          {bitLabels.map((lbl, bitIdx) => {
            const bitPos = 7 - bitIdx;
            const isSet = (val & (1 << bitPos)) !== 0;
            return (
              <div
                key={bitIdx}
                className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  isSet
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[9px] font-bold truncate max-w-full">{lbl}</span>
                <span className="text-xs font-bold font-mono">{isSet ? '1' : '0'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">
              {language === 'hu'
                ? 'ATmega328P Timer & PWM Belső Hardver Regiszterek'
                : 'ATmega328P Timer & PWM Hardware Registers'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'TCCR (Timer/Counter Control), OCR (Output Compare), TCNT (Counter) és Megszakítás Bite-ok'
                : 'TCCR (Control), OCR (Compare Match), TCNT (Counter) and Interrupt Flag Bits'}
            </p>
          </div>
        </div>
      </div>

      {/* Registers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderByteRow(
          'TCCR0A',
          regs.TCCRA,
          ['COM0A1', 'COM0A0', 'COM0B1', 'COM0B0', '-', '-', 'WGM01', 'WGM00'],
          'Timer0 Vezérlő Regiszter A (Mód & Kimenet)'
        )}

        {renderByteRow(
          'TCCR0B',
          regs.TCCRB,
          ['FOC0A', 'FOC0B', '-', '-', 'WGM02', 'CS02', 'CS01', 'CS00'],
          'Timer0 Vezérlő Regiszter B (Előosztó & WGM02)'
        )}

        {renderByteRow(
          'OCR0A',
          config.ocrValue & 0xff,
          ['Bit7', 'Bit6', 'Bit5', 'Bit4', 'Bit3', 'Bit2', 'Bit1', 'Bit0'],
          'Output Compare Register A (PWM Kitöltési Küszöb D6)'
        )}

        {renderByteRow(
          'TCNT0',
          liveState.tcntCurrent & 0xff,
          ['Bit7', 'Bit6', 'Bit5', 'Bit4', 'Bit3', 'Bit2', 'Bit1', 'Bit0'],
          'Timer/Counter0 Számláló Regiszter (0..255)'
        )}
      </div>

      {/* Explanatory Bit Mapping Reference */}
      <div className="bg-[#05070A] p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 flex flex-col gap-2.5">
        <span className="text-white font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{language === 'hu' ? 'WGM & COM Bit Jelentések:' : 'WGM & COM Bit Mapping Reference:'}</span>
        </span>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
          <li>
            <strong className="text-slate-200">WGM01:WGM00 = 11:</strong> Fast PWM mód (számlálás 0-tól 255-ig, túlcsorduláskor azonnal 0-ra ugrik).
          </li>
          <li>
            <strong className="text-slate-200">WGM01:WGM00 = 01:</strong> Phase Correct PWM mód (szimmetrikus számlálás 0-tól 255-ig fel, majd 255-től 0-ig le).
          </li>
          <li>
            <strong className="text-slate-200">COM0A1:COM0A0 = 10:</strong> Non-inverting mód (a D6 kimenet HIGH lesz a ciklus elején, és LOW összehasonlítási egyezéskor).
          </li>
          <li>
            <strong className="text-slate-200">CS02..CS00:</strong> Előosztó választás (001: /1, 010: /8, 011: /64, 100: /256, 101: /1024).
          </li>
        </ul>
      </div>
    </div>
  );
};
