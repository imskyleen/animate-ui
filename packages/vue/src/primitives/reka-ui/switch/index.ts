import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type PropType,
} from 'vue';
import {
  injectSwitchRootContext,
  SwitchRoot as RekaSwitchRoot,
  SwitchThumb as RekaSwitchThumb,
  type SwitchThumbProps as RekaSwitchThumbProps,
} from 'reka-ui';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  SwitchPressedKey,
  useSwitchThumb,
  type ThumbAnimationProps,
} from '../../../internal/controls/thumb';

type SwitchThumbProps = RekaSwitchThumbProps & ThumbAnimationProps;

const isOn = (value: unknown) => value === '' || value === true;

const SwitchRoot = defineComponent({
  name: 'SwitchRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const pressed = ref(false);
    provide(SwitchPressedKey, pressed);
    const release = () => {
      pressed.value = false;
    };

    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(RekaSwitchRoot, attrs, slots);
      return h(RekaSwitchRoot, { ...attrs, asChild: true }, {
        default: (slotProps: Record<string, unknown>) =>
          h(
            motion.button,
            {
              onPressStart: () => {
                if (!isOn(attrs.disabled)) pressed.value = true;
              },
              onPress: release,
              onPressCancel: release,
            },
            () => slots.default?.(slotProps),
          ),
      });
    };
  },
}) as unknown as typeof RekaSwitchRoot;

const AnimatedThumb = defineComponent({
  name: 'AnimatedSwitchThumb',
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const root = injectSwitchRootContext();
    const pressed = inject(SwitchPressedKey, ref(false));
    const element = ref<HTMLElement | null>(null);
    useSwitchThumb(
      () => element.value,
      () => ({ checked: root.checked.value, pressed: pressed.value }),
      () => props.transition,
    );
    return () => h('span', { ...attrs, ref: element }, slots.default?.());
  },
});

const SwitchThumb = defineComponent({
  name: 'SwitchThumb',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(RekaSwitchThumb, attrs, slots);
      return h(ReducedMotionConfig, null, () =>
        h(RekaSwitchThumb, { ...attrs, asChild: true }, () =>
          h(AnimatedThumb, { transition: props.transition }, slots),
        ),
      );
    };
  },
});

export {
  type SwitchRootEmits,
  type SwitchRootProps,
} from 'reka-ui';

export { SwitchRoot, SwitchThumb, type SwitchThumbProps };
