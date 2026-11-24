import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../utils/cn';

export interface JellySliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  accentColor?: string;
  onValueChange: (value: number) => void;
  className?: string;
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

const rubber = (x: number, min: number, max: number, d = 18) =>
  x < min
    ? min - (1 - 1 / (((min - x) * 0.55) / d + 1)) * d
    : x > max
      ? max + (1 - 1 / (((x - max) * 0.55) / d + 1)) * d
      : x;

const R = 12; // visual thumb radius
const TR = 14; // drawn thumb half size (goo filter trims ~2px)
const D = 18; // drop half size (36x36)
const OX = 40; // goo layer horizontal inset offset
const OY = 80; // goo layer vertical inset offset
const CY = 16; // track center y inside rail
const RISE = -38;
const REST_DROP = 0.5;

const T = {
  follow: [900, 50] as const,
  bubble: [420, 22] as const,
  release: [300, 14] as const,
  glide: [420, 34] as const,
};

const TICK_VALUES = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, ..., 100
const MAJOR_NUMS = [0, 25, 50, 75, 100];

export const JellySlider: React.FC<JellySliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  suffix = '%',
  accentColor = '#1DB954',
  onValueChange,
  className,
}) => {
  const gooId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const dropLabelRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const markRefs = useRef<(HTMLElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [isActive, setIsActive] = useState(false);

  const range = Math.max(1, max - min);
  const toNorm = (v: number) => clamp(((v - min) / range) * 100, 0, 100);
  const fromNorm = (n: number) => Math.round(min + (clamp(n, 0, 100) / 100) * range);

  const initialNorm = toNorm(value);

  const widthRef = useRef(260);
  const ratioRef = useRef(initialNorm / 100);
  const lastEmittedRef = useRef(value);
  const litValueRef = useRef(-1);
  const reducedRef = useRef(false);

  const draggingRef = useRef(false);
  const hoverRef = useRef(false);
  const liftedRef = useRef(false);

  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const span = () => Math.max(widthRef.current - 2 * R, 1);
  const toX = (norm: number) => R + (norm / 100) * span();
  const toNormFromX = (x: number) => clamp((x - R) / span(), 0, 1) * 100;

  const X = useRef<Spring>(makeSpring(toX(initialNorm), ...T.follow));
  const DX = useRef<Spring>(makeSpring(toX(initialNorm), 260, 18));
  const DY = useRef<Spring>(makeSpring(CY, ...T.bubble));
  const DS = useRef<Spring>(makeSpring(REST_DROP, ...T.bubble));
  const PS = useRef<Spring>(makeSpring(1, 520, 16));

  const syncBubbleTargets = () => {
    const up = draggingRef.current || liftedRef.current;
    DY.current.t = up ? CY + RISE : CY;
    DS.current.t = up ? 1 : REST_DROP;
    PS.current.t = draggingRef.current ? 1.16 : hoverRef.current ? 1.08 : 1;
    setIsActive(up);
  };

  // Sync external prop changes (e.g. reset or survey change) smoothly
  useEffect(() => {
    lastEmittedRef.current = value;
    if (draggingRef.current) return;
    const norm = toNorm(value);
    ratioRef.current = norm / 100;
    tuneSpring(X.current, ...T.glide, reducedRef.current);
    X.current.t = toX(norm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      reducedRef.current = media.matches;
    };
    syncMotion();
    media.addEventListener('change', syncMotion);

    const updateWidth = () => {
      const w = rail.clientWidth;
      if (!w || w === widthRef.current) return;
      widthRef.current = w;
      const xPos = toX(ratioRef.current * 100);
      X.current.x = X.current.t = DX.current.x = DX.current.t = xPos;
      X.current.v = DX.current.v = 0;
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(rail);

    const lightScale = (normVal: number) => {
      if (normVal === litValueRef.current) return;
      litValueRef.current = normVal;
      markRefs.current.forEach((m, i) => {
        if (!m) return;
        const on = i * 5 <= normVal && normVal > 0;
        const isMajor = i * 5 % 25 === 0;
        m.style.backgroundColor = on
          ? isMajor
            ? '#ffffff'
            : 'rgba(255,255,255,0.78)'
          : isMajor
            ? 'rgba(255,255,255,0.35)'
            : 'rgba(255,255,255,0.16)';
      });
      numRefs.current.forEach((n, i) => {
        if (!n) return;
        const on = i * 25 <= normVal && normVal > 0;
        n.style.color = on ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.42)';
      });
    };

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const sub = 4;
      const subDt = dt / sub;
      for (let k = 0; k < sub; k++) {
        DX.current.t = X.current.x;
        if (widthRef.current > 2 * R) {
          ratioRef.current = toNormFromX(X.current.t) / 100;
        }
        stepSpring(X.current, subDt);
        stepSpring(DX.current, subDt);
        stepSpring(DY.current, subDt);
        stepSpring(DS.current, subDt);
        stepSpring(PS.current, subDt);
      }

      const x = X.current.x;
      const wd = widthRef.current;
      const normVal = Math.round(toNormFromX(x));

      const st = 1 + Math.min(Math.abs(X.current.v) / 2400, 0.4);
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translate(${(x - TR + OX).toFixed(2)}px,${(CY - TR + OY).toFixed(2)}px) scale(${(st * PS.current.x).toFixed(3)},${(PS.current.x / st).toFixed(3)})`;
      }

      const tilt = clamp((DX.current.x - X.current.x) * 0.9, -28, 28);
      const dTr = `translate(${(DX.current.x - D).toFixed(2)}px,${(DY.current.x - D).toFixed(2)}px) rotate(${tilt.toFixed(2)}deg) scale(${DS.current.x.toFixed(3)})`;

      if (dropRef.current) {
        dropRef.current.style.transform = `translate(${OX}px,${OY}px) ${dTr}`;
      }
      if (dropLabelRef.current) {
        dropLabelRef.current.style.transform = dTr;
        dropLabelRef.current.style.opacity = clamp((DS.current.x - 0.7) / 0.25, 0, 1).toFixed(3);
        const mappedVal = fromNorm(normVal);
        const txt = String(mappedVal);
        if (dropLabelRef.current.textContent !== txt) {
          dropLabelRef.current.textContent = txt;
        }
      }

      if (fillRef.current) {
        const w = clamp(x, 0, Math.max(wd, 0)) * clamp((x - R) / R, 0, 1);
        fillRef.current.style.width = `${w.toFixed(2)}px`;
      }

      if (hitRef.current) {
        hitRef.current.style.left = `${(x - R).toFixed(2)}px`;
      }

      lightScale(normVal);

      if (draggingRef.current) {
        const targetMapped = fromNorm(Math.round(toNormFromX(X.current.t)));
        if (targetMapped !== lastEmittedRef.current) {
          lastEmittedRef.current = targetMapped;
          onValueChangeRef.current(targetMapped);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      media.removeEventListener('change', syncMotion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localX = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return R;
    return clientX - rail.getBoundingClientRect().left;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    tuneSpring(X.current, ...T.follow, reducedRef.current);
    X.current.t = rubber(localX(e.clientX), R, widthRef.current - R);
    syncBubbleTargets();
    hitRef.current?.focus({ preventScroll: true });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    X.current.t = rubber(localX(e.clientX), R, widthRef.current - R);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    tuneSpring(X.current, ...T.release, reducedRef.current);
    X.current.t = clamp(X.current.t, R, widthRef.current - R);
    const finalMapped = fromNorm(Math.round(toNormFromX(X.current.t)));
    if (finalMapped !== lastEmittedRef.current) {
      lastEmittedRef.current = finalMapped;
      onValueChangeRef.current(finalMapped);
    }
    syncBubbleTargets();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const deltaMap: Record<string, number> = {
      ArrowRight: 5,
      ArrowUp: 5,
      ArrowLeft: -5,
      ArrowDown: -5,
      PageUp: 10,
      PageDown: -10,
    };
    const absMap: Record<string, number> = { Home: min, End: max };
    const delta = deltaMap[e.key];
    const abs = absMap[e.key];
    if (delta === undefined && abs === undefined) return;
    e.preventDefault();

    const currentMapped = fromNorm(Math.round(toNormFromX(X.current.t)));
    const next = abs !== undefined ? abs : clamp(currentMapped + delta, min, max);
    tuneSpring(X.current, ...T.glide, reducedRef.current);
    X.current.t = toX(toNorm(next));
    lastEmittedRef.current = next;
    onValueChangeRef.current(next);
    liftedRef.current = true;
    syncBubbleTargets();
  };

  return (
    <div
      className={cn(
        'relative rounded-xl bg-white/[0.04] border border-white/[0.07] px-3.5 pt-3 pb-2.5 select-none transition-colors hover:border-white/15',
        isActive ? 'z-30' : 'z-10',
        className
      )}
    >
      {/* Goo SVG Filter */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter height="200%" id={gooId} width="200%" x="-50%" y="-50%">
            <feGaussianBlur in="SourceGraphic" result="b" stdDeviation="8" />
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

      {/* Header Row: Metric Label + Current Tabular Value */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-neutral-200 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          {label}
        </span>
        <span
          className="text-xs font-mono font-bold tabular-nums"
          style={{ color: accentColor }}
        >
          {value}
          {suffix}
        </span>
      </div>

      {/* Interactive Rail + Gooey Liquid Thumb & Rising Drop */}
      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            hoverRef.current = true;
            syncBubbleTargets();
          }
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
          syncBubbleTargets();
        }}
        className="relative h-8 touch-none cursor-pointer"
      >
        {/* Track */}
        <div className="absolute inset-x-0 top-[13px] h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div
            ref={fillRef}
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Gooey Layer (thumb + rising value droplet fuse together) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[40px] -right-[40px] -top-[80px] h-[140px]"
          style={{ filter: `url(#${gooId})` }}
        >
          <div
            ref={dropRef}
            className="absolute left-0 top-0 h-9 w-9 rounded-full bg-white will-change-transform"
          />
          <div
            ref={thumbRef}
            className="absolute left-0 top-0 h-7 w-7 rounded-full bg-white will-change-transform"
          />
        </div>

        {/* Crisp Number Inside Rising Drop */}
        <div
          ref={dropLabelRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 grid h-9 w-9 place-items-center text-xs font-bold tabular-nums text-black will-change-[transform,opacity]"
        >
          {value}
        </div>

        {/* Keyboard Accessible Hit Target */}
        <div
          ref={hitRef}
          aria-label={label}
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={value}
          aria-valuetext={`${value}${suffix}`}
          className="absolute top-1 h-6 w-6 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          onBlur={() => {
            liftedRef.current = false;
            syncBubbleTargets();
          }}
          onFocus={(e) => {
            if (e.currentTarget.matches(':focus-visible')) {
              liftedRef.current = true;
              syncBubbleTargets();
            }
          }}
          onKeyDown={onKeyDown}
          role="slider"
          tabIndex={0}
        />
      </div>

      {/* Tick Scale (Every 5, Major at 0/25/50/75/100) */}
      <div aria-hidden="true" className="mt-1">
        <div className="relative h-2">
          {TICK_VALUES.map((tickVal, idx) => {
            const isMajor = tickVal % 25 === 0;
            return (
              <i
                key={tickVal}
                ref={(el) => {
                  markRefs.current[idx] = el;
                }}
                className={cn(
                  'absolute top-0 -ml-[0.75px] w-[1.5px] rounded-[1px] transition-[background-color,height] duration-200',
                  isMajor ? 'h-2' : 'h-1'
                )}
                style={{
                  left: `calc(12px + (100% - 24px) * ${tickVal / 100})`,
                }}
              />
            );
          })}
        </div>
        <div className="relative mt-1 h-3.5 text-[10px] font-medium tabular-nums leading-[14px]">
          {MAJOR_NUMS.map((numVal, idx) => (
            <span
              key={numVal}
              ref={(el) => {
                numRefs.current[idx] = el;
              }}
              className="absolute top-0 -translate-x-1/2 transition-colors duration-200"
              style={{
                left: `calc(12px + (100% - 24px) * ${numVal / 100})`,
              }}
            >
              {numVal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JellySlider;
