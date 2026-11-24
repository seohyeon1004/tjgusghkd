import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Loader2, Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react';
import { cn } from '../utils/cn';
import {
  PREVIEW_DURATION_SEC,
  PreviewTrackItem,
  previewEngine,
} from '../utils/audioPreviewEngine';

/* -------------------------------------------------------------------------- */
/*  Liquid Glass SVG Filter (Kokonut UI)                                      */
/* -------------------------------------------------------------------------- */

const GLASS_SHADOW_DARK =
  'shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_2px_2px_0.5px_-2px_rgba(255,255,255,0.28),inset_-2px_-2px_0.5px_-2px_rgba(255,255,255,0.16),inset_0_0_16px_rgba(255,255,255,0.05)]';

const GlassFilter = React.memo(({ id, scale = 28 }: { id: string; scale?: number }) => (
  <svg aria-hidden="true" className="hidden" focusable={false}>
    <defs>
      <filter
        colorInterpolationFilters="sRGB"
        height="200%"
        id={id}
        width="200%"
        x="-50%"
        y="-50%"
      >
        <feTurbulence
          baseFrequency="0.05 0.05"
          numOctaves="1"
          result="turbulence"
          seed="1"
          type="fractalNoise"
        />
        <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="2" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredNoise"
          result="displaced"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="B"
        />
        <feGaussianBlur in="displaced" stdDeviation="4" />
      </filter>
    </defs>
  </svg>
));
GlassFilter.displayName = 'GlassFilter';

/* -------------------------------------------------------------------------- */
/*  Turntable Physics & Constants (Kokonut NowPlaying)                        */
/* -------------------------------------------------------------------------- */

// 33⅓ rpm = 200°/s (one full turn every 1.8s)
const CRUISE = 200;
const CRUISE_MS = 1800;
const MAX_OMEGA = 2160;
const COAST_TAU = 0.45;
const SPIN_UP_TAU = 0.22;
const SPIN_DOWN_TAU = 0.2;
const SETTLE_EPSILON = 2;
const DEAD_ZONE = 10;
const VELOCITY_WINDOW_MS = 80;
const STALE_MOVE_MS = 60;
const HOLD_SETTLE_S = 0.05;

const BAR_COUNT = 5;
const BAR_REST = 0.14;
const BAR_DECAY_S = 0.3;
const BAR_ATTACK_S = 0.08;

const RUBBER_MAX = 18;
const SEEK_STEP = 3;
const MAX_DT = 0.05;
const ROLL_MS = 220;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const RUBBER_RETURN = 'transform 450ms cubic-bezier(0.34, 1.4, 0.64, 1)';

const ROLL_KEYFRAMES = `@keyframes now-playing-in-up{from{transform:translateY(90%);opacity:0}to{transform:none;opacity:1}}
@keyframes now-playing-out-up{from{transform:none;opacity:1}to{transform:translateY(-90%);opacity:0}}
@keyframes now-playing-in-down{from{transform:translateY(-90%);opacity:0}to{transform:none;opacity:1}}
@keyframes now-playing-out-down{from{transform:none;opacity:1}to{transform:translateY(90%);opacity:0}}
@media (prefers-reduced-motion:reduce){.now-playing-roll{animation:none!important}.now-playing-roll-prev{display:none}}`;

const FACE_CLASS =
  'absolute transition-[opacity,filter,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity';
const faceState = (visible: boolean) =>
  visible ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-[3px]';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function damp(distance: number, max: number) {
  return max * (1 - Math.exp(-distance / max));
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function hashNum(n: number) {
  const s = Math.sin(n * 127.1) * 43_758.5453;
  return s - Math.floor(s);
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hashNum(i) * (1 - u) + hashNum(i + 1) * u;
}

function barLevel(index: number, t: number) {
  return (
    0.6 * noise(t * 4.3 + index * 17.3) +
    0.4 * noise(t * 9.1 + index * 31.7 + 100)
  );
}

function scrubGain(speed: number) {
  const excess = Math.max(0, Math.abs(speed) - CRUISE) / CRUISE;
  return 1 + 1.5 * excess ** 1.5;
}

function rotate(angle: number) {
  return `rotate(${Math.round((angle % 360) * 100) / 100}deg)`;
}

interface Engine {
  angle: number;
  omega: number;
  time: number;
  duration: number;
  playing: boolean;
  held: boolean;
  barDrag: boolean;
  pointerId: number | null;
  visible: boolean;
  reduced: boolean;
  env: number;
  scrubOmega: number;
  pointerAngle: number;
  center: { x: number; y: number };
  lastMoveAt: number;
  samples: { t: number; a: number }[];
  cruise: Animation | null;
  cruiseAngle: number;
}

function createEngine(duration: number, playing: boolean): Engine {
  return {
    angle: 0,
    omega: playing ? CRUISE : 0,
    time: 0,
    duration,
    playing,
    held: false,
    barDrag: false,
    pointerId: null,
    visible: true,
    reduced: false,
    env: 0,
    scrubOmega: 0,
    pointerAngle: 0,
    center: { x: 0, y: 0 },
    lastMoveAt: 0,
    samples: [],
    cruise: null,
    cruiseAngle: 0,
  };
}

function readAngle(e: Engine) {
  if (e.cruise && e.cruise.currentTime !== null) {
    return e.cruiseAngle + (Number(e.cruise.currentTime) / CRUISE_MS) * 360;
  }
  return e.angle;
}

function stopCruise(e: Engine, disc: HTMLElement | null) {
  if (!e.cruise) return;
  e.angle = readAngle(e);
  if (disc) {
    disc.style.transform = rotate(e.angle);
  }
  e.cruise.cancel();
  e.cruise = null;
}

function startCruise(e: Engine, disc: HTMLElement | null) {
  if (e.cruise || e.reduced || !disc || typeof disc.animate !== 'function') {
    return;
  }
  e.angle %= 360;
  e.cruiseAngle = e.angle;
  e.cruise = disc.animate(
    [
      { transform: `rotate(${e.angle}deg)` },
      { transform: `rotate(${e.angle + 360}deg)` },
    ],
    { duration: CRUISE_MS, iterations: Number.POSITIVE_INFINITY }
  );
  if (!e.visible) {
    e.cruise.pause();
  }
}

function integrateDisc(e: Engine, dt: number, disc: HTMLElement | null) {
  const target = e.playing ? CRUISE : 0;
  if (e.reduced) {
    e.omega = target;
    return;
  }
  if (e.cruise) {
    e.omega = CRUISE;
    return;
  }
  let tau = SPIN_UP_TAU;
  if (Math.abs(e.omega) > Math.abs(target)) {
    tau = e.playing ? COAST_TAU : SPIN_DOWN_TAU;
  }
  e.omega = target + (e.omega - target) * Math.exp(-dt / tau);
  if (Math.abs(e.omega - target) < SETTLE_EPSILON) {
    e.omega = target;
  }
  e.angle += e.omega * dt;
  if (e.playing && e.omega === CRUISE) {
    startCruise(e, disc);
  }
}

function meterTarget(e: Engine) {
  if (e.held) {
    return clamp(Math.abs(e.scrubOmega) / CRUISE, 0, 1);
  }
  return clamp(Math.abs(e.omega) / CRUISE, 0, 1);
}

function updateMeter(e: Engine, dt: number, bars: (HTMLElement | null)[], nowMs: number) {
  const target = meterTarget(e);
  if (e.reduced) {
    e.env = e.playing ? 1 : 0;
  } else if (target > e.env) {
    e.env = Math.min(target, e.env + dt / BAR_ATTACK_S);
  } else {
    e.env = Math.max(target, e.env - dt / BAR_DECAY_S);
  }

  const liveBoost = e.playing && !e.reduced ? previewEngine.getLiveLevel(nowMs) : 0.65;
  const t = e.reduced ? 0.37 : e.time + nowMs * 0.0004;
  for (const [i, bar] of bars.entries()) {
    if (bar) {
      const level = BAR_REST + (1 - BAR_REST) * barLevel(i, t) * e.env * (0.65 + liveBoost * 0.45);
      bar.style.transform = `scaleY(${clamp(level, BAR_REST, 1).toFixed(3)})`;
    }
  }
}

function rpmLabel(e: Engine) {
  if (e.held) {
    return `${Math.round(e.scrubOmega / 6)} rpm`;
  }
  if (e.omega === CRUISE) {
    return '33⅓ rpm';
  }
  return `${Math.round(e.omega / 6)} rpm`;
}

function paint(
  e: Engine,
  disc: HTMLElement | null,
  fill: HTMLElement | null,
  rpm: HTMLElement | null
) {
  if (disc && !e.cruise) {
    disc.style.transform = rotate(e.angle);
  }
  if (fill) {
    const p = e.duration > 0 ? clamp(e.time / e.duration, 0, 1) : 0;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  const label = rpmLabel(e);
  if (rpm && rpm.textContent !== label) {
    rpm.textContent = label;
  }
}

/* ------------------------------ Rolling Time ------------------------------ */

function RollDigit({ value, direction }: { value: string; direction: 1 | -1 }) {
  const [state, setState] = useState<{
    current: string;
    previous: string | null;
    count: number;
    direction: 1 | -1;
  }>({ current: value, previous: null, count: 0, direction });

  if (state.current !== value) {
    setState({
      current: value,
      previous: state.current,
      count: state.count + 1,
      direction,
    });
  }

  const up = state.direction > 0;
  const timing = `${ROLL_MS}ms ${EASE_OUT} both`;

  return (
    <span className="relative inline-block h-[1lh] overflow-hidden">
      {state.previous !== null && (
        <span
          className="now-playing-roll now-playing-roll-prev absolute inset-0"
          key={`p${state.count}`}
          style={{
            animation: `${up ? 'now-playing-out-up' : 'now-playing-out-down'} ${timing}`,
          }}
        >
          {state.previous}
        </span>
      )}
      <span
        className="now-playing-roll block"
        key={`c${state.count}`}
        style={
          state.count > 0
            ? {
                animation: `${up ? 'now-playing-in-up' : 'now-playing-in-down'} ${timing}`,
              }
            : undefined
        }
      >
        {state.current}
      </span>
    </span>
  );
}

function RollingTime({ seconds, direction }: { seconds: number; direction: 1 | -1 }) {
  const chars = formatTime(seconds).split('').reverse();
  return (
    <span aria-hidden="true" className="inline-flex flex-row-reverse">
      {chars.map((char, slot) =>
        char === ':' ? (
          <span key="colon">:</span>
        ) : (
          <RollDigit direction={direction} key={`slot-${slot}`} value={char} />
        )
      )}
    </span>
  );
}

/* --------------------------------- Vinyl Art -------------------------------- */

const DOT_GRID = Array.from({ length: 25 }, (_, i) => ({
  x: 26 + (i % 5) * 12,
  y: 26 + Math.floor(i / 5) * 12,
  lit: i === 8,
}));

function LabelArt({ variant }: { variant: number }) {
  const INK = 'fill-zinc-900';
  const ACCENT = 'fill-(--now-playing-accent)';

  if (variant === 1) {
    return (
      <g>
        <path className={ACCENT} d="M50 50 L50 8 A42 42 0 0 1 92 50 Z" />
        <path className={INK} d="M50 50 L8 50 A42 42 0 0 1 50 8 Z" />
        <rect className={INK} height="6" rx="1" width="30" x="50" y="62" />
        <rect className={INK} height="6" rx="1" width="20" x="50" y="72" />
      </g>
    );
  }
  if (variant === 2) {
    return (
      <g>
        {DOT_GRID.map((dot) => (
          <circle
            className={dot.lit ? ACCENT : INK}
            cx={dot.x}
            cy={dot.y}
            key={`${dot.x}-${dot.y}`}
            r={dot.lit ? 5.5 : 2.6}
          />
        ))}
      </g>
    );
  }
  return (
    <g>
      <circle className={ACCENT} cx="64" cy="36" r="20" />
      <rect className={INK} height="5" width="64" x="18" y="60" />
      <rect className={INK} height="5" width="52" x="18" y="70" />
      <rect className={INK} height="5" width="40" x="18" y="80" />
    </g>
  );
}

const GROOVES = [28, 31, 34, 37, 40, 43, 46];

function Disc({
  artworkVariant,
  artworkUrl,
}: {
  artworkVariant: number;
  artworkUrl: string | null;
}) {
  const clipId = useId();
  return (
    <svg aria-hidden="true" className="size-full" viewBox="0 0 100 100">
      <circle className="fill-zinc-950" cx="50" cy="50" r="50" />
      {GROOVES.map((r) => (
        <circle
          className="fill-none stroke-white/[0.08]"
          cx="50"
          cy="50"
          key={r}
          r={r}
          strokeWidth="0.6"
        />
      ))}
      <circle
        className="fill-none stroke-white/[0.18]"
        cx="50"
        cy="50"
        r="49"
        strokeWidth="0.8"
      />
      <clipPath id={clipId}>
        <circle cx="50" cy="50" r="24" />
      </clipPath>
      <circle className="fill-zinc-100" cx="50" cy="50" r="24" />
      {artworkUrl ? (
        <image
          clipPath={`url(#${clipId})`}
          height="48"
          href={artworkUrl}
          preserveAspectRatio="xMidYMid slice"
          width="48"
          x="26"
          y="26"
        />
      ) : (
        <g clipPath={`url(#${clipId})`} transform="translate(26 26) scale(0.48)">
          <LabelArt variant={artworkVariant} />
        </g>
      )}
      <circle className="fill-zinc-950 stroke-white/30" cx="50" cy="50" r="2.2" strokeWidth="0.6" />
    </svg>
  );
}

function Tonearm({ down }: { down: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-1 -right-3.5 h-[80%] w-auto origin-[77.5%_10%] transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none"
      style={{ transform: down ? 'rotate(11deg)' : 'rotate(-8deg)' }}
      viewBox="0 0 40 110"
    >
      <circle
        className="fill-zinc-800 stroke-zinc-600"
        cx="31"
        cy="11"
        r="8"
      />
      <circle className="fill-zinc-400" cx="31" cy="11" r="3" />
      <path
        className="fill-none stroke-zinc-400"
        d="M31 11 L31 70 L18 92"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <rect
        className="fill-zinc-200"
        height="12"
        rx="1.5"
        transform="rotate(32 16 96)"
        width="7"
        x="12.5"
        y="90"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  TrackPreviewPlayer (Liquid Glass + Scrubbable Disc Player)                */
/* -------------------------------------------------------------------------- */

interface TrackPreviewPlayerProps {
  activeTrack: PreviewTrackItem;
  playbackState: 'idle' | 'loading' | 'playing' | 'paused';
  currentTime: number;
  duration: number;
  artworkUrl: string | null;
  accentColor: string;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
}

export const TrackPreviewPlayer: React.FC<TrackPreviewPlayerProps> = ({
  activeTrack,
  playbackState,
  currentTime,
  duration,
  artworkUrl,
  accentColor,
  onTogglePlay,
  onStop,
  onSeek,
  onPrev,
  onNext,
  compact = false,
}) => {
  const filterId = useId();
  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const effectiveDuration = duration > 0 ? duration : PREVIEW_DURATION_SEC;

  const [clock, setClock] = useState<{ s: number; dir: 1 | -1 }>({
    s: 0,
    dir: 1,
  });

  const engineRef = useRef<Engine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = createEngine(effectiveDuration, isPlaying);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const rpmRef = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wakeRef = useRef<() => void>(() => undefined);
  const clockRef = useRef(0);
  const lastSeekCallRef = useRef(0);
  const holdExternalSyncUntilRef = useRef(0);

  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  const throttledSeek = useCallback((sec: number, force = false) => {
    const now = performance.now();
    if (force || now - lastSeekCallRef.current >= 75) {
      lastSeekCallRef.current = now;
      holdExternalSyncUntilRef.current = now + 180;
      onSeekRef.current(clamp(sec, 0, engineRef.current?.duration ?? PREVIEW_DURATION_SEC));
    }
  }, []);

  // Sync external playback state & time into physics engine
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;

    const wasPlaying = e.playing;
    e.playing = isPlaying;
    e.duration = effectiveDuration;

    if (wasPlaying && !isPlaying) {
      stopCruise(e, discRef.current);
    }

    if (!e.held && !e.barDrag && performance.now() > holdExternalSyncUntilRef.current) {
      e.time = clamp(currentTime, 0, effectiveDuration);
    }

    wakeRef.current();
  }, [isPlaying, currentTime, effectiveDuration]);

  // Reset clock when track changes
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.time = 0;
    clockRef.current = 0;
    setClock({ s: 0, dir: 1 });
    wakeRef.current();
  }, [activeTrack.id]);

  // Main physics + meter rAF loop
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;

    let raf = 0;
    let last = 0;

    const render = () => {
      paint(e, discRef.current, fillRef.current, rpmRef.current);
      const s = Math.floor(e.time);
      if (s !== clockRef.current) {
        const dir = s > clockRef.current ? 1 : -1;
        clockRef.current = s;
        setClock({ s, dir });
      }
    };

    const isAwake = () =>
      e.playing || e.held || e.barDrag || Math.abs(e.omega) > 0 || e.env > 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, MAX_DT) : 0;
      last = now;

      if (e.held) {
        e.scrubOmega *= Math.exp(-dt / HOLD_SETTLE_S);
      } else if (!e.barDrag) {
        integrateDisc(e, dt, discRef.current);
      }

      updateMeter(e, dt, barRefs.current, now);
      render();

      if (isAwake() && e.visible) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const wake = () => {
      render();
      if (raf === 0 && e.visible && isAwake()) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    wakeRef.current = wake;

    let inView = true;
    const syncVisibility = () => {
      e.visible = inView && !document.hidden;
      if (e.visible) {
        e.cruise?.play();
        wake();
      } else {
        e.cruise?.pause();
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      syncVisibility();
    });
    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    document.addEventListener('visibilitychange', syncVisibility);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      e.reduced = media.matches;
      if (e.reduced) {
        stopCruise(e, discRef.current);
      }
      wake();
    };
    syncMotion();
    media.addEventListener('change', syncMotion);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      media.removeEventListener('change', syncMotion);
      e.cruise?.cancel();
      e.cruise = null;
    };
  }, []);

  /* ---------------------------- Disc Scrubbing ---------------------------- */

  const pointerAngle = (e: Engine, clientX: number, clientY: number) => {
    const dx = clientX - e.center.x;
    const dy = clientY - e.center.y;
    return {
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      distance: Math.hypot(dx, dy),
    };
  };

  const onDiscDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e || event.button !== 0 || e.pointerId !== null) return;
    e.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    e.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    stopCruise(e, discRef.current);
    e.held = true;
    e.omega = 0;
    e.scrubOmega = 0;
    e.pointerAngle = pointerAngle(e, event.clientX, event.clientY).angle;
    e.lastMoveAt = performance.now();
    e.samples = [{ t: e.lastMoveAt, a: e.angle }];
    wakeRef.current();
  };

  const onDiscMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e?.held || e.pointerId !== event.pointerId) return;

    const { angle, distance } = pointerAngle(e, event.clientX, event.clientY);
    if (distance < DEAD_ZONE) {
      e.pointerAngle = angle;
      return;
    }

    let delta = angle - e.pointerAngle;
    delta -= Math.round(delta / 360) * 360;
    e.pointerAngle = angle;

    const now = performance.now();
    const dt = Math.max(now - e.lastMoveAt, 1) / 1000;
    e.lastMoveAt = now;
    const instant = clamp(delta / dt, -MAX_OMEGA, MAX_OMEGA);
    e.scrubOmega += (instant - e.scrubOmega) * 0.35;

    e.angle += delta;
    e.time = clamp(
      e.time + (delta / CRUISE) * scrubGain(e.scrubOmega),
      0,
      e.duration
    );

    e.samples.push({ t: now, a: e.angle });
    while (
      e.samples.length > 2 &&
      now - (e.samples[0]?.t ?? now) > VELOCITY_WINDOW_MS
    ) {
      e.samples.shift();
    }

    if (discRef.current) {
      discRef.current.style.transform = rotate(e.angle);
    }
    throttledSeek(e.time);
    wakeRef.current();
  };

  const onDiscUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e?.held || e.pointerId !== event.pointerId) return;
    e.pointerId = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    e.held = false;
    const now = performance.now();
    const first = e.samples[0];
    let velocity = 0;
    if (first && now - e.lastMoveAt < STALE_MOVE_MS && now > first.t) {
      velocity = ((e.angle - first.a) / (now - first.t)) * 1000;
    }
    e.omega = e.reduced ? 0 : clamp(velocity, -MAX_OMEGA, MAX_OMEGA);
    e.scrubOmega = 0;
    throttledSeek(e.time, true);
    wakeRef.current();
  };

  /* --------------------------- Rubber Scrubber Bar -------------------------- */

  const seekFromPointer = (clientX: number, forceSeek = false) => {
    const e = engineRef.current;
    const rail = railRef.current;
    if (!(e && rail?.parentElement)) return;

    const rect = rail.parentElement.getBoundingClientRect();
    const x = clientX - rect.left;
    e.time = clamp(x / rect.width, 0, 1) * e.duration;

    let over = 0;
    if (x < 0) {
      over = -damp(-x, RUBBER_MAX);
    } else if (x > rect.width) {
      over = damp(x - rect.width, RUBBER_MAX);
    }
    const stretch = 1 + Math.abs(over) / rect.width;
    const thin = 1 - (0.35 * Math.abs(over)) / RUBBER_MAX;
    rail.style.transition = 'none';
    rail.style.transformOrigin = over < 0 ? 'right center' : 'left center';
    rail.style.transform =
      over === 0 ? '' : `scale(${stretch.toFixed(4)}, ${thin.toFixed(3)})`;

    throttledSeek(e.time, forceSeek);
    wakeRef.current();
  };

  const onBarDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e || event.button !== 0 || e.pointerId !== null) return;
    e.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    e.barDrag = true;
    seekFromPointer(event.clientX, true);
  };

  const onBarMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (e?.barDrag && e.pointerId === event.pointerId) {
      seekFromPointer(event.clientX, false);
    }
  };

  const onBarUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e?.barDrag || e.pointerId !== event.pointerId) return;
    e.pointerId = null;
    e.barDrag = false;
    const rail = railRef.current;
    if (rail) {
      rail.style.transition = RUBBER_RETURN;
      rail.style.transform = '';
    }
    throttledSeek(e.time, true);
    wakeRef.current();
  };

  const onBarKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const e = engineRef.current;
    if (!e) return;
    const targets: Record<string, number> = {
      ArrowRight: e.time + SEEK_STEP,
      ArrowUp: e.time + SEEK_STEP,
      ArrowLeft: e.time - SEEK_STEP,
      ArrowDown: e.time - SEEK_STEP,
      Home: 0,
      End: e.duration - 0.5,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    e.time = clamp(target, 0, e.duration);
    throttledSeek(e.time, true);
    wakeRef.current();
  };

  const artworkVariant = hashString(`${activeTrack.title}-${activeTrack.artist}`) % 3;
  const style = { '--now-playing-accent': accentColor } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      style={style}
      className={cn(
        'relative w-full overflow-hidden rounded-3xl border border-white/15 bg-zinc-950/65 backdrop-blur-md transition-colors',
        GLASS_SHADOW_DARK,
        compact ? 'p-4' : 'p-5 sm:p-6'
      )}
    >
      <style>{ROLL_KEYFRAMES}</style>
      {/* Liquid Glass Refraction Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
        style={{ backdropFilter: `url("#${filterId}")` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />
      <GlassFilter id={filterId} scale={28} />

      <div className="relative z-10">
        {/* Top Row: Scrubbable Vinyl Disc + Tonearm + 5-bar Level Meter & Track Metadata */}
        <div className="flex items-center gap-5">
          <div className="relative size-28 sm:size-32 shrink-0">
            <div
              className="size-full cursor-grab touch-none select-none rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.65)] active:cursor-grabbing"
              data-now-playing-disc=""
              onLostPointerCapture={onDiscUp}
              onPointerCancel={onDiscUp}
              onPointerDown={onDiscDown}
              onPointerMove={onDiscMove}
              onPointerUp={onDiscUp}
              ref={discRef}
              title="LP판을 돌려 30초 미리듣기 구간 이동"
            >
              <Disc artworkVariant={artworkVariant} artworkUrl={artworkUrl} />
            </div>
            <Tonearm down={isPlaying} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="flex h-3.5 items-end gap-0.5">
                {Array.from({ length: BAR_COUNT }, (_, i) => (
                  <span
                    className="h-full w-[3px] origin-bottom rounded-[1px] bg-(--now-playing-accent)"
                    key={i}
                    ref={(node) => {
                      barRefs.current[i] = node;
                    }}
                    style={{ transform: `scaleY(${BAR_REST})` }}
                  />
                ))}
              </span>
              <span className="font-semibold text-[11px] text-neutral-400 uppercase tracking-wider">
                {isLoading
                  ? 'Loading preview'
                  : isPlaying
                    ? 'Now playing · 30s'
                    : playbackState === 'paused'
                      ? 'Paused · 30s'
                      : 'Ready · 30s preview'}
              </span>
            </div>

            <h3 className="mt-2 truncate font-bold text-base sm:text-lg text-white">
              {activeTrack.title}
            </h3>
            <p className="truncate text-sm text-neutral-400">
              {activeTrack.artist}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-block font-mono text-[11px] text-neutral-400 tabular-nums"
                ref={rpmRef}
              >
                {isPlaying ? '33⅓ rpm' : '0 rpm'}
              </span>
              <span aria-hidden="true" className="text-neutral-600 text-[10px]">
                ·
              </span>
              <span className="text-[11px] font-medium" style={{ color: accentColor }}>
                {activeTrack.tempo}
              </span>
              <span className="hidden sm:inline-block text-[10px] text-neutral-500">
                · LP를 드래그해 스크래치 탐색
              </span>
            </div>
          </div>
        </div>

        {/* Middle Row: Elastic Rubber-band Scrubber Bar + Rolling Time Digits */}
        <div className="mt-5">
          <div
            aria-label="30초 미리듣기 재생 위치 탐색"
            aria-valuemax={Math.round(effectiveDuration)}
            aria-valuemin={0}
            aria-valuenow={clock.s}
            aria-valuetext={`${formatTime(clock.s)} / ${formatTime(effectiveDuration)}`}
            className="group/seek -my-2 cursor-pointer touch-none py-2 outline-none"
            onKeyDown={onBarKey}
            onLostPointerCapture={onBarUp}
            onPointerCancel={onBarUp}
            onPointerDown={onBarDown}
            onPointerMove={onBarMove}
            onPointerUp={onBarUp}
            role="slider"
            tabIndex={0}
          >
            <div className="h-1.5">
              <div
                className="h-full overflow-hidden rounded-full bg-white/15 ring-white/30 ring-offset-2 ring-offset-zinc-950 group-focus-visible/seek:ring-2"
                ref={railRef}
              >
                <div
                  className="h-full w-full origin-left bg-(--now-playing-accent)"
                  ref={fillRef}
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between font-medium text-xs text-neutral-400 tabular-nums">
            <RollingTime direction={clock.dir} seconds={clock.s} />
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Bottom Row: Transport Controls */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            aria-label="이전 트랙"
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:bg-white/15 cursor-pointer"
            onClick={onPrev}
            type="button"
          >
            <SkipBack className="size-5" fill="currentColor" />
          </button>

          <button
            aria-label={isPlaying ? '일시정지' : '30초 미리듣기 재생'}
            aria-pressed={isPlaying}
            className={cn(
              'relative inline-flex size-12 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer',
              isPlaying || isLoading
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-[#1DB954] text-black hover:bg-[#1ed760]'
            )}
            onClick={onTogglePlay}
            type="button"
          >
            <Play
              aria-hidden="true"
              className={cn(
                FACE_CLASS,
                'size-5 translate-x-px fill-current',
                faceState(!isPlaying && !isLoading)
              )}
            />
            <Pause
              aria-hidden="true"
              className={cn(
                FACE_CLASS,
                'size-5 fill-current',
                faceState(isPlaying && !isLoading)
              )}
            />
            <Loader2
              aria-hidden="true"
              className={cn(
                FACE_CLASS,
                'size-5 animate-spin',
                faceState(isLoading)
              )}
            />
          </button>

          <button
            aria-label="다음 트랙"
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:bg-white/15 cursor-pointer"
            onClick={onNext}
            type="button"
          >
            <SkipForward className="size-5" fill="currentColor" />
          </button>

          {(isPlaying || playbackState === 'paused') && (
            <button
              aria-label="재생 정지"
              className="inline-flex size-9 items-center justify-center rounded-full text-neutral-400 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
              onClick={onStop}
              type="button"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
