import React from 'react';
import { IoBusTransaction } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Activity, Download, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface IoBusTransactionHistoryProps {
  transactions: IoBusTransaction[];
  onClearHistory: () => void;
}

export const IoBusTransactionHistory: React.FC<IoBusTransactionHistoryProps> = ({
  transactions,
  onClearHistory,
}) => {
  const { language } = useI18n();

  const toHex = (v: number, pad: number = 4) =>
    `0x${(v & (pad === 2 ? 0xff : 0xffff)).toString(16).toUpperCase().padStart(pad, '0')}`;

  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const header = 'Timestamp,Type,Mode,Address,DataHex,DataDec,ChipSelect,TargetDevice,Status\n';
    const rows = transactions
      .map(
        (t) =>
          `${new Date(t.timestamp).toISOString()},${t.type},${t.mode},${toHex(t.address)},${toHex(
            t.data,
            2
          )},${t.data},${t.chipSelect || 'NONE'},${t.targetDeviceName || 'UNKNOWN'},${t.status}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcu_io_transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? 'VALÓS IDEJŰ BUSZ TRANZAKCIÓ LOG' : 'REAL-TIME BUS TRANSACTION LOG'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {transactions.length}{' '}
              {language === 'hu' ? 'rögzített busz ciklus' : 'captured bus cycles'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={onClearHistory}
            disabled={transactions.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/60 disabled:opacity-40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl bg-black/60 font-mono text-xs">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-slate-600 italic">
            {language === 'hu'
              ? 'Még nincs rögzített I/O ciklus. Kattints a PEEK / POKE gombokra vagy futtass CPU kódot!'
              : 'No captured I/O bus cycles yet. Use PEEK / POKE or run CPU instructions!'}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 sticky top-0">
                <th className="p-2">TÍPUS</th>
                <th className="p-2">CÍM</th>
                <th className="p-2">ADAT (HEX/DEC)</th>
                <th className="p-2">CHIP SELECT</th>
                <th className="p-2">CÉL ESZKÖZ</th>
                <th className="p-2">ÁLLAPOT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/80 text-[11px]">
              {transactions.slice(-50).reverse().map((tx) => {
                const isWrite = tx.type === 'WRITE';
                return (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-2 flex items-center gap-1.5 font-bold">
                      {isWrite ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>WRITE</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>READ</span>
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-purple-300 font-semibold">{toHex(tx.address)}</td>
                    <td className="p-2 text-slate-200">
                      <strong className="text-emerald-400">{toHex(tx.data, 2)}</strong> ({tx.data})
                    </td>
                    <td className="p-2 text-slate-400">{tx.chipSelect || '/CS?'}</td>
                    <td className="p-2 text-slate-300">{tx.targetDeviceName || 'Unmapped'}</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
