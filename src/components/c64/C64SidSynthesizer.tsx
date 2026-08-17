import React, { useState } from 'react';
import { sidAudio } from '../../core/c64Audio';
import { useI18n } from '../../i18n/I18nContext';
import { Music, Radio, Volume2, Zap } from 'lucide-react';

export const C64SidSynthesizer: React.FC = () => {
  const { language } = useI18n();
  const [currentFreq, setCurrentFreq] = useState(440);
  const [selectedWave, setSelectedWave] = useState<OscillatorType>('square');

  const handlePlayTone = () => {
    sidAudio.playTone(currentFreq, 0.25, selectedWave, 0.4);
  };

  const PIANO_KEYS = [
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.0 },
    { note: 'A4', freq: 440.0 },
    { note: 'B4', freq: 493.88 },
    { note: 'C5', freq: 523.25 },
  ];

  return (
    <div className="bg-[#111622] rounded-2xl border border-slate-800/90 p-4 shadow-lg flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
            {language === 'hu'
              ? 'SID 6581 Hangchip & Szintetizátor'
              : 'SID 6581 Sound Synthesizer'}
          </h3>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/50">
          3 Voice Polyphony
        </span>
      </div>

      {/* Preset Sound FX triggers */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => sidAudio.playLaser()}
          className="px-2.5 py-1 bg-[#1A2234] hover:bg-purple-900/40 text-purple-300 border border-purple-800/50 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Laser FX</span>
        </button>

        <button
          onClick={() => sidAudio.playArpeggio()}
          className="px-2.5 py-1 bg-[#1A2234] hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/50 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Radio className="w-3 h-3" />
          <span>Arpeggio</span>
        </button>

        <button
          onClick={() => sidAudio.playBootJingle()}
          className="px-2.5 py-1 bg-[#1A2234] hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/50 rounded-lg font-bold transition-colors cursor-pointer"
        >
          Boot Jingle
        </button>

        <button
          onClick={() => sidAudio.playNoise(0.25, 0.4)}
          className="px-2.5 py-1 bg-[#1A2234] hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-lg font-bold transition-colors cursor-pointer"
        >
          White Noise (Robbanás)
        </button>

        <button
          onClick={() => sidAudio.playErrorBuzz()}
          className="px-2.5 py-1 bg-[#1A2234] hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-lg font-bold transition-colors cursor-pointer"
        >
          Buzz
        </button>
      </div>

      {/* Interactive Piano Mini Keyboard */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800">
        <span className="text-[10px] text-slate-400 font-bold uppercase">
          {language === 'hu' ? 'Klasszikus C4-C5 Zongora Billentyűk' : 'Piano Test Keys'}
        </span>
        <div className="grid grid-cols-8 gap-1">
          {PIANO_KEYS.map((k) => (
            <button
              key={k.note}
              onClick={() => {
                setCurrentFreq(Math.round(k.freq));
                sidAudio.playTone(k.freq, 0.2, selectedWave, 0.35);
              }}
              className="p-2 bg-gradient-to-b from-slate-200 to-slate-400 hover:from-cyan-300 hover:to-cyan-500 text-slate-900 font-black rounded-lg text-center text-xs shadow transition-transform active:scale-95 cursor-pointer select-none"
            >
              <div>{k.note}</div>
              <div className="text-[9px] font-normal opacity-75">{Math.round(k.freq)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Waveform and Frequency Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {language === 'hu' ? 'Hullámforma (Voice 1)' : 'Waveform'}
          </span>
          <div className="grid grid-cols-4 gap-1">
            {(['square', 'triangle', 'sawtooth', 'sine'] as OscillatorType[]).map((wave) => (
              <button
                key={wave}
                onClick={() => setSelectedWave(wave)}
                className={`py-1 rounded text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
                  selectedWave === wave
                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {wave === 'square' ? 'Pulse' : wave}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>{language === 'hu' ? 'Frekvencia' : 'Frequency'}</span>
            <span className="text-cyan-400 font-mono">{currentFreq} Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="2000"
              step="10"
              value={currentFreq}
              onChange={(e) => setCurrentFreq(parseInt(e.target.value, 10))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <button
              onClick={handlePlayTone}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
