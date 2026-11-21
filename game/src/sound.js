// Pip's Mischief — sounds, synthesized with WebAudio: no audio files,
// no network, just oscillators. Every effect is a short envelope so a
// found difference lands with a satisfying little chime.

let audio = null;

function context() {
  if (audio) return audio;
  try {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    audio = new AC();
  } catch {
    return null;
  }
  return audio;
}

/** One note: an oscillator that swells in and fades out. */
function tone(freq, start, length, type, volume) {
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ctx.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

/** A found difference: two bright notes, the second a fifth above. */
export function playFound() {
  tone(660, 0, 0.16, 'sine', 0.16);
  tone(990, 0.09, 0.24, 'sine', 0.14);
}

/** A wrong click: a low, soft buzz that says "not that one". */
export function playWrong() {
  tone(180, 0, 0.18, 'sawtooth', 0.05);
  tone(140, 0.05, 0.2, 'sawtooth', 0.04);
}

/** A hint spent: a single thoughtful note. */
export function playHint() {
  tone(520, 0, 0.2, 'triangle', 0.12);
}

/** A room cleared: a rising four-note arpeggio. */
export function playLevelDone() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.28, 'sine', 0.14));
}

/** The whole hunt won: a longer, brighter fanfare. */
export function playWin() {
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.32, 'sine', 0.13));
}

/** The clock running out: two descending notes. */
export function playTimeUp() {
  tone(392, 0, 0.3, 'triangle', 0.12);
  tone(262, 0.2, 0.45, 'triangle', 0.12);
}
