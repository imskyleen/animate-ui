'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  PROGRESS_TRANSITION,
  VALUE_TRANSITION,
  useCountingNumber,
} from '../../../internal/progress';
import { useHydrationLocale } from '../../../internal/hydration-locale';

type IndicatorAnimationProps = {
  transition?: Transition;
};

type ValueAnimationProps = {
  transition?: Transition;
};

const [ProgressMotionProvider, useProgressMotion] = getStrictContext<{
  value: number | null;
  percentage: number | null;
  min: number;
  max: number;
  format: Intl.NumberFormatOptions | undefined;
  locale: Intl.LocalesArgument | undefined;
}>('Progress.Root');

function Root(props: Root.Props) {
  const { value, min = 0, max = 100, format } = props;
  const locale = useHydrationLocale(props.locale);
  const percentage =
    value !== null && Number.isFinite(value) && max > min
      ? Math.min(100, Math.max(0, ((value - min) * 100) / (max - min)))
      : null;

  return (
    <ProgressMotionProvider
      value={{ value, percentage, min, max, format, locale }}
    >
      <ReducedMotionConfig>
        <ProgressPrimitive.Root {...props} locale={locale} />
      </ReducedMotionConfig>
    </ProgressMotionProvider>
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
  const { percentage } = useProgressMotion();
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(moveTransition ?? PROGRESS_TRANSITION);

  if (percentage === null) return <motion.div {...props} style={style} />;

  const rest: Record<string, unknown> = { ...style };
  delete rest.width;
  return (
    <motion.div
      {...props}
      style={rest as HTMLMotionProps<'div'>['style']}
      initial={false}
      animate={{ width: `${percentage}%` }}
      transition={reduce ? { duration: 0 } : spring}
    />
  );
}

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function formatValue(
  value: number,
  { min, max, format, locale }: ReturnType<typeof useProgressMotion>,
) {
  if (format)
    return new Intl.NumberFormat(locale, format).format(
      clampValue(value, min, max),
    );
  const percentage = max > min ? ((value - min) * 100) / (max - min) : 0;
  return new Intl.NumberFormat(locale, { style: 'percent' }).format(
    clampValue(percentage, 0, 100) / 100,
  );
}

function Value({ transition, children, ...props }: Value.Props) {
  const context = useProgressMotion();
  const spring = useTempoTransition(transition ?? VALUE_TRANSITION);
  const counted = useCountingNumber(
    context.value !== null && Number.isFinite(context.value)
      ? context.value
      : context.min,
    spring,
    context.min,
  );
  const formatted = formatValue(counted, context);

  return (
    <ProgressPrimitive.Value {...props}>
      {(formattedValue, value) => {
        if (formattedValue === 'indeterminate' || value === null)
          return children ? children(formattedValue, value) : null;
        return children ? children(formatted, counted) : formatted;
      }}
    </ProgressPrimitive.Value>
  );
}

namespace Value {
  export type Props = ProgressPrimitive.Value.Props & ValueAnimationProps;
  export type State = ProgressPrimitive.Value.State;
}

const Label = ProgressPrimitive.Label;

namespace Label {
  export type Props = ProgressPrimitive.Label.Props;
  export type State = ProgressPrimitive.Label.State;
}

type Status = ProgressPrimitive.Status;

export { Root, Track, Indicator, Value, Label, type Status };
