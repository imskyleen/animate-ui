import { defineComponent, h, type PropType } from 'vue';
import {
  injectRadioGroupItemContext,
  RadioGroupIndicator as RekaRadioGroupIndicator,
  RadioGroupItem as RekaRadioGroupItem,
  type RadioGroupIndicatorProps as RekaRadioGroupIndicatorProps,
  type RadioGroupItemProps as RekaRadioGroupItemProps,
} from 'reka-ui';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  IndicatorContent,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

type RadioGroupItemProps = RekaRadioGroupItemProps & {
  transition?: Transition;
};
type RadioGroupIndicatorProps = RekaRadioGroupIndicatorProps &
  IndicatorAnimationProps;

const isOn = (value: unknown) => value === '' || value === true;

const AnimatedItem = defineComponent({
  name: 'AnimatedRadioGroupItem',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const press = usePressMotion({
      disabled: () => isOn(attrs.disabled),
      transition: () => props.transition,
    });
    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(RekaRadioGroupItem, attrs, slots);
      return h(
        RekaRadioGroupItem,
        { ...attrs, asChild: true },
        {
          default: (slotProps: Record<string, unknown>) =>
            h(motion.button, press.value, () => slots.default?.(slotProps)),
        },
      );
    };
  },
});

const RadioGroupItem = defineComponent({
  name: 'RadioGroupItem',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(AnimatedItem, { ...attrs, transition: props.transition }, slots),
      );
  },
}) as unknown as typeof RekaRadioGroupItem;

const RadioGroupIndicator = defineComponent({
  name: 'RadioGroupIndicator',
  inheritAttrs: false,
  props: {
    forceMount: Boolean,
    transition: Object as PropType<Transition>,
    exitTransition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const item = injectRadioGroupItemContext();
    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(
          RekaRadioGroupIndicator,
          { ...attrs, forceMount: props.forceMount },
          slots,
        );
      return h(ReducedMotionConfig, null, () =>
        h(
          RekaRadioGroupIndicator,
          { ...attrs, forceMount: true, asChild: true },
          () =>
            h(
              IndicatorContent,
              {
                kind: 'dot',
                checked: item.checked.value,
                keepMounted: props.forceMount,
                transition: props.transition,
                exitTransition: props.exitTransition,
              },
              slots,
            ),
        ),
      );
    };
  },
});

export {
  RadioGroupRoot,
  type RadioGroupRootEmits,
  type RadioGroupRootProps,
  type RadioGroupItemSelectEvent,
} from 'reka-ui';

export {
  RadioGroupItem,
  RadioGroupIndicator,
  type RadioGroupItemProps,
  type RadioGroupIndicatorProps,
};
