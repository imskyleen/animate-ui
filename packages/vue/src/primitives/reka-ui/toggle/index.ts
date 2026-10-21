import { defineComponent, h, type PropType } from 'vue';
import {
  Toggle as RekaToggle,
  type ToggleProps as RekaToggleProps,
} from 'reka-ui';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';

type ToggleProps = RekaToggleProps & { transition?: Transition };

const isOn = (value: unknown) => value === '' || value === true;

const AnimatedToggle = defineComponent({
  name: 'AnimatedToggle',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const press = usePressMotion({
      disabled: () => isOn(attrs.disabled),
      transition: () => props.transition,
    });
    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(RekaToggle, attrs, slots);
      return h(RekaToggle, { ...attrs, asChild: true }, {
        default: (slotProps: Record<string, unknown>) =>
          h(motion.button, press.value, () => slots.default?.(slotProps)),
      });
    };
  },
});

const Toggle = defineComponent({
  name: 'Toggle',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(AnimatedToggle, { ...attrs, transition: props.transition }, slots),
      );
  },
}) as unknown as typeof RekaToggle;

export { type ToggleEmits } from 'reka-ui';

export { Toggle, type ToggleProps };
