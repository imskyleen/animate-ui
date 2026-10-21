import { defineComponent, h, type PropType } from 'vue';
import {
  CheckboxIndicator as RekaCheckboxIndicator,
  injectCheckboxRootContext,
  type CheckboxIndicatorProps as RekaCheckboxIndicatorProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  useCheckAnimation,
  type CheckAnimation,
} from '../../../utils/motion';
import {
  IndicatorContent,
  type CheckAnimationProps,
  type IndicatorAnimationProps,
} from '../../../internal/controls/indicator';

type CheckboxIndicatorProps = RekaCheckboxIndicatorProps &
  IndicatorAnimationProps &
  CheckAnimationProps;

const isOn = (value: unknown) => value === '' || value === true;

const CheckboxIndicator = defineComponent({
  name: 'CheckboxIndicator',
  inheritAttrs: false,
  props: {
    forceMount: Boolean,
    animation: String as PropType<CheckAnimation>,
    transition: Object as PropType<Transition>,
    exitTransition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const root = injectCheckboxRootContext();
    const look = useCheckAnimation(() => props.animation);

    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(
          RekaCheckboxIndicator,
          { ...attrs, forceMount: props.forceMount },
          slots,
        );
      const state = root.state.value;
      return h(ReducedMotionConfig, null, () =>
        h(
          RekaCheckboxIndicator,
          { ...attrs, forceMount: true, asChild: true },
          () =>
            h(
              IndicatorContent,
              {
                kind: 'check',
                animation: look.value,
                checked: state === true || state === 'indeterminate',
                indeterminate: state === 'indeterminate',
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
  CheckboxRoot,
  type CheckboxRootEmits,
  type CheckboxRootProps,
} from 'reka-ui';

export { CheckboxIndicator, type CheckboxIndicatorProps };
