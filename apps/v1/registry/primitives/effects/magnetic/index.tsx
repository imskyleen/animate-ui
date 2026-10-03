'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  type HTMLMotionProps,
} from 'motion/react';

import {
  ReducedMotionConfig,
  spring,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

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
  duration: spring.default.duration,
  bounce: spring.default.bounce,
};

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function subscribeToHoverCapability(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True only when the primary pointer can hover precisely (mouse, trackpad). */
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
  springOptions = DEFAULT_SPRING_OPTIONS,
  onlyOnHover = false,
  disableOnTouch = true,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  asChild = false,
  ...props
}: MagneticProps) {
  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const canHover = useCanHover();
  const reduce = useShouldReduceMotion();
  const enabled = !reduce && (canHover || !disableOnTouch);

  const activeRef = React.useRef(!onlyOnHover);
  // Untransformed center of the element, measured lazily after scroll/resize.
  const centerRef = React.useRef<{ x: number; y: number } | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springOptions);
  const y = useSpring(rawY, springOptions);
  const transform = useTransform(
    [x, y],
    ([latestX, latestY]: number[]) =>
      `translate3d(${latestX}px, ${latestY}px, 0)`,
  );

  const reset = React.useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const compute = React.useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const el = localRef.current;
      if (!el) return;

      if (!centerRef.current) {
        const { left, top, width, height } = el.getBoundingClientRect();
        // Remove the current magnetic offset so the pull doesn't feed back.
        centerRef.current = {
          x: left - x.get() + width / 2,
          y: top - y.get() + height / 2,
        };
      }

      const dx = e.clientX - centerRef.current.x;
      const dy = e.clientY - centerRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (activeRef.current && dist <= range) {
        const factor = (1 - dist / range) * strength;
        rawX.set(dx * factor);
        rawY.set(dy * factor);
      } else {
        reset();
      }
    },
    [range, strength, rawX, rawY, x, y, reset],
  );

  React.useEffect(() => {
    activeRef.current = !onlyOnHover;
  }, [onlyOnHover]);

  React.useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const invalidate = () => {
      centerRef.current = null;
    };
    window.addEventListener('scroll', invalidate, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', invalidate, { passive: true });

    return () => {
      window.removeEventListener('scroll', invalidate, { capture: true });
      window.removeEventListener('resize', invalidate);
    };
  }, [enabled, reset]);

  React.useEffect(() => {
    // `onlyOnHover` reads the pointer from the element's own events.
    const el = localRef.current;
    if (!enabled || onlyOnHover || !el) return;

    let inView = false;
    // Only track the pointer while the element is on screen.
    const handleMove = (e: PointerEvent) => {
      if (inView) compute(e);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      centerRef.current = null;
      if (!inView) reset();
    });
    observer.observe(el);
    window.addEventListener('pointermove', handleMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', handleMove);
      reset();
    };
  }, [compute, enabled, onlyOnHover, reset]);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef}
      style={{ display: 'inline-block', ...style, transform }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onlyOnHover && enabled) {
          activeRef.current = true;
          centerRef.current = null;
        }
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
