export type AudioMood = 'bubblegum' | 'lofi' | 'citypop' | 'edm' | 'acoustic';

export interface PreviewTrackItem {
  id: string;
  title: string;
  artist: string;
  tempo: string;
  mood: AudioMood;
  searchQuery?: string;
  kind: 'track' | 'artist';
  badgeLabel?: string;
}

export const PREVIEW_DURATION_SEC = 30;

interface CachedLookup {
  previewUrl: string | null;
  artworkUrl: string | null;
}

const lookupCache = new Map<string, CachedLookup>();

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function parseBpm(tempo: string, mood: AudioMood): number {
  const match = tempo.match(/(\d+)/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val >= 55 && val <= 170) return val;
  }
  const defaults: Record<AudioMood, number> = {
    bubblegum: 118,
    lofi: 74,
    citypop: 105,
    edm: 128,
    acoustic: 76,
  };
  return defaults[mood];
}

/**
 * Generates a deterministic 48-bar waveform contour unique to each track
 * so every song displays a distinct visual sound signature.
 */
export function generateWaveformLevels(seedKey: string, count = 48): number[] {
  const seed = hashString(seedKey);
  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const phrase = Math.sin(t * Math.PI * (2.5 + (seed % 3))) * 0.25;
    const groove = Math.abs(Math.sin(i * 0.62 + (seed % 11))) * 0.42;
    const detail = Math.abs(Math.cos(i * 1.37 + ((seed >> 4) % 13))) * 0.23;
    const introOutro = Math.sin(t * Math.PI) * 0.18;
    const level = 0.22 + groove + detail + Math.max(0, phrase) + introOutro;
    return Math.max(0.18, Math.min(1, level));
  });
}

async function queryITunesStore(query: string, country?: string): Promise<CachedLookup> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2400);

  try {
    const countryParam = country ? `&country=${country}` : '';
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5${countryParam}`;
    const res = await fetch(url, { signal: controller.signal });
    window.clearTimeout(timeoutId);

    if (!res.ok) {
      return { previewUrl: null, artworkUrl: null };
    }

    const data = (await res.json()) as {
      results?: Array<{
        previewUrl?: string;
        artworkUrl100?: string;
        trackName?: string;
      }>;
    };

    const match = data.results?.find((r) => Boolean(r.previewUrl));
    return {
      previewUrl: match?.previewUrl ?? null,
      artworkUrl: match?.artworkUrl100
        ? match.artworkUrl100.replace('100x100bb', '300x300bb')
        : null,
    };
  } catch {
    window.clearTimeout(timeoutId);
    return { previewUrl: null, artworkUrl: null };
  }
}

async function fetchITunesPreview(query: string): Promise<CachedLookup> {
  if (lookupCache.has(query)) {
    return lookupCache.get(query)!;
  }

  let result = await queryITunesStore(query, 'KR');
  if (!result.previewUrl) {
    const globalResult = await queryITunesStore(query);
    if (globalResult.previewUrl || !result.artworkUrl) {
      result = globalResult;
    }
  }

  lookupCache.set(query, result);
  return result;
}

export interface EngineCallbacks {
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onStateChange: (state: 'idle' | 'loading' | 'playing' | 'paused') => void;
  onSourceResolved: (source: 'itunes' | 'synth', artworkUrl: string | null) => void;
  onEnded: () => void;
}

class PreviewAudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private activeSource: 'none' | 'itunes' | 'synth' = 'none';
  private activeItem: PreviewTrackItem | null = null;
  private callbacks: EngineCallbacks | null = null;

  private playId = 0;
  private isPlaying = false;
  private currentTime = 0;
  private duration = PREVIEW_DURATION_SEC;

  // Synth scheduler state
  private schedulerTimer: number | null = null;
  private progressRaf: number | null = null;
  private synthAnchorAudioTime = 0;
  private synthAnchorTrackOffset = 0;
  private nextStepTime = 0;
  private currentStepIndex = 0;
  private activeSynthNodes: AudioNode[] = [];
  private freqBins = new Uint8Array(64);

  public setCallbacks(cb: EngineCallbacks) {
    this.callbacks = cb;
  }

  private ensureAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    if (!this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.32;
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.78;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.freqBins = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (!this.noiseBuffer) {
      const len = this.audioCtx.sampleRate * 0.3;
      const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.audioCtx;
  }

  public async play(item: PreviewTrackItem, startOffset = 0): Promise<void> {
    const requestId = ++this.playId;
    this.stopInternal(false);

    this.activeItem = item;
    this.currentTime = Math.max(0, Math.min(startOffset, PREVIEW_DURATION_SEC - 0.1));
    this.duration = PREVIEW_DURATION_SEC;
    this.callbacks?.onStateChange('loading');
    this.callbacks?.onTimeUpdate(this.currentTime, this.duration);

    const query = item.searchQuery || `${item.artist} ${item.title}`;
    const lookup = await fetchITunesPreview(query);

    if (requestId !== this.playId) return;

    if (lookup.previewUrl) {
      const started = await this.startITunesAudio(lookup.previewUrl, this.currentTime, requestId);
      if (requestId !== this.playId) return;
      if (started) {
        this.activeSource = 'itunes';
        this.callbacks?.onSourceResolved('itunes', lookup.artworkUrl);
        this.callbacks?.onStateChange('playing');
        return;
      }
    }

    // Fallback: 30-second procedural multi-track Web Audio synthesizer
    if (requestId !== this.playId) return;
    this.activeSource = 'synth';
    this.callbacks?.onSourceResolved('synth', lookup.artworkUrl);
    this.startSynth(item, this.currentTime);
    this.callbacks?.onStateChange('playing');
  }

  private startITunesAudio(url: string, startOffset: number, requestId: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.audioEl) {
        this.audioEl = new Audio();
        this.audioEl.preload = 'auto';
      }
      const audio = this.audioEl;
      audio.pause();
      audio.src = url;
      audio.volume = 0.72;

      let settled = false;
      const settle = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      const failTimer = window.setTimeout(() => {
        settle(false);
      }, 3000);

      audio.onloadedmetadata = () => {
        if (requestId !== this.playId) {
          window.clearTimeout(failTimer);
          settle(false);
          return;
        }
        const rawDur = Number.isFinite(audio.duration) ? audio.duration : PREVIEW_DURATION_SEC;
        this.duration = Math.min(PREVIEW_DURATION_SEC, Math.max(1, rawDur));
        if (startOffset > 0 && startOffset < this.duration) {
          audio.currentTime = startOffset;
        }
      };

      audio.ontimeupdate = () => {
        if (requestId !== this.playId || this.activeSource !== 'itunes') return;
        const pos = Math.min(audio.currentTime, PREVIEW_DURATION_SEC);
        this.currentTime = pos;
        this.callbacks?.onTimeUpdate(pos, this.duration);
        if (pos >= PREVIEW_DURATION_SEC) {
          this.handleTrackFinished();
        }
      };

      audio.onended = () => {
        if (requestId !== this.playId || this.activeSource !== 'itunes') return;
        this.handleTrackFinished();
      };

      audio.onerror = () => {
        window.clearTimeout(failTimer);
        settle(false);
      };

      audio
        .play()
        .then(() => {
          window.clearTimeout(failTimer);
          if (requestId !== this.playId) {
            audio.pause();
            settle(false);
            return;
          }
          this.isPlaying = true;
          settle(true);
        })
        .catch(() => {
          window.clearTimeout(failTimer);
          settle(false);
        });
    });
  }

  private startSynth(item: PreviewTrackItem, startOffset: number) {
    const ctx = this.ensureAudioCtx();
    this.stopSynthNodes();

    this.duration = PREVIEW_DURATION_SEC;
    this.isPlaying = true;
    this.synthAnchorAudioTime = ctx.currentTime;
    this.synthAnchorTrackOffset = startOffset;

    const bpm = parseBpm(item.tempo, item.mood);
    const stepDuration = 60 / bpm / 2; // 8th-note grid
    this.currentStepIndex = Math.floor(startOffset / stepDuration);
    this.nextStepTime = ctx.currentTime + 0.04;

    const seed = hashString(`${item.title}-${item.artist}`);

    const scheduleStep = (stepIdx: number, when: number) => {
      if (!this.audioCtx || !this.masterGain) return;
      const trackTime = stepIdx * stepDuration;
      if (trackTime >= PREVIEW_DURATION_SEC) return;

      const bar = Math.floor(stepIdx / 8) % 4;
      const stepInBar = stepIdx % 8;

      // Chord progressions per mood (MIDI note roots)
      const progressions: Record<AudioMood, number[][]> = {
        bubblegum: [
          [67, 71, 74, 78], // Gmaj7
          [64, 67, 71, 74], // Em7
          [60, 64, 67, 71], // Cmaj7
          [62, 66, 69, 72], // D7
        ],
        lofi: [
          [65, 69, 72, 76], // Fmaj7
          [64, 67, 71, 74], // Em7
          [62, 65, 69, 72], // Dm7
          [60, 64, 67, 71], // Cmaj7
        ],
        citypop: [
          [65, 69, 72, 76], // Fmaj7
          [67, 71, 74, 77], // G7
          [64, 67, 71, 74], // Em7
          [69, 72, 76, 79], // Am7
        ],
        edm: [
          [57, 60, 64, 69], // Am
          [53, 57, 60, 65], // F
          [60, 64, 67, 72], // C
          [55, 59, 62, 67], // G
        ],
        acoustic: [
          [60, 64, 67, 72], // C
          [55, 59, 62, 67], // G
          [57, 60, 64, 69], // Am
          [53, 57, 60, 65], // F
        ],
      };

      const transpose = ((seed % 5) - 2);
      const chords = progressions[item.mood];
      const chord = chords[bar].map((n) => n + transpose);

      const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

      // 1. Drums
      if (item.mood !== 'acoustic') {
        const hasKick =
          item.mood === 'edm'
            ? stepInBar % 2 === 0
            : stepInBar === 0 || stepInBar === 3 || stepInBar === 4;
        if (hasKick) {
          this.triggerKick(when, item.mood === 'edm' ? 0.55 : 0.36);
        }

        const hasSnare = stepInBar === 2 || stepInBar === 6;
        if (hasSnare) {
          this.triggerSnare(when, item.mood === 'lofi' ? 0.14 : 0.22);
        }

        if (item.mood === 'edm' || item.mood === 'citypop' || stepInBar % 2 === 1) {
          this.triggerHat(when, item.mood === 'lofi' ? 0.05 : 0.09);
        }
      }

      // 2. Bassline on downbeats & syncopations
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 5) {
        const bassMidi = chord[0] - 24 + (stepInBar === 5 ? 7 : 0);
        this.triggerBass(
          when,
          midiToFreq(bassMidi),
          stepDuration * 1.4,
          item.mood === 'edm' ? 'sawtooth' : 'triangle',
          item.mood === 'acoustic' ? 0.14 : 0.24
        );
      }

      // 3. Chords / Rhodes / Acoustic Guitar Strum
      if (stepInBar === 0 || (item.mood === 'citypop' && stepInBar === 3) || (item.mood === 'edm' && stepInBar % 2 === 0)) {
        const sustain = item.mood === 'edm' ? stepDuration * 0.9 : stepDuration * 5.2;
        chord.forEach((note, idx) => {
          const offset = item.mood === 'acoustic' ? idx * 0.035 : 0;
          this.triggerPad(
            when + offset,
            midiToFreq(note),
            sustain,
            item.mood === 'lofi' || item.mood === 'acoustic' ? 'sine' : 'triangle',
            item.mood === 'edm' ? 0.07 : 0.06
          );
        });
      }

      // 4. Melodic Lead / Arpeggio motif
      const melodyPattern = [
        (seed + 0) % 4,
        -1,
        (seed + 1) % 4,
        (seed + 2) % 4,
        (seed + 3) % 4,
        -1,
        (seed + 2) % 4,
        (seed + 1) % 4,
      ];
      const degree = melodyPattern[(stepInBar + (bar % 2)) % 8];
      if (degree >= 0) {
        const leadMidi = chord[degree % chord.length] + 12;
        this.triggerLead(
          when,
          midiToFreq(leadMidi),
          stepDuration * 1.5,
          item.mood
        );
      }
    };

    this.schedulerTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      const horizon = this.audioCtx.currentTime + 0.22;
      while (this.nextStepTime < horizon) {
        const trackPos = this.currentStepIndex * stepDuration;
        if (trackPos >= PREVIEW_DURATION_SEC) {
          break;
        }
        scheduleStep(this.currentStepIndex, this.nextStepTime);
        this.nextStepTime += stepDuration;
        this.currentStepIndex += 1;
      }
    }, 60);

    const tickProgress = () => {
      if (!this.isPlaying || !this.audioCtx || this.activeSource !== 'synth') return;
      const elapsed = this.audioCtx.currentTime - this.synthAnchorAudioTime;
      const pos = Math.min(PREVIEW_DURATION_SEC, this.synthAnchorTrackOffset + elapsed);
      this.currentTime = pos;
      this.callbacks?.onTimeUpdate(pos, this.duration);

      if (pos >= PREVIEW_DURATION_SEC) {
        this.handleTrackFinished();
        return;
      }
      this.progressRaf = requestAnimationFrame(tickProgress);
    };
    this.progressRaf = requestAnimationFrame(tickProgress);
  }

  private triggerKick(when: number, gainAmt: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.14);

    gain.gain.setValueAtTime(gainAmt, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + 0.2);
    this.activeSynthNodes.push(osc, gain);
  }

  private triggerSnare(when: number, gainAmt: number) {
    if (!this.audioCtx || !this.masterGain || !this.noiseBuffer) return;
    const src = this.audioCtx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, when);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(gainAmt, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.14);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(when);
    src.stop(when + 0.16);
    this.activeSynthNodes.push(src, filter, gain);
  }

  private triggerHat(when: number, gainAmt: number) {
    if (!this.audioCtx || !this.masterGain || !this.noiseBuffer) return;
    const src = this.audioCtx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, when);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(gainAmt, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.05);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(when);
    src.stop(when + 0.06);
    this.activeSynthNodes.push(src, filter, gain);
  }

  private triggerBass(
    when: number,
    freq: number,
    dur: number,
    type: OscillatorType,
    gainAmt: number
  ) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, when);
    filter.frequency.exponentialRampToValueAtTime(220, when + dur);

    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(gainAmt, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    this.activeSynthNodes.push(osc, filter, gain);
  }

  private triggerPad(
    when: number,
    freq: number,
    dur: number,
    type: OscillatorType,
    gainAmt: number
  ) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(gainAmt, when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    this.activeSynthNodes.push(osc, gain);
  }

  private triggerLead(when: number, freq: number, dur: number, mood: AudioMood) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = mood === 'edm' || mood === 'citypop' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, when);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(mood === 'lofi' ? 1400 : 2800, when);

    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(mood === 'edm' ? 0.12 : 0.1, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    this.activeSynthNodes.push(osc, filter, gain);
  }

  private handleTrackFinished() {
    this.stopInternal(false);
    this.currentTime = 0;
    this.callbacks?.onTimeUpdate(0, this.duration);
    this.callbacks?.onStateChange('idle');
    this.callbacks?.onEnded();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.activeSource === 'itunes' && this.audioEl) {
      this.currentTime = Math.min(this.audioEl.currentTime, this.duration);
      this.audioEl.pause();
    } else if (this.activeSource === 'synth') {
      this.stopSynthTimers();
      this.stopSynthNodes();
    }
    this.callbacks?.onStateChange('paused');
  }

  public resume() {
    if (this.isPlaying || !this.activeItem) return;

    if (this.activeSource === 'itunes' && this.audioEl) {
      this.audioEl
        .play()
        .then(() => {
          this.isPlaying = true;
          this.callbacks?.onStateChange('playing');
        })
        .catch(() => {
          this.activeSource = 'synth';
          this.startSynth(this.activeItem!, this.currentTime);
          this.callbacks?.onStateChange('playing');
        });
    } else {
      this.activeSource = 'synth';
      this.startSynth(this.activeItem, this.currentTime);
      this.callbacks?.onStateChange('playing');
    }
  }

  public seek(seconds: number) {
    if (!this.activeItem) return;
    const clamped = Math.max(0, Math.min(seconds, this.duration - 0.1));
    this.currentTime = clamped;
    this.callbacks?.onTimeUpdate(clamped, this.duration);

    if (this.activeSource === 'itunes' && this.audioEl) {
      this.audioEl.currentTime = clamped;
    } else if (this.activeSource === 'synth') {
      if (this.isPlaying) {
        this.stopSynthTimers();
        this.stopSynthNodes();
        this.startSynth(this.activeItem, clamped);
      }
    }
  }

  public getLiveLevel(nowMs: number): number {
    if (!this.isPlaying || !this.activeItem) return 0.14;

    if (this.activeSource === 'synth' && this.analyser) {
      this.analyser.getByteFrequencyData(this.freqBins);
      let sum = 0;
      const count = Math.min(24, this.freqBins.length);
      for (let i = 0; i < count; i++) {
        sum += this.freqBins[i];
      }
      const norm = sum / (count * 255);
      return Math.max(0.18, Math.min(1, 0.2 + norm * 2.4));
    }

    // Smooth BPM-synced reactive envelope for external <audio> stream
    const bpm = parseBpm(this.activeItem.tempo, this.activeItem.mood);
    const beatPhase = ((nowMs / 1000) * (bpm / 60)) % 1;
    const kick = Math.pow(1 - beatPhase, 2.2) * 0.55;
    const shimmer = Math.abs(Math.sin(nowMs * 0.009)) * 0.25;
    return Math.max(0.2, Math.min(1, 0.22 + kick + shimmer));
  }

  private stopSynthTimers() {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.progressRaf !== null) {
      cancelAnimationFrame(this.progressRaf);
      this.progressRaf = null;
    }
  }

  private stopSynthNodes() {
    this.activeSynthNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeSynthNodes = [];
  }

  private stopInternal(resetState: boolean) {
    this.isPlaying = false;
    this.stopSynthTimers();
    this.stopSynthNodes();

    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.ontimeupdate = null;
      this.audioEl.onended = null;
      this.audioEl.onerror = null;
    }

    if (resetState) {
      this.activeSource = 'none';
      this.currentTime = 0;
      this.callbacks?.onTimeUpdate(0, PREVIEW_DURATION_SEC);
      this.callbacks?.onStateChange('idle');
    }
  }

  public stop() {
    this.playId += 1;
    this.stopInternal(true);
  }
}

export const previewEngine = new PreviewAudioEngine();
