import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, Loader2, Pause, Play } from 'lucide-react';
import { PreviewTrackItem } from '../utils/audioPreviewEngine';

export type TrackDisplayItem = PreviewTrackItem & {
  durationLabel: string;
  matchScore: number;
};

interface PullToRefreshTracksProps {
  tracks: TrackDisplayItem[];
  activeTrackId: string;
  isPlayingActive: boolean;
  isLoadingActive: boolean;
  accentColor: string;
  refreshKey: string;
  onSelectTrack: (track: TrackDisplayItem) => void;
  onRefresh: () => void;
}

interface Spring {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
}

const makeSpring = (x: number, k = 400, c = 30): Spring => ({ x, v: 0, t: x, k, c });

const tuneSpring = (s: Spring, k: number, c: number, reduced: boolean) => {
  s.k = k;
  s.c = reduced ? 2 * Math.sqrt(k) : c;
};

const stepSpring = (s: Spring, dt: number) => {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const rubber = (d: number) => {
  const dist = Math.max(0, d);
  return dist <= 180 ? dist * 0.55 : 99 + 60 * (1 - 1 / (((dist - 180) * 0.55) / 60 + 1));
};

const PULL_THRESHOLD = 88;
const HOLD_OFFSET = 64;
const HOLD_DURATION_SEC = 0.85;
const REST_Y = 5;
const REST_SCALE = 0.25;
const RETURN_K = 260;
const RETURN_C = 18;

const ROW_ANIM_CSS = `
@keyframes ptr-row-in {
  from {
    opacity: 0;
    transform: translateY(-14px) scale(0.96);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
.ptr-row-enter {
  animation: ptr-row-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .ptr-row-enter {
    animation: none !important;
  }
}
`;

export const PullToRefreshTracks: React.FC<PullToRefreshTracksProps> = ({
  tracks,
  activeTrackId,
  isPlayingActive,
  isLoadingActive,
  accentColor,
  refreshKey,
  onSelectTrack,
  onRefresh,
}) => {
  const gooFilterId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  const [statusText, setStatusText] = useState('아래로 당겨 새로고침');
  const [isDragging, setIsDragging] = useState(false);
  const [enterBatch, setEnterBatch] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const suppressClickUntilRef = useRef(0);
  const prevRefreshKeyRef = useRef(refreshKey);

  // Trigger stagger entrance whenever track batch changes
  useEffect(() => {
    if (prevRefreshKeyRef.current !== refreshKey) {
      prevRefreshKeyRef.current = refreshKey;
      setEnterBatch((b) => b + 1);
      setStatusText('방금 업데이트됨');
      const id = window.setTimeout(() => {
        setStatusText('아래로 당겨 새로고침');
      }, 2200);
      return () => window.clearTimeout(id);
    }
  }, [refreshKey]);

  // Physics refs
  const modeRef = useRef<'idle' | 'pulling' | 'loading' | 'settling'>('idle');
  const dragRef = useRef<{
    id: number;
    x0: number;
    y0: number;
    engaged: boolean;
    armed: boolean;
  } | null>(null);

  const reducedRef = useRef(false);
  const P = useRef<Spring>(makeSpring(0, RETURN_K, RETURN_C));
  const D = useRef<Spring>(makeSpring(REST_Y, 380, 20));
  const DS = useRef<Spring>(makeSpring(REST_SCALE, 420, 18));
  const SP = useRef<Spring>(makeSpring(0, 400, 26));
  const timersRef = useRef<Array<{ t: number; fn: () => void }>>([]);

  const scheduleAfter = (sec: number, fn: () => void) => {
    timersRef.current.push({ t: sec, fn });
  };

  // Main spring rAF loop
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduced = () => {
      reducedRef.current = media.matches;
    };
    syncReduced();
    media.addEventListener('change', syncReduced);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      for (let i = timersRef.current.length - 1; i >= 0; i--) {
        timersRef.current[i].t -= dt;
        if (timersRef.current[i].t <= 0) {
          const item = timersRef.current.splice(i, 1)[0];
          item.fn();
        }
      }

      const sub = 4;
      const subDt = dt / sub;
      const mode = modeRef.current;

      for (let k = 0; k < sub; k++) {
        const p = clamp(P.current.x / PULL_THRESHOLD, 0, 1);
        if (mode === 'pulling') {
          D.current.t = Math.max(REST_Y, P.current.x * 0.5);
          DS.current.t = REST_SCALE + (1 - REST_SCALE) * p;
          SP.current.t = 0;
        } else if (mode === 'loading') {
          D.current.t = HOLD_OFFSET / 2;
          DS.current.t = 1;
          SP.current.t = 1;
        } else {
          D.current.t = REST_Y;
          DS.current.t = REST_SCALE;
          SP.current.t = 0;
        }
        stepSpring(P.current, subDt);
        stepSpring(D.current, subDt);
        stepSpring(DS.current, subDt);
        stepSpring(SP.current, subDt);
      }

      if (listRef.current) {
        const y = Math.abs(P.current.x) < 0.05 && P.current.t === 0 ? 0 : P.current.x;
        listRef.current.style.transform = y === 0 ? '' : `translateY(${y.toFixed(2)}px)`;
      }

      const stretch = 1 + clamp(Math.abs(D.current.v) / 1600, 0, 0.35);
      if (dropRef.current) {
        dropRef.current.style.transform = `translateY(${(D.current.x - 16).toFixed(2)}px) scale(${(DS.current.x / stretch).toFixed(3)},${(DS.current.x * stretch).toFixed(3)})`;
        dropRef.current.style.opacity = (1 - clamp(SP.current.x, 0, 1)).toFixed(3);
      }
      if (spinRef.current) {
        spinRef.current.style.transform = `translateY(${(D.current.x - 16).toFixed(2)}px) scale(${(0.6 + 0.4 * SP.current.x).toFixed(3)})`;
        spinRef.current.style.opacity = clamp(SP.current.x, 0, 1).toFixed(3);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      media.removeEventListener('change', syncReduced);
      timersRef.current = [];
    };
  }, []);

  const triggerRefresh = () => {
    const reduced = reducedRef.current;
    modeRef.current = 'loading';
    tuneSpring(P.current, RETURN_K, RETURN_C, reduced);
    P.current.t = HOLD_OFFSET;
    setStatusText('새로운 곡 추천 중…');

    scheduleAfter(HOLD_DURATION_SEC, () => {
      onRefreshRef.current();
      modeRef.current = 'settling';
      tuneSpring(P.current, RETURN_K, RETURN_C, reduced);
      P.current.t = 0;
      setStatusText('방금 업데이트됨');
      scheduleAfter(0.6, () => {
        modeRef.current = 'idle';
      });
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modeRef.current !== 'idle' || e.button !== 0) return;
    dragRef.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      engaged: false,
      armed: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;

    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;

    if (!drag.engaged) {
      if (dy > 7 && Math.abs(dy) > Math.abs(dx)) {
        drag.engaged = true;
        modeRef.current = 'pulling';
        tuneSpring(P.current, 900, 50, reducedRef.current);
        setIsDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      } else {
        return;
      }
    }

    P.current.t = rubber(dy);
    const over = P.current.t >= PULL_THRESHOLD;

    if (over && !drag.armed) {
      drag.armed = true;
      DS.current.v += 4;
      setStatusText('놓으면 새로고침');
    } else if (!over && drag.armed) {
      drag.armed = false;
      setStatusText('더 아래로 당겨주세요');
    } else if (!over && !drag.armed && P.current.t > 8) {
      setStatusText('더 아래로 당겨주세요');
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;

    const wasEngaged = drag.engaged;
    dragRef.current = null;
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (!wasEngaged) return;

    // Prevent accidental click on track button right after releasing a drag
    suppressClickUntilRef.current = performance.now() + 220;

    if (P.current.t >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      modeRef.current = 'idle';
      tuneSpring(P.current, RETURN_K, RETURN_C, reducedRef.current);
      P.current.t = 0;
      setStatusText('아래로 당겨 새로고침');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171717]/95 overflow-hidden shadow-lg">
      <style>{ROW_ANIM_CSS}</style>

      {/* Gooey SVG Filter */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter height="200%" id={gooFilterId} width="200%" x="-50%" y="-50%">
            <feGaussianBlur in="SourceGraphic" result="b" stdDeviation="7" />
            <feColorMatrix
              in="b"
              mode="matrix"
              result="g"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3.5 pb-2.5 bg-[#171717]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">추천 트랙</span>
          <span className="text-[11px] text-neutral-500">· {tracks.length}곡</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 transition-opacity">
          <ArrowDown className="w-3 h-3 text-[#1DB954]" />
          {statusText}
        </span>
      </div>

      {/* Pull-to-Refresh Body */}
      <div
        ref={bodyRef}
        role="region"
        aria-label="추천 트랙 목록, 아래로 당겨서 새로고침"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        className={`relative overflow-hidden select-none touch-pan-x ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Gooey Handle & Stretching Droplet */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[120px]"
          style={{ filter: `url(#${gooFilterId})` }}
        >
          <div className="absolute left-1/2 top-[2px] h-1.5 w-11 -ml-[22px] rounded-full bg-white" />
          <div
            ref={dropRef}
            className="absolute left-1/2 top-0 h-8 w-8 -ml-4 rounded-full bg-white will-change-transform"
          />
        </div>

        {/* Crisp Loading Spinner */}
        <div
          ref={spinRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 z-[2] h-8 w-8 -ml-4 rounded-full bg-white p-1.5 text-black opacity-0"
        >
          <svg
            className="block h-full w-full animate-spin"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M12 4a8 8 0 0 1 8 8" />
          </svg>
        </div>

        {/* Track Rows List */}
        <div
          ref={listRef}
          className="relative z-[2] bg-[#171717] px-3 pb-3 pt-2.5 space-y-2 will-change-transform"
        >
          {tracks.map((item, idx) => {
            const isCurrent = activeTrackId === item.id;
            const isTrackPlaying = isCurrent && isPlayingActive;
            const isTrackLoading = isCurrent && isLoadingActive;

            return (
              <button
                key={`${enterBatch}-${item.id}`}
                type="button"
                onClick={() => {
                  if (performance.now() < suppressClickUntilRef.current) return;
                  onSelectTrack(item);
                }}
                style={{
                  animationDelay: enterBatch > 0 ? `${idx * 45}ms` : undefined,
                  borderColor: isCurrent ? `${accentColor}80` : undefined,
                }}
                className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer group ${
                  enterBatch > 0 ? 'ptr-row-enter' : ''
                } ${
                  isCurrent
                    ? 'bg-[#1DB954]/10 border-[#1DB954]/50 shadow-[0_0_20px_rgba(29,185,84,0.12)]'
                    : 'bg-black/45 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#1DB954] text-black'
                        : 'bg-neutral-800 text-[#1DB954] group-hover:bg-[#1DB954] group-hover:text-black'
                    }`}
                  >
                    {isTrackLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isTrackPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold truncate ${
                          isCurrent ? 'text-[#1ed760]' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      {isTrackPlaying && (
                        <span className="inline-flex items-end gap-0.5 h-3 shrink-0" aria-hidden="true">
                          <span className="w-0.5 bg-[#1DB954] h-full animate-[pulse_0.6s_infinite_alternate]" />
                          <span className="w-0.5 bg-[#1DB954] h-2/3 animate-[pulse_0.8s_infinite_alternate]" />
                          <span className="w-0.5 bg-[#1DB954] h-4/5 animate-[pulse_0.5s_infinite_alternate]" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">{item.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3">
                  <span className="hidden sm:inline-block text-[11px] font-medium text-neutral-400">
                    30초 미리듣기
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono tabular-nums text-neutral-400">
                      {item.durationLabel}
                    </span>
                    <span className="block text-[10px] text-[#1DB954]">{item.tempo}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
