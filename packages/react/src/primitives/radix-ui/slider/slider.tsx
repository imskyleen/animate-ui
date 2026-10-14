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

type SliderProps = SliderPrimitive.SliderProps;
type SliderTrackProps = SliderPrimitive.SliderTrackProps;
type SliderRangeProps = SliderPrimitive.SliderRangeProps & RangeAnimationProps;
type SliderThumbProps = SliderPrimitive.SliderThumbProps & ThumbAnimationProps;

type RangeAnimationProps = {
  transition?: Transition;
};

type ThumbAnimationProps = {
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
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(
    props.defaultValue ?? [props.min ?? 0],
  );
  const values = controlled ? props.value : uncontrolled;
  const wasControlledRef = React.useRef(controlled);
  React.useEffect(() => {
    if (wasControlledRef.current === controlled) return;
    const [from, to] = controlled
      ? ['uncontrolled', 'controlled']
      : ['controlled', 'uncontrolled'];
    console.warn(
      `Slider is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
    );
    wasControlledRef.current = controlled;
  }, [controlled]);

  const motionContext = useSliderRootMotion({
    disabled: props.disabled,
    valuesKey: String(values),
  });

  return (
    <SliderMotionProvider value={motionContext}>
      <SliderPrimitive.Root
        {...props}
        value={values}
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

Root.displayName = 'Slider';
Range.displayName = 'SliderRange';
Thumb.displayName = 'SliderThumb';

export {
  Root,
  Root as Slider,
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
