import React, { useEffect, useRef, useState } from 'react';
import {
  BridgeFaultInjection,
  BridgeNodePeripherals,
  BridgeProtocol,
  BridgeScenarioPreset,
  DualMcuBridgeState,
} from '../../../types/mcuBridge';
import {
  createInitialBridgeState,
  stepDualMcuBridge,
} from '../../../core/mcuBridgeEngine';
import { BRIDGE_SCENARIOS } from '../../../core/mcuBridgeScenarios';
import { McuBridgeNodeCard } from './McuBridgeNodeCard';
import { McuBridgeBusVisualizer } from './McuBridgeBusVisualizer';
import { McuBridgeFaultInjector } from './McuBridgeFaultInjector';
import { McuBridgeTrafficInspector } from './McuBridgeTrafficInspector';
import { McuBlockStudio } from '../blocks/McuBlockStudio';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  ArrowRightLeft,
  Blocks,
  CheckCircle2,
  Cpu,
  Layers,
  Network,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

export const McuBridgeStudio: React.FC = () => {
  const { language } = useI18n();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('i2c_telemetry');
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [bridgeState, setBridgeState] = useState<DualMcuBridgeState>(() =>
    createInitialBridgeState('i2c_telemetry')
  );

  const activeScenario =
    BRIDGE_SCENARIOS.find((s) => s.id === selectedScenarioId) || BRIDGE_SCENARIOS[0];

  // Simulation execution loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch preset scenario
  const handleSelectScenario = (scenario: BridgeScenarioPreset) => {
    setSelectedScenarioId(scenario.id);
    setBridgeState(createInitialBridgeState(scenario.id));
  };

  // Step simulation
  const handleStep = () => {
    setBridgeState((prev) => stepDualMcuBridge(prev));
  };

  // Toggle run / pause
  const handleToggleRun = () => {
    setBridgeState((prev) => ({ ...prev, isSyncRunning: !prev.isSyncRunning }));
  };

  // Hardware Reset
  const handleReset = () => {
    setBridgeState(createInitialBridgeState(selectedScenarioId));
  };

  // Periodic clock loop
  useEffect(() => {
    if (bridgeState.isSyncRunning) {
      const intervalMs = Math.max(50, Math.floor(1000 / bridgeState.masterClockHz));
      timerRef.current = setInterval(() => {
        setBridgeState((prev) => stepDualMcuBridge(prev));
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bridgeState.isSyncRunning, bridgeState.masterClockHz]);

  // Update MCU A Peripherals
  const handleUpdateMcuAPeripherals = (
    updater: (prev: BridgeNodePeripherals) => BridgeNodePeripherals
  ) => {
    setBridgeState((prev) => ({
      ...prev,
      mcuA: { ...prev.mcuA, peripherals: updater(prev.mcuA.peripherals) },
    }));
  };

  // Update MCU B Peripherals
  const handleUpdateMcuBPeripherals = (
    updater: (prev: BridgeNodePeripherals) => BridgeNodePeripherals
  ) => {
    setBridgeState((prev) => ({
      ...prev,
      mcuB: { ...prev.mcuB, peripherals: updater(prev.mcuB.peripherals) },
    }));
  };

  // Toggle wire disconnection
  const handleToggleDisconnectWire = (wireId: string) => {
    setBridgeState((prev) => {
      const isCurrentlyCut = !!prev.faults.disconnectedWires[wireId];
      return {
        ...prev,
        faults: {
          ...prev.faults,
          disconnectedWires: {
            ...prev.faults.disconnectedWires,
            [wireId]: !isCurrentlyCut,
          },
        },
      };
    });
  };

  // Update Faults
  const handleUpdateFaults = (
    updater: (prev: BridgeFaultInjection) => BridgeFaultInjection
  ) => {
    setBridgeState((prev) => ({
      ...prev,
      faults: updater(prev.faults),
    }));
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-10">
      {/* Top Protocol Scenario Selector Bar */}
      <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300">
              <ArrowRightLeft className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {language === 'hu'
                    ? 'Két Mikrokontroller Összekapcsolási & Kommunikációs Híd'
                    : 'Dual MCU Interconnect & Protocol Bridge Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-bold">
                  v3.2.0 • Real-Time Bus Sim
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {language === 'hu'
                  ? 'Két egyidejűleg futó MCU hardveres kommunikációja valós idejű vezeték- és protokollszimulációval.'
                  : 'Two simultaneously running microcontrollers linked via real-time bus and protocol simulation.'}
              </p>
            </div>
          </div>

          {/* Master Execution Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Clock Speed Slider */}
            <div className="flex items-center gap-2 bg-[#05070D] px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[11px] font-bold">Bus Clock:</span>
              <input
                type="range"
                min={1}
                max={20}
                value={bridgeState.masterClockHz}
                onChange={(e) =>
                  setBridgeState((prev) => ({
                    ...prev,
                    masterClockHz: Number(e.target.value),
                  }))
                }
                className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-cyan-300 font-bold min-w-[45px]">
                {bridgeState.masterClockHz} Hz
              </span>
            </div>

            {/* Step Button */}
            <button
              onClick={handleStep}
              disabled={bridgeState.isSyncRunning}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hu' ? 'Lépés' : 'Step'}</span>
            </button>

            {/* Run / Pause Button */}
            <button
              onClick={handleToggleRun}
              className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all ${
                bridgeState.isSyncRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              }`}
            >
              {bridgeState.isSyncRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>{language === 'hu' ? 'Szünet' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{language === 'hu' ? 'Futtatás' : 'Run'}</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-colors"
              title="Reset Bridge"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Protocol Preset Chips Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BRIDGE_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isSelected ? 'text-cyan-300' : 'text-slate-200'}>
                    {scenario.protocol}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                    {language === 'hu' ? scenario.categoryHu : scenario.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                  {language === 'hu' ? scenario.titleHu : scenario.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Active Scenario Description Bar */}
        <div className="bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <strong className="text-white">
              {language === 'hu' ? activeScenario.titleHu : activeScenario.title}:
            </strong>
            <span className="text-slate-300 font-sans hidden md:inline">
              {language === 'hu'
                ? activeScenario.descriptionHu
                : activeScenario.description}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-cyan-400 font-mono text-[11px] font-bold">
              {activeScenario.baudRateOrSpeed}
            </span>
            <button
              onClick={() => setShowBlockModal(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all text-[11px]"
            >
              <Blocks className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? '🧩 Blokk Szerkesztő' : '🧩 Block Editor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Block Programming Modal / Drawer */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl w-full max-w-7xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Blocks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'hu'
                      ? 'Vizuális Blokk-Programozó (Dual MCU Célpontokhoz)'
                      : 'Visual Block Studio (Targeting Dual MCU Nodes)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'hu'
                      ? 'Szerkeszd a kódot grafikus blokkokkal, majd töltsd fel (Flash) az MCU A vagy MCU B memóriájába!'
                      : 'Assemble blocks visually and flash directly to MCU A or MCU B node memory!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <McuBlockStudio
              onFlashToMcuA={(code) => {
                setBridgeState((prev) => ({
                  ...prev,
                  mcuA: { ...prev.mcuA, code, flashMemory: code.split('\n') },
                }));
              }}
              onFlashToMcuB={(code) => {
                setBridgeState((prev) => ({
                  ...prev,
                  mcuB: { ...prev.mcuB, code, flashMemory: code.split('\n') },
                }));
              }}
            />
          </div>
        </div>
      )}

      {/* Main Dual MCU Bridge Layout: MCU A <-> Physical Bus <-> MCU B */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: MCU Node A (Master / Controller) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <McuBridgeNodeCard
            node={bridgeState.mcuA}
            onUpdatePeripherals={handleUpdateMcuAPeripherals}
            onUpdateCode={(code) =>
              setBridgeState((prev) => ({
                ...prev,
                mcuA: { ...prev.mcuA, code, flashMemory: code.split('\n') },
              }))
            }
            isMaster={true}
          />
        </div>

        {/* Center: Physical Bus Wires & Visual Signal Transmission */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <McuBridgeBusVisualizer
            protocol={bridgeState.protocol}
            wires={bridgeState.wires}
            disconnectedWires={bridgeState.faults.disconnectedWires}
            onToggleDisconnectWire={handleToggleDisconnectWire}
            isRunning={bridgeState.isSyncRunning}
            busSpeedLabel={activeScenario.baudRateOrSpeed}
          />

          {/* Real-time Status Exchange Banner */}
          <div className="bg-[#0A0E1A] p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2 shadow-lg">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span className="text-slate-300">
              {language === 'hu'
                ? bridgeState.lastExchangeSummaryHu
                : bridgeState.lastExchangeSummary}
            </span>
          </div>
        </div>

        {/* Right: MCU Node B (Slave / Actuators & Sensors) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <McuBridgeNodeCard
            node={bridgeState.mcuB}
            onUpdatePeripherals={handleUpdateMcuBPeripherals}
            onUpdateCode={(code) =>
              setBridgeState((prev) => ({
                ...prev,
                mcuB: { ...prev.mcuB, code, flashMemory: code.split('\n') },
              }))
            }
            isMaster={false}
          />
        </div>
      </div>

      {/* Bottom Dual Grid: Fault Injector & Live Protocol Frame Dissector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hardware Fault Injector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <McuBridgeFaultInjector
            protocol={bridgeState.protocol}
            faults={bridgeState.faults}
            onUpdateFaults={handleUpdateFaults}
            errorCount={bridgeState.errorCount}
            onResetErrors={() =>
              setBridgeState((prev) => ({ ...prev, errorCount: 0 }))
            }
          />
        </div>

        {/* Protocol Analyzer & Traffic Dissector (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <McuBridgeTrafficInspector
            packets={bridgeState.trafficHistory}
            protocol={bridgeState.protocol}
            onClearLogs={() =>
              setBridgeState((prev) => ({ ...prev, trafficHistory: [] }))
            }
          />
        </div>
      </div>
    </div>
  );
};
