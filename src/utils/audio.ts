// Retro Web Audio Synthesizer for Birthday Candles
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play soft candle extinguish puff
export function playExtinguishPuff() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Audio context not allowed or failed
  }
}

// Play blow whoosh sound
export function playBlowWhoosh() {
  try {
    const ctx = getAudioContext();
    // Pink/white noise buffer for breath whoosh
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio context not allowed
  }
}

// Happy Birthday Chiptune 8-Bit Melody
const NOTES: { [key: string]: number } = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
};

// Notes: note, duration in beats (quarter note = 1 beat)
const HAPPY_BIRTHDAY_NOTES: Array<[string, number]> = [
  ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['F4', 1], ['E4', 2],
  ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['G4', 1], ['F4', 2],
  ['C4', 0.75], ['C4', 0.25], ['C5', 1], ['A4', 1], ['F4', 1], ['E4', 1], ['D4', 2],
  ['Bb4', 0.75], ['Bb4', 0.25], ['A4', 1], ['F4', 1], ['G4', 1], ['F4', 2],
];

let melodyTimeoutIds: number[] = [];

export function stopBirthdayMelody() {
  melodyTimeoutIds.forEach((id) => clearTimeout(id));
  melodyTimeoutIds = [];
}

export function playHappyBirthdayChiptune() {
  try {
    stopBirthdayMelody();
    const ctx = getAudioContext();
    const tempo = 140; // BPM
    const beatDuration = 60 / tempo;

    let currentTimeOffset = 0;

    HAPPY_BIRTHDAY_NOTES.forEach(([noteName, beats]) => {
      const duration = beats * beatDuration;
      const freq = NOTES[noteName];
      if (freq) {
        const timeoutId = window.setTimeout(() => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'square'; // 8-bit chiptune sound
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          const noteLength = duration * 0.85;
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + noteLength);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          osc.stop(audioCtx.currentTime + noteLength);
        }, currentTimeOffset * 1000);

        melodyTimeoutIds.push(timeoutId);
      }
      currentTimeOffset += duration;
    });
  } catch {
    // ignored
  }
}
