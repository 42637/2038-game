// Procedural High-Performance Web Audio Synthesizer for Phase 1 & Phase 2
class AudioService {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicIntervalId: number | null = null;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    startGain = 0.12,
    endGain = 0.001
  ) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(startGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore context restrictions
    }
  }

  // Soft tactile wooden swipe snap sound
  playMoveSound(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      this.playTone(200, 0.04, 'triangle', 0.05, 0.001);
    }
  }

  // Value-specific pitch-harmonized arcade merge chimes
  playMergeSoundForValue(value: number, enabled = true) {
    if (!enabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      let rootFreq = 523.25; // C5 default
      let overtoneFreq = 659.25; // E5

      switch (value) {
        case 4:
          rootFreq = 523.25; overtoneFreq = 659.25; break; // C5 + E5
        case 8:
          rootFreq = 587.33; overtoneFreq = 739.99; break; // D5 + F#5
        case 16:
          rootFreq = 659.25; overtoneFreq = 830.61; break; // E5 + G#5
        case 32:
          rootFreq = 783.99; overtoneFreq = 987.77; break; // G5 + B5
        case 64:
          rootFreq = 880.00; overtoneFreq = 1108.73; break; // A5 + C#6
        case 128:
          rootFreq = 1046.50; overtoneFreq = 1318.51; break; // C6 + E6
        case 256:
          rootFreq = 1174.66; overtoneFreq = 1479.98; break; // D6 + F#6
        case 512:
          rootFreq = 1318.51; overtoneFreq = 1661.22; break; // E6 + G#6
        default:
          this.playMilestoneSound(enabled);
          return;
      }

      // Root tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(rootFreq, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Overtone chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(overtoneFreq, now + 0.015);
      gain2.gain.setValueAtTime(0.09, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.015);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } catch {
      this.playTone(523.25, 0.08, 'triangle', 0.12);
    }
  }

  playMilestoneSound(enabled = true) {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.18, 'sine', 0.2), idx * 60);
    });
  }

  playChallengeCompleteSound(enabled = true) {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.22, 'triangle', 0.22), idx * 65);
    });
  }

  playChallengeFailedSound(enabled = true) {
    if (!enabled) return;
    this.playTone(293.66, 0.15, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(220.0, 0.25, 'sawtooth', 0.18), 120);
  }

  playHardcoreStartSound(enabled = true) {
    if (!enabled) return;
    this.playTone(440, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(880, 0.15, 'square', 0.18), 70);
  }

  playMegaBoardStartSound(enabled = true) {
    if (!enabled) return;
    this.playTone(329.63, 0.12, 'sine', 0.15);
    setTimeout(() => this.playTone(440.0, 0.12, 'sine', 0.16), 80);
    setTimeout(() => this.playTone(523.25, 0.2, 'sine', 0.18), 160);
  }

  playNewBestSound(enabled = true) {
    if (!enabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.2, 'triangle', 0.2), idx * 70);
    });
  }

  playGameOverSound(enabled = true) {
    if (!enabled) return;
    this.playTone(392.0, 0.12, 'sawtooth', 0.12);
    setTimeout(() => this.playTone(329.63, 0.12, 'sawtooth', 0.12), 100);
    setTimeout(() => this.playTone(261.63, 0.25, 'sawtooth', 0.15), 200);
  }

  playTimeWarningSound(enabled = true) {
    if (!enabled) return;
    this.playTone(880, 0.04, 'square', 0.06);
  }

  playBombSound(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Noise Generator for Explosive Blast Crackle
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Low-pass filter for thunderous explosion thud
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(35, now + 0.4);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Sub-Bass Punch Oscillator
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.38);

      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      noise.start(now);
      subOsc.start(now);
      noise.stop(now + 0.45);
      subOsc.stop(now + 0.45);
    } catch {
      // Fallback
      this.playTone(120, 0.3, 'sawtooth', 0.3);
    }
  }

  playIceBreakSound(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [1400, 2200, 3100, 4400].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);
        gain.gain.setValueAtTime(0.18, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 0.12);
      });
    } catch {
      this.playTone(1400, 0.1, 'sine', 0.2);
    }
  }

  playStreakSound(enabled = true) {
    if (!enabled) return;
    const notes = [659.25, 783.99, 987.77, 1318.5]; // E5, G5, B5, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.2, 'triangle', 0.22), idx * 60);
    });
  }

  playUndoSound(enabled = true) {
    if (!enabled) return;
    this.playTone(440, 0.08, 'sine', 0.12);
    setTimeout(() => this.playTone(330, 0.12, 'sine', 0.1), 50);
  }

  playHammerSound(enabled = true) {
    if (!enabled) return;
    this.playTone(150, 0.15, 'sawtooth', 0.25);
  }

  playShuffleSound(enabled = true) {
    if (!enabled) return;
    [400, 600, 350, 700].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.06, 'triangle', 0.14), idx * 35);
    });
  }

  setMusicEnabled(enabled: boolean) {
    if (enabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  private startAmbientMusic() {
    this.isMusicPlaying = true;
    const chords = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major
      [196.0, 246.94, 293.66], // G major
    ];
    let step = 0;

    this.musicIntervalId = window.setInterval(() => {
      if (!this.isMusicPlaying) return;
      const currentChord = chords[step % chords.length];
      currentChord.forEach((freq) => {
        this.playTone(freq, 1.6, 'sine', 0.015, 0.001);
      });
      step++;
    }, 3000);
  }

  private stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const audioService = new AudioService();
