import React from 'react';
import { IoDeviceMapping } from '../../../types/ioEmulator';
import { useI18n } from '../../../i18n/I18nContext';
import { Sliders, ToggleLeft, ShieldAlert, Cpu } from 'lucide-react';

interface IoButtonsAndSwitchesProps {
  device: IoDeviceMapping;
  onUpdateDevice: (updated: IoDeviceMapping) => void;
  isBusActive?: boolean;
}

export const IoButtonsAndSwitches: React.FC<IoButtonsAndSwitchesProps> = ({
  device,
  onUpdateDevice,
  isBusActive,
}) => {
  const { language } = useI18n();

  const toBin = (v: number) => (v & 0xff).toString(2).padStart(8, '0');
  const toHex = (v: number) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;

  if (device.type === 'PUSH_BUTTONS_4BIT') {
    const btnState = device.buttonState || {
      buttonStates: [false, false, false, false],
      pullUp: true,
      latchMode: false,
    };

    const handlePressButton = (idx: number, isPressed: boolean) => {
      const nextStates = [...btnState.buttonStates] as [boolean, boolean, boolean, boolean];
      if (btnState.latchMode) {
        // Toggle on click
        if (isPressed) {
          nextStates[idx] = !nextStates[idx];
        }
      } else {
        nextStates[idx] = isPressed;
      }

      onUpdateDevice({
        ...device,
        buttonState: {
          ...btnState,
          buttonStates: nextStates,
        },
      });
    };

    // Calculate electrical bus byte with pull-up logic
    let busVal = 0;
    btnState.buttonStates.forEach((pressed, idx) => {
      const bitVal = btnState.pullUp ? (pressed ? 0 : 1) : pressed ? 1 : 0;
      busVal |= bitVal << idx;
    });
    const finalReadByte = (busVal & 0x0f) | 0xf0;

    return (
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
        {isBusActive && (
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200">
                {language === 'hu' ? device.nameHu : device.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">{toHex(device.baseAddress)}</span>
                <span>•</span>
                <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                  {device.chipSelectLabel}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{device.accessMode}</span>
              </div>
            </div>
          </div>

          {/* Pull-Up / Pull-Down Resistor Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onUpdateDevice({
                  ...device,
                  buttonState: { ...btnState, pullUp: !btnState.pullUp },
                })
              }
              title={
                btnState.pullUp
                  ? language === 'hu'
                    ? 'Felhúzó ellenállás (VCC) - Alaphelyzet: 1, Lenomva: 0'
                    : 'Pull-up Resistor (VCC) - Idle: 1, Pressed: 0'
                  : language === 'hu'
                  ? 'Lehúzó ellenállás (GND) - Alaphelyzet: 0, Lenomva: 1'
                  : 'Pull-down Resistor (GND) - Idle: 0, Pressed: 1'
              }
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                btnState.pullUp
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
              }`}
            >
              {btnState.pullUp ? 'Pull-Up (VCC)' : 'Pull-Down (GND)'}
            </button>
          </div>
        </div>

        {/* 4 Tactile Buttons */}
        <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-3">
          <div className="grid grid-cols-4 gap-2.5">
            {btnState.buttonStates.map((isPressed, idx) => {
              const bitVal = btnState.pullUp ? (isPressed ? '0' : '1') : isPressed ? '1' : '0';
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    BTN{idx} (D{idx})
                  </span>
                  <button
                    onMouseDown={() => handlePressButton(idx, true)}
                    onMouseUp={() => !btnState.latchMode && handlePressButton(idx, false)}
                    onMouseLeave={() => !btnState.latchMode && handlePressButton(idx, false)}
                    onTouchStart={() => handlePressButton(idx, true)}
                    onTouchEnd={() => !btnState.latchMode && handlePressButton(idx, false)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold transition-all select-none cursor-pointer ${
                      isPressed
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-95 border-2 border-white'
                        : 'bg-gradient-to-b from-slate-700 to-slate-900 text-slate-200 border border-slate-600 shadow-md hover:border-cyan-400 active:scale-95'
                    }`}
                  >
                    {isPressed ? 'DOWN' : 'UP'}
                  </button>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isPressed ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    Bit: {bitVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tri-state buffer status */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>74HC244 Tri-State Buffer</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Bus Read: <strong className="text-cyan-300">{toHex(finalReadByte)}</strong> ({toBin(finalReadByte)})</span>
          </div>
        </div>
      </div>
    );
  }

  // 8-Bit DIP Switch Bank
  const dipState = device.dipState || { value: 0 };
  const dipBits = toBin(dipState.value).split('');

  const handleToggleDip = (bitIndex: number) => {
    const nextVal = dipState.value ^ (1 << bitIndex);
    onUpdateDevice({
      ...device,
      dipState: { value: nextVal },
    });
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {isBusActive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ToggleLeft className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? device.nameHu : device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-amber-400 font-semibold">{toHex(device.baseAddress)}</span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300 font-mono">
                {device.chipSelectLabel}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{device.accessMode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 DIP Switches */}
      <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/60 mb-3 shadow-inner">
        <div className="grid grid-cols-8 gap-1.5">
          {dipBits.map((bit, idx) => {
            const bitNum = 7 - idx;
            const isOn = bit === '1';
            return (
              <button
                key={bitNum}
                onClick={() => handleToggleDip(bitNum)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isOn
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-black/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[9px] font-mono text-slate-400">SW{bitNum}</span>
                <div
                  className={`w-5 h-8 rounded-sm p-0.5 border flex flex-col justify-between transition-colors ${
                    isOn ? 'bg-amber-950 border-amber-400' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div
                    className={`w-full h-3 rounded-xs transition-all ${
                      isOn ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-700'
                    }`}
                  />
                  <div
                    className={`w-full h-3 rounded-xs transition-all ${
                      isOn ? 'bg-transparent' : 'bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isOn ? 'text-amber-300' : 'text-slate-500'
                  }`}
                >
                  {bit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span>Parallel 8-Bit Read Buffer</span>
        <div className="flex items-center gap-2">
          <span>HEX: <strong className="text-amber-400">{toHex(dipState.value)}</strong></span>
          <span>DEC: <strong className="text-slate-200">{dipState.value}</strong></span>
        </div>
      </div>
    </div>
  );
};
