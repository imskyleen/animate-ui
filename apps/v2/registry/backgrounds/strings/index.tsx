'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  useInView,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

const SAMPLES = 32;
const MAX_VELOCITY = 640;
const WAVE_SPEED = 1100;

type Pluck = {
  amplitude: MotionValue<number>;
  at: number;
  controls: AnimationPlaybackControls | null;
};

type StringsBackgroundProps = React.ComponentProps<'div'> & {
  lineColor?: string;
  gap?: number;
  tension?: number;
  damping?: number;
  sway?: number;
  interactive?: boolean;
};

function shape(s: number, at: number) {
  if (s <= at) return Math.sin((Math.PI / 2) * (s / at));
  return Math.sin((Math.PI / 2) * ((1 - s) / (1 - at)));
}

function StringsBackgroundContent({
  ref,
  lineColor,
  gap = 14,
  tension = 1,
  damping = 3.5,
  sway = 1,
  interactive = true,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...props
}: StringsBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const plucksRef = React.useRef<Pluck[]>([]);
  const sizeRef = React.useRef({ width: 0, height: 0 });
  const lastRef = React.useRef<{ x: number; y: number; t: number } | null>(
    null,
  );
  const drawRef = React.useRef<(time: number) => void>(() => {});
  const timeRef = React.useRef(0);

  const options = { lineColor, gap, tension, damping, sway };
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const count = () => plucksRef.current.length;
  const xOf = (index: number) => {
    const { width } = sizeRef.current;
    const { gap } = optionsRef.current;
    const n = count();
    return n <= 1 ? width / 2 : (width - (n - 1) * gap) / 2 + index * gap;
  };

  const pluck = (index: number, velocity: number, at: number, delay = 0) => {
    const string = plucksRef.current[index];
    if (!string) return;
    const n = count();
    const pitch = n <= 1 ? 0.5 : index / (n - 1);
    string.controls?.stop();
    string.at = Math.min(0.9, Math.max(0.1, at));
    string.controls = animate(string.amplitude, 0, {
      type: 'spring',
      stiffness:
        (140 + 620 * Math.pow(pitch, 1.3)) * optionsRef.current.tension,
      damping: optionsRef.current.damping,
      mass: 1,
      velocity: Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity)),
      restDelta: 0.05,
      restSpeed: 0.5,
      delay,
    });
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let dpr = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const n = Math.max(1, Math.floor(rect.width / optionsRef.current.gap));
      const current = plucksRef.current;
      current.slice(n).forEach((string) => string.controls?.stop());
      plucksRef.current = Array.from(
        { length: n },
        (_, i) =>
          current[i] ?? { amplitude: motionValue(0), at: 0.5, controls: null },
      );
    };

    const draw = (time: number) => {
      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) return;
      const { lineColor, sway } = optionsRef.current;
      const strings = plucksRef.current;
      const n = strings.length;
      const seconds = time / 1000;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle =
        lineColor ?? (getComputedStyle(container).color || '#737373');
      context.shadowColor = context.strokeStyle as string;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        const string = strings[i]!;
        const amplitude = string.amplitude.get();
        const x = xOf(i);
        const wind =
          sway *
          (1.6 * Math.sin(seconds * 0.9 + i * 0.32) +
            0.8 * Math.sin(seconds * 0.47 - i * 0.11));
        const energy = Math.min(1, Math.abs(amplitude) / 14);
        context.globalAlpha = 0.28 + 0.62 * energy;
        context.lineWidth = 1 + 0.6 * energy;
        context.shadowBlur = energy > 0.05 ? 10 * energy : 0;
        context.beginPath();
        for (let k = 0; k <= SAMPLES; k++) {
          const s = k / SAMPLES;
          const offset =
            amplitude * shape(s, string.at) + wind * Math.sin(Math.PI * s);
          if (k === 0) context.moveTo(x + offset, s * height);
          else context.lineTo(x + offset, s * height);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
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
      plucksRef.current.forEach((string) => string.controls?.stop());
    };
  }, [gap]);

  React.useEffect(() => {
    drawRef.current(timeRef.current);
  }, [lineColor, sway]);

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
      data-slot="strings-background"
      className={cn('relative size-full overflow-hidden', className)}
      style={style}
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        const now = performance.now();
        const last = lastRef.current;
        lastRef.current = { x, y, t: now };
        if (!last) return;
        const dt = Math.max(1, now - last.t) / 1000;
        const velocity = (x - last.x) / dt;
        const { height } = sizeRef.current;
        for (let i = 0; i < count(); i++) {
          const sx = xOf(i);
          if ((last.x - sx) * (x - sx) < 0 || (x === sx && last.x !== sx)) {
            const t = (sx - last.x) / (x - last.x);
            pluck(i, velocity * 0.55, (last.y + (y - last.y) * t) / height);
          }
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        lastRef.current = null;
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        const { height } = sizeRef.current;
        for (let i = 0; i < count(); i++) {
          const distance = xOf(i) - x;
          const falloff = Math.exp(-Math.abs(distance) / 420);
          pluck(
            i,
            Math.sign(distance || 1) * MAX_VELOCITY * falloff,
            y / height,
            Math.abs(distance) / WAVE_SPEED,
          );
        }
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)',
        }}
      />
      {children}
    </div>
  );
}

function StringsBackground(props: StringsBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <StringsBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { StringsBackground, type StringsBackgroundProps };
