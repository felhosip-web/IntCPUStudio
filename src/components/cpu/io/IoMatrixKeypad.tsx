import React from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Grid, KeyRound } from 'lucide-react';

interface IoMatrixKeypadProps {
  device: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

const KEYPAD_KEYS = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D'],
];

export const IoMatrixKeypad: React.FC<IoMatrixKeypadProps> = ({
  device,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();
  const keypadState = device.keypadState || {
    activeColumnLatch: 0b0001,
    pressedKeys: {},
  };

  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  const handleToggleKey = (row: number, col: number) => {
    const keyId = `${row},${col}`;
    const nextPressed = { ...keypadState.pressedKeys };
    if (nextPressed[keyId]) {
      delete nextPressed[keyId];
    } else {
      nextPressed[keyId] = true;
    }

    onUpdateDevice({
      ...device,
      keypadState: {
        ...keypadState,
        pressedKeys: nextPressed,
      },
    });
  };

  // Check which row is active based on active driven columns (Active LOW drive: 0 is active)
  const colLatch = keypadState.activeColumnLatch & 0x0f;
  const rowActive = [false, false, false, false];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const colIsActive = (colLatch & (1 << c)) === 0;
      if (colIsActive && keypadState.pressedKeys[`${r},${c}`]) {
        rowActive[r] = true;
      }
    }
  }

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {isBusActive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? device.nameHu : device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-purple-400 font-semibold">
                {toHex(device.baseAddress)} (Col) / {toHex(device.baseAddress + 1)} (Row)
              </span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                {device.chipSelectLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4x4 Keypad Grid */}
      <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-3 flex flex-col items-center">
        {/* Column Drive Indicator LEDs */}
        <div className="grid grid-cols-4 gap-2 mb-2 w-full max-w-[200px]">
          {[0, 1, 2, 3].map((c) => {
            const isColActive = (colLatch & (1 << c)) === 0;
            return (
              <div key={c} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-mono text-slate-500">C{c}</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    isColActive
                      ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] border-purple-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* 16 Buttons with Row Sense indicators on the left */}
        <div className="flex items-center gap-2">
          {/* Row Sense LEDs */}
          <div className="flex flex-col justify-around gap-2.5">
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="flex items-center gap-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    rowActive[r]
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] border-emerald-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
                <span className="text-[8px] font-mono text-slate-500">R{r}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5 w-[180px]">
            {KEYPAD_KEYS.map((rowKeys, r) =>
              rowKeys.map((k, c) => {
                const isPressed = !!keypadState.pressedKeys[`${r},${c}`];
                return (
                  <button
                    key={k}
                    onClick={() => handleToggleKey(r, c)}
                    title={`Key ${k} (Row ${r}, Col ${c})`}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                      isPressed
                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.7)] scale-95 border border-purple-300'
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95'
                    }`}
                  >
                    {k}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="text-slate-500">Matrix Scan: Out Col (0xE005), In Row (0xE006)</span>
        <span className="text-purple-300 font-semibold">
          Col Latch: {toHex(colLatch)}
        </span>
      </div>
    </div>
  );
};
