import React from 'react';
import { AdcLiveState, AdcSimulationConfig } from '../../../types/mcuAdc';
import { useI18n } from '../../../i18n/I18nContext';
import { Binary, Check, Cpu, HelpCircle, Lock, Sliders } from 'lucide-react';

interface AdcRegistersViewProps {
  liveState: AdcLiveState;
  config: AdcSimulationConfig;
  onUpdateConfig: (newConfig: Partial<AdcSimulationConfig>) => void;
  vRef: number;
}

export const AdcRegistersView: React.FC<AdcRegistersViewProps> = ({
  liveState,
  config,
  onUpdateConfig,
  vRef,
}) => {
  const { language } = useI18n();

  const renderByteBitRow = (
    name: string,
    val: number,
    bitLabels: string[],
    bitTooltips: string[],
    desc: string,
    descHu: string,
    onBitToggle?: (bitIdx: number) => void
  ) => {
    return (
      <div className="p-3 rounded-xl bg-[#05070A] border border-slate-800 flex flex-col gap-2 shadow-inner">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">{name}</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              ({language === 'hu' ? descHu : desc})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              0x{val.toString(16).padStart(2, '0').toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">({val})</span>
          </div>
        </div>

        {/* 8 Bits Grid */}
        <div className="grid grid-cols-8 gap-1 font-mono">
          {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
            const isBitSet = (val & (1 << bit)) !== 0;
            const bitLabel = bitLabels[7 - bit];
            const bitTip = bitTooltips[7 - bit];

            return (
              <button
                key={bit}
                onClick={() => onBitToggle && onBitToggle(bit)}
                disabled={!onBitToggle}
                className={`py-1.5 rounded-lg border text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                  onBitToggle ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isBitSet
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title={bitTip}
              >
                <span>{isBitSet ? '1' : '0'}</span>
                <span className="text-[7.5px] text-slate-400 font-normal truncate max-w-full">
                  {bitLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span>
                {language === 'hu'
                  ? 'ADC Hardver Vezérlő & Adat Regiszterek'
                  : 'ADC Hardware Control & Data Registers'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                ATmega328P Standard
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'ADMUX, ADCSRA, ADCSRB, ADCL, ADCH és DIDR0 közvetlen bit-állapota'
                : 'Direct bitwise view of ADMUX, ADCSRA, ADCSRB, ADCL, ADCH, and DIDR0'}
            </p>
          </div>
        </div>

        {/* 10-bit Data Latch Status */}
        <div className="flex items-center gap-2 bg-[#05070A] px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">ADC 10-bit:</span>
          <span className="text-emerald-400 font-bold">{liveState.rawResult10Bit}</span>
          <span className="text-slate-500">
            (0x{liveState.rawResult10Bit.toString(16).toUpperCase()})
          </span>
        </div>
      </div>

      {/* Registers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ADMUX */}
        {renderByteBitRow(
          'ADMUX',
          liveState.ADMUX,
          ['REFS1', 'REFS0', 'ADLAR', '-', 'MUX3', 'MUX2', 'MUX1', 'MUX0'],
          [
            'REFS1: Referencia feszültség választó 1',
            'REFS0: Referencia feszültség választó 0',
            'ADLAR: Eredmény balra zárása (1=8-bit ADCH olvasás)',
            '-: Fenntartott',
            'MUX3: Analóg csatorna választó bit 3',
            'MUX2: Analóg csatorna választó bit 2',
            'MUX1: Analóg csatorna választó bit 1',
            'MUX0: Analóg csatorna választó bit 0',
          ],
          'Multiplexer & Reference Selection Register',
          'Multiplexer & Feszültség Referencia Regiszter'
        )}

        {/* ADCSRA */}
        {renderByteBitRow(
          'ADCSRA',
          liveState.ADCSRA,
          ['ADEN', 'ADSC', 'ADATE', 'ADIF', 'ADIE', 'ADPS2', 'ADPS1', 'ADPS0'],
          [
            'ADEN: ADC Engedélyezése (1=BE)',
            'ADSC: Átalakítás indítása (Start Conversion)',
            'ADATE: Automatikus indítás engedélyezése',
            'ADIF: Átalakítás befejezve megszakítás flag',
            'ADIE: ADC megszakítás engedélyezése',
            'ADPS2: Órajel előosztó bit 2',
            'ADPS1: Órajel előosztó bit 1',
            'ADPS0: Órajel előosztó bit 0',
          ],
          'Control and Status Register A',
          'Vezérlő és Állapot Regiszter A'
        )}

        {/* ADCL & ADCH Data Registers */}
        <div className="p-3 rounded-xl bg-[#05070A] border border-slate-800 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-cyan-400">ADCL & ADCH (Data Registers)</span>
            <span className="text-[10px] text-slate-500">
              {config.alignment === 'RIGHT_10BIT' ? 'Right-adjusted' : 'Left-adjusted (ADLAR=1)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {/* ADCH */}
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-purple-400">ADCH</span>
                <span>0x{liveState.ADCH.toString(16).padStart(2, '0').toUpperCase()}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {config.alignment === 'RIGHT_10BIT'
                  ? 'Felső bitek: B9, B8'
                  : 'Felső 8 bit: B9..B2 (8-bit mód)'}
              </div>
            </div>

            {/* ADCL */}
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-cyan-400">ADCL</span>
                <span>0x{liveState.ADCL.toString(16).padStart(2, '0').toUpperCase()}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {config.alignment === 'RIGHT_10BIT'
                  ? 'Alsó 8 bit: B7..B0'
                  : 'Alsó bitek: B1, B0 (Shiftelt)'}
              </div>
            </div>
          </div>
        </div>

        {/* DIDR0 */}
        {renderByteBitRow(
          'DIDR0',
          liveState.DIDR0,
          ['ADC7D', 'ADC6D', 'ADC5D', 'ADC4D', 'ADC3D', 'ADC2D', 'ADC1D', 'ADC0D'],
          [
            'ADC7D: Digitális bemenet tiltása ADC7 lábon',
            'ADC6D: Digitális bemenet tiltása ADC6 lábon',
            'ADC5D: Digitális bemenet tiltása ADC5 lábon',
            'ADC4D: Digitális bemenet tiltása ADC4 lábon',
            'ADC3D: Digitális bemenet tiltása ADC3 lábon',
            'ADC2D: Digitális bemenet tiltása ADC2 lábon',
            'ADC1D: Digitális bemenet tiltása ADC1 lábon',
            'ADC0D: Digitális bemenet tiltása ADC0 lábon (Energia megtakarítás)',
          ],
          'Digital Input Disable Register 0 (Power Saving)',
          'Digitális Bemenet Tiltás Regiszter (Zajcsökkentés & Fogyasztás)'
        )}
      </div>
    </div>
  );
};
