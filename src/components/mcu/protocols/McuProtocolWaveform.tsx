import React from 'react';
import { ProtocolSpec, ProtocolStep } from '../../../types/mcuProtocols';
import { useI18n } from '../../../i18n/I18nContext';

interface McuProtocolWaveformProps {
  spec: ProtocolSpec;
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const McuProtocolWaveform: React.FC<McuProtocolWaveformProps> = ({
  spec,
  currentStepIndex,
  onSelectStep,
}) => {
  const { language } = useI18n();
  const preset = spec.presets[0];
  const steps = preset?.steps || [];

  if (steps.length === 0) return null;

  // Extract all unique signal names across all steps
  const signalNames = Object.keys(steps[0].signals);
  const stepWidth = 110;
  const channelHeight = 44;
  const paddingLeft = 100;
  const paddingTop = 28;
  const totalWidth = paddingLeft + steps.length * stepWidth + 40;
  const totalHeight = paddingTop + signalNames.length * channelHeight + 35;

  return (
    <div className="w-full bg-[#05070A] border border-slate-800/90 rounded-2xl p-3 flex flex-col gap-2 overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-bold">
            {language === 'hu' ? 'Logikai Időzítési Diagram & Busz Állapotok' : 'Logic Timing Diagram & Bus Waveforms'}
          </span>
          <span className="text-slate-500 text-[11px]">
            ({steps.length} {language === 'hu' ? 'fázis / lépés' : 'phases / steps'})
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {language === 'hu' ? 'Kattints egy oszlopra a lépéshez' : 'Click a column to jump to step'}
        </span>
      </div>

      {/* Scrollable SVG Waveform Canvas */}
      <div className="w-full overflow-x-auto custom-scrollbar border border-slate-800/60 rounded-xl bg-[#030407]">
        <svg
          width={Math.max(680, totalWidth)}
          height={totalHeight}
          className="select-none cursor-pointer"
        >
          {/* Background Grid & Phase Column Highlights */}
          {steps.map((st, sIdx) => {
            const x = paddingLeft + sIdx * stepWidth;
            const isSelected = sIdx === currentStepIndex;

            return (
              <g
                key={`col-${sIdx}`}
                onClick={() => onSelectStep(sIdx)}
                className="transition-opacity"
              >
                {/* Column background hover / active highlight */}
                <rect
                  x={x}
                  y={paddingTop}
                  width={stepWidth}
                  height={signalNames.length * channelHeight}
                  fill={isSelected ? `${spec.color}15` : 'transparent'}
                  stroke={isSelected ? spec.color : '#1E293B'}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  strokeDasharray={isSelected ? undefined : '2,2'}
                />

                {/* Step Index & Time Marker on Top Header */}
                <text
                  x={x + stepWidth / 2}
                  y={16}
                  textAnchor="middle"
                  fill={isSelected ? '#38BDF8' : '#94A3B8'}
                  fontSize={10}
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  T+{st.timeUs}µs
                </text>

                {/* Category Badge on Bottom */}
                <rect
                  x={x + 4}
                  y={paddingTop + signalNames.length * channelHeight + 6}
                  width={stepWidth - 8}
                  height={18}
                  rx={4}
                  fill={isSelected ? `${spec.color}30` : '#0F172A'}
                  stroke={isSelected ? spec.color : '#334155'}
                  strokeWidth={1}
                />
                <text
                  x={x + stepWidth / 2}
                  y={paddingTop + signalNames.length * channelHeight + 19}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                  fontSize={9}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {st.category}
                </text>
              </g>
            );
          })}

          {/* Render Signal Rows */}
          {signalNames.map((sigName, sigIdx) => {
            const yBase = paddingTop + sigIdx * channelHeight + channelHeight / 2;
            const highY = yBase - 12;
            const lowY = yBase + 12;

            // Generate path for the digital / analog signal
            let pathD = '';
            steps.forEach((st, sIdx) => {
              const xStart = paddingLeft + sIdx * stepWidth;
              const xEnd = xStart + stepWidth;
              const val = st.signals[sigName];
              const yVal = val >= 0.5 ? highY : lowY;

              if (sIdx === 0) {
                pathD += `M ${xStart} ${yVal} L ${xEnd} ${yVal}`;
              } else {
                const prevVal = steps[sIdx - 1].signals[sigName];
                const prevYVal = prevVal >= 0.5 ? highY : lowY;
                if (prevYVal !== yVal) {
                  // Transition edge
                  pathD += ` L ${xStart} ${yVal} L ${xEnd} ${yVal}`;
                } else {
                  pathD += ` L ${xEnd} ${yVal}`;
                }
              }
            });

            return (
              <g key={`sig-${sigName}`}>
                {/* Channel Label Background */}
                <rect
                  x={0}
                  y={paddingTop + sigIdx * channelHeight}
                  width={paddingLeft - 4}
                  height={channelHeight}
                  fill="#0B0F17"
                  stroke="#1E293B"
                  strokeWidth={0.5}
                />

                {/* Channel Name */}
                <text
                  x={12}
                  y={yBase - 2}
                  fill="#E2E8F0"
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {sigName}
                </text>

                {/* Current Voltage Badge */}
                {steps[currentStepIndex].busVoltages &&
                  steps[currentStepIndex].busVoltages![sigName] !== undefined && (
                    <text
                      x={12}
                      y={yBase + 12}
                      fill={spec.color}
                      fontSize={9}
                      fontFamily="monospace"
                    >
                      {steps[currentStepIndex].busVoltages![sigName] >= 0 ? '+' : ''}
                      {steps[currentStepIndex].busVoltages![sigName].toFixed(1)}V
                    </text>
                  )}

                {/* Baseline Guide */}
                <line
                  x1={paddingLeft}
                  y1={lowY}
                  x2={totalWidth}
                  y2={lowY}
                  stroke="#1E293B"
                  strokeWidth={0.5}
                />

                {/* Signal Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={spec.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Step Sample Dots */}
                {steps.map((st, sIdx) => {
                  const x = paddingLeft + sIdx * stepWidth + stepWidth / 2;
                  const val = st.signals[sigName];
                  const yVal = val >= 0.5 ? highY : lowY;
                  const isCurrent = sIdx === currentStepIndex;

                  return (
                    <circle
                      key={`dot-${sigName}-${sIdx}`}
                      cx={x}
                      cy={yVal}
                      r={isCurrent ? 4.5 : 2.5}
                      fill={isCurrent ? '#FFFFFF' : spec.color}
                      stroke="#05070A"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Active Step Cursor Line */}
          {(() => {
            const curX = paddingLeft + currentStepIndex * stepWidth + stepWidth / 2;
            return (
              <g>
                <line
                  x1={curX}
                  y1={paddingTop - 6}
                  x2={curX}
                  y2={paddingTop + signalNames.length * channelHeight + 5}
                  stroke="#38BDF8"
                  strokeWidth={2}
                  strokeDasharray="4,3"
                />
                <polygon
                  points={`${curX - 5},${paddingTop - 6} ${curX + 5},${paddingTop - 6} ${curX},${paddingTop}`}
                  fill="#38BDF8"
                />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};
