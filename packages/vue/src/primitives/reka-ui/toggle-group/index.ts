import { defineComponent, h, ref, type Component, type PropType } from 'vue';
import {
  ToggleGroupItem as RekaToggleGroupItem,
  ToggleGroupRoot as RekaToggleGroupRoot,
  type ToggleGroupItemProps as RekaToggleGroupItemProps,
  type ToggleGroupRootProps as RekaToggleGroupRootProps,
} from 'reka-ui';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import { usePressMotion } from '../../../internal/controls/press';
import {
  toggleGroupItemProps,
  useToggleGroupHighlight,
} from '../../../internal/controls/highlight';

type ToggleGroupRootProps = RekaToggleGroupRootProps & {
  transition?: Transition;
};
type ToggleGroupItemProps = RekaToggleGroupItemProps & {
  transition?: Transition;
};

// Its required `value` comes through attrs.
const RekaItem = RekaToggleGroupItem as Component;

const isOn = (value: unknown) => value === '' || value === true;

const elementOf = (component: unknown) => {
  let node = (component as { $el?: Node } | null)?.$el ?? null;
  while (node && !(node instanceof HTMLElement)) node = node.nextSibling;
  return node;
};

const ToggleGroupRoot = defineComponent({
  name: 'ToggleGroupRoot',
  inheritAttrs: false,
  props: {
    type: String as PropType<'single' | 'multiple'>,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const root = ref<HTMLElement | null>(null);
    const groupProps = useToggleGroupHighlight(() => root.value, {
      multiple: () => props.type === 'multiple',
      transition: () => props.transition,
    });
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          RekaToggleGroupRoot,
          {
            ...attrs,
            ...groupProps,
            type: props.type,
            ref: (component: unknown) => {
              root.value = elementOf(component);
            },
          },
          slots,
        ),
      );
  },
}) as unknown as typeof RekaToggleGroupRoot;

const AnimatedItem = defineComponent({
  name: 'AnimatedToggleGroupItem',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const press = usePressMotion({
      disabled: () => isOn(attrs.disabled),
      transition: () => props.transition,
    });
    return () => {
      if (isOn(attrs.asChild) || isOn(attrs['as-child']))
        return h(RekaItem, attrs, slots);
      return h(
        RekaItem,
        { ...attrs, asChild: true },
        {
          default: (slotProps: Record<string, unknown>) =>
            h(motion.button, { ...toggleGroupItemProps, ...press.value }, () =>
              slots.default?.(slotProps),
            ),
        },
      );
    };
  },
});

const ToggleGroupItem = defineComponent({
  name: 'ToggleGroupItem',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(AnimatedItem, { ...attrs, transition: props.transition }, slots),
      );
  },
}) as unknown as typeof RekaToggleGroupItem;

export { type ToggleGroupRootEmits } from 'reka-ui';

export {
  ToggleGroupRoot,
  ToggleGroupItem,
  type ToggleGroupRootProps,
  type ToggleGroupItemProps,
};
