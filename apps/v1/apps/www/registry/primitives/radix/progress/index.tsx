'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { motion } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';

type ProgressContextType = {
  value: number;
};

const [ProgressProvider, useProgress] =
  getStrictContext<ProgressContextType>('ProgressContext');

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

function Progress(props: ProgressProps) {
  return (
    <ProgressProvider value={{ value: props.value ?? 0 }}>
      <ProgressPrimitive.Root data-slot="progress" {...props} />
    </ProgressProvider>
  );
}

const MotionProgressIndicator = motion.create(ProgressPrimitive.Indicator);

type ProgressIndicatorProps = React.ComponentProps<
  typeof MotionProgressIndicator
>;

function ProgressIndicator({
  transition = { type: 'spring', stiffness: 100, damping: 30 },
  ...props
}: ProgressIndicatorProps) {
  const { value } = useProgress();

  return (
    <MotionProgressIndicator
      data-slot="progress-indicator"
      animate={{ x: `-${100 - (value || 0)}%` }}
      transition={transition}
      {...props}
    />
  );
}

export {
  Progress,
  ProgressIndicator,
  useProgress,
  type ProgressProps,
  type ProgressIndicatorProps,
  type ProgressContextType,
};
