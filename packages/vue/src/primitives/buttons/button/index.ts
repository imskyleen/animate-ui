import { defineComponent, h, type Component, type PropType } from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot } from '../../slot';
import { SCALE_SPRING, TAP_SCALE } from '../_button';

type ButtonProps = {
  hoverScale?: number;
  tapScale?: number;
  asChild?: boolean;
  transition?: Transition;
};

const ButtonContent = defineComponent({
  name: 'ButtonContent',
  inheritAttrs: false,
  props: {
    hoverScale: { type: Number, default: 1 },
    tapScale: { type: Number, default: TAP_SCALE },
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(() => SCALE_SPRING);
    return () =>
      h(
        (props.asChild ? Slot : motion.button) as Component,
        {
          'data-slot': 'button',
          initial: reduce.value ? undefined : { transform: 'scale(1)' },
          whilePress: reduce.value
            ? undefined
            : { transform: `scale(${props.tapScale})` },
          whileHover:
            reduce.value || props.hoverScale === 1
              ? undefined
              : { transform: `scale(${props.hoverScale})` },
          transition: props.transition ?? defaultTransition.value,
          ...attrs,
        },
        slots,
      );
  },
});

/** A button that gives a little when pressed (and, optionally, hovered). */
const Button = defineComponent({
  name: 'Button',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ButtonContent as Component, attrs, slots),
      );
  },
});

export { Button, type ButtonProps };
