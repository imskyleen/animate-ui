'use client';

import * as React from 'react';
import {
  Slider as AriaSlider,
  SliderFill as AriaSliderFill,
  SliderThumb as AriaSliderThumb,
  type SliderFillProps as AriaSliderFillProps,
  type SliderProps,
  type SliderThumbProps as AriaSliderThumbProps,
} from 'react-aria-components';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig, useTempoTransition } from '../../../utils/motion';
import {
  SLIDER_TRANSITION,
  SliderMotionProvider,
  assignRef,
  useSliderPartMotion,
  useSliderRootMotion,
  useThumbStretch,
} from '../../../internal/slider';

// Same API as React Aria's Slider, SliderFill and SliderThumb, animated like
// Animate UI v1's switch thumb (v1 had no slider): the dragged thumb stretches
// along the track, and a press on the track glides the thumb and the fill to
// the new value, on v1's spring (stiffness 300, damping 25; see
// ../../../internal/slider). Dragging and the keyboard follow instantly. The
// animated elements are React Aria's own, through its `render` prop.

type SliderFillProps = AriaSliderFillProps & {
  /**
   * Transition of the fill after a press on the track. Defaults to a spring
   * (stiffness 300, damping 25).
   */
  transition?: Transition;
};

type SliderThumbProps = AriaSliderThumbProps & {
  /**
   * Transition of the thumb after a press on the track, and of its stretch
   * while dragged. Defaults to a spring (stiffness 300, damping 25).
   */
  transition?: Transition;
};

function Slider<T extends number | number[]>(
  props: SliderProps<T> & React.RefAttributes<HTMLDivElement>,
) {
  return (
    <ReducedMotionConfig>
      <SliderRoot {...props} />
    </ReducedMotionConfig>
  );
}

function SliderRoot<T extends number | number[]>({
  render,
  onChange,
  ...props
}: SliderProps<T> & React.RefAttributes<HTMLDivElement>) {
  // Mirrors the value (React Aria keeps it in its state) to know when it
  // changes; React Aria stays the source of truth.
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = controlled ? props.value : uncontrolled;

  const motionContext = useSliderRootMotion({
    disabled: props.isDisabled,
    valuesKey: String(value),
  });

  return (
    <SliderMotionProvider value={motionContext}>
      <AriaSlider
        {...props}
        onChange={(next) => {
          if (!controlled) setUncontrolled(next);
          onChange?.(next);
        }}
        render={(domProps, renderProps) => {
          const element = {
            ...domProps,
            // Presses on the track (and the thumbs) start here.
            onPointerDownCapture: (
              event: React.PointerEvent<HTMLDivElement>,
            ) => {
              domProps.onPointerDownCapture?.(event);
              motionContext.startPress(event);
            },
          };
          return render ? render(element, renderProps) : <div {...element} />;
        }}
      />
    </SliderMotionProvider>
  );
}

function SliderFill({
  transition,
  render,
  ...props
}: SliderFillProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <AriaSliderFill
      {...props}
      render={(domProps, renderProps) =>
        // A custom `render` keeps working, without the animation.
        render ? (
          render(domProps, renderProps)
        ) : (
          <FillMotion
            {...(domProps as HTMLMotionProps<'div'>)}
            partTransition={transition}
          />
        )
      }
    />
  );
}

function FillMotion({
  ref,
  style,
  partTransition,
  ...props
}: HTMLMotionProps<'div'> & { partTransition: Transition | undefined }) {
  const spring = useTempoTransition(partTransition ?? SLIDER_TRANSITION);
  const { ref: motionRef, transform } = useSliderPartMotion('range', spring);

  return (
    <motion.div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        motionRef.current = node;
        assignRef(ref as React.Ref<HTMLDivElement>, node);
      }}
      style={{ ...style, transform, transformOrigin: '0 0' }}
    />
  );
}

function SliderThumb({
  transition,
  render,
  ...props
}: SliderThumbProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <AriaSliderThumb
      {...props}
      render={(domProps, renderProps) =>
        render ? (
          render(domProps, renderProps)
        ) : (
          <ThumbMotion
            {...(domProps as HTMLMotionProps<'div'>)}
            isDragging={renderProps.isDragging}
            partTransition={transition}
          />
        )
      }
    />
  );
}

function ThumbMotion({
  ref,
  style,
  isDragging,
  partTransition,
  ...props
}: HTMLMotionProps<'div'> & {
  isDragging: boolean;
  partTransition: Transition | undefined;
}) {
  const spring = useTempoTransition(partTransition ?? SLIDER_TRANSITION);
  // React Aria centers the thumb with its own transform: ours goes after it.
  const base = typeof style?.transform === 'string' ? style.transform : '';
  const { ref: motionRef, transform } = useSliderPartMotion(
    'thumb',
    spring,
    base,
  );
  // React Aria drags the thumb a press on the track moved, too.
  useThumbStretch(motionRef, isDragging, spring);

  return (
    <motion.div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        motionRef.current = node;
        assignRef(ref as React.Ref<HTMLDivElement>, node);
      }}
      style={{ ...style, transform }}
    />
  );
}

export {
  Slider,
  SliderFill,
  SliderThumb,
  type SliderFillProps,
  type SliderThumbProps,
};
