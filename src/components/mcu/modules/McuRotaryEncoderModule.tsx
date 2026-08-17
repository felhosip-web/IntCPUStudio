import React, { useState } from 'react';
import { RotaryEncoderState } from '../../../types/mcu';
import { useI18n } from '../../../i18n/I18nContext';
import { playPortBeep } from '../../../core/audio';
import { ChevronLeft, ChevronRight, Compass, Disc, MousePointer, RotateCcw, Sliders } from 'lucide-react';

interface McuRotaryEncoderModuleProps {
  state: RotaryEncoderState;
  onChange: (updater: (prev: RotaryEncoderState) => RotaryEncoderState) => void;
  onTriggerInterrupt: (vector: 'INT0' | 'INT1') => void;
}

export const McuRotaryEncoderModule: React.FC<McuRotaryEncoderModuleProps> = ({
  state,
  onChange,
  onTriggerInterrupt,
}) => {
  const { language } = useI18n();
  const [knobAngle, setKnobAngle] = useState(0);

  // Turn Left (CCW)
  const handleTurnCCW = () => {
    setKnobAngle((prev) => prev - 15);
    onChange((prev) => ({
      ...prev,
      position: prev.position - 1,
      lastDirection: 'CCW',
      phaseA: false,
      phaseB: true,
    }));
    onTriggerInterrupt('INT0');
    playPortBeep(520, 0.02);
  };

  // Turn Right (CW)
  const handleTurnCW = () => {
    setKnobAngle((prev) => prev + 15);
    onChange((prev) => ({
      ...prev,
      position: prev.position + 1,
      lastDirection: 'CW',
      phaseA: true,
      phaseB: false,
    }));
    onTriggerInterrupt('INT0');
    playPortBeep(640, 0.02);
  };

  // Push Button
  const handleButtonPress = (pressed: boolean) => {
    onChange((prev) => ({
      ...prev,
      isSwPressed: pressed,
    }));
    if (pressed) {
      playPortBeep(880, 0.04);
    }
  };

  const handleResetPosition = () => {
    onChange((prev) => ({
      ...prev,
      position: 0,
      lastDirection: 'NONE',
    }));
  };

  return (
    <div className="bg-[#18130B] rounded-xl border border-amber-500/30 p-3.5 flex flex-col gap-3 shadow-lg hover:border-amber-500/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Disc className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-xs font-bold text-amber-300">Rotary Encoder</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                Quadrature (CLK: {state.pinA}, DT: {state.pinB}, SW: {state.pinSw})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {language === 'hu'
                ? 'Kvadratúra Forgó Jeladó Beépített Nyomógombbal'
                : 'Incremental Quadrature Encoder with Push Switch'}
            </p>
          </div>
        </div>

        {/* Direction Tag */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className={`px-2 py-0.5 rounded border font-bold ${
              state.lastDirection === 'CW'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : state.lastDirection === 'CCW'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {state.lastDirection === 'CW'
              ? '↻ JOBBRA (CW)'
              : state.lastDirection === 'CCW'
              ? '↺ BALRA (CCW)'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Interactive Dial & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0E0C06] p-3 rounded-lg border border-amber-950">
        {/* Left: Rotating Knob Visual */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Outer dial ring */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-950/40">
              {/* Inner rotating core */}
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-900/60 to-slate-900 border border-amber-500/60 flex items-center justify-center relative transition-transform duration-100 ease-out"
                style={{ transform: `rotate(${knobAngle}deg)` }}
              >
                {/* Pointer indicator */}
                <div className="absolute top-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
                <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[8px] font-mono text-amber-300">
                  ENC
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">
              {language === 'hu' ? 'Pozíció / Érték:' : 'Position Value:'}
            </span>
            <span className="font-mono text-2xl font-black text-amber-200">
              {state.position}
            </span>
            <button
              onClick={handleResetPosition}
              className="mt-1 flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-amber-300 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Nullázás (0)
            </button>
          </div>
        </div>

        {/* Right: Step Buttons & Push Switch */}
        <div className="flex flex-col justify-between gap-2 font-mono text-[10px]">
          <div>
            <span className="text-slate-400 mb-1 block">
              {language === 'hu' ? 'Forgatás szimuláció:' : 'Turn Control:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleTurnCCW}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-300 border border-amber-900/80 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Lépés -1
              </button>
              <button
                onClick={handleTurnCW}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-300 border border-amber-900/80 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                Lépés +1 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tactile Switch Button */}
          <div className="flex items-center justify-between pt-1 border-t border-amber-900/30">
            <span className="text-slate-500">Tengely Gomb (SW):</span>
            <button
              onMouseDown={() => handleButtonPress(true)}
              onMouseUp={() => handleButtonPress(false)}
              onMouseLeave={() => handleButtonPress(false)}
              onTouchStart={() => handleButtonPress(true)}
              onTouchEnd={() => handleButtonPress(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer select-none transition-all ${
                state.isSwPressed
                  ? 'bg-amber-500 text-slate-950 border-amber-300 scale-95 shadow-md shadow-amber-500/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-800'
              }`}
            >
              <MousePointer className="w-3 h-3" />
              {state.isSwPressed ? 'LENYOMVA (LOW)' : 'KATTINTÁS (SW)'}
            </button>
          </div>
        </div>
      </div>

      {/* Quadrature Phase Logic Preview */}
      <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-amber-950">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Kvadratúra Fázisok:</span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                state.phaseA ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            />
            CLK (A): <strong className="text-slate-300">{state.phaseA ? 'HIGH' : 'LOW'}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                state.phaseB ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            />
            DT (B): <strong className="text-slate-300">{state.phaseB ? 'HIGH' : 'LOW'}</strong>
          </span>
        </div>
        <div className="text-slate-400 text-[10px]">
          INT0 Trigger: <span className="text-emerald-400">Falling Edge Enabled</span>
        </div>
      </div>
    </div>
  );
};
