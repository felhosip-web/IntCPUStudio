import React, { useState } from 'react';
import { BridgeProtocol, BridgeTrafficPacket } from '../../../types/mcuBridge';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Layers,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react';

interface McuBridgeTrafficInspectorProps {
  packets: BridgeTrafficPacket[];
  protocol: BridgeProtocol;
  onClearLogs: () => void;
}

export const McuBridgeTrafficInspector: React.FC<McuBridgeTrafficInspectorProps> = ({
  packets,
  protocol,
  onClearLogs,
}) => {
  const { language } = useI18n();
  const [selectedPktId, setSelectedPktId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'ERRORS_ONLY'>('ALL');

  const filteredPackets = packets.filter((p) => {
    if (filterType === 'ERRORS_ONLY') {
      return p.dissection.status !== 'OK';
    }
    return true;
  });

  // Export JSON or CSV trace
  const handleExportTrace = () => {
    const jsonStr = JSON.stringify(packets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dual_mcu_bridge_trace_${protocol}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="mcu-bridge-traffic-inspector"
      className="bg-[#090D17] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 font-mono"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'hu'
                  ? 'Protokoll Analizátor & Csomag Diszszektor'
                  : 'Live Protocol Analyzer & Frame Dissector'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                {packets.length} {language === 'hu' ? 'Csomag naplózva' : 'Frames Captured'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Valós idejű buszforgalom hexadecimális dump és mező szintű elemzés'
                : 'Real-time bus traffic hex dump and field-level protocol dissection'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Filter toggle */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'hu' ? 'Mind' : 'All'}
            </button>
            <button
              onClick={() => setFilterType('ERRORS_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'ERRORS_ONLY'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'hu' ? 'Csak Hibák' : 'Errors Only'}
            </button>
          </div>

          {/* Export Trace */}
          <button
            onClick={handleExportTrace}
            disabled={packets.length === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
            title="Export JSON Trace"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            disabled={packets.length === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer transition-colors"
            title="Napló ürítése"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Packet Table List */}
      <div className="max-h-72 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {filteredPackets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {language === 'hu'
              ? 'Nincs rögzített buszforgalom. Indítsd el a szimulációt!'
              : 'No captured traffic yet. Start the synchronized simulation!'}
          </div>
        ) : (
          filteredPackets.map((pkt) => {
            const isSelected = selectedPktId === pkt.id;
            const isOk = pkt.dissection.status === 'OK';

            return (
              <div
                key={pkt.id}
                className={`rounded-xl border transition-all ${
                  isOk
                    ? isSelected
                      ? 'bg-cyan-950/40 border-cyan-600'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    : isSelected
                      ? 'bg-rose-950/40 border-rose-600'
                      : 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                }`}
              >
                {/* Collapsed Row */}
                <div
                  onClick={() => setSelectedPktId(isSelected ? null : pkt.id)}
                  className="p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none text-xs"
                >
                  <div className="flex items-center gap-2 min-w-[120px]">
                    {isSelected ? (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-slate-400 text-[11px]">{pkt.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        pkt.source === 'MCU_A'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {pkt.source} &rarr; {pkt.target}
                    </span>
                  </div>

                  {/* Decoded Content */}
                  <div className="flex-1 font-bold truncate text-slate-200" title={pkt.decodedMessage}>
                    {pkt.decodedMessage}
                  </div>

                  {/* Hex Dump & Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono hidden md:inline">
                      {pkt.hexDump}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOk
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                      }`}
                    >
                      {pkt.dissection.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Detailed Field Dissector */}
                {isSelected && (
                  <div className="p-3 border-t border-slate-800 bg-[#05070D] rounded-b-xl flex flex-col gap-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {pkt.dissection.address && (
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">Target Address</div>
                          <div className="font-bold text-cyan-300">{pkt.dissection.address}</div>
                        </div>
                      )}
                      {pkt.dissection.command && (
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">Command / Header</div>
                          <div className="font-bold text-purple-300">{pkt.dissection.command}</div>
                        </div>
                      )}
                      {pkt.dissection.crc && (
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">CRC Checksum</div>
                          <div className="font-bold text-emerald-300">{pkt.dissection.crc}</div>
                        </div>
                      )}
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase">ACK / Handshake</div>
                        <div className="font-bold text-amber-300">
                          {pkt.dissection.ack ? 'ACK (Acknowledged)' : 'NACK / No Reply'}
                        </div>
                      </div>
                    </div>

                    {pkt.dissection.payload && (
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase">Payload Data Breakdown</div>
                        <div className="font-mono text-slate-200 text-[11px] pt-0.5">
                          {pkt.dissection.payload}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Protocol: {pkt.protocol} Frame</span>
                      <span>Raw Byte Count: {pkt.rawBytes.length} Bytes</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
