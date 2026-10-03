'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { useDirection } from '@base-ui/react/direction-provider';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { progressTransition, revealTransform } from '../../../internal/progress';

// Same API as Base UI's Progress. Base UI sizes the indicator with a
// percentage width; the Indicator keeps it full width and reveals the value
// with an animated transform instead (the track clips it, as shadcn/ui's
// `overflow-x-hidden` track does).

/** Animate UI's additions to `Progress.Indicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the indicator moving to a new value. Defaults to
   * `spring.snappy` without bounce (600ms), which retargets smoothly.
   */
  transition?: Transition;
};

// Base UI keeps its percentage private: the Root mirrors it.
const [PercentageProvider, usePercentage] = getStrictContext<{
  percentage: number | null;
}>('Progress.Root');

function Root(props: Root.Props) {
  const { value, min = 0, max = 100 } = props;
  const percentage =
    value !== null && Number.isFinite(value) && max > min
      ? ((value - min) * 100) / (max - min)
      : null;

  return (
    <PercentageProvider value={{ percentage }}>
      <ReducedMotionConfig>
        <ProgressPrimitive.Root {...props} />
      </ReducedMotionConfig>
    </PercentageProvider>
  );
}

namespace Root {
  export type Props = ProgressPrimitive.Root.Props &
    React.RefAttributes<HTMLDivElement>;
  export type State = ProgressPrimitive.Root.State;
}

const Track = ProgressPrimitive.Track;

namespace Track {
  export type Props = ProgressPrimitive.Track.Props;
  export type State = ProgressPrimitive.Track.State;
}

function Indicator({ transition, ...props }: Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      {...props}
      // Base UI's props (className, style, data-*…) land on the motion.div;
      // it only carries the transform.
      render={(renderProps) => (
        <IndicatorMotion
          {...(renderProps as HTMLMotionProps<'div'>)}
          moveTransition={transition}
        />
      )}
    />
  );
}

namespace Indicator {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = ProgressPrimitive.Indicator.Props &
    IndicatorAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ProgressPrimitive.Indicator.State;
}

function IndicatorMotion({
  style,
  moveTransition,
  ...props
}: HTMLMotionProps<'div'> & { moveTransition: Transition | undefined }) {
  const { percentage } = usePercentage();
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const rtl = useDirection() === 'rtl';
  const move = reduce
    ? tokens.transition.instant
    : (moveTransition ?? progressTransition(tokens));

  // Indeterminate: Base UI sets no size, the styles decide.
  if (percentage === null) return <motion.div {...props} style={style} />;

  return (
    <motion.div
      {...props}
      style={{ ...style, width: '100%' }}
      // No animation on mount: it starts where the value is.
      initial={false}
      animate={{
        transform: revealTransform(percentage, rtl),
        transition: move,
      }}
    />
  );
}

const Value = ProgressPrimitive.Value;

namespace Value {
  export type Props = ProgressPrimitive.Value.Props;
  export type State = ProgressPrimitive.Value.State;
}

const Label = ProgressPrimitive.Label;

namespace Label {
  export type Props = ProgressPrimitive.Label.Props;
  export type State = ProgressPrimitive.Label.State;
}

type Status = ProgressPrimitive.Status;

export { Root, Track, Indicator, Value, Label, type Status };
