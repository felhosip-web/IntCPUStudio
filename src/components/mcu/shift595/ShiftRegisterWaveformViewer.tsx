import React from 'react';
import { ShiftWaveformSample } from '../../../types/mcuShiftRegister';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, Radio } from 'lucide-react';

interface ShiftRegisterWaveformViewerProps {
  waveform: ShiftWaveformSample[];
  activeTimeIndex?: number;
}

export const ShiftRegisterWaveformViewer: React.FC<ShiftRegisterWaveformViewerProps> = ({
  waveform,
  activeTimeIndex,
}) => {
  const { language } = useI18n();

  if (!waveform || waveform.length === 0) {
    return (
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 text-center text-slate-500 font-mono text-xs italic">
        {language === 'hu'
          ? 'Még nincs rögzített hullámforma. Küldj el egy bájtot vagy léptesd az órajelet a diagram megtekintéséhez!'
          : 'No waveform samples captured yet. Shift a byte to inspect timing waveforms!'}
      </div>
    );
  }

  const signals = [
    { key: 'ds', label: 'DS (Data)', color: '#38BDF8' }, // sky blue
    { key: 'shcp', label: 'SH_CP (Clock)', color: '#F59E0B' }, // amber
    { key: 'stcp', label: 'ST_CP (Latch)', color: '#10B981' }, // emerald
    { key: 'q7s', label: "QH' (Cascade)", color: '#C084FC' }, // purple
    { key: 'oe_n', label: '/OE (Enable)', color: '#F43F5E' }, // rose
  ];

  // Scale calculations for SVG waveform renderer
  const stepWidth = 28;
  const signalHeight = 26;
  const svgWidth = Math.max(700, waveform.length * stepWidth + 40);
  const svgHeight = signals.length * (signalHeight + 12) + 30;

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? 'VALÓS IDEJŰ LOGIKAI IDŐZÍTÉSI DIAGRAM' : 'REAL-TIME TIMING WAVEFORM'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {waveform.length} {language === 'hu' ? 'időzítési lépés rögzítve' : 'timing steps captured'}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Waveform Canvas */}
      <div className="overflow-x-auto bg-black/70 rounded-xl border border-slate-900 p-2">
        <svg width={svgWidth} height={svgHeight} className="font-mono select-none">
          {/* Vertical grid lines for each step */}
          {waveform.map((sample, idx) => {
            const x = idx * stepWidth + 90;
            const isHighlight = activeTimeIndex === idx;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={10}
                  x2={x}
                  y2={svgHeight - 20}
                  stroke={isHighlight ? '#38BDF8' : '#1e293b'}
                  strokeWidth={isHighlight ? 2 : 1}
                  strokeDasharray={isHighlight ? undefined : '2,2'}
                />
                <text
                  x={x}
                  y={svgHeight - 8}
                  fill={isHighlight ? '#38BDF8' : '#64748b'}
                  fontSize="8"
                  textAnchor="middle"
                >
                  t{idx}
                </text>
              </g>
            );
          })}

          {/* Render each signal track */}
          {signals.map((sig, sigIdx) => {
            const baseY = sigIdx * (signalHeight + 12) + 28;
            const topY = baseY - 16;

            // Build step waveform path
            let pathD = '';
            waveform.forEach((sample, idx) => {
              const xStart = idx * stepWidth + 90;
              const xEnd = (idx + 1) * stepWidth + 90;
              const val = (sample as any)[sig.key] || 0;
              const y = val === 1 ? topY : baseY;

              if (idx === 0) {
                pathD = `M ${xStart} ${y} H ${xEnd}`;
              } else {
                const prevVal = (waveform[idx - 1] as any)[sig.key] || 0;
                if (prevVal !== val) {
                  pathD += ` V ${y} H ${xEnd}`;
                } else {
                  pathD += ` H ${xEnd}`;
                }
              }
            });

            return (
              <g key={sig.key}>
                {/* Signal label on the left */}
                <text
                  x={80}
                  y={baseY - 4}
                  fill={sig.color}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {sig.label}
                </text>

                {/* 0 / 1 tick marks */}
                <text x={84} y={topY + 3} fill="#475569" fontSize="7" textAnchor="start">1</text>
                <text x={84} y={baseY + 3} fill="#475569" fontSize="7" textAnchor="start">0</text>

                {/* Signal path trace */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={sig.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Az órajel felfutó élén (SH_CP ⤤) a DS bit belép az S0-ba.</span>
        <span>A retesz felfutó élén (ST_CP ⤤) a QA..QH kimenetek azonnal frissülnek.</span>
      </div>
    </div>
  );
};
