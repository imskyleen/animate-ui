'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';
import {
  PRESSED_SCALE,
  SliderMotionProvider,
  assignRef,
  useSliderMotion,
  usePressScale,
  useSliderPartMotion,
  useSliderRootMotion,
} from '../../../internal/slider';

// Same API as Base UI's Slider. Dragging and the keyboard follow instantly; a
// press on the track glides the thumb and the indicator to the new value
// (FLIP on transforms, see ../../../internal/slider), and the pressed thumb grows.

/** Animate UI's additions to `Slider.Indicator`. */
type IndicatorAnimationProps = {
  /** Transition of the indicator after a press on the track. Defaults to `spring.snappy`. */
  transition?: Transition;
};

/** Animate UI's additions to `Slider.Thumb`. */
type ThumbAnimationProps = {
  /** Transition of the thumb after a press on the track, and of its press scale. Defaults to `spring.snappy`. */
  transition?: Transition;
  /** Scale of the thumb while it is pressed or dragged. Defaults to `1.15`. */
  pressedScale?: number;
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
  // Mirrors the value (Base UI keeps it private) to know when it changes;
  // Base UI stays the source of truth.
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = controlled ? props.value : uncontrolled;

  const motionContext = useSliderRootMotion({
    disabled: props.disabled,
    valuesKey: String(value),
  });

  return (
    <SliderMotionProvider value={motionContext}>
      <SliderPrimitive.Root
        {...props}
        onValueChange={(next, details) => {
          props.onValueChange?.(next, details);
          // Base UI lets the handler cancel the change.
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
      // Presses on the track (and the thumbs) start here.
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

function Indicator({ ref, transition, ...props }: Indicator.Props) {
  const tokens = useMotionTokens();
  const { ref: motionRef, transform } = useSliderPartMotion(
    'range',
    transition ?? tokens.spring.snappy,
  );

  return (
    <SliderPrimitive.Indicator
      {...props}
      // Base UI's props (className, style, data-*…) land on the motion.div;
      // it only carries the transform.
      render={
        <motion.div
          ref={(node: HTMLDivElement | null) => {
            motionRef.current = node;
            assignRef(ref, node);
          }}
          style={{ transform, transformOrigin: '0 0' }}
        />
      }
    />
  );
}

namespace Indicator {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = SliderPrimitive.Indicator.Props &
    IndicatorAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = SliderPrimitive.Indicator.State;
}

function Thumb({
  ref,
  transition,
  pressedScale = PRESSED_SCALE,
  onFocus,
  onBlur,
  ...props
}: Thumb.Props) {
  const tokens = useMotionTokens();
  const t = transition ?? tokens.spring.snappy;
  const { isPressing } = useSliderMotion();
  const [isFocused, setIsFocused] = React.useState(false);
  const { ref: motionRef, transform, press } = useSliderPartMotion('thumb', t);

  // Base UI focuses the thumb it moves, so the pressed thumb is the focused
  // one while the pointer is down.
  const isPressed = isPressing && isFocused;
  usePressScale(press, isPressed, { transition: t, pressedScale });

  return (
    <SliderPrimitive.Thumb
      {...props}
      // Base UI forwards focus handlers to the thumb's nested input.
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      render={
        <motion.div
          ref={(node: HTMLDivElement | null) => {
            motionRef.current = node;
            assignRef(ref, node);
          }}
          data-pressed={isPressed || undefined}
          // Composes with the `translate` Base UI centers the thumb with.
          style={{ transform }}
        />
      }
    />
  );
}

namespace Thumb {
  /** Base UI's props, plus Animate UI's `transition` and `pressedScale`. */
  export type Props = SliderPrimitive.Thumb.Props &
    ThumbAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = SliderPrimitive.Thumb.State;
}

export { Root, Label, Value, Control, Track, Indicator, Thumb };
