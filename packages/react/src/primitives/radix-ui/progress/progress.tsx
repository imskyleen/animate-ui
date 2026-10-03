'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { progressTransition } from '../../../internal/progress';

// Same API as Radix's Progress. Radix leaves the indicator's position to
// you: shadcn/ui moves it with `style={{ transform: translateX(…) }}`. The
// Indicator animates that transform instead of jumping to it.

type ProgressProps = ProgressPrimitive.ProgressProps;
type ProgressIndicatorProps = ProgressPrimitive.ProgressIndicatorProps &
  IndicatorAnimationProps;

/** Animate UI's additions to `Progress.Indicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the indicator moving to a new value. Defaults to
   * `spring.snappy` without bounce (600ms), which retargets smoothly.
   */
  transition?: Transition;
};

const Root = ProgressPrimitive.Root;

function Indicator(
  props: React.ComponentProps<typeof ProgressPrimitive.Indicator> &
    IndicatorAnimationProps,
) {
  return (
    <ReducedMotionConfig>
      <IndicatorMotion {...props} />
    </ReducedMotionConfig>
  );
}

function IndicatorMotion({
  style,
  transition,
  children,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Indicator> &
  IndicatorAnimationProps) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const { transform, ...rest } = style ?? {};
  const move = reduce
    ? tokens.transition.instant
    : (transition ?? progressTransition(tokens));

  return (
    // Radix's props (className, data-state, data-value…) land on the
    // motion.div through asChild; it only carries the transform.
    <ProgressPrimitive.Indicator {...props} asChild>
      <motion.div
        style={rest}
        // No animation on mount: it starts where the value is.
        initial={false}
        animate={transform ? { transform, transition: move } : undefined}
      >
        {children}
      </motion.div>
    </ProgressPrimitive.Indicator>
  );
}

const createProgressScope: typeof ProgressPrimitive.createProgressScope =
  ProgressPrimitive.createProgressScope;

export {
  Root,
  Indicator,
  Indicator as ProgressIndicator,
  createProgressScope,
  type ProgressProps,
  type ProgressIndicatorProps,
};
