'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { type Transition } from 'motion/react';

import { ReducedMotionConfig, useTempoTransition } from '../../../utils/motion';
import {
  SLIDER_TRANSITION,
  SliderMotionProvider,
  assignRef,
  useSliderMotion,
  useSliderPartMotion,
  useSliderRootMotion,
  useThumbStretch,
} from '../../../internal/slider';
import { useHydrationLocale } from '../../../internal/hydration-locale';
import { motionRender } from '../../../internal/modal-motion';

type IndicatorAnimationProps = {
  transition?: Transition;
};

type ThumbAnimationProps = {
  transition?: Transition;
};

type SliderValue = number | readonly number[];

function Root<Value extends SliderValue = SliderValue>(
  props: Root.Props<Value>,
) {
  return (
    <ReducedMotionConfig>
      <RootMotion {...(props as unknown as Root.Props)} />
    </ReducedMotionConfig>
  );
}

function RootMotion(props: Root.Props) {
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = controlled ? props.value : uncontrolled;

  const locale = useHydrationLocale(props.locale);
  const motionContext = useSliderRootMotion({
    disabled: props.disabled,
    valuesKey: String(value),
  });

  return (
    <SliderMotionProvider value={motionContext}>
      <SliderPrimitive.Root
        {...props}
        locale={locale}
        onValueChange={(next, details) => {
          props.onValueChange?.(next, details);
          if (!controlled && !details.isCanceled) setUncontrolled(next);
        }}
      />
    </SliderMotionProvider>
  );
}

namespace Root {
  export type State = SliderPrimitive.Root.State;
  export type Props<Value extends SliderValue = SliderValue> =
    SliderPrimitive.Root.Props<Value> & React.RefAttributes<HTMLDivElement>;
  export type ChangeEventReason = SliderPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = SliderPrimitive.Root.ChangeEventDetails;
  export type CommitEventReason = SliderPrimitive.Root.CommitEventReason;
  export type CommitEventDetails = SliderPrimitive.Root.CommitEventDetails;
}

const Label = SliderPrimitive.Label;

namespace Label {
  export type Props = SliderPrimitive.Label.Props;
  export type State = SliderPrimitive.Label.State;
}

const Value = SliderPrimitive.Value;

namespace Value {
  export type Props = SliderPrimitive.Value.Props;
  export type State = SliderPrimitive.Value.State;
}

function Control({ onPointerDownCapture, ...props }: Control.Props) {
  const { startPress } = useSliderMotion();

  return (
    <SliderPrimitive.Control
      {...props}
      onPointerDownCapture={(event) => {
        onPointerDownCapture?.(event);
        startPress(event);
      }}
    />
  );
}

namespace Control {
  export type Props = SliderPrimitive.Control.Props &
    React.RefAttributes<HTMLDivElement>;
  export type State = SliderPrimitive.Control.State;
}

const Track = SliderPrimitive.Track;

namespace Track {
  export type Props = SliderPrimitive.Track.Props;
  export type State = SliderPrimitive.Track.State;
}

function Indicator({ ref, transition, render, ...props }: Indicator.Props) {
  const spring = useTempoTransition(transition ?? SLIDER_TRANSITION);
  const { ref: motionRef, transform } = useSliderPartMotion('range', spring);

  return (
    <SliderPrimitive.Indicator
      {...props}
      render={motionRender(render, {
        ref: (node: HTMLDivElement | null) => {
          motionRef.current = node;
          assignRef(ref, node);
        },
        style: { transform, transformOrigin: '0 0' },
      })}
    />
  );
}

namespace Indicator {
  export type Props = SliderPrimitive.Indicator.Props &
    IndicatorAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = SliderPrimitive.Indicator.State;
}

function Thumb({
  ref,
  transition,
  onFocus,
  onBlur,
  render,
  ...props
}: Thumb.Props) {
  const spring = useTempoTransition(transition ?? SLIDER_TRANSITION);
  const { isPressing } = useSliderMotion();
  const [isFocused, setIsFocused] = React.useState(false);
  const { ref: motionRef, transform } = useSliderPartMotion('thumb', spring);

  const isPressed = isPressing && isFocused;
  useThumbStretch(motionRef, isPressed, spring);

  return (
    <SliderPrimitive.Thumb
      {...props}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      render={motionRender(render, {
        ref: (node: HTMLDivElement | null) => {
          motionRef.current = node;
          assignRef(ref, node);
        },
        'data-pressed': isPressed || undefined,
        style: { transform },
      })}
    />
  );
}

namespace Thumb {
  export type Props = SliderPrimitive.Thumb.Props &
    ThumbAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = SliderPrimitive.Thumb.State;
}

export { Root, Label, Value, Control, Track, Indicator, Thumb };
