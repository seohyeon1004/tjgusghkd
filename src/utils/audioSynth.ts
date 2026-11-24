let audioCtx: AudioContext | null = null;
let activeNodes: (OscillatorNode | GainNode)[] = [];

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

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

export function stopAudio() {
  try {
    activeNodes.forEach(node => {
      if ('stop' in node && typeof node.stop === 'function') {
        node.stop();
      }
      node.disconnect();
    });
    activeNodes = [];
  } catch {
    activeNodes = [];
  }
}

export function playGenrePreview(mood: 'bubblegum' | 'lofi' | 'citypop' | 'edm' | 'acoustic', onComplete?: () => void) {
  stopAudio();
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    if (mood === 'bubblegum') {
      // Dreamy, sweet arpeggio like ILLIT 'Magnetic' (G major / E minor dreamy vibes)
      const notes = [392, 587.33, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 392, 587.33, 659.25, 880];
      notes.forEach((freq, i) => {
        const time = now + i * 0.22;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Sweet bell harmonic
        const harmonic = ctx.createOscillator();
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(freq * 2, time);

        noteGain.gain.setValueAtTime(0.12, time);
        noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

        osc.connect(noteGain);
        harmonic.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(time);
        harmonic.start(time);
        osc.stop(time + 0.5);
        harmonic.stop(time + 0.5);

        activeNodes.push(osc, harmonic, noteGain);
      });
    } else if (mood === 'lofi') {
      // Warm Rhodes / Jazz 7th chords (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
      const chords = [
        [349.23, 440, 523.25, 659.25], // Fmaj7
        [329.63, 392, 493.88, 587.33], // Em7
        [293.66, 349.23, 440, 523.25], // Dm7
        [261.63, 329.63, 392, 493.88], // Cmaj7
      ];

      chords.forEach((chord, chordIdx) => {
        const startTime = now + chordIdx * 0.9;
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(0.08, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 1.2);
          activeNodes.push(osc, noteGain);
        });
      });
    } else if (mood === 'citypop') {
      // Funky Neo-Soul / City Pop groovy bassline + sparkling rhodes
      const bassNotes = [196, 220, 246.94, 293.66, 246.94, 220];
      bassNotes.forEach((freq, idx) => {
        const time = now + idx * 0.35;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq / 2, time);

        // Low pass filter for warm funk punch
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);

        noteGain.gain.setValueAtTime(0.15, time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.32);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.34);
        activeNodes.push(osc, noteGain);
      });
    } else if (mood === 'edm') {
      // Pumping sidechained pulse synth & uplifting rise
      const notes = [261.63, 261.63, 329.63, 392, 440, 523.25, 587.33, 659.25];
      notes.forEach((freq, i) => {
        const time = now + i * 0.24;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        noteGain.gain.setValueAtTime(0.18, time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.23);
        activeNodes.push(osc, noteGain);
      });
    } else {
      // Acoustic fingerpicking (warm folk nylon strings)
      const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23, 440, 587.33];
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.28;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        noteGain.gain.setValueAtTime(0.14, time);
        noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.55);
        activeNodes.push(osc, noteGain);
      });
    }

    const duration = mood === 'lofi' ? 4.0 : 3.2;
    setTimeout(() => {
      stopAudio();
      if (onComplete) onComplete();
    }, duration * 1000);
  } catch {
    if (onComplete) onComplete();
  }
}
