'use client';

import * as React from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const PATHS = [
  {
    at: { left: '-18%', top: '-30%' },
    x: ['0%', '14%', '4%', '0%'],
    y: ['0%', '8%', '18%', '0%'],
    duration: 26,
  },
  {
    at: { left: '48%', top: '-36%' },
    x: ['0%', '-12%', '-20%', '0%'],
    y: ['0%', '16%', '4%', '0%'],
    duration: 32,
  },
  {
    at: { left: '14%', top: '52%' },
    x: ['0%', '18%', '-6%', '0%'],
    y: ['0%', '-10%', '-4%', '0%'],
    duration: 38,
  },
];

type GlowBackgroundProps = React.ComponentProps<'div'> & {
  colors?: [string, string, string];
  intensity?: number;
  speed?: number;
  grain?: boolean;
  interactive?: boolean;
  transition?: SpringOptions;
};

function GlowBackgroundContent({
  ref,
  colors = ['#6366f1', '#22d3ee', '#a855f7'],
  intensity = 1,
  speed = 1,
  grain = true,
  interactive = true,
  transition = { stiffness: 40, damping: 20 },
  className,
  children,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  ...props
}: GlowBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;
  const pace = Math.max(speed, 0.01);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, transition);
  const y = useSpring(pointerY, transition);
  const [hovered, setHovered] = React.useState(false);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - rect.left);
    pointerY.set(event.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      data-slot="glow-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!interactive || reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const atX = event.clientX - rect.left;
        const atY = event.clientY - rect.top;
        pointerX.jump(atX);
        pointerY.jump(atY);
        x.jump(atX);
        y.jump(atY);
        setHovered(true);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!interactive || reduce) return;
        move(event);
        setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
    >
      {PATHS.map((path, index) => (
        <motion.div
          key={index}
          data-slot="glow"
          aria-hidden="true"
          className="pointer-events-none absolute aspect-square w-[80%] min-w-[520px]"
          style={{
            ...path.at,
            background: `radial-gradient(closest-side, ${colors[index]}, transparent)`,
            opacity: 0.32 * intensity,
            willChange: 'transform',
          }}
          initial={{ x: '0%', y: '0%' }}
          animate={playing ? { x: path.x, y: path.y } : { x: '0%', y: '0%' }}
          transition={
            playing
              ? {
                  duration: path.duration / pace,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { duration: 0 }
          }
        />
      ))}
      <motion.div
        data-slot="glow-cursor"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 size-[420px] -translate-x-1/2 -translate-y-1/2"
        style={{
          x,
          y,
          background: `radial-gradient(closest-side, ${colors[0]}, transparent)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 0.18 * intensity : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {grain && (
        <div
          data-slot="glow-grain"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
      )}
      {children}
    </div>
  );
}

function GlowBackground(props: GlowBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <GlowBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { GlowBackground, type GlowBackgroundProps };
