import React, { useState } from 'react';
import { BridgeNodePeripherals, BridgeNodeState } from '../../../types/mcuBridge';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  CheckCircle2,
  Code2,
  Cpu,
  Eye,
  Flame,
  Gauge,
  Layers,
  Power,
  Radio,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Tv,
  Volume2,
  Zap,
} from 'lucide-react';

interface McuBridgeNodeCardProps {
  node: BridgeNodeState;
  onUpdatePeripherals: (updater: (prev: BridgeNodePeripherals) => BridgeNodePeripherals) => void;
  onUpdateCode: (newCode: string) => void;
  isMaster?: boolean;
}

export const McuBridgeNodeCard: React.FC<McuBridgeNodeCardProps> = ({
  node,
  onUpdatePeripherals,
  onUpdateCode,
  isMaster = false,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'PERIPHERALS' | 'CODE'>('PERIPHERALS');
  const [editingCode, setEditingCode] = useState(node.code);

  const p = node.peripherals;
  const isA = node.id === 'MCU_A';

  return (
    <div
      id={`mcu-node-card-${node.id}`}
      className={`rounded-2xl border p-4 shadow-xl flex flex-col gap-3 transition-all ${
        isA
          ? 'bg-[#080D1A] border-cyan-500/40 shadow-cyan-950/30'
          : 'bg-[#100A1A] border-purple-500/40 shadow-purple-950/30'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isA
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
            }`}
          >
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                {language === 'hu' ? node.nameHu : node.name}
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isMaster
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : 'bg-purple-950 text-purple-300 border-purple-700'
                }`}
              >
                {node.role}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ATmega328P @ 16 MHz • Flash: 32KB
            </span>
          </div>
        </div>

        {/* View Tab Switcher: Peripherals vs Source Code */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('PERIPHERALS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'PERIPHERALS'
                ? isA
                  ? 'bg-cyan-600 text-white'
                  : 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 inline mr-1" />
            <span>{language === 'hu' ? 'I/O & Szenzorok' : 'I/O & Sensors'}</span>
          </button>
          <button
            onClick={() => setActiveTab('CODE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'CODE'
                ? isA
                  ? 'bg-cyan-600 text-white'
                  : 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 inline mr-1" />
            <span>{language === 'hu' ? 'Kód (C/C++)' : 'Code (C++)'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Stats Strip */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[9px] uppercase">TX Packets</div>
          <div className="font-bold text-emerald-400">{node.packetsSent}</div>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[9px] uppercase">RX Packets</div>
          <div className="font-bold text-cyan-400">{node.packetsReceived}</div>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[9px] uppercase">Last TX</div>
          <div className="font-bold text-amber-400 truncate px-1" title={node.lastTxMsg}>
            {node.lastTxMsg}
          </div>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[9px] uppercase">Last RX</div>
          <div className="font-bold text-purple-400 truncate px-1" title={node.lastRxMsg}>
            {node.lastRxMsg}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'PERIPHERALS' ? (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {/* Controllers & Inputs (Sliders, Potentiometers, Buttons) */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                {isA
                  ? language === 'hu'
                    ? 'Mester Vezérlők & Szenzor Bemenetek'
                    : 'Master Inputs & Potentiometer'
                  : language === 'hu'
                    ? 'Szolga Helyi Szenzorok'
                    : 'Slave Local Sensor Telemetry'}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {isA ? 'Interactive Input' : 'Telemetry Generator'}
              </span>
            </div>

            {/* Potentiometer Knob / Slider */}
            <div className="flex items-center justify-between gap-3 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold min-w-[90px]">
                {isA ? 'Pot / Throttle (A0):' : 'Temp Sensor:'}
              </span>
              <input
                type="range"
                min={0}
                max={1023}
                value={p.potentiometer}
                onChange={(e) =>
                  onUpdatePeripherals((prev) => ({
                    ...prev,
                    potentiometer: Number(e.target.value),
                  }))
                }
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="font-bold text-cyan-300 min-w-[65px] text-right">
                {p.potentiometer} <span className="text-[10px] text-slate-500">/1023</span>
              </span>
            </div>

            {/* Sub Slider (Set-point / Speed) */}
            <div className="flex items-center justify-between gap-3 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold min-w-[90px]">
                {isA ? 'PWM Setpoint (D3):' : 'Light (Lux):'}
              </span>
              <input
                type="range"
                min={0}
                max={255}
                value={p.sliderVal}
                onChange={(e) =>
                  onUpdatePeripherals((prev) => ({
                    ...prev,
                    sliderVal: Number(e.target.value),
                  }))
                }
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <span className="font-bold text-purple-300 min-w-[65px] text-right">
                {p.sliderVal} <span className="text-[10px] text-slate-500">PWM</span>
              </span>
            </div>

            {/* Digital Pushbutton / Trigger */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onMouseDown={() =>
                  onUpdatePeripherals((prev) => ({ ...prev, button1: true }))
                }
                onMouseUp={() =>
                  onUpdatePeripherals((prev) => ({ ...prev, button1: false }))
                }
                onTouchStart={() =>
                  onUpdatePeripherals((prev) => ({ ...prev, button1: true }))
                }
                onTouchEnd={() =>
                  onUpdatePeripherals((prev) => ({ ...prev, button1: false }))
                }
                className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer text-center select-none shadow-md ${
                  p.button1
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/40 scale-98'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5 inline mr-1.5" />
                <span>{language === 'hu' ? 'Gomb Nyomva (D2 / INT)' : 'Press Button (D2)'}</span>
              </button>

              <button
                onClick={() =>
                  onUpdatePeripherals((prev) => ({
                    ...prev,
                    relayActive: !prev.relayActive,
                  }))
                }
                className={`px-3 py-2 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                  p.relayActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {p.relayActive ? 'Relay: ON' : 'Relay: OFF'}
              </button>
            </div>
          </div>

          {/* Actuator & Display Outputs (Servo, RGB LED, OLED Display, Stepper) */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hu' ? 'Kimeneti Beavatkozók & Kijelzők' : 'Actuator & Display Outputs'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </div>

            {/* Virtual SSD1306 128x64 OLED Display */}
            <div className="bg-[#02050A] border-2 border-slate-800 rounded-xl p-3 shadow-inner flex flex-col gap-1 font-mono">
              <div className="flex items-center justify-between text-[9px] text-cyan-400/70 pb-1 border-b border-cyan-950 font-bold">
                <span className="flex items-center gap-1">
                  <Tv className="w-3 h-3 text-cyan-400" />
                  <span>SSD1306 OLED (128x64)</span>
                </span>
                <span>{isA ? 'HOST VIEW' : 'REMOTE NODE'}</span>
              </div>
              <div className="text-cyan-300 text-xs font-bold tracking-wider pt-1">
                &gt; {p.oledLines[0] || 'READY'}
              </div>
              <div className="text-cyan-400 text-xs font-semibold">
                &gt; {p.oledLines[1] || 'BUS IDLE'}
              </div>
              <div className="text-cyan-200 text-xs">
                &gt; {p.oledLines[2] || 'WAITING...'}
              </div>
              <div className="text-cyan-500 text-[11px]">
                &gt; {p.oledLines[3] || 'STATUS: 0x00'}
              </div>
            </div>

            {/* Servo Gauge & RGB LED Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Servo Angle Gauge */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-slate-400 font-bold pb-1">
                  {language === 'hu' ? 'Szervó Szög (D9 PWM)' : 'Servo Angle (D9 PWM)'}
                </div>
                {/* SVG Visual Needle Gauge */}
                <svg viewBox="0 0 100 55" className="w-24 h-14 overflow-visible">
                  {/* Gauge Arc */}
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="8"
                    strokeDasharray="110"
                    strokeDashoffset={110 - (p.servoAngle / 180) * 110}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Needle */}
                  <g
                    transform={`rotate(${p.servoAngle - 90} 50 50)`}
                    className="transition-transform duration-300 origin-center"
                  >
                    <line x1="50" y1="50" x2="50" y2="18" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4" fill="#F43F5E" />
                  </g>
                </svg>
                <div className="text-cyan-300 font-bold text-sm">{p.servoAngle}°</div>
              </div>

              {/* RGB LED with dynamic glow */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-slate-400 font-bold pb-1">
                  {language === 'hu' ? 'RGB LED (D5/D6/D3)' : 'RGB LED (D5/D6/D3)'}
                </div>
                <div className="relative my-2">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/40 shadow-2xl transition-all duration-300"
                    style={{
                      backgroundColor: `rgb(${p.rgbColor.r}, ${p.rgbColor.g}, ${p.rgbColor.b})`,
                      boxShadow: `0 0 25px rgba(${p.rgbColor.r}, ${p.rgbColor.g}, ${p.rgbColor.b}, 0.8)`,
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-300">
                  R:{p.rgbColor.r} G:{p.rgbColor.g} B:{p.rgbColor.b}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Source Code Editor Tab */
        <div className="flex flex-col gap-2 font-mono">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
            <span>Embedded Firmware ({node.model})</span>
            <button
              onClick={() => onUpdateCode(editingCode)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{language === 'hu' ? 'Flash ROM-ba' : 'Flash to MCU'}</span>
            </button>
          </div>
          <textarea
            value={editingCode}
            onChange={(e) => setEditingCode(e.target.value)}
            rows={12}
            className="w-full bg-[#05070A] border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};
