import {
  defineComponent,
  h,
  shallowRef,
  type Component,
  type PropType,
} from 'vue';
import {
  injectTabsRootContext,
  TabsContent as RekaTabsContent,
  TabsList as RekaTabsList,
  TabsRoot as RekaTabsRoot,
  TabsTrigger as RekaTabsTrigger,
  type TabsContentProps as RekaTabsContentProps,
  type TabsListProps as RekaTabsListProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

type TabsListProps = RekaTabsListProps & { transition?: Transition };
type TabsContentProps = RekaTabsContentProps & {
  transition?: Transition;
  exitTransition?: Transition;
};

const isOn = (value: unknown) => value === '' || value === true;

const elementOf = (node: unknown) =>
  ((node as { $el?: unknown } | null)?.$el ?? node) as HTMLElement | null;

const TabsRoot = defineComponent({
  name: 'TabsRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () => h(RekaTabsRoot, attrs, slots));
  },
}) as unknown as typeof RekaTabsRoot;

/** The list: an indicator behind the active tab slides to the next one. */
const TabsList = defineComponent({
  name: 'TabsList',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const list = shallowRef<HTMLElement | null>(null);
    const asChild = () => isOn(attrs.asChild) || isOn(attrs['as-child']);
    const { render, listProps } = useTabsIndicator(list, () => ({
      transition: props.transition,
      enabled: !asChild(),
    }));
    return () =>
      h(
        RekaTabsList,
        {
          ...attrs,
          ...listProps.value,
          ref: (node: unknown) => {
            list.value = elementOf(node);
          },
        },
        {
          default: (slotProps: Record<string, unknown>) =>
            asChild()
              ? slots.default?.(slotProps)
              : [render(), slots.default?.(slotProps)],
        },
      );
  },
}) as unknown as typeof RekaTabsList;

const TabsTrigger = defineComponent({
  name: 'TabsTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(RekaTabsTrigger as Component, { [TAB_ATTRIBUTE]: '', ...attrs }, slots);
  },
}) as unknown as typeof RekaTabsTrigger;

/** A panel: the one left fades out first, then the next fades in as the height glides. */
const TabsContent = defineComponent({
  name: 'TabsContent',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number], required: true },
    forceMount: Boolean,
    transition: Object as PropType<Transition>,
    exitTransition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const root = injectTabsRootContext();
    const active = () => root.modelValue.value === props.value;
    const { element, waiting, leaving } = usePanelMotion(active, () => ({
      transition: props.transition,
      exitTransition: props.exitTransition,
    }));
    return () =>
      h(
        RekaTabsContent,
        {
          ...attrs,
          value: props.value,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          forceMount: props.forceMount || leaving.value || undefined,
          hidden:
            isOn(attrs.hidden) ||
            waiting.value ||
            (!active() && !leaving.value) ||
            undefined,
          inert: isOn(attrs.inert) || leaving.value || undefined,
        },
        slots,
      );
  },
}) as unknown as typeof RekaTabsContent;

export {
  TabsIndicator,
  type TabsRootProps,
  type TabsRootEmits,
  type TabsTriggerProps,
} from 'reka-ui';

export {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsListProps,
  type TabsContentProps,
};
