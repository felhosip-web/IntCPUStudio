import React from 'react';
import { AdcLiveState, AdcSimulationConfig } from '../../../types/mcuAdc';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, Info, Sliders, TrendingUp } from 'lucide-react';

interface AdcTransferCurveProps {
  liveState: AdcLiveState;
  config: AdcSimulationConfig;
  vRef: number;
}

export const AdcTransferCurve: React.FC<AdcTransferCurveProps> = ({
  liveState,
  config,
  vRef,
}) => {
  const { language } = useI18n();

  const lsbMv = liveState.lsbStepMilliVolts;
  const quantErrMv = liveState.quantizationErrorMv;
  const quantErrLsb = liveState.quantizationErrorLsb;

  // Generate discrete points around current Vin to plot the staircase transfer function
  const centerVin = liveState.sampleAndHoldVoltage;
  const rangeSpanV = Math.min(vRef, Math.max(0.1, 10 * (lsbMv / 1000))); // Span ~10 LSBs around point
  const minV = Math.max(0, centerVin - rangeSpanV / 2);
  const maxV = Math.min(vRef, centerVin + rangeSpanV / 2);

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingBottom = 30;
  const plotW = svgWidth - paddingLeft - 20;
  const plotH = svgHeight - paddingBottom - 20;

  const vToX = (v: number) => paddingLeft + ((v - minV) / (maxV - minV || 1)) * plotW;
  const codeToY = (c: number) => {
    const minCode = Math.floor((minV / vRef) * 1024);
    const maxCode = Math.ceil((maxV / vRef) * 1024);
    return 20 + plotH - ((c - minCode) / (maxCode - minCode || 1)) * plotH;
  };

  // Generate staircase steps
  const minCode = Math.floor((minV / vRef) * 1024);
  const maxCode = Math.ceil((maxV / vRef) * 1024);
  const steps: { x1: number; x2: number; y: number; code: number }[] = [];

  for (let c = minCode; c <= maxCode; c++) {
    const vStart = (c / 1024) * vRef;
    const vEnd = ((c + 1) / 1024) * vRef;
    steps.push({
      x1: vToX(Math.max(minV, vStart)),
      x2: vToX(Math.min(maxV, vEnd)),
      y: codeToY(c),
      code: c,
    });
  }

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span>
                {language === 'hu'
                  ? 'ADC Kvantálási Karakterisztika & Pontossági Matematika'
                  : 'ADC Quantization Transfer Function & Precision Math'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? `1 LSB = VREF / 1024 = ${lsbMv.toFixed(3)} mV. 10 bites felbontás.`
                : `1 LSB = VREF / 1024 = ${lsbMv.toFixed(3)} mV. 10-bit resolution.`}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-500 text-[10px]">1 LSB Lépésköz:</span>
          <span className="text-cyan-400 font-bold text-sm">{lsbMv.toFixed(3)} mV</span>
          <span className="text-[9px] text-slate-500">VREF / 1024</span>
        </div>

        <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-500 text-[10px]">Kvantálási Hiba (ΔV):</span>
          <span
            className={`font-bold text-sm ${
              Math.abs(quantErrLsb) <= 0.5 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {quantErrMv >= 0 ? '+' : ''}
            {quantErrMv.toFixed(2)} mV
          </span>
          <span className="text-[9px] text-slate-500">
            ({quantErrLsb >= 0 ? '+' : ''}
            {quantErrLsb.toFixed(2)} LSB)
          </span>
        </div>

        <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-500 text-[10px]">Elméleti SNR:</span>
          <span className="text-purple-400 font-bold text-sm">61.96 dB</span>
          <span className="text-[9px] text-slate-500">6.02*N + 1.76 dB</span>
        </div>

        <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-500 text-[10px]">Effektív Bitek (ENOB):</span>
          <span className="text-emerald-400 font-bold text-sm">~9.85 Bit</span>
          <span className="text-[9px] text-slate-500">Zajszűrés nélkül</span>
        </div>
      </div>

      {/* SVG Staircase Transfer Function */}
      <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-2 overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px] font-mono text-[9px]"
        >
          {/* Axis lines */}
          <line
            x1={paddingLeft}
            y1={20}
            x2={paddingLeft}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - 10}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Labels */}
          <text x={svgWidth - 10} y={svgHeight - 10} fill="#64748B" textAnchor="end">
            Vin (Volt)
          </text>
          <text x={10} y={15} fill="#64748B">
            Code
          </text>

          {/* Ideal Linear Line */}
          <line
            x1={vToX(minV)}
            y1={codeToY(minCode)}
            x2={vToX(maxV)}
            y2={codeToY(maxCode)}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* Staircase Steps */}
          {steps.map((st, i) => (
            <g key={i}>
              <line
                x1={st.x1}
                y1={st.y}
                x2={st.x2}
                y2={st.y}
                stroke="#06B6D4"
                strokeWidth="2"
              />
              {i < steps.length - 1 && (
                <line
                  x1={st.x2}
                  y1={st.y}
                  x2={st.x2}
                  y2={steps[i + 1].y}
                  stroke="#06B6D4"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}

          {/* Current Vin Operating Point (Red / Amber glowing dot) */}
          <circle
            cx={vToX(centerVin)}
            cy={codeToY(liveState.rawResult10Bit)}
            r={5}
            fill="#F59E0B"
            stroke="#FEF3C7"
            strokeWidth="2"
          />
          <text
            x={vToX(centerVin) + 8}
            y={codeToY(liveState.rawResult10Bit) - 6}
            fill="#F59E0B"
            fontWeight="bold"
          >
            Vin = {centerVin.toFixed(3)}V (Code: {liveState.rawResult10Bit})
          </text>
        </svg>
      </div>
    </div>
  );
};
