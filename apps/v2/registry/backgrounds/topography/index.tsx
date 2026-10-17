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
            const path = level % 5 === 0 ? major : minor;
            const segment = (
              x1: number,
              y1: number,
              x2: number,
              y2: number,
            ) => {
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
            };
            switch (code) {
              case 1:
              case 14:
                segment(x, left, bottom, y + CELL);
                break;
              case 2:
              case 13:
                segment(bottom, y + CELL, x + CELL, right);
                break;
              case 3:
              case 12:
                segment(x, left, x + CELL, right);
                break;
              case 4:
              case 11:
                segment(top, y, x + CELL, right);
                break;
              case 6:
              case 9:
                segment(top, y, bottom, y + CELL);
                break;
              case 7:
              case 8:
                segment(x, left, top, y);
                break;
              case 5:
              case 10: {
                const center = (a + b + c + d) / 4 > v;
                if ((code === 5) === center) {
                  segment(x, left, top, y);
                  segment(bottom, y + CELL, x + CELL, right);
                } else {
                  segment(x, left, bottom, y + CELL);
                  segment(top, y, x + CELL, right);
                }
                break;
              }
            }
          }
        }
      }

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
