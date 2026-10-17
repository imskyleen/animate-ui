'use client';

import * as React from 'react';
import {
  animate,
  cancelFrame,
  frame,
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
const RELAX = 2;
const MIN_FRAME = 10;
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

type Contours = {
  segments: Float64Array;
  count: number;
  used: Uint8Array;
  first: Int32Array;
  second: Int32Array;
  points: Float64Array;
  scratch: Float64Array;
};

function createContours(edges: number): Contours {
  return {
    segments: new Float64Array(0),
    count: 0,
    used: new Uint8Array(0),
    first: new Int32Array(edges).fill(-1),
    second: new Int32Array(edges).fill(-1),
    points: new Float64Array(0),
    scratch: new Float64Array(0),
  };
}

function addSegment(
  c: Contours,
  edgeA: number,
  xA: number,
  yA: number,
  edgeB: number,
  xB: number,
  yB: number,
) {
  if ((c.count + 1) * 6 > c.segments.length) {
    const capacity = Math.max(256, c.count * 2);
    const segments = new Float64Array(capacity * 6);
    segments.set(c.segments);
    c.segments = segments;
    c.used = new Uint8Array(capacity);
    c.points = new Float64Array(capacity * 4 + 16);
    c.scratch = new Float64Array(capacity * 4 + 16);
  }
  const o = c.count * 6;
  const s = c.segments;
  s[o] = edgeA;
  s[o + 1] = xA;
  s[o + 2] = yA;
  s[o + 3] = edgeB;
  s[o + 4] = xB;
  s[o + 5] = yB;
  c.count++;
}

function link(c: Contours, edge: number, segment: number) {
  if (c.first[edge]! < 0) c.first[edge] = segment;
  else c.second[edge] = segment;
}

function neighbour(c: Contours, edge: number, segment: number) {
  const a = c.first[edge]!;
  const next = a === segment ? c.second[edge]! : a;
  return next >= 0 && !c.used[next] ? next : -1;
}

function traceLevel(path: Path2D, c: Contours) {
  const s = c.segments;
  const pts = c.points;
  for (let i = 0; i < c.count; i++) {
    c.used[i] = 0;
    link(c, s[i * 6]!, i);
    link(c, s[i * 6 + 3]!, i);
  }
  const middle = (pts.length >> 2) << 1;
  for (let start = 0; start < c.count; start++) {
    if (c.used[start]) continue;
    c.used[start] = 1;
    const o = start * 6;
    let head = middle;
    let tail = middle;
    pts[tail++] = s[o + 1]!;
    pts[tail++] = s[o + 2]!;
    pts[tail++] = s[o + 4]!;
    pts[tail++] = s[o + 5]!;
    let current = start;
    let edge = s[o + 3]!;
    for (;;) {
      const next = neighbour(c, edge, current);
      if (next < 0) break;
      c.used[next] = 1;
      const n = next * 6;
      const far = s[n] === edge ? 3 : 0;
      pts[tail++] = s[n + far + 1]!;
      pts[tail++] = s[n + far + 2]!;
      edge = s[n + far]!;
      current = next;
    }
    const closed = edge === s[o] && tail - head > 6;
    if (closed) tail -= 2;
    else {
      current = start;
      edge = s[o]!;
      for (;;) {
        const next = neighbour(c, edge, current);
        if (next < 0) break;
        c.used[next] = 1;
        const n = next * 6;
        const far = s[n] === edge ? 3 : 0;
        pts[--head] = s[n + far + 2]!;
        pts[--head] = s[n + far + 1]!;
        edge = s[n + far]!;
        current = next;
      }
    }
    smooth(path, pts, head, tail, closed, c.scratch);
  }
  for (let i = 0; i < c.count; i++) {
    const from = s[i * 6]!;
    const to = s[i * 6 + 3]!;
    c.first[from] = c.second[from] = -1;
    c.first[to] = c.second[to] = -1;
  }
  c.count = 0;
}

function relax(
  pts: Float64Array,
  start: number,
  n: number,
  closed: boolean,
  scratch: Float64Array,
) {
  for (let pass = 0; pass < RELAX; pass++) {
    scratch.set(pts.subarray(start, start + n * 2));
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const a = ((i - 1 + n) % n) * 2;
      const b = ((i + 1) % n) * 2;
      pts[start + i * 2] =
        (scratch[a]! + 2 * scratch[i * 2]! + scratch[b]!) / 4;
      pts[start + i * 2 + 1] =
        (scratch[a + 1]! + 2 * scratch[i * 2 + 1]! + scratch[b + 1]!) / 4;
    }
  }
}

function at(pts: Float64Array, start: number, n: number, i: number) {
  return start + ((i + n) % n) * 2;
}

function smooth(
  path: Path2D,
  pts: Float64Array,
  start: number,
  end: number,
  closed: boolean,
  scratch: Float64Array,
) {
  const n = (end - start) / 2;
  if (n < 2) return;
  if (n > 3) relax(pts, start, n, closed, scratch);
  if (closed && n > 2) {
    const last = at(pts, start, n, -1);
    path.moveTo(
      (pts[last]! + pts[start]!) / 2,
      (pts[last + 1]! + pts[start + 1]!) / 2,
    );
    for (let i = 0; i < n; i++) {
      const p = at(pts, start, n, i);
      const q = at(pts, start, n, i + 1);
      path.quadraticCurveTo(
        pts[p]!,
        pts[p + 1]!,
        (pts[p]! + pts[q]!) / 2,
        (pts[p + 1]! + pts[q + 1]!) / 2,
      );
    }
    return;
  }
  path.moveTo(pts[start]!, pts[start + 1]!);
  for (let i = 1; i < n - 1; i++) {
    const p = start + i * 2;
    path.quadraticCurveTo(
      pts[p]!,
      pts[p + 1]!,
      (pts[p]! + pts[p + 2]!) / 2,
      (pts[p + 1]! + pts[p + 3]!) / 2,
    );
  }
  path.lineTo(pts[end - 2]!, pts[end - 1]!);
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
  const drawRef = React.useRef<(time: number, looping?: boolean) => void>(
    () => {},
  );
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
    let levelLow = new Int16Array(0);
    let levelHigh = new Int16Array(0);
    let bucketStart = new Int32Array(0);
    let bucketCells = new Int32Array(0);
    let contours = createContours(0);
    let frames = 0;
    let textColor = '#737373';

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
      levelLow = new Int16Array(rows * cols);
      levelHigh = new Int16Array(rows * cols);
      contours = createContours(2 * (rows + 1) * (cols + 1) + 4);
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

    const draw = (time: number, looping = false) => {
      if (width === 0 || height === 0) return;
      const { lineColor, levels } = optionsRef.current;
      sample(time);
      const count = Math.max(2, Math.round(levels));
      const step = (2 * RANGE) / count;
      const minor = new Path2D();
      const major = new Path2D();
      const stride = cols + 1;
      let lowest = Infinity;
      let highest = -Infinity;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * stride + col;
          const a = field[i]!;
          const b = field[i + 1]!;
          const c = field[i + stride + 1]!;
          const d = field[i + stride]!;
          const first = Math.ceil((Math.min(a, b, c, d) + RANGE) / step);
          const last = Math.floor((Math.max(a, b, c, d) + RANGE) / step);
          levelLow[row * cols + col] = first;
          levelHigh[row * cols + col] = last;
          if (first < lowest) lowest = first;
          if (last > highest) highest = last;
        }
      }

      const span = highest - lowest + 1;
      if (bucketStart.length < span + 1) bucketStart = new Int32Array(span + 1);
      bucketStart.fill(0, 0, span + 1);
      let entries = 0;
      for (let cell = 0; cell < rows * cols; cell++)
        for (let level = levelLow[cell]!; level <= levelHigh[cell]!; level++) {
          bucketStart[level - lowest + 1]!++;
          entries++;
        }
      for (let l = 0; l < span; l++) bucketStart[l + 1]! += bucketStart[l]!;
      if (bucketCells.length < entries)
        bucketCells = new Int32Array(entries * 2);
      const fill = bucketStart.slice(0, span);
      for (let cell = 0; cell < rows * cols; cell++)
        for (let level = levelLow[cell]!; level <= levelHigh[cell]!; level++)
          bucketCells[fill[level - lowest]!++] = cell;

      for (let level = lowest; level <= highest; level++) {
        const v = level * step - RANGE;
        const end = bucketStart[level - lowest + 1]!;
        for (let e = bucketStart[level - lowest]!; e < end; e++) {
          {
            const cell = bucketCells[e]!;
            const row = (cell / cols) | 0;
            const col = cell - row * cols;
            const i = row * stride + col;
            const a = field[i]!;
            const b = field[i + 1]!;
            const c = field[i + stride + 1]!;
            const d = field[i + stride]!;
            const code =
              (a > v ? 8 : 0) |
              (b > v ? 4 : 0) |
              (c > v ? 2 : 0) |
              (d > v ? 1 : 0);
            if (code === 0 || code === 15) continue;
            const x = col * CELL;
            const y = row * CELL;
            const top = x + ((v - a) / (b - a)) * CELL;
            const right = y + ((v - b) / (c - b)) * CELL;
            const bottom = x + ((v - d) / (c - d)) * CELL;
            const left = y + ((v - a) / (d - a)) * CELL;
            const T = i * 2;
            const B = T + stride * 2;
            const L = T + 1;
            const R = T + 3;
            const k = contours;
            switch (code) {
              case 1:
              case 14:
                addSegment(k, L, x, left, B, bottom, y + CELL);
                break;
              case 2:
              case 13:
                addSegment(k, B, bottom, y + CELL, R, x + CELL, right);
                break;
              case 3:
              case 12:
                addSegment(k, L, x, left, R, x + CELL, right);
                break;
              case 4:
              case 11:
                addSegment(k, T, top, y, R, x + CELL, right);
                break;
              case 6:
              case 9:
                addSegment(k, T, top, y, B, bottom, y + CELL);
                break;
              case 7:
              case 8:
                addSegment(k, L, x, left, T, top, y);
                break;
              case 5:
              case 10: {
                const center = (a + b + c + d) / 4 > v;
                if ((code === 5) === center) {
                  addSegment(k, L, x, left, T, top, y);
                  addSegment(k, B, bottom, y + CELL, R, x + CELL, right);
                } else {
                  addSegment(k, L, x, left, B, bottom, y + CELL);
                  addSegment(k, T, top, y, R, x + CELL, right);
                }
                break;
              }
            }
          }
        }
        traceLevel(level % 5 === 0 ? major : minor, contours);
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      if (!looping || frames++ % 30 === 0)
        textColor = getComputedStyle(container).color || '#737373';
      context.strokeStyle = lineColor ?? textColor;
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
    let waited = 0;
    const tick = ({ delta }: { delta: number }) => {
      waited += delta;
      if (waited < MIN_FRAME) return;
      timeRef.current += Math.min(waited, 64);
      waited = 0;
      drawRef.current(timeRef.current, true);
    };
    frame.render(tick, true);
    return () => cancelFrame(tick);
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
