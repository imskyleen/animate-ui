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
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';
import { useAutoHeight } from './use-auto-height';

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
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const { ref, height } = useAutoHeight<HTMLDivElement>(deps);

  // Reduced motion: the height changes at once.
  const heightTransition = reduce
    ? tokens.transition.instant
    : (transition ?? { ...tokens.spring.snappy, restDelta: 0.01 });

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
