'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  useInView,
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

const CELL = 10;
const FEATURE = 280;
const RANGE = 0.95;
const HILL_RADIUS = 90;
const RIPPLE_WIDTH = 60;

const PERMUTATION = (() => {
  const table = Array.from({ length: 256 }, (_, i) => i);
  let seed = 1013;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [table[i], table[j]] = [table[j]!, table[i]!];
  }
  return Uint8Array.from([...table, ...table]);
})();

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise(x: number, y: number, z: number) {
  const p = PERMUTATION;
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const A = p[X]! + Y;
  const AA = p[A]! + Z;
  const AB = p[A + 1]! + Z;
  const B = p[X + 1]! + Y;
  const BA = p[B]! + Z;
  const BB = p[B + 1]! + Z;
  return lerp(
    lerp(
      lerp(grad(p[AA]!, x, y, z), grad(p[BA]!, x - 1, y, z), u),
      lerp(grad(p[AB]!, x, y - 1, z), grad(p[BB]!, x - 1, y - 1, z), u),
      v,
    ),
    lerp(
      lerp(grad(p[AA + 1]!, x, y, z - 1), grad(p[BA + 1]!, x - 1, y, z - 1), u),
      lerp(
        grad(p[AB + 1]!, x, y - 1, z - 1),
        grad(p[BB + 1]!, x - 1, y - 1, z - 1),
        u,
      ),
      v,
    ),
    w,
  );
}

function trace(path: Path2D, segments: number[]) {
  const count = segments.length / 6;
  const ends = new Map<number, number[]>();
  for (let s = 0; s < count; s++)
    for (const side of [0, 3]) {
      const edge = segments[s * 6 + side]!;
      const list = ends.get(edge);
      if (list) list.push(s);
      else ends.set(edge, [s]);
    }
  const used = new Uint8Array(count);
  const walk = (s: number, edge: number, into: number[]) => {
    for (;;) {
      const next = ends.get(edge)?.find((n) => n !== s && !used[n]);
      if (next === undefined) return edge;
      used[next] = 1;
      const o = next * 6;
      const far = segments[o] === edge ? 3 : 0;
      into.push(segments[o + far + 1]!, segments[o + far + 2]!);
      s = next;
      edge = segments[o + far]!;
    }
  };
  for (let s = 0; s < count; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const o = s * 6;
    const forward = [segments[o + 4]!, segments[o + 5]!];
    const end = walk(s, segments[o + 3]!, forward);
    const closed = end === segments[o];
    const backward: number[] = [];
    if (!closed) walk(s, segments[o]!, backward);
    const points: number[] = [];
    for (let i = backward.length - 2; i >= 0; i -= 2)
      points.push(backward[i]!, backward[i + 1]!);
    points.push(segments[o + 1]!, segments[o + 2]!, ...forward);
    if (closed) points.length -= 2;
    smooth(path, points, closed);
  }
}

function smooth(path: Path2D, points: number[], closed: boolean) {
  const n = points.length / 2;
  if (n < 2) return;
  const x = (i: number) => points[((i + n) % n) * 2]!;
  const y = (i: number) => points[((i + n) % n) * 2 + 1]!;
  if (closed && n > 2) {
    path.moveTo((x(-1) + x(0)) / 2, (y(-1) + y(0)) / 2);
    for (let i = 0; i < n; i++)
      path.quadraticCurveTo(
        x(i),
        y(i),
        (x(i) + x(i + 1)) / 2,
        (y(i) + y(i + 1)) / 2,
      );
    return;
  }
  path.moveTo(x(0), y(0));
  for (let i = 1; i < n - 1; i++)
    path.quadraticCurveTo(
      x(i),
      y(i),
      (x(i) + x(i + 1)) / 2,
      (y(i) + y(i + 1)) / 2,
    );
  path.lineTo(x(n - 1), y(n - 1));
}

type Ripple = { x: number; y: number; progress: MotionValue<number> };

type TopographyBackgroundProps = React.ComponentProps<'div'> & {
  lineColor?: string;
  levels?: number;
  speed?: number;
  scale?: number;
  peak?: number;
  interactive?: boolean;
  transition?: SpringOptions;
};

function TopographyBackgroundContent({
  ref,
  lineColor,
  levels = 16,
  speed = 1,
  scale = 1,
  peak = 1,
  interactive = true,
  transition = { stiffness: 120, damping: 20 },
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...props
}: TopographyBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const raised = useMotionValue(0);
  const hillX = useSpring(pointerX, transition);
  const hillY = useSpring(pointerY, transition);
  const hill = useSpring(raised, { stiffness: 80, damping: 18 });
  const rise = useMotionValue(reduce ? 1 : 0);
  const ripplesRef = React.useRef<Ripple[]>([]);
  const drawRef = React.useRef<(time: number) => void>(() => {});
  const timeRef = React.useRef(0);

  const options = { lineColor, levels, speed, scale, peak };
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  React.useEffect(() => {
    if (reduce) {
      rise.jump(1);
      return;
    }
    const controls = animate(rise, 1, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [reduce, rise]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      cols = Math.ceil(width / CELL) + 1;
      rows = Math.ceil(height / CELL) + 1;
      field = new Float32Array((cols + 1) * (rows + 1));
      if (hill.get() === 0) {
        pointerX.jump(width / 2);
        pointerY.jump(height / 2);
        hillX.jump(width / 2);
        hillY.jump(height / 2);
      }
    };

    const sample = (time: number) => {
      const { speed, scale, peak } = optionsRef.current;
      const size = FEATURE * scale;
      const z = time * 0.00005 * speed;
      const lift = hill.get() * peak * 1.5;
      const hx = hillX.get();
      const hy = hillY.get();
      const ripples = ripplesRef.current;
      const reach = Math.hypot(width, height) * 0.8;
      const amount = rise.get();
      let i = 0;
      for (let row = 0; row <= rows; row++) {
        const y = row * CELL;
        for (let col = 0; col <= cols; col++) {
          const x = col * CELL;
          const nx = x / size;
          const ny = y / size;
          let value =
            noise(nx, ny, z) * 1.1 + noise(nx * 2.1, ny * 2.1, z * 1.7) * 0.45;
          const dx = x - hx;
          const dy = y - hy;
          if (lift > 0)
            value += lift * Math.exp(-Math.hypot(dx, dy) / HILL_RADIUS);
          for (const ripple of ripples) {
            const p = ripple.progress.get();
            const d = Math.hypot(x - ripple.x, y - ripple.y) - p * reach;
            value +=
              0.9 *
              (1 - p) *
              Math.cos((d / RIPPLE_WIDTH) * 1.8) *
              Math.exp(-(d * d) / (2 * RIPPLE_WIDTH * RIPPLE_WIDTH));
          }
          field[i++] = value * amount;
        }
      }
    };

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;
      const { lineColor, levels } = optionsRef.current;
      sample(time);
      const count = Math.max(2, Math.round(levels));
      const step = (2 * RANGE) / count;
      const minor = new Path2D();
      const major = new Path2D();
      const stride = cols + 1;
      const byLevel = new Map<number, number[]>();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * stride + col;
          const a = field[i]!;
          const b = field[i + 1]!;
          const c = field[i + stride + 1]!;
          const d = field[i + stride]!;
          const low = Math.min(a, b, c, d);
          const high = Math.max(a, b, c, d);
          const first = Math.ceil((low + RANGE) / step);
          const last = Math.floor((high + RANGE) / step);
          const x = col * CELL;
          const y = row * CELL;
          for (let level = first; level <= last; level++) {
            const v = level * step - RANGE;
            const code =
              (a > v ? 8 : 0) |
              (b > v ? 4 : 0) |
              (c > v ? 2 : 0) |
              (d > v ? 1 : 0);
            if (code === 0 || code === 15) continue;
            const top = x + ((v - a) / (b - a)) * CELL;
            const right = y + ((v - b) / (c - b)) * CELL;
            const bottom = x + ((v - d) / (c - d)) * CELL;
            const left = y + ((v - a) / (d - a)) * CELL;
            let list = byLevel.get(level);
            if (!list) byLevel.set(level, (list = []));
            const edge = (row * stride + col) * 2;
            const T = [edge, top, y] as const;
            const B = [edge + stride * 2, bottom, y + CELL] as const;
            const L = [edge + 1, x, left] as const;
            const R = [edge + 3, x + CELL, right] as const;
            const segment = (
              from: readonly [number, number, number],
              to: readonly [number, number, number],
            ) => list.push(...from, ...to);
            switch (code) {
              case 1:
              case 14:
                segment(L, B);
                break;
              case 2:
              case 13:
                segment(B, R);
                break;
              case 3:
              case 12:
                segment(L, R);
                break;
              case 4:
              case 11:
                segment(T, R);
                break;
              case 6:
              case 9:
                segment(T, B);
                break;
              case 7:
              case 8:
                segment(L, T);
                break;
              case 5:
              case 10: {
                const center = (a + b + c + d) / 4 > v;
                if ((code === 5) === center) {
                  segment(L, T);
                  segment(B, R);
                } else {
                  segment(L, B);
                  segment(T, R);
                }
                break;
              }
            }
          }
        }
      }

      for (const [level, list] of byLevel)
        trace(level % 5 === 0 ? major : minor, list);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle =
        lineColor ?? (getComputedStyle(container).color || '#737373');
      context.lineCap = 'round';
      context.globalAlpha = 0.4;
      context.lineWidth = 1;
      context.stroke(minor);
      context.globalAlpha = 0.85;
      context.lineWidth = 1.5;
      context.stroke(major);
      context.globalAlpha = 1;
    };

    drawRef.current = draw;
    resize();
    draw(timeRef.current);
    const observer = new ResizeObserver(() => {
      resize();
      draw(timeRef.current);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      drawRef.current = () => {};
    };
  }, [hill, hillX, hillY, pointerX, pointerY, rise]);

  React.useEffect(() => {
    drawRef.current(timeRef.current);
  }, [lineColor, levels, scale, peak]);

  React.useEffect(() => {
    if (!playing) return;
    let frameId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      timeRef.current += Math.min(now - last, 64);
      last = now;
      drawRef.current(timeRef.current);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  const point = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <div
      ref={containerRef}
      data-slot="topography-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        pointerX.set(x);
        pointerY.set(y);
        raised.set(1);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        raised.set(0);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        pointerX.set(x);
        pointerY.set(y);
        const ripple: Ripple = { x, y, progress: motionValue(0) };
        ripplesRef.current = [...ripplesRef.current.slice(-3), ripple];
        animate(ripple.progress, 1, {
          duration: 2.6,
          ease: [0.25, 0.4, 0.45, 1],
        }).then(() => {
          ripplesRef.current = ripplesRef.current.filter((r) => r !== ripple);
        });
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      {children}
    </div>
  );
}

function TopographyBackground(props: TopographyBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <TopographyBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { TopographyBackground, type TopographyBackgroundProps };
