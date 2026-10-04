'use client';

import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig, useTempoTransition } from '../../../utils/motion';
import {
  SLIDER_TRANSITION,
  SliderMotionProvider,
  useSliderMotion,
  useSliderPartMotion,
  useSliderRootMotion,
  useThumbStretch,
} from '../../../internal/slider';

// Same API as Radix's Slider, animated like Animate UI v1's switch thumb (v1
// had no slider): the pressed (or dragged) thumb stretches along the track,
// and a press on the track glides the thumb and the range to the new value,
// on v1's spring (stiffness 300, damping 25; see ../../../internal/slider).
// Dragging and the keyboard follow instantly.

type SliderProps = SliderPrimitive.SliderProps;
type SliderTrackProps = SliderPrimitive.SliderTrackProps;
type SliderRangeProps = SliderPrimitive.SliderRangeProps & RangeAnimationProps;
type SliderThumbProps = SliderPrimitive.SliderThumbProps & ThumbAnimationProps;

/** Animate UI's additions to `Slider.Range`. */
type RangeAnimationProps = {
  /**
   * Transition of the range after a press on the track. Defaults to a spring
   * (stiffness 300, damping 25).
   */
  transition?: Transition;
};

/** Animate UI's additions to `Slider.Thumb`. */
type ThumbAnimationProps = {
  /**
   * Transition of the thumb after a press on the track, and of its stretch
   * while pressed. Defaults to a spring (stiffness 300, damping 25).
   */
  transition?: Transition;
};

function Root(props: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <ReducedMotionConfig>
      <RootMotion {...props} />
    </ReducedMotionConfig>
  );
}

function RootMotion({
  onPointerDownCapture,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  // Mirrors the values (Radix keeps them private) to know when they change;
  // Radix stays the source of truth.
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const values = controlled ? props.value : uncontrolled;

  const motionContext = useSliderRootMotion({
    disabled: props.disabled,
    valuesKey: String(values),
  });

  return (
    <SliderMotionProvider value={motionContext}>
      <SliderPrimitive.Root
        {...props}
        onValueChange={(next) => {
          if (!controlled) setUncontrolled(next);
          props.onValueChange?.(next);
        }}
        onPointerDownCapture={(event) => {
          onPointerDownCapture?.(event);
          motionContext.startPress(event);
        }}
      />
    </SliderMotionProvider>
  );
}

const Track = SliderPrimitive.Track;

function Range({
  transition,
  children,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Range> & RangeAnimationProps) {
  const spring = useTempoTransition(transition ?? SLIDER_TRANSITION);
  const { ref, transform } = useSliderPartMotion('range', spring);

  return (
    // Radix's props (className, style, data-*…) land on the motion.span
    // through asChild; it only carries the transform.
    <SliderPrimitive.Range {...props} asChild>
      <motion.span
        ref={ref as React.Ref<HTMLSpanElement>}
        style={{ transform, transformOrigin: '0 0' }}
      >
        {children}
      </motion.span>
    </SliderPrimitive.Range>
  );
}

function Thumb({
  transition,
  onFocus,
  onBlur,
  children,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Thumb> & ThumbAnimationProps) {
  const spring = useTempoTransition(transition ?? SLIDER_TRANSITION);
  const { isPressing } = useSliderMotion();
  const [isFocused, setIsFocused] = React.useState(false);
  const { ref, transform } = useSliderPartMotion('thumb', spring);

  // Radix focuses the thumb it moves, so the pressed thumb is the focused
  // one while the pointer is down.
  const isPressed = isPressing && isFocused;
  useThumbStretch(ref, isPressed, spring);

  return (
    <SliderPrimitive.Thumb
      data-pressed={isPressed || undefined}
      {...props}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      asChild
    >
      <motion.span
        ref={ref as React.Ref<HTMLSpanElement>}
        style={{ transform }}
      >
        {children}
      </motion.span>
    </SliderPrimitive.Thumb>
  );
}

const createSliderScope: typeof SliderPrimitive.createSliderScope =
  SliderPrimitive.createSliderScope;

// Radix's unstable parts, unchanged (not animated).
const unstable_BubbleInput = SliderPrimitive.unstable_BubbleInput;
const unstable_SliderBubbleInput = SliderPrimitive.unstable_SliderBubbleInput;
const unstable_SliderThumbProvider =
  SliderPrimitive.unstable_SliderThumbProvider;
const unstable_SliderThumbTrigger = SliderPrimitive.unstable_SliderThumbTrigger;
const unstable_ThumbProvider = SliderPrimitive.unstable_ThumbProvider;
const unstable_ThumbTrigger = SliderPrimitive.unstable_ThumbTrigger;
type unstable_SliderBubbleInputProps =
  SliderPrimitive.unstable_SliderBubbleInputProps;
type unstable_SliderThumbProviderProps =
  SliderPrimitive.unstable_SliderThumbProviderProps;
type unstable_SliderThumbTriggerProps =
  SliderPrimitive.unstable_SliderThumbTriggerProps;

export {
  Root,
  Track,
  Range,
  Thumb,
  Track as SliderTrack,
  Range as SliderRange,
  Thumb as SliderThumb,
  createSliderScope,
  unstable_BubbleInput,
  unstable_SliderBubbleInput,
  unstable_SliderThumbProvider,
  unstable_SliderThumbTrigger,
  unstable_ThumbProvider,
  unstable_ThumbTrigger,
  type SliderProps,
  type SliderTrackProps,
  type SliderRangeProps,
  type SliderThumbProps,
  type unstable_SliderBubbleInputProps,
  type unstable_SliderThumbProviderProps,
  type unstable_SliderThumbTriggerProps,
};
