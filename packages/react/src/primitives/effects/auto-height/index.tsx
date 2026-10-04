'use client';

import * as React from 'react';
import {
  motion,
  type HTMLMotionProps,
  type LegacyAnimationControls,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';
import { useAutoHeight } from './use-auto-height';

/** Animate UI v1's spring. */
const AUTO_HEIGHT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  bounce: 0,
  restDelta: 0.01,
};

type AutoHeightProps = WithAsChild<
  {
    children: React.ReactNode;
    deps?: React.DependencyList;
    animate?: TargetAndTransition | LegacyAnimationControls;
    transition?: Transition;
  } & Omit<HTMLMotionProps<'div'>, 'animate'>
>;

function AutoHeight(props: AutoHeightProps) {
  return (
    <ReducedMotionConfig>
      <AutoHeightInner {...props} />
    </ReducedMotionConfig>
  );
}

function AutoHeightInner({
  children,
  deps = [],
  transition,
  style,
  animate,
  asChild = false,
  ...props
}: AutoHeightProps) {
  const spring = useTempoTransition(transition ?? AUTO_HEIGHT_TRANSITION);
  const reduce = useShouldReduceMotion();
  const { ref, height } = useAutoHeight<HTMLDivElement>(deps);

  // Reduced motion: the height changes at once.
  const heightTransition: Transition = reduce ? { duration: 0 } : spring;

  const Comp = asChild ? Slot : motion.div;

  return (
    <Comp
      style={{ overflow: 'hidden', ...style }}
      animate={{ height, ...animate }}
      transition={heightTransition}
      {...props}
    >
      <div ref={ref}>{children}</div>
    </Comp>
  );
}

export { AutoHeight, type AutoHeightProps };
