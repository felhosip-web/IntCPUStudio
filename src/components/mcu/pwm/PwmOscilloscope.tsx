import React, { useState } from 'react';
import { PwmLiveState, PwmSimulationConfig } from '../../../types/mcuPwm';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  Clock,
  Maximize2,
  Minimize2,
  Sliders,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react';

interface PwmOscilloscopeProps {
  liveState: PwmLiveState;
  config: PwmSimulationConfig;
}

export const PwmOscilloscope: React.FC<PwmOscilloscopeProps> = ({
  liveState,
  config,
}) => {
  const { language } = useI18n();

  // Measurement cursors (0..100% of plot width)
  const [cursorA, setCursorA] = useState<number>(20);
  const [cursorB, setCursorB] = useState<number>(55);
  const [showRcFilter, setShowRcFilter] = useState<boolean>(true);
  const [showRamp, setShowRamp] = useState<boolean>(true);

  const samples = liveState.samples;
  if (!samples || samples.length === 0) return null;

  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 55;
  const paddingBottom = 30;
  const plotW = svgWidth - paddingLeft - 25;
  const plotH = svgHeight - paddingBottom - 25;

  const minTime = samples[0].timeUs;
  const maxTime = samples[samples.length - 1].timeUs;
  const timeSpan = maxTime - minTime || 1;

  const timeToX = (t: number) => paddingLeft + ((t - minTime) / timeSpan) * plotW;
  const voltToY = (v: number) => 20 + plotH - (v / 5.0) * plotH;
  const tcntToY = (tcnt: number, top: number) => 20 + plotH - (tcnt / (top || 1)) * plotH;

  // Build SVG Paths
  let pwmPath = '';
  let rcPath = '';
  let rampPath = '';

  samples.forEach((s, idx) => {
    const x = timeToX(s.timeUs);
    const yPwm = voltToY(s.pwmSignal);
    const yRc = voltToY(s.rcFilteredVoltage);
    const yRamp = tcntToY(s.tcnt, s.top);

    if (idx === 0) {
      pwmPath = `M ${x} ${yPwm}`;
      rcPath = `M ${x} ${yRc}`;
      rampPath = `M ${x} ${yRamp}`;
    } else {
      // Step jump for digital square wave
      const prevY = voltToY(samples[idx - 1].pwmSignal);
      pwmPath += ` L ${x} ${prevY} L ${x} ${yPwm}`;
      rcPath += ` L ${x} ${yRc}`;
      rampPath += ` L ${x} ${yRamp}`;
    }
  });

  // Calculate Delta T between cursors
  const cursorATimeUs = minTime + (cursorA / 100) * timeSpan;
  const cursorBTimeUs = minTime + (cursorB / 100) * timeSpan;
  const deltaTUs = Math.abs(cursorBTimeUs - cursorATimeUs);
  const deltaTFreqHz = deltaTUs > 0 ? (1 / (deltaTUs * 1e-6)) : 0;

  return (
    <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white">
                {language === 'hu'
                  ? 'Valós Idejű PWM Hullámforma & Oszcilloszkóp'
                  : 'Real-Time PWM Waveform & Oscilloscope'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 border border-purple-700 text-purple-300">
                {liveState.calculatedFrequencyHz.toFixed(1)} Hz
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? `Kitöltés: ${liveState.dutyCyclePercent.toFixed(1)}% • THigh = ${liveState.tHighUs.toFixed(1)} μs • TLow = ${liveState.tLowUs.toFixed(1)} μs`
                : `Duty: ${liveState.dutyCyclePercent.toFixed(1)}% • THigh = ${liveState.tHighUs.toFixed(1)} μs • TLow = ${liveState.tLowUs.toFixed(1)} μs`}
            </p>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowRamp(!showRamp)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              showRamp
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'TCNT Felfutás' : 'TCNT Ramp'}</span>
          </button>

          <button
            onClick={() => setShowRcFilter(!showRcFilter)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              showRcFilter
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'RC Szűrt Feszültség' : 'RC Filter (DAC)'}</span>
          </button>
        </div>
      </div>

      {/* Main SVG Oscilloscope Screen */}
      <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-3 relative overflow-hidden">
        {/* Grid Background */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[600px] font-mono text-[9px]"
        >
          {/* Horizontal Grid lines */}
          {[0, 1.25, 2.5, 3.75, 5.0].map((v) => {
            const y = voltToY(v);
            return (
              <g key={v}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - 20}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text x={paddingLeft - 8} y={y + 3} fill="#64748B" textAnchor="end">
                  {v.toFixed(2)}V
                </text>
              </g>
            );
          })}

          {/* OCR Comparison Threshold Line */}
          {showRamp && (
            <g>
              <line
                x1={paddingLeft}
                y1={tcntToY(config.ocrValue, config.topValue)}
                x2={svgWidth - 20}
                y2={tcntToY(config.ocrValue, config.topValue)}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6,3"
              />
              <text
                x={svgWidth - 25}
                y={tcntToY(config.ocrValue, config.topValue) - 4}
                fill="#F59E0B"
                textAnchor="end"
                fontWeight="bold"
              >
                OCR Threshold ({config.ocrValue})
              </text>
            </g>
          )}

          {/* TCNT Counter Ramp Curve */}
          {showRamp && (
            <path
              d={rampPath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              opacity={0.6}
            />
          )}

          {/* PWM Output Digital Square Wave */}
          <path
            d={pwmPath}
            fill="none"
            stroke="#A855F7"
            strokeWidth="2.5"
          />

          {/* RC Low-Pass Filtered Analog Voltage */}
          {showRcFilter && (
            <path
              d={rcPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
            />
          )}

          {/* Measurement Cursor A (Cyan) */}
          <line
            x1={paddingLeft + (cursorA / 100) * plotW}
            y1={15}
            x2={paddingLeft + (cursorA / 100) * plotW}
            y2={svgHeight - paddingBottom}
            stroke="#06B6D4"
            strokeWidth="1.5"
          />
          <text
            x={paddingLeft + (cursorA / 100) * plotW + 4}
            y={22}
            fill="#06B6D4"
            fontWeight="bold"
          >
            CA ({cursorATimeUs.toFixed(1)}μs)
          </text>

          {/* Measurement Cursor B (Rose) */}
          <line
            x1={paddingLeft + (cursorB / 100) * plotW}
            y1={15}
            x2={paddingLeft + (cursorB / 100) * plotW}
            y2={svgHeight - paddingBottom}
            stroke="#F43F5E"
            strokeWidth="1.5"
          />
          <text
            x={paddingLeft + (cursorB / 100) * plotW + 4}
            y={22}
            fill="#F43F5E"
            fontWeight="bold"
          >
            CB ({cursorBTimeUs.toFixed(1)}μs)
          </text>

          {/* Bottom Time Axis */}
          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - 20}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x={svgWidth - 20} y={svgHeight - 10} fill="#64748B" textAnchor="end">
            Idő (μs)
          </text>
        </svg>
      </div>

      {/* Cursors Slider Bar & Measurement Delta Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#05070A] p-3 rounded-2xl border border-slate-800 font-mono text-xs">
        {/* Sliders */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Kurzor A: {cursorATimeUs.toFixed(1)} μs</span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={cursorA}
              onChange={(e) => setCursorA(parseFloat(e.target.value))}
              className="w-32 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Kurzor B: {cursorBTimeUs.toFixed(1)} μs</span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={cursorB}
              onChange={(e) => setCursorB(parseFloat(e.target.value))}
              className="w-32 accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Delta Calculations */}
        <div className="flex items-center justify-around bg-[#0B0F17] p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">ΔT Időkülönbség:</span>
            <span className="text-white font-bold text-sm">{deltaTUs.toFixed(2)} μs</span>
          </div>
          <div className="w-[1px] h-7 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">1 / ΔT Frekvencia:</span>
            <span className="text-purple-400 font-bold text-sm">
              {deltaTFreqHz > 1000 ? `${(deltaTFreqHz / 1000).toFixed(2)} kHz` : `${deltaTFreqHz.toFixed(1)} Hz`}
            </span>
          </div>
          <div className="w-[1px] h-7 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">Átlag Veff:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {liveState.effectiveVoltage.toFixed(3)} V
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
