// DAPUR KILAT — audio: tiny WebAudio synth bleeps, no sound files at all.
// Chop ticks, serve ding, error buzz, click. M mutes.
export function createAudio() {
  const sfx = {
    ctx: null,
    muted: false,
    ensure() {
      if (this.ctx) return true;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
        return true;
      } catch (e) {
        return false;
      }
    },
    tone(freq, dur, type, vol, when) {
      if (this.muted || !this.ensure()) return;
      try {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const t0 = this.ctx.currentTime + (when || 0);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(vol || 0.12, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      } catch (e) {
        // Silent if the browser blocks audio.
      }
    },
    chop() {
      this.tone(180, 0.07, 'square', 0.08);
    },
    pickup() {
      this.tone(520, 0.08, 'sine', 0.1);
    },
    cookStart() {
      this.tone(300, 0.12, 'triangle', 0.1);
      this.tone(420, 0.12, 'triangle', 0.1, 0.1);
    },
    ready() {
      this.tone(660, 0.12, 'sine', 0.12);
      this.tone(880, 0.18, 'sine', 0.12, 0.1);
    },
    serve() {
      this.tone(880, 0.1, 'sine', 0.14);
      this.tone(1174, 0.22, 'sine', 0.14, 0.09);
    },
    error() {
      this.tone(140, 0.18, 'sawtooth', 0.1);
    },
    expire() {
      this.tone(220, 0.25, 'sawtooth', 0.1);
      this.tone(160, 0.3, 'sawtooth', 0.1, 0.15);
    },
    click() {
      this.tone(700, 0.05, 'sine', 0.08);
    },
    countdown() {
      this.tone(980, 0.09, 'square', 0.07);
    },
    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    },
  };
  return sfx;
}
