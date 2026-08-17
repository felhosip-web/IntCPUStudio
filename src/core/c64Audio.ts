// Commodore 64 SID 6581/8580 Audio Synthesizer Emulation

class SidAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.18, this.audioCtx.currentTime);
    }
  }

  public playTone(
    frequency: number,
    durationSec: number = 0.15,
    waveform: OscillatorType = 'triangle',
    volume: number = 0.5
  ) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx || !this.masterGain) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(Math.max(20, Math.min(8000, frequency)), this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.05, durationSec));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playNoise(durationSec: number = 0.2, volume: number = 0.3) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx || !this.masterGain) return;

      const bufferSize = this.audioCtx.sampleRate * durationSec;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + durationSec);
    } catch {
      // Ignore audio error
    }
  }

  public playKeyClick() {
    this.playTone(1200, 0.015, 'square', 0.1);
  }

  public playBootJingle() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'square', 0.25);
      }, idx * 90);
    });
  }

  public playErrorBuzz() {
    this.playTone(130, 0.25, 'sawtooth', 0.35);
  }

  public playLaser() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx || !this.masterGain) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore audio error
    }
  }

  public playArpeggio() {
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C major
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.08, 'triangle', 0.25);
      }, idx * 50);
    });
  }

  // 1541 Floppy Drive Mechanical Stepper & Motor Sounds
  public playDriveStep(tracks: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx || !this.masterGain) return;

      const count = Math.min(10, Math.max(1, tracks));
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!this.audioCtx || !this.masterGain) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const now = this.audioCtx.currentTime;

          // Stepper motor thunk/click
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220 + Math.random() * 80, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.025);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.03);
        }, i * 28);
      }
    } catch {
      // Audio error fallback
    }
  }

  public playDriveChatter(durationSec: number = 0.4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx || !this.masterGain) return;

      // Realistic 1541 head chatter (filtered rhythmic bursts)
      const bufferSize = Math.floor(this.audioCtx.sampleRate * durationSec);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Modulated noise chatter
        const mod = Math.sin((i / this.audioCtx.sampleRate) * 120 * Math.PI) > 0 ? 1 : 0.2;
        output[i] = (Math.random() * 2 - 1) * mod * 0.4;
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      const bandpass = this.audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(850, this.audioCtx.currentTime);
      bandpass.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      noiseSource.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + durationSec);
    } catch {
      // Audio error fallback
    }
  }

  public playDiskInsert() {
    if (this.isMuted) return;
    // Lever click / door latch sound
    this.playTone(480, 0.04, 'square', 0.2);
    setTimeout(() => {
      this.playTone(280, 0.06, 'triangle', 0.25);
    }, 45);
  }
}

export const sidAudio = new SidAudioEngine();
