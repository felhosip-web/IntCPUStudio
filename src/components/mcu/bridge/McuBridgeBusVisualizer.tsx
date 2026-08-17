import React from 'react';
import { BridgeProtocol, BridgeWire } from '../../../types/mcuBridge';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  AlertOctagon,
  ArrowLeftRight,
  Check,
  Cpu,
  Power,
  Radio,
  Scissors,
  Share2,
  Sparkles,
  Unplug,
  Wifi,
  Zap,
} from 'lucide-react';

interface McuBridgeBusVisualizerProps {
  protocol: BridgeProtocol;
  wires: BridgeWire[];
  disconnectedWires: Record<string, boolean>;
  onToggleDisconnectWire: (wireId: string) => void;
  isRunning: boolean;
  busSpeedLabel: string;
}

export const McuBridgeBusVisualizer: React.FC<McuBridgeBusVisualizerProps> = ({
  protocol,
  wires,
  disconnectedWires,
  onToggleDisconnectWire,
  isRunning,
  busSpeedLabel,
}) => {
  const { language } = useI18n();

  return (
    <div
      id="mcu-bridge-bus-visualizer"
      className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3.5"
    >
      {/* Bus Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Share2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Fizikai Busz & Vezetékes Összeköttetés'
                  : 'Physical Bus Wiring & Signal Interconnect'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
                {protocol} • {busSpeedLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'hu'
                ? 'Kattints bármelyik vezetékre a megszakításhoz (Hardveres hibaszimuláció)!'
                : 'Click any wire to disconnect/cut it (Hardware fault injection)!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            {language === 'hu' ? 'Vezetékek száma:' : 'Active Wires:'}{' '}
            <strong className="text-cyan-400">{wires.length}</strong>
          </span>
        </div>
      </div>

      {/* Protocol Diagram / Wires Layout */}
      <div className="flex flex-col gap-2.5">
        {wires.map((wire) => {
          const isCut = !!disconnectedWires[wire.id];

          return (
            <div
              key={wire.id}
              onClick={() => onToggleDisconnectWire(wire.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCut
                  ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-md'
              }`}
            >
              {/* Left Pin (MCU A) */}
              <div className="flex items-center gap-2 min-w-[150px]">
                <div
                  className="w-3 h-3 rounded-full border border-white/50 shadow"
                  style={{ backgroundColor: isCut ? '#EF4444' : wire.color }}
                />
                <div className="font-mono text-xs font-bold text-slate-200">
                  <span className="text-cyan-400">[MCU A]</span> {wire.pinMcuA}
                </div>
              </div>

              {/* Center Bus Line Visualization */}
              <div className="flex-1 flex items-center justify-center gap-2 relative">
                {/* Horizontal Wire Line */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 relative overflow-hidden flex items-center">
                  {!isCut ? (
                    <div
                      className="h-full rounded-full transition-all duration-300 relative w-full"
                      style={{
                        backgroundColor: wire.color,
                        opacity: 0.85,
                        boxShadow: `0 0 10px ${wire.color}`,
                      }}
                    >
                      {/* Animated Traveling Pulse */}
                      {isRunning && (
                        <div
                          className="absolute top-0 bottom-0 w-8 bg-white/90 rounded-full animate-pulse blur-[1px]"
                          style={{
                            animation: 'pulse 1.2s infinite',
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    /* Broken wire indicator */
                    <div className="w-full flex items-center justify-center">
                      <div className="h-0.5 w-1/3 bg-rose-500 border-dashed" />
                      <Scissors className="w-4 h-4 text-rose-400 mx-2 animate-bounce" />
                      <div className="h-0.5 w-1/3 bg-rose-500 border-dashed" />
                    </div>
                  )}
                </div>

                {/* Voltage & Logic Level Badge */}
                <div
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border whitespace-nowrap shadow-sm ${
                    isCut
                      ? 'bg-rose-900/60 text-rose-300 border-rose-700'
                      : 'bg-slate-950 text-slate-200 border-slate-700'
                  }`}
                >
                  {isCut ? (
                    <span className="flex items-center gap-1 text-rose-400">
                      <Unplug className="w-3 h-3" />
                      <span>DISCONNECTED</span>
                    </span>
                  ) : (
                    <span>
                      {wire.busVoltage.toFixed(1)}V • LOGIC {wire.logicA}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Pin (MCU B) */}
              <div className="flex items-center justify-end gap-2 min-w-[150px]">
                <div className="font-mono text-xs font-bold text-slate-200 text-right">
                  <span className="text-purple-400">[MCU B]</span> {wire.pinMcuB}
                </div>
                <div
                  className="w-3 h-3 rounded-full border border-white/50 shadow"
                  style={{ backgroundColor: isCut ? '#EF4444' : wire.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocol Architecture Helper Note */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {protocol === 'I2C' &&
              (language === 'hu'
                ? 'I2C Busz: Nyitott kollektoros vonalak 4.7kΩ felhúzó ellenállásokkal 5V-ra. Mindkét MCU vezérelheti az SDA-t.'
                : 'I2C Bus: Open-drain lines with 4.7kΩ pull-up resistors to 5V. Both MCUs can drive SDA during ACK/NACK slots.')}
            {protocol === 'SPI' &&
              (language === 'hu'
                ? 'SPI Busz: 4-vezetékes szinkron nagysebességű kapcsolat. MOSI/MISO egyszerre küld és fogad adatot.'
                : 'SPI Bus: 4-wire high-speed synchronous bus. MOSI and MISO exchange bytes simultaneously on SCK transitions.')}
            {protocol === 'UART' &&
              (language === 'hu'
                ? 'UART Busz: Aszinkron pont-pont összeköttetés keresztbekötött TX-RX vonalakkal és közös GND referenciával.'
                : 'UART Link: Point-to-point asynchronous link with crossed TX/RX pins and shared ground reference.')}
            {protocol === 'RS485' &&
              (language === 'hu'
                ? 'RS-485 Busz: MAX485 differenciális vonalmeghajtók (A-B). Nagy zavarvédettség akár 1200 méterig.'
                : 'RS-485 Bus: Differential MAX485 line drivers (A-B). High noise immunity over distances up to 1200 meters.')}
            {protocol === 'CAN' &&
              (language === 'hu'
                ? 'CAN Busz 2.0B: Differenciális CAN_H (3.5V) és CAN_L (1.5V) 120Ω-os lezárással, hardveres arbitrációval.'
                : 'CAN Bus 2.0B: Differential CAN_H (3.5V) and CAN_L (1.5V) terminated with 120Ω split resistors.')}
            {protocol === 'NRF24' &&
              (language === 'hu'
                ? 'nRF24L01+ Rádió: 2.4GHz GFSK vezeték nélküli adatátvitel automatikus ACK és csomagújraküldési funkcióval.'
                : 'nRF24L01+ Radio: 2.4GHz GFSK wireless packet transfer with hardware auto-acknowledgement and retry.')}
          </span>
        </div>
      </div>
    </div>
  );
};
