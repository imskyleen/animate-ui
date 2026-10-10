'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { PROGRESS_TRANSITION } from '../../../internal/progress';

// Same API as Radix's Progress, animated like Motion UI's progress bar: the
// indicator springs to a new value (stiffness 300, damping 35). Radix leaves
// the indicator's position to you: shadcn/ui moves it with
// `style={{ transform: translateX(…) }}` (v1 animated the same `x`). The
// Indicator animates that transform instead of jumping to it.

type ProgressProps = ProgressPrimitive.ProgressProps;
type ProgressIndicatorProps = ProgressPrimitive.ProgressIndicatorProps &
  IndicatorAnimationProps;

/** Animate UI's additions to `Progress.Indicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the indicator moving to a new value. Defaults to a spring
   * (stiffness 300, damping 35).
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
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? PROGRESS_TRANSITION);
  const { transform, ...rest } = style ?? {};
  const move = reduce ? { duration: 0 } : spring;
  // v1 animated `x`: a retarget keeps the indicator's momentum (a `transform`
  // string would restart from rest). Other transforms animate as they are.
  const x =
    typeof transform === 'string'
      ? /^\s*translateX\((-?[\d.]+%)\)\s*$/.exec(transform)?.[1]
      : undefined;
  const target = x !== undefined ? { x } : transform ? { transform } : null;

  return (
    // Radix's props (className, data-state, data-value…) land on the
    // motion.div through asChild; it only carries the transform.
    <ProgressPrimitive.Indicator {...props} asChild>
      <motion.div
        style={rest}
        // No animation on mount: it starts where the value is.
        initial={false}
        animate={target ? { ...target, transition: move } : undefined}
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
