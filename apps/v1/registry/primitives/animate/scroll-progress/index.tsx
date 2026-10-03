'use client';

import * as React from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type HTMLMotionProps,
  type SpringOptions,
} from 'motion/react';

import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type ScrollProgressDirection = 'horizontal' | 'vertical';

type ScrollProgressContextType = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  scale: MotionValue<number>;
  direction: ScrollProgressDirection;
  global: boolean;
};

const [LocalScrollProgressProvider, useScrollProgress] =
  getStrictContext<ScrollProgressContextType>('ScrollProgressContext');

type ScrollProgressProviderProps = {
  children: React.ReactNode;
  global?: boolean;
  transition?: SpringOptions;
  direction?: ScrollProgressDirection;
};

function ScrollProgressProvider(props: ScrollProgressProviderProps) {
  return (
    <ReducedMotionConfig>
      <ScrollProgressProviderInner {...props} />
    </ReducedMotionConfig>
  );
}

function ScrollProgressProviderInner({
  global = false,
  transition = { stiffness: 250, damping: 40, bounce: 0 },
  direction = 'vertical',
  ...props
}: ScrollProgressProviderProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useShouldReduceMotion();

  const { scrollYProgress, scrollXProgress } = useScroll(
    global ? undefined : { container: containerRef },
  );

  const progress = direction === 'vertical' ? scrollYProgress : scrollXProgress;
  const smoothed = useSpring(progress, transition);
  // Reduced motion: the bar tracks the scroll position without easing.
  const scale = reduce ? progress : smoothed;

  return (
    <LocalScrollProgressProvider
      value={{
        containerRef,
        progress,
        scale,
        direction,
        global,
      }}
      {...props}
    />
  );
}

type ScrollProgressMode = 'width' | 'height' | 'scaleY' | 'scaleX';

type ScrollProgressProps = WithAsChild<
  HTMLMotionProps<'div'> & {
    mode?: ScrollProgressMode;
  }
>;

function ScrollProgress({
  style,
  mode = 'scaleX',
  asChild = false,
  ...props
}: ScrollProgressProps) {
  const { scale, direction, global } = useScrollProgress();

  // Both are motion values: scrolling never re-renders the component.
  const transform = useTransform(scale, (value) =>
    mode === 'scaleY' ? `scaleY(${value})` : `scaleX(${value})`,
  );
  const size = useTransform(scale, (value) => `${value * 100}%`);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      data-slot="scroll-progress"
      data-direction={direction}
      data-mode={mode}
      data-global={global}
      style={{
        ...(mode === 'width' || mode === 'height'
          ? { [mode]: size }
          : {
              transform,
              transformOrigin: mode === 'scaleX' ? '0% 50%' : '50% 0%',
            }),
        ...style,
      }}
      {...props}
    />
  );
}

type ScrollProgressContainerProps = WithAsChild<HTMLMotionProps<'div'>>;

function ScrollProgressContainer({
  ref,
  asChild = false,
  ...props
}: ScrollProgressContainerProps) {
  const { containerRef, direction, global } = useScrollProgress();

  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={containerRef}
      data-slot="scroll-progress-container"
      data-direction={direction}
      data-global={global}
      {...props}
    />
  );
}

export {
  ScrollProgressProvider,
  ScrollProgress,
  ScrollProgressContainer,
  useScrollProgress,
  type ScrollProgressProviderProps,
  type ScrollProgressProps,
  type ScrollProgressContainerProps,
  type ScrollProgressDirection,
  type ScrollProgressMode,
  type ScrollProgressContextType,
};
