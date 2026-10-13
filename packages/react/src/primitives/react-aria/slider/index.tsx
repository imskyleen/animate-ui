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

type SliderFillProps = AriaSliderFillProps & {
  transition?: Transition;
};

type SliderThumbProps = AriaSliderThumbProps & {
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
  const base = typeof style?.transform === 'string' ? style.transform : '';
  const { ref: motionRef, transform } = useSliderPartMotion(
    'thumb',
    spring,
    base,
  );
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
