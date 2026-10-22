import {
  Comment,
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Highlight, HighlightItem } from '../effects/highlight';
import { Slot } from '../slot';
import { layoutHeight } from '../../internal/screen-scale';
import { callHandler } from '../../internal/handlers';

type TabsOrientation = 'horizontal' | 'vertical';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.selection;
const CONTENTS_TRANSITION: Transition = motionTokens.spring.slide;
const CONTENT_TRANSITION: Transition = motionTokens.spring.selection;

const INSTANT: Transition = { duration: 0 };

type TabsContextType = {
  activeValue: () => string | undefined;
  handleValueChange: (value: string) => void;
  registerTrigger: (value: string, node: HTMLElement | null) => void;
  orientation: () => TabsOrientation;
  getTriggerId: (value: string) => string;
  getContentId: (value: string) => string;
  getTriggerValue: (node: HTMLElement) => string | undefined;
  registerId: (
    kind: 'trigger' | 'content',
    value: string,
    id: string | undefined,
  ) => void;
};

const TabsKey: InjectionKey<TabsContextType> = Symbol('AnimateUITabs');

function useTabs() {
  const context = inject(TabsKey, null);
  if (!context) throw new Error('useTabs must be used within Tabs');
  return context;
}

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

const flatten = (nodes: VNode[] = []): VNode[] =>
  nodes.flatMap((node) =>
    node.type === Fragment
      ? flatten(node.children as VNode[])
      : node.type === Comment
        ? []
        : [node],
  );

function toIdPart(value: string) {
  return value.replace(/\s+/g, '-');
}

function isEnabled(tab: HTMLElement) {
  return (
    !tab.hasAttribute('disabled') &&
    tab.getAttribute('aria-disabled') !== 'true'
  );
}

type TabsProps = {
  modelValue?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
};

/** Tabs whose highlight slides to the selected one and whose panels slide in turn. */
const Tabs = defineComponent({
  name: 'Tabs',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    orientation: {
      type: String as PropType<TabsOrientation>,
      default: 'horizontal',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const baseId = useId();
    const own = ref<string | undefined>(props.defaultValue);
    const triggers = new Map<string, HTMLElement>();
    let initialSet = false;
    const isControlled = () => props.modelValue !== undefined;

    const registerTrigger = (value: string, node: HTMLElement | null) => {
      if (node) {
        triggers.set(value, node);
        if (!isControlled() && own.value === undefined && !initialSet) {
          own.value = value;
          initialSet = true;
        }
      } else triggers.delete(value);
    };

    const handleValueChange = (value: string) => {
      if (!isControlled()) own.value = value;
      emit('update:modelValue', value);
    };

    const customIds = ref<
      Record<string, { trigger?: string; content?: string }>
    >({});
    const registerId = (
      kind: 'trigger' | 'content',
      value: string,
      id: string | undefined,
    ) => {
      if (customIds.value[value]?.[kind] === id) return;
      customIds.value = {
        ...customIds.value,
        [value]: { ...customIds.value[value], [kind]: id },
      };
    };

    provide(TabsKey, {
      activeValue: () => props.modelValue ?? own.value,
      handleValueChange,
      registerTrigger,
      orientation: () => props.orientation,
      getTriggerId: (value) =>
        customIds.value[value]?.trigger ??
        `${baseId}-trigger-${toIdPart(value)}`,
      getContentId: (value) =>
        customIds.value[value]?.content ??
        `${baseId}-content-${toIdPart(value)}`,
      getTriggerValue: (node) => {
        for (const [value, el] of triggers) if (el === node) return value;
        return undefined;
      },
      registerId,
    });

    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          'div',
          {
            'data-slot': 'tabs',
            'data-orientation': props.orientation,
            ...attrs,
          },
          slots.default?.(),
        ),
      );
  },
});

type TabsHighlightProps = {
  transition?: Transition;
  exitDelay?: number;
};

/** The highlight that slides to the selected tab. */
const TabsHighlight = defineComponent({
  name: 'TabsHighlight',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
    exitDelay: { type: Number, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const { activeValue } = useTabs();
    return () =>
      h(
        Highlight as Component,
        {
          'data-slot': 'tabs-highlight',
          controlledItems: true,
          modelValue: activeValue() ?? null,
          transition: props.transition ?? HIGHLIGHT_TRANSITION,
          ...(props.exitDelay !== undefined
            ? { exitDelay: props.exitDelay }
            : {}),
          click: false,
          ...attrs,
        },
        slots,
      );
  },
});

/** The row (or column) of tabs. */
const TabsList = defineComponent({
  name: 'TabsList',
  setup(_, { slots }) {
    const { orientation } = useTabs();
    return () =>
      h(
        'div',
        {
          role: 'tablist',
          'aria-orientation': orientation(),
          'data-slot': 'tabs-list',
          'data-orientation': orientation(),
        },
        slots.default?.(),
      );
  },
});

type TabsHighlightItemProps = {
  value: string;
};

/** A tab's place under the highlight. */
const TabsHighlightItem = defineComponent({
  name: 'TabsHighlightItem',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        HighlightItem as Component,
        { 'data-slot': 'tabs-highlight-item', ...attrs },
        slots,
      );
  },
});

type TabsTriggerProps = {
  value: string;
  asChild?: boolean;
};

/** A tab. Arrow keys, Home and End move between tabs. */
const TabsTrigger = defineComponent({
  name: 'TabsTrigger',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabs();
    const element = shallowRef<HTMLElement | null>(null);

    watch(
      () => [props.value, attrs.id as string | undefined] as const,
      ([value, id], _, onCleanup) => {
        tabs.registerId('trigger', value, id);
        onCleanup(() => tabs.registerId('trigger', value, undefined));
      },
      { immediate: true },
    );

    watch(
      () => [props.value, element.value] as const,
      ([value, node], _, onCleanup) => {
        if (!node) return;
        tabs.registerTrigger(value, node);
        onCleanup(() => tabs.registerTrigger(value, null));
      },
      { immediate: true, flush: 'post' },
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      callHandler(attrs.onKeydown, event);
      if (event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const current = event.currentTarget as HTMLElement;
      const list = current.closest('[role="tablist"]');
      if (!list) return;
      const rtl = getComputedStyle(list).direction === 'rtl';
      const orientation = tabs.orientation();
      const next =
        orientation === 'vertical'
          ? 'ArrowDown'
          : rtl
            ? 'ArrowLeft'
            : 'ArrowRight';
      const prev =
        orientation === 'vertical'
          ? 'ArrowUp'
          : rtl
            ? 'ArrowRight'
            : 'ArrowLeft';
      if (![next, prev, 'Home', 'End'].includes(event.key)) return;
      const all = Array.from(
        list.querySelectorAll<HTMLElement>('[role="tab"]'),
      ).filter(
        (tab) =>
          tab.closest('[role="tablist"]') === list &&
          (tab === current || isEnabled(tab)),
      );
      const index = all.indexOf(current);
      if (index === -1) return;
      const count = all.length;
      const targetIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? count - 1
            : (index + (event.key === next ? 1 : -1) + count) % count;
      const target = all[targetIndex];
      event.preventDefault();
      if (!target) return;
      target.focus();
      const targetValue = tabs.getTriggerValue(target);
      if (targetValue !== undefined) tabs.handleValueChange(targetValue);
    };

    return () => {
      const isActive = tabs.activeValue() === props.value;
      return h(
        (props.asChild ? Slot : motion.button) as Component,
        {
          id: (attrs.id as string | undefined) ?? tabs.getTriggerId(props.value),
          'data-slot': 'tabs-trigger',
          role: 'tab',
          type: 'button',
          'aria-selected': isActive,
          'aria-controls': tabs.getContentId(props.value),
          tabindex: isActive ? 0 : -1,
          'data-state': isActive ? 'active' : 'inactive',
          'data-orientation': tabs.orientation(),
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event);
            if (!event.defaultPrevented) tabs.handleValueChange(props.value);
          },
          onKeydown: handleKeyDown,
        },
        slots,
      );
    };
  },
});

type TabsContentsProps = {
  transition?: Transition;
};

type HeightState = { value: number; animate: boolean; index: number };

/** Holds the panels side by side: they slide to the selected one, and the height follows. */
const TabsContents = defineComponent({
  name: 'TabsContents',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const { activeValue } = useTabs();
    const spring = useTempoTransition(
      () => props.transition ?? CONTENTS_TRANSITION,
    );
    const reduce = useShouldReduceMotion();
    const transition = computed<Transition>(() =>
      reduce.value ? INSTANT : spring.value,
    );

    const container = shallowRef<HTMLElement | null>(null);
    const items: Array<HTMLElement | null> = [];
    const activeIndex = ref(-1);
    const count = ref(0);
    const heightState = shallowRef<HeightState | null>(null);
    const rtl = ref(false);

    const setHeight = (value: number, index: number, glide = false) => {
      const previous = heightState.value;
      if (previous?.value !== value)
        heightState.value = {
          value,
          animate: previous !== null && (glide || previous.value > 0),
          index: previous?.index ?? index,
        };
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const now = heightState.value;
          if (now && !now.animate && now.value > 0)
            heightState.value = { ...now, animate: true };
        }),
      );
    };

    const measure = (index: number) => {
      const pane = items[index];
      const box = container.value;
      if (!pane || !box) return 0;
      const base = layoutHeight(pane);
      const cs = getComputedStyle(box);
      const isBorderBox = cs.boxSizing === 'border-box';
      const paddingY =
        (parseFloat(cs.paddingTop || '0') || 0) +
        (parseFloat(cs.paddingBottom || '0') || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || '0') || 0) +
        (parseFloat(cs.borderBottomWidth || '0') || 0);
      const total = base + (isBorderBox ? paddingY + borderY : 0);
      const dpr = window.devicePixelRatio || 1;
      return Math.ceil(total * dpr) / dpr;
    };

    watch(
      [activeIndex, container],
      ([index, box]) => {
        if (!box) return;
        const next = getComputedStyle(box).direction === 'rtl';
        if (next !== rtl.value) rtl.value = next;
        if (heightState.value === null && index >= 0) {
          const first = measure(index);
          if (first > 0) setHeight(first, index);
          else if (box.getClientRects().length)
            heightState.value = { value: 0, animate: false, index };
        }
      },
      { flush: 'post' },
    );

    watch(
      [activeIndex, count, container],
      ([index, , box], _, onCleanup) => {
        const pane = items[index];
        if (!pane || !box) return;
        const first = measure(index);
        if (first > 0) setHeight(first, index, true);
        const ro = new ResizeObserver(() => {
          const next = measure(index);
          if (next > 0) requestAnimationFrame(() => setHeight(next, index));
        });
        ro.observe(pane);
        ro.observe(box);
        onCleanup(() => ro.disconnect());
      },
      { flush: 'post' },
    );

    onBeforeUnmount(() => (items.length = 0));

    return () => {
      const children = flatten(slots.default?.());
      const active = activeValue();
      const index = children.findIndex(
        (child) => (child.props as { value?: string } | null)?.value === active,
      );
      activeIndex.value = index;
      count.value = children.length;
      const shownIndex = active === undefined ? 0 : index;
      const state = heightState.value;
      return h(
        motion.div as Component,
        {
          'data-slot': 'tabs-contents',
          animate: { height: state?.value ?? 'auto' },
          transition: state?.animate ? transition.value : INSTANT,
          ...attrs,
          ref: (node: unknown) => {
            container.value = elementOf(node);
          },
          style: [attrs.style, { overflow: 'hidden' }],
        },
        () =>
          h(
            motion.div as Component,
            {
              style: { display: 'flex', marginInline: '-8px' },
              animate: { x: index * (rtl.value ? 100 : -100) + '%' },
              transition: transition.value,
            },
            () =>
              children.map((child, i) =>
                h(
                  'div',
                  {
                    key: i,
                    ref: (el: unknown) => {
                      items[i] = el as HTMLElement | null;
                    },
                    style: {
                      width: '100%',
                      flexShrink: 0,
                      paddingInline: '8px',
                      height: '100%',
                      ...(!state?.animate &&
                      i !== shownIndex &&
                      i !== state?.index
                        ? { maxHeight: '0px', overflow: 'hidden' }
                        : null),
                    },
                  },
                  [child],
                ),
              ),
          ),
      );
    };
  },
});

type TabsContentProps = {
  value: string;
  asChild?: boolean;
};

/** A panel: the panels not selected blur. */
const TabsContent = defineComponent({
  name: 'TabsContent',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabs();
    const blur = useTempoTransition(() => CONTENT_TRANSITION);
    watch(
      () => [props.value, attrs.id as string | undefined] as const,
      ([value, id], _, onCleanup) => {
        tabs.registerId('content', value, id);
        onCleanup(() => tabs.registerId('content', value, undefined));
      },
      { immediate: true },
    );
    return () => {
      const isActive = tabs.activeValue() === props.value;
      return h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          role: 'tabpanel',
          id:
            (attrs.id as string | undefined) ?? tabs.getContentId(props.value),
          'aria-labelledby': tabs.getTriggerId(props.value),
          tabindex: isActive ? 0 : -1,
          'data-slot': 'tabs-content',
          'data-state': isActive ? 'active' : 'inactive',
          inert: !isActive || undefined,
          initial: { filter: 'blur(0px)' },
          animate: { filter: isActive ? 'blur(0px)' : 'blur(4px)' },
          exit: { filter: 'blur(0px)' },
          transition: blur.value,
          ...attrs,
          style: [{ overflow: 'hidden' }, attrs.style],
        },
        slots,
      );
    };
  },
});

export {
  Tabs,
  TabsList,
  TabsHighlight,
  TabsHighlightItem,
  TabsTrigger,
  TabsContents,
  TabsContent,
  useTabs,
  type TabsProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
  type TabsContextType,
  type TabsOrientation,
};
