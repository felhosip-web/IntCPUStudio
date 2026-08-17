import React, { useState } from 'react';
import { Nrf24State } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import { playPortBeep } from '../../../core/audio';
import { Activity, ArrowDownLeft, ArrowUpRight, CheckCircle2, Radio, Send, ShieldCheck, Wifi } from 'lucide-react';

interface McuNrf24ModuleProps {
  state: Nrf24State;
  onChange: (updater: (prev: Nrf24State) => Nrf24State) => void;
  onTriggerInterrupt: (vector: 'INT0' | 'INT1') => void;
}

export const McuNrf24Module: React.FC<McuNrf24ModuleProps> = ({
  state,
  onChange,
  onTriggerInterrupt,
}) => {
  const { language } = useI18n();
  const [customPayload, setCustomPayload] = useState('TEMP:24.5C#42');
  const [txBlink, setTxBlink] = useState(false);
  const [rxBlink, setRxBlink] = useState(false);

  // Send packet from MCU
  const handleSendPacket = () => {
    setTxBlink(true);
    playPortBeep(1200, 0.03);
    setTimeout(() => setTxBlink(false), 200);

    onChange((prev) => ({
      ...prev,
      lastTxPayload: customPayload,
      packetsSent: prev.packetsSent + 1,
      lastAckReceived: true,
      isTransmitting: true,
    }));

    // Auto-respond from Node B after 300ms
    setTimeout(() => {
      setRxBlink(true);
      playPortBeep(1600, 0.03);
      setTimeout(() => setRxBlink(false), 200);

      onChange((prev) => ({
        ...prev,
        lastRxPayload: `ACK_RESPONSE[${customPayload.substring(0, 10)}]`,
        packetsReceived: prev.packetsReceived + 1,
      }));
      onTriggerInterrupt('INT0');
    }, 350);
  };

  const rfFreqMhz = 2400 + state.channel;

  return (
    <div className="bg-[#0B1713] rounded-xl border border-emerald-500/30 p-3.5 flex flex-col gap-3 shadow-lg hover:border-emerald-500/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-xs font-bold text-emerald-300">nRF24L01+ 2.4GHz</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                SPI (D11/D12/D13 + CE:{state.cePin} + CSN:{state.csnPin})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {language === 'hu'
                ? 'Vezeték Nélküli Rádiófrekvenciás Adó-Vevő Modul'
                : 'Nordic 2.4GHz RF Transceiver with Auto-ACK'}
            </p>
          </div>
        </div>

        {/* TX / RX LED Indicators */}
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                txBlink
                  ? 'bg-amber-400 border-amber-200 shadow-md shadow-amber-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-amber-300">TX</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                rxBlink
                  ? 'bg-emerald-400 border-emerald-200 shadow-md shadow-emerald-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-emerald-300">RX</span>
          </div>
        </div>
      </div>

      {/* RF Config & Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#06100D] p-3 rounded-lg border border-emerald-950">
        {/* Left: RF Parameters */}
        <div className="flex flex-col justify-between gap-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">RF Csatorna:</span>
            <div className="flex items-center gap-1">
              <select
                value={state.channel}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    channel: parseInt(e.target.value, 10),
                  }))
                }
                className="bg-slate-900 border border-emerald-800 text-emerald-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
              >
                <option value={10}>CH 10 (2410 MHz)</option>
                <option value={40}>CH 40 (2440 MHz)</option>
                <option value={76}>CH 76 (2476 MHz - Alapértelmezett)</option>
                <option value={108}>CH 108 (2508 MHz ISM)</option>
                <option value={125}>CH 125 (2525 MHz)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Adatsebesség:</span>
            <select
              value={state.dataRate}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  dataRate: e.target.value as any,
                }))
              }
              className="bg-slate-900 border border-emerald-800 text-emerald-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
            >
              <option value="250kbps">250 kbps (Hosszú hatótáv)</option>
              <option value="1Mbps">1 Mbps (Standard)</option>
              <option value="2Mbps">2 Mbps (Nagy sebesség)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Adóteljesítmény:</span>
            <span className="text-emerald-400 font-bold">{state.powerDbm} dBm (Max 1mW)</span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-emerald-900/30">
            <span>Frekvencia:</span>
            <strong className="text-emerald-300 font-mono">{rfFreqMhz} MHz</strong>
          </div>
        </div>

        {/* Right: Live Wireless Packet Sender */}
        <div className="flex flex-col justify-between gap-1.5 font-mono text-[10px]">
          <span className="text-slate-400">
            {language === 'hu' ? 'Adatcsomag küldés szimuláció:' : 'Packet Transmission:'}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              placeholder="Adat payload..."
              className="flex-1 bg-slate-950 border border-emerald-900/80 rounded px-2 py-1 text-emerald-200 text-[10px] font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSendPacket}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <Send className="w-3 h-3" /> TX
            </button>
          </div>

          {/* Packet Counters */}
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-emerald-900/30">
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowUpRight className="w-3 h-3 text-amber-400" />
              <span>TX: <strong className="text-amber-300">{state.packetsSent}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
              <span>RX: <strong className="text-emerald-300">{state.packetsReceived}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Packet Inspection Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-emerald-950">
        <div>
          <span className="text-slate-500">Utolsó TX Csomag (Pipe 0: {state.txAddress}):</span>
          <p className="text-amber-300 font-mono truncate">{state.lastTxPayload}</p>
        </div>
        <div>
          <span className="text-slate-500">Utolsó RX Csomag (Node B ACK Payload):</span>
          <p className="text-emerald-300 font-mono truncate">{state.lastRxPayload}</p>
        </div>
      </div>
    </div>
  );
};
