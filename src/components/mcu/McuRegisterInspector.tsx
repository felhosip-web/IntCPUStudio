import React, { useState } from 'react';
import { McuRegisters } from '../../types/mcu';
import { useI18n } from '../../i18n/I18nContext';
import { Binary, Check, Cpu, Edit2, Sliders, ToggleLeft } from 'lucide-react';

interface McuRegisterInspectorProps {
  registers: McuRegisters;
  onUpdateRegister: (name: keyof McuRegisters, value: number) => void;
}

export const McuRegisterInspector: React.FC<McuRegisterInspectorProps> = ({
  registers,
  onUpdateRegister,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'IO' | 'TIMERS_ADC' | 'GENERAL'>('IO');

  // Helper to render an 8-bit interactive bit-row
  const renderBitRow = (
    name: string,
    regKey: keyof McuRegisters,
    val: number,
    bitLabels?: string[],
    desc?: string
  ) => {
    return (
      <div className="p-2.5 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300">{name}</span>
            {desc && <span className="text-[10px] text-slate-500 hidden sm:inline">({desc})</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">0x{val.toString(16).padStart(2, '0').toUpperCase()}</span>
            <span className="text-[10px] text-slate-500 font-bold">({val})</span>
          </div>
        </div>

        {/* 8 Bits Grid */}
        <div className="grid grid-cols-8 gap-1">
          {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
            const isBitSet = (val & (1 << bit)) !== 0;
            const bitLabel = bitLabels ? bitLabels[7 - bit] : `b${bit}`;
            return (
              <button
                key={bit}
                onClick={() => {
                  const nextVal = val ^ (1 << bit);
                  onUpdateRegister(regKey, nextVal);
                }}
                className={`py-1.5 rounded-lg border font-mono text-[9px] font-bold flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isBitSet
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title={`Kattints a(z) ${name}.${bit} bit (${bitLabel}) átbillentéséhez`}
              >
                <span>{isBitSet ? '1' : '0'}</span>
                <span className="text-[7px] text-slate-500 font-normal truncate max-w-full">{bitLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-4 shadow-xl select-none">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200">
              {language === 'hu' ? 'MCU I/O Regiszterek & SREG' : 'MCU I/O Registers & SREG'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {language === 'hu' ? 'Közvetlen bitenkénti I/O állapot vizsgálat és állítás' : 'Direct bitwise I/O inspection & toggling'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#05070A] p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setActiveTab('IO')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === 'IO'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'hu' ? 'GPIO Portok' : 'GPIO Ports'}
          </button>
          <button
            onClick={() => setActiveTab('TIMERS_ADC')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === 'TIMERS_ADC'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timers / ADC
          </button>
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === 'GENERAL'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SREG / R0..R31
          </button>
        </div>
      </div>

      {/* Tab 1: GPIO Ports (B, C, D) */}
      {activeTab === 'IO' && (
        <div className="flex flex-col gap-2.5">
          {/* Port B */}
          <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between pt-1">
            <span>PORT B (D8..D13, PB5 Onboard LED)</span>
          </div>
          {renderBitRow('DDRB', 'DDRB', registers.DDRB, ['-', '-', 'PB5', 'PB4', 'PB3', 'PB2', 'PB1', 'PB0'], 'Adatirány: 1=OUT, 0=IN')}
          {renderBitRow('PORTB', 'PORTB', registers.PORTB, ['-', '-', 'PB5', 'PB4', 'PB3', 'PB2', 'PB1', 'PB0'], 'Kimeneti szint / Pull-up')}
          {renderBitRow('PINB', 'PINB', registers.PINB, ['-', '-', 'PB5', 'PB4', 'PB3', 'PB2', 'PB1', 'PB0'], 'Bemeneti fizikai szint')}

          {/* Port D */}
          <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>PORT D (D0..D7, INT0, PWM D3/D5/D6)</span>
          </div>
          {renderBitRow('DDRD', 'DDRD', registers.DDRD, ['PD7', 'PD6', 'PD5', 'PD4', 'PD3', 'PD2', 'PD1', 'PD0'], 'Adatirány D')}
          {renderBitRow('PORTD', 'PORTD', registers.PORTD, ['PD7', 'PD6', 'PD5', 'PD4', 'PD3', 'PD2', 'PD1', 'PD0'], 'Kimeneti szint D')}
        </div>
      )}

      {/* Tab 2: Timers & ADC */}
      {activeTab === 'TIMERS_ADC' && (
        <div className="flex flex-col gap-2.5">
          {/* ADC */}
          <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between pt-1">
            <span>ADC0..ADC5 (10-bit Successive Approximation)</span>
            <span className="text-cyan-400">Val: {registers.adcValue}</span>
          </div>
          {renderBitRow('ADMUX', 'ADMUX', registers.ADMUX, ['REFS1', 'REFS0', 'ADLAR', '-', 'MUX3', 'MUX2', 'MUX1', 'MUX0'], 'Referencia & Csatorna')}
          {renderBitRow('ADCSRA', 'ADCSRA', registers.ADCSRA, ['ADEN', 'ADSC', 'ADATE', 'ADIF', 'ADIE', 'ADPS2', 'ADPS1', 'ADPS0'], 'ADC Vezérlő & Státusz')}

          {/* Timer 0 */}
          <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>TIMER 0 (8-bit Fast PWM / Pins D5, D6)</span>
          </div>
          {renderBitRow('TCCR0A', 'TCCR0A', registers.TCCR0A, ['COM0A1', 'COM0A0', 'COM0B1', 'COM0B0', '-', '-', 'WGM01', 'WGM00'])}
          {renderBitRow('OCR0A', 'OCR0A', registers.OCR0A, undefined, `D6 PWM Duty: ${registers.OCR0A}`)}
          {renderBitRow('OCR0B', 'OCR0B', registers.OCR0B, undefined, `D5 PWM Duty: ${registers.OCR0B}`)}
        </div>
      )}

      {/* Tab 3: SREG & General Registers */}
      {activeTab === 'GENERAL' && (
        <div className="flex flex-col gap-3">
          {/* SREG Status Register */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col gap-2 shadow-inner">
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
              <span>SREG (Status Register)</span>
              <span className="text-[10px] text-slate-400">I • T • H • S • V • N • Z • C</span>
            </div>

            <div className="grid grid-cols-8 gap-1 font-mono text-center">
              {Object.entries(registers.sreg).map(([flag, isActive]) => (
                <div
                  key={flag}
                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">{flag}</span>
                  <span className="text-[9px]">{isActive ? '1' : '0'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* R16..R23 Fast Working Registers */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col gap-2 shadow-inner">
            <div className="text-xs font-mono font-bold text-slate-300">
              Working Registers (R16 - R23)
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-xs">
              {[16, 17, 18, 19, 20, 21, 22, 23].map((rNum) => (
                <div
                  key={rNum}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center"
                >
                  <span className="text-[9px] text-slate-500">R{rNum}</span>
                  <span className="font-bold text-amber-300">
                    0x{(registers.r[rNum] || 0).toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
