import React from 'react';
import { PROTOCOL_SPECS } from '../../../core/mcuProtocolData';
import { ProtocolType } from '../../../types/mcuProtocols';
import { useI18n } from '../../../i18n/I18nContext';
import { Check, HelpCircle, Layers, X } from 'lucide-react';

interface McuProtocolComparisonTableProps {
  selectedProtocol: ProtocolType;
  onSelectProtocol: (prot: ProtocolType) => void;
}

export const McuProtocolComparisonTable: React.FC<McuProtocolComparisonTableProps> = ({
  selectedProtocol,
  onSelectProtocol,
}) => {
  const { language } = useI18n();
  const protocols = Object.values(PROTOCOL_SPECS);

  return (
    <div className="w-full bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono text-white">
            {language === 'hu'
              ? 'Protokoll Összehasonlító Mátrix & Szabvány Jellemzők'
              : 'Protocol Comparison Matrix & Specifications'}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          1-Wire • I2C • SPI • CAN • RS-485 • RS-422 • RS-232
        </span>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto custom-scrollbar border border-slate-800/80 rounded-xl">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#05070A] text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="p-3 font-bold">{language === 'hu' ? 'Protokoll' : 'Protocol'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Vezetékek' : 'Wires'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Jeltípus' : 'Signaling'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Duplex Mód' : 'Duplex'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Max Sebesség' : 'Max Speed'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Max Távolság' : 'Max Distance'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Multi-Master' : 'Multi-Master'}</th>
              <th className="p-3 font-bold">{language === 'hu' ? 'Tipikus Felhasználás' : 'Common Uses'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {protocols.map((prot) => {
              const isSelected = prot.id === selectedProtocol;

              return (
                <tr
                  key={prot.id}
                  onClick={() => onSelectProtocol(prot.id)}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 text-white font-semibold'
                      : 'hover:bg-slate-900/50 text-slate-300'
                  }`}
                >
                  {/* Protocol Name with Color Dot */}
                  <td className="p-3 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prot.color }}
                    />
                    <span className="font-bold text-white">{prot.name}</span>
                  </td>

                  {/* Wires */}
                  <td className="p-3 text-slate-300">
                    {prot.wireCount} ({prot.physicalLines.slice(0, 2).join(', ')})
                  </td>

                  {/* Signaling */}
                  <td className="p-3 text-slate-400 text-[11px]">
                    {language === 'hu' ? prot.signalingTypeHu : prot.signalingType}
                  </td>

                  {/* Duplex Mode */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prot.duplexMode === 'Full-Duplex'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : 'bg-amber-950 border border-amber-800 text-amber-300'
                      }`}
                    >
                      {prot.duplexMode}
                    </span>
                  </td>

                  {/* Max Speed */}
                  <td className="p-3 text-cyan-300 font-bold">{prot.maxSpeed}</td>

                  {/* Max Distance */}
                  <td className="p-3 text-amber-300">{prot.maxDistance}</td>

                  {/* Multi-Master */}
                  <td className="p-3 text-center">
                    {prot.multiMaster ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'hu' ? 'Igen' : 'Yes'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <X className="w-3.5 h-3.5" />
                        <span>{language === 'hu' ? 'Nem' : 'No'}</span>
                      </span>
                    )}
                  </td>

                  {/* Typical Applications */}
                  <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {language === 'hu'
                      ? prot.typicalApplicationsHu[0]
                      : prot.typicalApplications[0]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
