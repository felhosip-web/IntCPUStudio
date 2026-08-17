import React, { useEffect, useRef } from 'react';
import { AudioPsgState } from '../../types/hardware';
import { useI18n } from '../../i18n/I18nContext';
import { Volume2, VolumeX, Music, Activity, Play } from 'lucide-react';
import { playPortBeep } from '../../core/audio';

interface AudioPsgModuleProps {
  audioState: AudioPsgState;
  onUpdateAudio: (updater: (prev: AudioPsgState) => AudioPsgState) => void;
}

export const AudioPsgModule: React.FC<AudioPsgModuleProps> = ({ audioState, onUpdateAudio }) => {
  const { language } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isEnabled = !!audioState?.enabled;
  const channel1Freq = audioState?.channel1Freq ?? 440;
  const channel1Wave = audioState?.channel1Wave ?? 'SQUARE';
  const channel1Vol = audioState?.channel1Vol ?? 12;

  // Animated Oscilloscope Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.fillStyle = '#05070A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw wave
      ctx.strokeStyle = isEnabled ? '#06B6D4' : '#4B5563';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amp = (canvas.height / 2.5) * (channel1Vol / 15);

      for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * 4 * Math.PI + phase;
        let y = canvas.height / 2;

        if (isEnabled) {
          if (channel1Wave === 'SQUARE') {
            y += Math.sin(t) >= 0 ? amp : -amp;
          } else if (channel1Wave === 'TRIANGLE') {
            y += ((Math.asin(Math.sin(t)) * 2) / Math.PI) * amp;
          } else if (channel1Wave === 'SAWTOOTH') {
            y += ((t % (2 * Math.PI)) / Math.PI - 1) * amp;
          } else if (channel1Wave === 'NOISE') {
            y += (Math.random() * 2 - 1) * amp;
          }
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      phase += 0.15;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isEnabled, channel1Freq, channel1Wave, channel1Vol]);

  const handleTestPlay = () => {
    playPortBeep(channel1Freq, 0.2);
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 text-xs font-mono select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-950 text-pink-400 border border-pink-800">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs">
              {language === 'hu' ? 'PSG Chiptune Hanggenerátor' : 'PSG Chiptune Sound Synthesizer'}
            </div>
            <div className="text-[10px] text-pink-400">
              {language === 'hu' ? 'I/O Port: 7 (0x07)' : 'I/O Port: 7 (0x07)'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onUpdateAudio((p) => ({ ...p, enabled: !p?.enabled }))}
          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors ${
            isEnabled
              ? 'bg-pink-600/80 hover:bg-pink-500 text-white'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          <span>{isEnabled ? (language === 'hu' ? 'Aktív' : 'Active') : (language === 'hu' ? 'Néma' : 'Muted')}</span>
        </button>
      </div>

      {/* Visual Oscilloscope Canvas */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070A] relative shadow-inner">
        <canvas ref={canvasRef} width={280} height={70} className="w-full h-[70px] block" />
        <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-bold flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-cyan-400" />
          <span>{channel1Wave} • {channel1Freq} Hz</span>
        </div>
      </div>

      {/* Waveform Selector */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-400 font-bold">
          {language === 'hu' ? 'Hullámforma Típus:' : 'Waveform Type:'}
        </span>
        <div className="grid grid-cols-4 gap-1">
          {(['SQUARE', 'TRIANGLE', 'SAWTOOTH', 'NOISE'] as const).map((wave) => (
            <button
              key={wave}
              onClick={() => onUpdateAudio((p) => ({ ...p, channel1Wave: wave }))}
              className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                channel1Wave === wave
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {wave}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency & Test Trigger */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">{language === 'hu' ? 'Frekvencia:' : 'Freq:'}</span>
          <span className="text-cyan-300 font-bold">{channel1Freq} Hz</span>
        </div>

        <button
          onClick={handleTestPlay}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Play className="w-3 h-3" />
          <span>{language === 'hu' ? 'Hang Teszt' : 'Play Tone'}</span>
        </button>
      </div>
    </div>
  );
};
