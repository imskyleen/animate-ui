'use client';

import * as React from 'react';
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

const REST_LIGHT = { x: 34, y: 28 };

type OrbBackgroundProps = React.ComponentProps<'div'> & {
  colors?: string[];
  size?: number | string;
  speed?: number;
  interactive?: boolean;
  transition?: SpringOptions;
};

function OrbBackgroundContent({
  ref,
  colors = ['#7c8cff', '#b48cff', '#6cc6ff', '#8af0d6'],
  size = 'min(70vmin, 640px)',
  speed = 1,
  interactive = true,
  transition = { stiffness: 60, damping: 18 },
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: OrbBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const orbRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const lightX = useSpring(REST_LIGHT.x, transition);
  const lightY = useSpring(REST_LIGHT.y, transition);
  const lean = useMotionValue(0);
  const leanY = useMotionValue(0);
  const shiftX = useSpring(lean, transition);
  const shiftY = useSpring(leanY, transition);
  const highlight = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.12) 22%, transparent 48%)`;
  const shadeX = useTransform(lightX, (x) => 100 - x);
  const shadeY = useTransform(lightY, (y) => 100 - y);
  const shade = useMotionTemplate`radial-gradient(circle at ${shadeX}% ${shadeY}%, rgb(0 0 0 / 0.28), transparent 55%)`;

  const ring = [...colors, colors[0]].join(', ');
  const duration = 24 / Math.max(speed, 0.01);

  return (
    <div
      ref={containerRef}
      data-slot="orb-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const orb = orbRef.current;
        if (!interactive || reduce || !orb) return;
        const rect = orb.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        lightX.set(50 + clamp(dx) * 30);
        lightY.set(50 + clamp(dy) * 30);
        lean.set(clamp(dx) * 18);
        leanY.set(clamp(dy) * 18);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        lightX.set(REST_LIGHT.x);
        lightY.set(REST_LIGHT.y);
        lean.set(0);
        leanY.set(0);
      }}
    >
      <motion.div
        ref={orbRef}
        data-slot="orb"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2"
        style={{
          width: size,
          aspectRatio: '1',
          translateX: '-50%',
          translateY: '-50%',
          x: shiftX,
          y: shiftY,
        }}
      >
        <motion.div
          data-slot="orb-glow"
          className="absolute -inset-1/4 rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${colors[0]}, transparent)`,
            filter: 'blur(48px)',
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: 0.35, scale: 0.94 }}
          animate={
            playing
              ? { opacity: [0.35, 0.55, 0.35], scale: [0.94, 1.04, 0.94] }
              : { opacity: 0.45, scale: 1 }
          }
          transition={
            playing
              ? {
                  duration: 7 / Math.max(speed, 0.01),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { duration: 0 }
          }
        />
        <div
          data-slot="orb-body"
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            isolation: 'isolate',
            boxShadow:
              'inset 0 0 0 1px rgb(255 255 255 / 0.18), inset 0 -24px 64px rgb(0 0 0 / 0.18), 0 30px 80px -20px rgb(0 0 0 / 0.25)',
          }}
        >
          <motion.div
            data-slot="orb-swirl"
            className="absolute -inset-1/4"
            style={{
              background: `conic-gradient(from 0deg at 42% 58%, ${ring})`,
              filter: 'blur(72px)',
              willChange: 'transform',
            }}
            initial={{ rotate: 0 }}
            animate={playing ? { rotate: [0, 360] } : { rotate: 0 }}
            transition={
              playing
                ? { duration, repeat: Infinity, ease: 'linear' }
                : { duration: 0 }
            }
          />
          <motion.div
            data-slot="orb-counter-swirl"
            className="absolute -inset-1/4 mix-blend-soft-light"
            style={{
              background: `conic-gradient(from 180deg, ${[...ring.split(', ')].reverse().join(', ')})`,
              filter: 'blur(80px)',
              willChange: 'transform',
            }}
            initial={{ rotate: 0 }}
            animate={playing ? { rotate: [0, -360] } : { rotate: 0 }}
            transition={
              playing
                ? { duration: duration * 1.6, repeat: Infinity, ease: 'linear' }
                : { duration: 0 }
            }
          />
          <motion.div
            data-slot="orb-shade"
            className="absolute inset-0"
            style={{ background: shade }}
          />
          <motion.div
            data-slot="orb-highlight"
            className="absolute inset-0"
            style={{ background: highlight }}
          />
        </div>
      </motion.div>
      {children}
    </div>
  );
}

function OrbBackground(props: OrbBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <OrbBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { OrbBackground, type OrbBackgroundProps };
