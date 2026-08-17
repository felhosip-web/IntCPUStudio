import React, { useState } from 'react';
import { AdcLiveState, AdcSimulationConfig } from '../../../types/mcuAdc';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, Clock, Sliders, Zap } from 'lucide-react';

interface AdcTimingDiagramProps {
  liveState: AdcLiveState;
  config: AdcSimulationConfig;
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
  vRef: number;
}

export const AdcTimingDiagram: React.FC<AdcTimingDiagramProps> = ({
  liveState,
  config,
  currentStepIndex,
  onSelectStep,
  vRef,
}) => {
  const { language } = useI18n();
  const [cursorA, setCursorA] = useState<number>(1);
  const [cursorB, setCursorB] = useState<number>(13);

  const totalCycles = liveState.totalCyclesRequired || 13;
  const tAdcUs = (1 / liveState.fAdcActualHz) * 1e6; // e.g. 8.0 us for 125kHz

  const deltaCycles = Math.abs(cursorB - cursorA);
  const deltaTimeUs = deltaCycles * tAdcUs;

  // Signal rows configuration
  const signals = [
    { id: 'CLK_ADC', label: 'ADC CLK', labelHu: 'ADC Órajel', color: '#38BDF8' },
    { id: 'SH_SWITCH', label: 'S/H SWITCH', labelHu: 'Mintavevő Kapcsoló', color: '#34D399' },
    { id: 'SAR_DAC', label: 'VDAC vs VIN (V)', labelHu: 'VDAC vs VIN (Feszültség)', color: '#FBBF24', isAnalog: true },
    { id: 'COMP_OUT', label: 'COMPARATOR', labelHu: 'Komparátor Kimenet', color: '#A78BFA' },
    { id: 'ADSC', label: 'ADSC (Start Conv)', labelHu: 'ADSC (Átalakítás Aktív)', color: '#F43F5E' },
    { id: 'ADIF', label: 'ADIF (IRQ Flag)', labelHu: 'ADIF (Megszakítás Jelző)', color: '#10B981' },
    { id: 'LATCH', label: 'DATA LATCH', labelHu: 'ADCL:ADCH Tárolás', color: '#6366F1' },
  ];

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const leftMargin = 140;
  const rightMargin = 30;
  const plotWidth = svgWidth - leftMargin - rightMargin;
  const rowHeight = 44;

  const cycleToX = (cycle: number) => {
    return leftMargin + ((cycle - 1) / totalCycles) * plotWidth;
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span>
                {language === 'hu'
                  ? 'Valós Idejű ADC Időzítési Diagram & Logikai Analizátor'
                  : 'Real-Time ADC Timing Diagram & Logic Analyzer'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                fADC = {(liveState.fAdcActualHz / 1000).toFixed(1)} kHz (T = {tAdcUs.toFixed(1)} µs)
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? `1 átalakítás = ${totalCycles} ADC órajel ciklus (${(totalCycles * tAdcUs).toFixed(1)} µs). 16MHz CPU / Prescaler ${config.prescaler}.`
                : `1 conversion = ${totalCycles} ADC clock cycles (${(totalCycles * tAdcUs).toFixed(1)} µs). 16MHz CPU / Prescaler ${config.prescaler}.`}
            </p>
          </div>
        </div>

        {/* Cursor Delta Telemetry */}
        <div className="flex items-center gap-3 bg-[#05070A] px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span>Δ Cycles:</span>
            <span className="text-cyan-300 font-bold">{deltaCycles.toFixed(1)} Tclk</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-800" />
          <div className="flex items-center gap-1 text-slate-400">
            <span>Δ Time:</span>
            <span className="text-emerald-400 font-bold">{deltaTimeUs.toFixed(2)} µs</span>
          </div>
        </div>
      </div>

      {/* SVG Waveform Logic Analyzer */}
      <div className="bg-[#05070A] rounded-2xl border border-slate-800 p-2 overflow-x-auto relative select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] font-mono text-[10px]"
        >
          {/* Background Grid Lines for Clock Cycles */}
          {Array.from({ length: totalCycles + 1 }).map((_, i) => {
            const cycle = i + 1;
            const x = cycleToX(cycle);
            const isSelectedStep =
              liveState.steps[currentStepIndex] &&
              liveState.steps[currentStepIndex].clockCycle === cycle;

            return (
              <g key={i}>
                {/* Vertical cycle dashed line */}
                <line
                  x1={x}
                  y1={24}
                  x2={x}
                  y2={svgHeight - 10}
                  stroke={isSelectedStep ? '#06B6D4' : '#1E293B'}
                  strokeWidth={isSelectedStep ? 2 : 1}
                  strokeDasharray={isSelectedStep ? undefined : '2,2'}
                />
                {/* Cycle header label */}
                {i < totalCycles && (
                  <text
                    x={x + plotWidth / totalCycles / 2}
                    y={16}
                    fill={isSelectedStep ? '#06B6D4' : '#64748B'}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="9"
                  >
                    T{cycle}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Signal Rows */}
          {signals.map((sig, rowIndex) => {
            const yBase = 35 + rowIndex * rowHeight;
            const highY = yBase + 8;
            const lowY = yBase + 30;

            return (
              <g key={sig.id}>
                {/* Row divider */}
                <line
                  x1={10}
                  y1={yBase + rowHeight - 2}
                  x2={svgWidth - 10}
                  y2={yBase + rowHeight - 2}
                  stroke="#1E293B"
                  strokeWidth="0.5"
                />

                {/* Signal Name */}
                <text
                  x={leftMargin - 12}
                  y={yBase + 20}
                  fill={sig.color}
                  textAnchor="end"
                  fontWeight="bold"
                  fontSize="10"
                >
                  {language === 'hu' ? sig.labelHu : sig.label}
                </text>

                {/* Waveform Drawing based on Signal Type */}
                {sig.id === 'CLK_ADC' && (
                  <path
                    d={Array.from({ length: totalCycles })
                      .map((_, c) => {
                        const xStart = cycleToX(c + 1);
                        const xMid = xStart + plotWidth / totalCycles / 2;
                        const xEnd = cycleToX(c + 2);
                        return `M ${xStart} ${lowY} L ${xStart} ${highY} L ${xMid} ${highY} L ${xMid} ${lowY} L ${xEnd} ${lowY}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="1.5"
                  />
                )}

                {sig.id === 'SH_SWITCH' && (
                  <path
                    d={`
                      M ${cycleToX(1)} ${highY}
                      L ${cycleToX(config.reference === 'AVCC_5V' ? 3 : 3)} ${highY}
                      L ${cycleToX(config.reference === 'AVCC_5V' ? 3 : 3)} ${lowY}
                      L ${cycleToX(totalCycles + 1)} ${lowY}
                    `}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="2"
                  />
                )}

                {sig.id === 'SAR_DAC' && (
                  <g>
                    {/* Vin Line */}
                    <line
                      x1={cycleToX(1)}
                      y1={lowY - (Math.min(1, liveState.sampleAndHoldVoltage / vRef) * 22)}
                      x2={cycleToX(totalCycles + 1)}
                      y2={lowY - (Math.min(1, liveState.sampleAndHoldVoltage / vRef) * 22)}
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                    {/* VDAC Steps Staircase */}
                    <path
                      d={liveState.steps
                        .filter((s) => s.clockCycle >= 1 && s.clockCycle <= totalCycles)
                        .map((step, idx) => {
                          const x1 = cycleToX(step.clockCycle);
                          const x2 = cycleToX(step.clockCycle + 1);
                          const normV = Math.min(1, Math.max(0, step.dacVoltage / vRef));
                          const stepY = lowY - normV * 22;
                          return `${idx === 0 ? 'M' : 'L'} ${x1} ${stepY} L ${x2} ${stepY}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke={sig.color}
                      strokeWidth="2"
                    />
                  </g>
                )}

                {sig.id === 'COMP_OUT' && (
                  <path
                    d={liveState.steps
                      .filter((s) => s.clockCycle >= 1 && s.clockCycle <= totalCycles)
                      .map((step, idx) => {
                        const x1 = cycleToX(step.clockCycle);
                        const x2 = cycleToX(step.clockCycle + 1);
                        const compY = step.comparatorOutput ? highY : lowY;
                        return `${idx === 0 ? 'M' : 'L'} ${x1} ${compY} L ${x2} ${compY}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="1.5"
                  />
                )}

                {sig.id === 'ADSC' && (
                  <path
                    d={`
                      M ${cycleToX(1)} ${highY}
                      L ${cycleToX(totalCycles)} ${highY}
                      L ${cycleToX(totalCycles)} ${lowY}
                      L ${cycleToX(totalCycles + 1)} ${lowY}
                    `}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="2"
                  />
                )}

                {sig.id === 'ADIF' && (
                  <path
                    d={`
                      M ${cycleToX(1)} ${lowY}
                      L ${cycleToX(totalCycles)} ${lowY}
                      L ${cycleToX(totalCycles)} ${highY}
                      L ${cycleToX(totalCycles + 1)} ${highY}
                    `}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="2"
                  />
                )}

                {sig.id === 'LATCH' && (
                  <path
                    d={`
                      M ${cycleToX(1)} ${lowY}
                      L ${cycleToX(totalCycles)} ${lowY}
                      L ${cycleToX(totalCycles)} ${highY}
                      L ${cycleToX(totalCycles + 0.8)} ${highY}
                      L ${cycleToX(totalCycles + 0.8)} ${lowY}
                      L ${cycleToX(totalCycles + 1)} ${lowY}
                    `}
                    fill="none"
                    stroke={sig.color}
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Interactive Cursor A (Amber) */}
          <line
            x1={cycleToX(cursorA)}
            y1={20}
            x2={cycleToX(cursorA)}
            y2={svgHeight - 10}
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <text
            x={cycleToX(cursorA)}
            y={svgHeight - 2}
            fill="#F59E0B"
            textAnchor="middle"
            fontWeight="bold"
            fontSize="9"
          >
            Cursor A (T{cursorA.toFixed(0)})
          </text>

          {/* Interactive Cursor B (Emerald) */}
          <line
            x1={cycleToX(cursorB)}
            y1={20}
            x2={cycleToX(cursorB)}
            y2={svgHeight - 10}
            stroke="#10B981"
            strokeWidth="2"
          />
          <text
            x={cycleToX(cursorB)}
            y={svgHeight - 2}
            fill="#10B981"
            textAnchor="middle"
            fontWeight="bold"
            fontSize="9"
          >
            Cursor B (T{cursorB.toFixed(0)})
          </text>
        </svg>
      </div>

      {/* Timing Controls & Cursors Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#05070A] p-3 rounded-xl border border-slate-800 text-xs font-mono">
        {/* Cursor A Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>Cursor A (Start):</span>
            <span>T{cursorA} ({((cursorA - 1) * tAdcUs).toFixed(1)} µs)</span>
          </div>
          <input
            type="range"
            min={1}
            max={totalCycles}
            value={cursorA}
            onChange={(e) => setCursorA(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Cursor B Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>Cursor B (End):</span>
            <span>T{cursorB} ({((cursorB - 1) * tAdcUs).toFixed(1)} µs)</span>
          </div>
          <input
            type="range"
            min={1}
            max={totalCycles}
            value={cursorB}
            onChange={(e) => setCursorB(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
