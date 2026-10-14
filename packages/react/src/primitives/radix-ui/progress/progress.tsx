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

type ProgressProps = ProgressPrimitive.ProgressProps;
type ProgressIndicatorProps = ProgressPrimitive.ProgressIndicatorProps &
  IndicatorAnimationProps;

type IndicatorAnimationProps = {
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
  const x =
    typeof transform === 'string'
      ? /^\s*translateX\((-?[\d.]+%)\)\s*$/.exec(transform)?.[1]
      : undefined;
  const target = x !== undefined ? { x } : transform ? { transform } : null;

  return (
    <ProgressPrimitive.Indicator {...props} asChild>
      <motion.div
        style={rest}
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

Indicator.displayName = 'ProgressIndicator';

export {
  Root,
  Root as Progress,
  Indicator,
  Indicator as ProgressIndicator,
  createProgressScope,
  type ProgressProps,
  type ProgressIndicatorProps,
};
