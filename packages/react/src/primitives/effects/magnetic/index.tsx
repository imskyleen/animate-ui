'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type HTMLMotionProps,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';

type MagneticProps = WithAsChild<
  {
    children?: React.ReactNode;
    strength?: number;
    range?: number;
    springOptions?: SpringOptions;
    onlyOnHover?: boolean;
    disableOnTouch?: boolean;
    ref?: React.Ref<HTMLElement>;
  } & HTMLMotionProps<'div'>
>;

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 100,
  damping: 10,
  mass: 0.5,
};

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function subscribeToHoverCapability(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function useCanHover() {
  return React.useSyncExternalStore(
    subscribeToHoverCapability,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

function Magnetic(props: MagneticProps) {
  return (
    <ReducedMotionConfig>
      <MagneticInner {...props} />
    </ReducedMotionConfig>
  );
}

function MagneticInner({
  ref,
  strength = 0.5,
  range = 120,
  springOptions: springOptionsProp,
  onlyOnHover = false,
  disableOnTouch = true,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  asChild = false,
  ...props
}: MagneticProps) {
  const defaultSpringOptions = useTempoTransition(DEFAULT_SPRING_OPTIONS);
  const springOptions = springOptionsProp ?? defaultSpringOptions;

  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const canHover = useCanHover();
  const reduce = useShouldReduceMotion();
  const enabled = !reduce && (canHover || !disableOnTouch);

  const activeRef = React.useRef(!onlyOnHover);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springOptions);
  const y = useSpring(rawY, springOptions);

  const reset = React.useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const compute = React.useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!localRef.current) return;
      const { left, top, width, height } =
        localRef.current.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (activeRef.current && dist <= range) {
        const factor = (1 - dist / range) * strength;
        rawX.set(dx * factor);
        rawY.set(dy * factor);
      } else {
        reset();
      }
    },
    [range, strength, rawX, rawY, reset],
  );

  React.useEffect(() => {
    activeRef.current = !onlyOnHover;
  }, [onlyOnHover]);

  React.useEffect(() => {
    if (!enabled) reset();
  }, [enabled, reset]);

  React.useEffect(() => {
    const el = localRef.current;
    if (!enabled || onlyOnHover || !el) return;

    let inView = false;
    const handleMove = (e: MouseEvent) => {
      if (inView) compute(e);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      if (!inView) reset();
    });
    observer.observe(el);
    window.addEventListener('mousemove', handleMove);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMove);
      reset();
    };
  }, [compute, enabled, onlyOnHover, reset]);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef}
      style={{ display: 'inline-block', ...style, x, y }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onlyOnHover && enabled) activeRef.current = true;
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onlyOnHover) activeRef.current = false;
        reset();
        onMouseLeave?.(e);
      }}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onlyOnHover && enabled) compute(e);
        onMouseMove?.(e);
      }}
      {...props}
    />
  );
}

export { Magnetic, type MagneticProps };
