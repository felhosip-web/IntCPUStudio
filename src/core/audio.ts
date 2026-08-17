import { SimulatorSettings, WaveformType } from '../types/settings';

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;
let currentSettings: Partial<SimulatorSettings> = {
  masterVolume: 60,
  enableClockTickSound: true,
  tickWaveform: 'sine',
  enableAluChimeSound: true,
  enableHaltSound: true,
  beeperBaseFreq: 440,
};

export function updateAudioSettings(settings: Partial<SimulatorSettings>) {
  currentSettings = { ...currentSettings, ...settings };
}

export function setAudioMuted(muted: boolean) {
  isAudioMuted = muted;
}

export function getAudioMuted(): boolean {
  return isAudioMuted;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getVolumeGain(): number {
  if (isAudioMuted) return 0;
  const vol = (currentSettings.masterVolume ?? 60) / 100;
  return Math.max(0, Math.min(1, vol));
}

export function playClockTick(customWaveform?: WaveformType) {
  if (isAudioMuted || !currentSettings.enableClockTickSound) return;
  const volume = getVolumeGain();
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = (customWaveform || currentSettings.tickWaveform || 'sine') as OscillatorType;
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.015);

    const baseGain = 0.04 * volume;
    gain.gain.setValueAtTime(baseGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.015);
  } catch {
    // Audio may be blocked before first user interaction
  }
}

export function playAluChime() {
  if (isAudioMuted || !currentSettings.enableAluChimeSound) return;
  const volume = getVolumeGain();
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.04);

    const baseGain = 0.06 * volume;
    gain.gain.setValueAtTime(baseGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Silent catch
  }
}

export function playPortBeep(freq?: number, duration = 0.1) {
  if (isAudioMuted) return;
  const volume = getVolumeGain();
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    const targetFreq = freq || currentSettings.beeperBaseFreq || 440;
    osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

    const baseGain = 0.08 * volume;
    gain.gain.setValueAtTime(baseGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silent catch
  }
}

export function playHaltTone() {
  if (isAudioMuted || !currentSettings.enableHaltSound) return;
  const volume = getVolumeGain();
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);

    const baseGain = 0.07 * volume;
    gain.gain.setValueAtTime(baseGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Silent catch
  }
}

export function playTestSound() {
  playPortBeep(currentSettings.beeperBaseFreq || 440, 0.15);
}
