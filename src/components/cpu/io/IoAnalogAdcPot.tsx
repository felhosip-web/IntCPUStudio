import React from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, Gauge, Cpu } from 'lucide-react';

interface IoAnalogAdcPotProps {
  adcDevice: IoDeviceMapping;
  dacDevice: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

export const IoAnalogAdcPot: React.FC<IoAnalogAdcPotProps> = ({
  adcDevice,
  dacDevice,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();

  const adcState = adcDevice.adcPotState || {
    analogVoltage: 2.5,
    quantizedValue: 128,
  };

  const dacState = dacDevice.dacVoltState || {
    latchedValue: 128,
    outputVoltage: 2.5,
  };

  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;
  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');

  const handleVoltageChange = (v: number) => {
    const clampedV = Math.max(0, Math.min(5.0, v));
    const quantized = Math.round((clampedV / 5.0) * 255);
    onUpdateDevice({
      ...adcDevice,
      adcPotState: {
        analogVoltage: clampedV,
        quantizedValue: quantized,
      },
    });
  };

  // Needle angle calculation for DAC analog meter (-60 deg to +60 deg)
  const dacNeedleDeg = -60 + (dacState.outputVoltage / 5.0) * 120;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Potentiometer & 8-Bit SAR ADC (Input) */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
        {isBusActive && (
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200">
                {language === 'hu' ? adcDevice.nameHu : adcDevice.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="text-amber-400 font-semibold">{toHex(adcDevice.baseAddress)}</span>
                <span>•</span>
                <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                  {adcDevice.chipSelectLabel}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{adcDevice.accessMode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analog Slider & Voltage Indicator */}
        <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {language === 'hu' ? 'Analóg Bemenet (0.0V - 5.0V):' : 'Analog Input (0.0V - 5.0V):'}
            </span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {adcState.analogVoltage.toFixed(2)} V
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="5"
            step="0.02"
            value={adcState.analogVoltage}
            onChange={(e) => handleVoltageChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>0.0V (GND)</span>
            <span>2.5V (VCC/2)</span>
            <span>5.0V (VCC)</span>
          </div>

          {/* Quantization SAR breakdown */}
          <div className="mt-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">8-Bit SAR Digitális:</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold">{toHex(adcState.quantizedValue)}</span>
              <span className="text-slate-500">({toBin(adcState.quantizedValue)})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-500" />
            <span>ADC0804 SAR Converter</span>
          </div>
          <span>LSB: ~19.5 mV</span>
        </div>
      </div>

      {/* 2. DAC & Analog Voltmeter (Output) */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
        {isBusActive && (
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200">
                {language === 'hu' ? dacDevice.nameHu : dacDevice.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="text-blue-400 font-semibold">{toHex(dacDevice.baseAddress)}</span>
                <span>•</span>
                <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                  {dacDevice.chipSelectLabel}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{dacDevice.accessMode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vintage Analog Needle Gauge */}
        <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-3 flex flex-col items-center justify-center">
          <div className="relative w-44 h-24 overflow-hidden flex items-end justify-center">
            {/* Meter Dial Arc */}
            <svg viewBox="0 0 160 90" className="w-full h-full">
              {/* Arc background */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
              />
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray="188"
                strokeDashoffset={188 - (dacState.outputVoltage / 5.0) * 188}
                className="transition-all duration-300"
              />
              {/* Dial tick marks */}
              <text x="18" y="88" fill="#64748b" fontSize="8" fontFamily="monospace">0V</text>
              <text x="75" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">2.5V</text>
              <text x="135" y="88" fill="#64748b" fontSize="8" fontFamily="monospace">5V</text>
            </svg>

            {/* Needle Pivot */}
            <div
              className="absolute bottom-0 w-1 h-20 bg-rose-500 origin-bottom transition-transform duration-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              style={{ transform: `rotate(${dacNeedleDeg}deg)` }}
            />
            <div className="absolute bottom-0 w-4 h-4 bg-slate-200 rounded-full border-2 border-slate-900" />
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Kimenő feszültség:</span>
            <span className="text-blue-400 font-bold text-sm">
              {dacState.outputVoltage.toFixed(2)} V
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span>R-2R Ladder DAC</span>
          <span>Latched Byte: <strong className="text-blue-300">{toHex(dacState.latchedValue)}</strong></span>
        </div>
      </div>
    </div>
  );
};
