import React from 'react';
import { ProtocolSpec, ProtocolStep } from '../../../types/mcuProtocols';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, ArrowRight, Cpu, Radio, Shield, Zap } from 'lucide-react';

interface McuProtocolCircuitProps {
  spec: ProtocolSpec;
  currentStep: ProtocolStep;
}

export const McuProtocolCircuit: React.FC<McuProtocolCircuitProps> = ({
  spec,
  currentStep,
}) => {
  const { language } = useI18n();

  return (
    <div className="w-full bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Header with Physical Spec Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg border"
            style={{
              backgroundColor: `${spec.color}15`,
              borderColor: `${spec.color}40`,
              color: spec.color,
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-white">
              {language === 'hu' ? 'Fizikai Réteg & Hardver Kapcsolás' : 'Physical Layer & Hardware Circuit'}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {language === 'hu' ? spec.topologyHu : spec.topology}
            </span>
          </div>
        </div>

        {/* Physical Parameter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {spec.wireCount} {language === 'hu' ? 'Vezeték' : 'Wires'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            Max {spec.maxSpeed}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
            {spec.maxDistance}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
            {spec.duplexMode}
          </span>
        </div>
      </div>

      {/* Interactive Circuit Schematic Block Diagram */}
      <div className="w-full bg-[#05070A] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-stretch justify-between gap-4 relative overflow-hidden">
        {/* Left: Master MCU Node */}
        <div
          className={`flex-1 min-w-[200px] p-3 rounded-xl border transition-all ${
            currentStep.highlightNode === 'MASTER'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-mono text-white">Master MCU</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              Host / Controller
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between items-center text-slate-400">
              <span>{language === 'hu' ? 'Állapot:' : 'Action:'}</span>
              <span className="text-cyan-300 font-bold text-right text-[10px]">
                {language === 'hu' ? currentStep.masterActionHu : currentStep.masterAction}
              </span>
            </div>
            {currentStep.activeBytes?.txByte !== undefined && (
              <div className="flex justify-between items-center bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/40">
                <span className="text-slate-400">{language === 'hu' ? 'Adat (TX):' : 'Data (TX):'}</span>
                <span className="text-white font-bold">
                  0x{currentStep.activeBytes.txByte.toString(16).toUpperCase().padStart(2, '0')} (
                  {currentStep.activeBytes.byteName || 'Byte'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Bus & Physical Lines / Transceiver */}
        <div className="flex-[1.5] flex flex-col justify-center gap-2 px-2 py-1">
          {/* Signal Bus Wires with Voltage Badges */}
          <div className="space-y-2">
            {spec.physicalLines.map((lineName) => {
              const voltage = currentStep.busVoltages ? currentStep.busVoltages[lineName] : undefined;
              const isHigh = currentStep.signals[lineName] >= 0.5;

              return (
                <div key={lineName} className="flex items-center gap-2">
                  <span className="w-20 text-[11px] font-mono font-bold text-slate-300 truncate">
                    {lineName}
                  </span>

                  {/* Wire line with moving electron / pulse */}
                  <div className="flex-1 h-3 bg-slate-900 rounded-full relative overflow-hidden border border-slate-800 flex items-center">
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{
                        backgroundColor: isHigh ? `${spec.color}30` : '#0F172A',
                      }}
                    />
                    <div
                      className="h-1.5 w-6 rounded-full animate-pulse transition-all duration-300"
                      style={{
                        backgroundColor: isHigh ? spec.color : '#475569',
                        boxShadow: isHigh ? `0 0 8px ${spec.color}` : 'none',
                        transform: `translateX(${((currentStep.stepIndex * 35) % 80) + 10}px)`,
                      }}
                    />
                  </div>

                  {/* Voltage value display */}
                  {voltage !== undefined ? (
                    <span
                      className="text-[11px] font-mono px-2 py-0.5 rounded border font-bold min-w-[54px] text-center"
                      style={{
                        backgroundColor: `${spec.color}15`,
                        borderColor: `${spec.color}40`,
                        color: spec.color,
                      }}
                    >
                      {voltage >= 0 ? '+' : ''}
                      {voltage.toFixed(1)}V
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 min-w-[54px] text-center">
                      {isHigh ? 'HIGH (1)' : 'LOW (0)'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Differential Delta V or Pull-Up Note */}
          <div className="mt-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{language === 'hu' ? 'Illesztő / Véglezárás:' : 'Transceiver / Termination:'}</span>
            </span>
            <span className="text-slate-200 font-semibold">{spec.typicalTransceiver}</span>
          </div>
        </div>

        {/* Right: Slave Node / Target Device */}
        <div
          className={`flex-1 min-w-[200px] p-3 rounded-xl border transition-all ${
            currentStep.highlightNode === 'SLAVE_1'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold font-mono text-white">Slave / Node</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
              Target Device
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between items-center text-slate-400">
              <span>{language === 'hu' ? 'Válasz:' : 'Action:'}</span>
              <span className="text-purple-300 font-bold text-right text-[10px]">
                {language === 'hu' ? currentStep.slaveActionHu : currentStep.slaveAction}
              </span>
            </div>
            {currentStep.activeBytes?.rxByte !== undefined && (
              <div className="flex justify-between items-center bg-purple-950/60 px-2 py-1 rounded border border-purple-800/40">
                <span className="text-slate-400">{language === 'hu' ? 'Vett (RX):' : 'Received (RX):'}</span>
                <span className="text-white font-bold">
                  0x{currentStep.activeBytes.rxByte.toString(16).toUpperCase().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
