import React from 'react';
import { BridgeFaultInjection, BridgeProtocol } from '../../../types/mcuBridge';
import { useI18n } from '../../../i18n/I18nContext';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Radio,
  RefreshCw,
  Scissors,
  ShieldAlert,
  Sliders,
  Sparkles,
  Unplug,
  WifiOff,
  Zap,
  ZapOff,
} from 'lucide-react';

interface McuBridgeFaultInjectorProps {
  protocol: BridgeProtocol;
  faults: BridgeFaultInjection;
  onUpdateFaults: (updater: (prev: BridgeFaultInjection) => BridgeFaultInjection) => void;
  errorCount: number;
  onResetErrors: () => void;
}

export const McuBridgeFaultInjector: React.FC<McuBridgeFaultInjectorProps> = ({
  protocol,
  faults,
  onUpdateFaults,
  errorCount,
  onResetErrors,
}) => {
  const { language } = useI18n();

  return (
    <div
      id="mcu-bridge-fault-injector"
      className="bg-[#0A0D17] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 font-mono"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bug className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Hardveres Hibainjektor & Robusztussági Teszt'
                  : 'Hardware Fault Injector & Stress Lab'}
              </h3>
              {errorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-bold animate-pulse">
                  {errorCount} {language === 'hu' ? 'Hiba elkapva' : 'Errors Caught'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Szimulálj NACK hibákat, vonalszakadást, távolsági csillapítást és zajt!'
                : 'Inject NACK conditions, line cuts, RF distance loss, and bit flips in real-time!'}
            </p>
          </div>
        </div>

        {errorCount > 0 && (
          <button
            onClick={onResetErrors}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{language === 'hu' ? 'Hibaszámláló törlése' : 'Clear Errors'}</span>
          </button>
        )}
      </div>

      {/* Fault Injection Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Fault 1: Force NACK / No-Acknowledge (I2C) */}
        {protocol === 'I2C' && (
          <div
            onClick={() =>
              onUpdateFaults((prev) => ({ ...prev, forceNack: !prev.forceNack }))
            }
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
              faults.forceNack
                ? 'bg-rose-950/30 border-rose-600 text-rose-200'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {language === 'hu' ? 'Kényszerített NACK (I2C)' : 'Force Slave NACK (I2C)'}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  faults.forceNack
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {faults.forceNack ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              {language === 'hu'
                ? 'A szolga nem húzza le az SDA vonalat a 9. órajelciklusban.'
                : 'Slave holds SDA HIGH during ACK clock slot, simulating dead node.'}
            </p>
          </div>
        )}

        {/* Fault 2: Wireless RF Distance Slider (nRF24) */}
        {protocol === 'NRF24' && (
          <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 flex flex-col justify-between gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                <Radio className="w-4 h-4 text-cyan-400" />
                {language === 'hu'
                  ? 'RF Távolság & Csillapítás (Path Loss):'
                  : 'Simulated RF Distance & Path Loss:'}
              </span>
              <span className="text-xs font-bold text-cyan-300">
                {faults.rfDistanceMeters.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={60}
              step={0.5}
              value={faults.rfDistanceMeters}
              onChange={(e) =>
                onUpdateFaults((prev) => ({
                  ...prev,
                  rfDistanceMeters: Number(e.target.value),
                }))
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0.5m (RSSI: -35 dBm)</span>
              <span>25m (RSSI: -70 dBm)</span>
              <span className="text-rose-400">&gt;40m (Drop / Out of Range)</span>
            </div>
          </div>
        )}

        {/* Fault 3: RS-485 / CAN 120 Ohm Termination Resistor */}
        {(protocol === 'RS485' || protocol === 'CAN') && (
          <div
            onClick={() =>
              onUpdateFaults((prev) => ({
                ...prev,
                rs485Terminated: !prev.rs485Terminated,
              }))
            }
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
              !faults.rs485Terminated
                ? 'bg-rose-950/30 border-rose-600 text-rose-200'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                {language === 'hu' ? '120Ω Busz Lezárás' : '120Ω Split Terminator'}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  faults.rs485Terminated
                    ? 'bg-emerald-700 text-white'
                    : 'bg-rose-700 text-white'
                }`}
              >
                {faults.rs485Terminated ? 'MATCHED' : 'UNTERMINATED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              {language === 'hu'
                ? 'Kikapcsolva jelvisszaverődés és jitter lép fel a vonalakon.'
                : 'Removing termination introduces cable reflection and signal ringing.'}
            </p>
          </div>
        )}

        {/* Fault 4: Random Noise & Bit Flips */}
        <div
          onClick={() =>
            onUpdateFaults((prev) => ({
              ...prev,
              noiseEnabled: !prev.noiseEnabled,
            }))
          }
          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
            faults.noiseEnabled
              ? 'bg-amber-950/30 border-amber-600 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {language === 'hu' ? 'Elektromos Zaj & Bit Flip' : 'EMI Noise & CRC Error'}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                faults.noiseEnabled
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {faults.noiseEnabled ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-tight">
            {language === 'hu'
              ? 'Véletlenszerű bithiba injektálása a hardveres CRC ellenőrzés tesztelésére.'
              : 'Inverts random bit in packet to verify hardware CRC failure handling.'}
          </p>
        </div>

        {/* Fault 5: Quick Disconnect All Wires */}
        <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-slate-200">
              {language === 'hu' ? 'Összes Vezeték Visszaállítása' : 'Reconnect All Wires'}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              {language === 'hu' ? 'Minden fizikai szakadás törlése' : 'Clear all severed wire faults'}
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateFaults((prev) => ({ ...prev, disconnectedWires: {} }))
            }
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Helyreállítás' : 'Restore'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
