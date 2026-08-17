import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Grid, Sparkles, Trash2 } from 'lucide-react';

interface MatrixDisplayModuleProps {
  matrixLeds: number[]; // 8 rows of 8-bit values
  onClearMatrix?: () => void;
}

export const MatrixDisplayModule: React.FC<MatrixDisplayModuleProps> = ({
  matrixLeds = [],
  onClearMatrix,
}) => {
  const { language } = useI18n();
  const rows = (matrixLeds || []).slice(0, 8);
  while (rows.length < 8) {
    rows.push(0);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {language === 'hu'
              ? '8x8 GRAFIKUS LED MÁTRIX (PORT 5)'
              : '8x8 GRAPHIC LED MATRIX (PORT 5)'}
          </span>
        </div>
        {onClearMatrix && (
          <button
            onClick={onClearMatrix}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>{language === 'hu' ? 'Törlés' : 'Clear'}</span>
          </button>
        )}
      </div>

      {/* 8x8 Pixel Grid */}
      <div className="bg-black/90 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
        <div className="grid grid-rows-8 gap-1.5 p-2 bg-[#0A0B0E] rounded-lg border border-slate-800/80 shadow-inner">
          {rows.map((rowVal, rowIdx) => {
            const bin = (rowVal & 0xff).toString(2).padStart(8, '0');
            return (
              <div key={rowIdx} className="grid grid-cols-8 gap-1.5">
                {bin.split('').map((bit, colIdx) => {
                  const isOn = bit === '1';
                  return (
                    <div
                      key={colIdx}
                      title={`${language === 'hu' ? 'Sor' : 'Row'}: ${rowIdx}, ${language === 'hu' ? 'Oszlop' : 'Col'}: ${colIdx}, ${language === 'hu' ? 'Érték' : 'Val'}: ${bit}`}
                      className={`w-4 h-4 rounded-xs transition-all duration-150 ${
                        isOn
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] border border-rose-300'
                          : 'bg-slate-900/80 border border-slate-800/60'
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-2 bg-[#0A0B0E] rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          {language === 'hu' ? (
            <>
              Küldj 8 bájtot egymás után az <code className="text-cyan-300">OUT 5, reg</code>{' '}
              utasítással egy 8x8-as kép kirajzolásához!
            </>
          ) : (
            <>
              Send 8 consecutive bytes with <code className="text-cyan-300">OUT 5, reg</code> to
              render an 8x8 graphic pattern!
            </>
          )}
        </span>
      </div>
    </div>
  );
};
