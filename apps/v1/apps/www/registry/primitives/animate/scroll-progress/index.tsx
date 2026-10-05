'use client';

import * as React from 'react';
import {
  motion,
  useScroll,
  useSpring,
  type MotionValue,
  type HTMLMotionProps,
  type SpringOptions,
} from 'motion/react';

import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useMotionValueState } from '@/registry/hooks/use-motion-value-state';

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

function ScrollProgressProvider({
  global = false,
  transition = { stiffness: 250, damping: 40, bounce: 0 },
  direction = 'vertical',
  ...props
}: ScrollProgressProviderProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress, scrollXProgress } = useScroll(
    global ? undefined : { container: containerRef },
  );

  const progress = direction === 'vertical' ? scrollYProgress : scrollXProgress;
  const scale = useSpring(progress, transition);

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
  mode = 'width',
  asChild = false,
  ...props
}: ScrollProgressProps) {
  const { scale, direction, global } = useScrollProgress();
  const scaleValue = useMotionValueState(scale);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      data-slot="scroll-progress"
      data-direction={direction}
      data-mode={mode}
      data-global={global}
      style={{
        ...(mode === 'width' || mode === 'height'
          ? {
              [mode]: scaleValue * 100 + '%',
            }
          : {
              [mode]: scale,
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
