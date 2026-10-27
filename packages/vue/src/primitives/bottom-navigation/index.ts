import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import {
  animateMini,
  motion,
  spring,
  useMotionValue,
  type Transition,
} from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Highlight, HighlightItem } from '../effects/highlight';
import { Slot } from '../slot';
import { SCALE_SPRING, TAP_SCALE } from '../buttons/_button';
import { callHandler } from '../../internal/handlers';

type BottomNavigationScrollBehavior = 'none' | 'hide' | 'minimize';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.selection;
const SCROLL_TRANSITION: Transition = motionTokens.spring.slide;
const FADE_TRANSITION: Transition = motionTokens.transition.fade;
const LABEL_TRANSITION: Transition = motionTokens.spring.selection;
const INSTANT: Transition = { duration: 0 };

// Scrolled less than this, the bar stays as it is.
const SCROLL_THRESHOLD = 6;
// Gap kept between the hidden bar and the edge it slides past.
const HIDDEN_GAP = 8;

const ACCESSORY = '[data-slot="bottom-navigation-accessory"]';

type BottomNavigationContextType = {
  activeValue: () => string | undefined;
  handleValueChange: (value: string) => void;
  minimized: () => boolean;
  scrollBehavior: () => BottomNavigationScrollBehavior;
  scrollTransition: () => Transition;
};

const BottomNavigationKey: InjectionKey<BottomNavigationContextType> = Symbol(
  'AnimateUIBottomNavigation',
);

const BottomNavigationItemKey: InjectionKey<{ isActive: () => boolean }> =
  Symbol('AnimateUIBottomNavigationItem');

function useBottomNavigation() {
  const context = inject(BottomNavigationKey, null);
  if (!context)
    throw new Error('useBottomNavigation must be used within BottomNavigation');
  return context;
}

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

// The event's own path: by the time it reaches the bar, a re-render may have
// replaced its target.
const inAccessory = (event: Event) =>
  event
    .composedPath()
    .some((node) => node instanceof Element && node.matches(ACCESSORY));

const scrollTopOf = (target: HTMLElement | Window) =>
  target instanceof Window ? target.scrollY : target.scrollTop;

type BottomNavigationProps = {
  modelValue?: string;
  defaultValue?: string;
  scrollBehavior?: BottomNavigationScrollBehavior;
  scrollContainer?: HTMLElement | null;
  transition?: Transition;
};

const BottomNavigationRoot = defineComponent({
  name: 'BottomNavigationRoot',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    scrollBehavior: {
      type: String as PropType<BottomNavigationScrollBehavior>,
      default: 'none',
    },
    scrollContainer: {
      type: Object as PropType<HTMLElement | null>,
      default: undefined,
    },
    transition: Object as PropType<Transition>,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const own = ref<string | undefined>(props.defaultValue);
    const activeValue = () => props.modelValue ?? own.value;
    const reduce = useShouldReduceMotion();
    const slide = useTempoTransition(() => SCROLL_TRANSITION);
    const fade = useTempoTransition(() => FADE_TRANSITION);
    const scrollTransition = computed(
      () => props.transition ?? (reduce.value ? INSTANT : slide.value),
    );

    const nav = shallowRef<HTMLElement | null>(null);
    const collapsed = ref(false);
    const hidden = computed(
      () => collapsed.value && props.scrollBehavior === 'hide',
    );
    const minimized = computed(
      () => collapsed.value && props.scrollBehavior === 'minimize',
    );
    const y = useMotionValue(0);
    const offset = ref(0);

    const collapse = () => {
      const element = nav.value;
      if (!element) return;
      if (props.scrollBehavior === 'hide') {
        const rect = element.getBoundingClientRect();
        const edge =
          props.scrollContainer?.getBoundingClientRect().bottom ??
          window.innerHeight;
        offset.value = edge - (rect.top - y.get()) + HIDDEN_GAP;
      }
      collapsed.value = true;
    };

    watch(
      () => [props.scrollBehavior, props.scrollContainer] as const,
      ([behavior, container], _, onCleanup) => {
        collapsed.value = false;
        if (behavior === 'none' || typeof window === 'undefined') return;
        const target: HTMLElement | Window = container ?? window;
        let last = scrollTopOf(target);
        const onScroll = () => {
          const top = scrollTopOf(target);
          const delta = top - last;
          if (top <= 0) {
            collapsed.value = false;
            last = top;
            return;
          }
          if (Math.abs(delta) < SCROLL_THRESHOLD) return;
          if (delta > 0) collapse();
          else collapsed.value = false;
          last = top;
        };
        target.addEventListener('scroll', onScroll, { passive: true });
        onCleanup(() => target.removeEventListener('scroll', onScroll));
      },
      { immediate: true, flush: 'post' },
    );

    const handleValueChange = (value: string) => {
      collapsed.value = false;
      if (props.modelValue === undefined) own.value = value;
      emit('update:modelValue', value);
    };

    provide(BottomNavigationKey, {
      activeValue,
      handleValueChange,
      minimized: () => minimized.value,
      scrollBehavior: () => props.scrollBehavior,
      scrollTransition: () => scrollTransition.value,
    });

    return () =>
      h(
        motion.nav as Component,
        {
          'data-slot': 'bottom-navigation',
          'data-hidden': hidden.value ? '' : undefined,
          'data-minimized': minimized.value ? '' : undefined,
          ...attrs,
          ref: (node: unknown) => {
            nav.value = elementOf(node);
          },
          style: [
            {
              y: reduce.value ? 0 : y,
              pointerEvents: hidden.value ? 'none' : undefined,
            },
            attrs.style,
          ],
          initial: false,
          animate: reduce.value
            ? { opacity: hidden.value ? 0 : 1 }
            : { y: hidden.value ? offset.value : 0, opacity: 1 },
          transition: reduce.value
            ? (props.transition ?? fade.value)
            : scrollTransition.value,
          onFocusin: (event: FocusEvent) => {
            callHandler(attrs.onFocusin, event);
            // A press focuses too: its click grows the bar, with its selection.
            const target = event.target as Element | null;
            if (target?.matches(':focus-visible') && !inAccessory(event))
              collapsed.value = false;
          },
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event);
            if (!inAccessory(event)) collapsed.value = false;
          },
        },
        slots,
      );
  },
});

/** A bottom bar whose highlight glides to the selected item. */
const BottomNavigation = defineComponent({
  name: 'BottomNavigation',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(BottomNavigationRoot as Component, attrs, slots),
      );
  },
});

type BottomNavigationHighlightProps = {
  transition?: Transition;
};

/** The highlight that slides to the selected item. */
const BottomNavigationHighlight = defineComponent({
  name: 'BottomNavigationHighlight',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const { activeValue } = useBottomNavigation();
    return () =>
      h(
        Highlight as Component,
        {
          'data-slot': 'bottom-navigation-highlight',
          controlledItems: true,
          modelValue: activeValue() ?? null,
          transition: props.transition ?? HIGHLIGHT_TRANSITION,
          click: false,
          ...attrs,
        },
        slots,
      );
  },
});

type BottomNavigationHighlightItemProps = {
  value: string;
};

/** An item's place under the highlight. */
const BottomNavigationHighlightItem = defineComponent({
  name: 'BottomNavigationHighlightItem',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        HighlightItem as Component,
        { 'data-slot': 'bottom-navigation-highlight-item', ...attrs },
        slots,
      );
  },
});

const BOX = [
  'width',
  'height',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const;

type Size = number[];

const sizeOf = (el: HTMLElement): Size => {
  const style = getComputedStyle(el);
  return BOX.map((key) => parseFloat(style[key]));
};

const clearBox = (el: HTMLElement) => {
  for (const key of BOX) el.style[key] = '';
};

const LABEL = '[data-slot="bottom-navigation-label"]';

// The element's size once the labels in it have opened or folded.
// Under its icon, a label folds its height; beside it, its width.
const isBelow = (label: Element) =>
  !!label.parentElement &&
  getComputedStyle(label.parentElement).flexDirection.startsWith('column');

const settledSizeOf = (el: HTMLElement): Size => {
  const labels = [...el.querySelectorAll<HTMLElement>(LABEL)];
  const saved = labels.map(({ style }) => [style.width, style.height] as const);
  for (const label of labels) {
    const folded = 'folded' in label.dataset ? '0px' : 'auto';
    label.style.width = isBelow(label) ? 'auto' : folded;
    label.style.height = isBelow(label) ? folded : 'auto';
  }
  const size = sizeOf(el);
  labels.forEach(({ style }, index) => {
    [style.width, style.height] = saved[index]!;
  });
  return size;
};

// When the bar minimizes or grows back, the element eases from its last size
// and padding to the ones its CSS gives it in the new state.
function useMorph(
  element: () => HTMLElement | null,
  minimized: () => boolean,
  transition: () => Transition,
  selected: () => boolean = () => false,
) {
  const reduce = useShouldReduceMotion();
  let size: Size | null = null;
  let controls: ReturnType<typeof animateMini> | null = null;
  let observer: ResizeObserver | undefined;

  watch(
    element,
    (el) => {
      observer?.disconnect();
      if (!el) return;
      size = sizeOf(el);
      observer = new ResizeObserver(() => {
        if (!controls) size = sizeOf(el);
      });
      observer.observe(el);
    },
    { flush: 'post' },
  );
  onBeforeUnmount(() => observer?.disconnect());

  // Held at its size until the update: Motion measures layouts in between,
  // and a jump to the new size would slide the highlight on its own.
  let from: Size | null = null;
  let pending = false;
  watch(
    () => [minimized(), selected()] as const,
    ([isMinimized], [wasMinimized]) => {
      const el = element();
      // Selected while it eases, it heads for its new size instead.
      if (!el || pending || (isMinimized === wasMinimized && !controls)) return;
      pending = true;
      from = controls ? sizeOf(el) : size;
      controls?.stop();
      controls = null;
      if (from)
        BOX.forEach((key, index) => (el.style[key] = `${from![index]}px`));
    },
    { flush: 'sync' },
  );

  watch(
    () => [minimized(), selected()] as const,
    () => {
      const el = element();
      if (!el || !pending) return;
      pending = false;
      clearBox(el);
      const to = settledSizeOf(el);
      const start = from;
      size = to;
      if (
        reduce.value ||
        !start ||
        start.every((value, index) => value === to[index])
      )
        return;
      const options = transition();
      const current = animateMini(
        el,
        {
          ...Object.fromEntries(
            BOX.map((key, index) => [
              key,
              [`${start[index]}px`, `${to[index]}px`],
            ]),
          ),
        },
        options.type === 'spring' ? { ...options, type: spring } : options,
      );
      controls = current;
      current.then(() => {
        if (controls !== current) return;
        controls = null;
        clearBox(el);
      });
    },
    { flush: 'post' },
  );
}

type BottomNavigationItemProps = {
  value: string;
  tapScale?: number;
  asChild?: boolean;
  transition?: Transition;
};

/** A link (or, `as-child`, your own element) that selects its item. */
const BottomNavigationItem = defineComponent({
  name: 'BottomNavigationItem',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    tapScale: { type: Number, default: TAP_SCALE },
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const navigation = useBottomNavigation();
    const reduce = useShouldReduceMotion();
    const press = useTempoTransition(() => SCALE_SPRING);
    const element = shallowRef<HTMLElement | null>(null);
    const isActive = () => navigation.activeValue() === props.value;

    provide(BottomNavigationItemKey, { isActive });
    useMorph(
      () => element.value,
      navigation.minimized,
      navigation.scrollTransition,
      isActive,
    );

    return () => {
      const active = isActive();
      return h(
        (props.asChild ? Slot : motion.a) as Component,
        {
          'data-slot': 'bottom-navigation-item',
          'data-state': active ? 'active' : 'inactive',
          'data-minimized': navigation.minimized() ? '' : undefined,
          'aria-current': active ? 'page' : undefined,
          initial: reduce.value ? undefined : { transform: 'scale(1)' },
          whilePress: reduce.value
            ? undefined
            : { transform: `scale(${props.tapScale})` },
          transition: props.transition ?? press.value,
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event);
            if (!event.defaultPrevented)
              navigation.handleValueChange(props.value);
          },
        },
        slots,
      );
    };
  },
});

type BottomNavigationLabelProps = {
  show?: BottomNavigationLabelShow;
  transition?: Transition;
};

type BottomNavigationLabelShow = 'always' | 'active';

/**
 * The item's name. Opens out of a blur and folds away with its room: when the
 * bar minimizes, and with `show="active"`, when its item isn't selected.
 */
const BottomNavigationLabel = defineComponent({
  name: 'BottomNavigationLabel',
  inheritAttrs: false,
  props: {
    show: {
      type: String as PropType<BottomNavigationLabelShow>,
      default: 'always',
    },
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const navigation = useBottomNavigation();
    const item = inject(BottomNavigationItemKey, null);
    if (!item)
      throw new Error(
        'BottomNavigationLabel must be used within BottomNavigationItem',
      );
    const reduce = useShouldReduceMotion();
    const fade = useTempoTransition(() => FADE_TRANSITION);
    const select = useTempoTransition(() => LABEL_TRANSITION);
    const element = shallowRef<HTMLElement | null>(null);
    const below = ref(false);
    onMounted(() => {
      if (element.value) below.value = isBelow(element.value);
    });
    let wasMinimized = navigation.minimized();

    return () => {
      const { class: className, style, ...rest } = attrs;
      const folded =
        navigation.minimized() || (props.show === 'active' && !item.isActive());
      // Opened or folded by the bar, it moves with the items' sizes.
      const byBar =
        wasMinimized !== navigation.minimized() || props.show === 'always';
      wasMinimized = navigation.minimized();
      const size =
        props.transition ??
        (byBar ? navigation.scrollTransition() : select.value);
      // Beside its icon, it fades with its width; below it, out of the way first.
      const look =
        props.show === 'active'
          ? size
          : folded
            ? { ...fade.value, duration: (fade.value.duration ?? 0.2) / 2 }
            : fade.value;
      return h(
        motion.span as Component,
        {
          'data-slot': 'bottom-navigation-label',
          'data-folded': folded ? '' : undefined,
          ...rest,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          style: [
            {
              display: 'inline-flex',
              justifyContent: below.value ? 'center' : 'flex-start',
              flexShrink: 0,
              overflow: 'clip',
              whiteSpace: 'nowrap',
            },
            style,
          ],
          initial: false,
          animate: folded
            ? {
                width: below.value ? 'auto' : 0,
                height: below.value ? 0 : 'auto',
                opacity: 0,
                filter: 'blur(4px)',
              }
            : {
                width: 'auto',
                height: 'auto',
                opacity: 1,
                filter: 'blur(0px)',
              },
          transition: reduce.value
            ? INSTANT
            : { ...size, opacity: look, filter: look },
        },
        () =>
          h(
            'span',
            { class: className, style: { display: 'inline-flex' } },
            slots.default?.(),
          ),
      );
    };
  },
});

/** Sits beside the bar and minimizes with it; pressing it leaves the bar minimized. */
const BottomNavigationAccessory = defineComponent({
  name: 'BottomNavigationAccessory',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const navigation = useBottomNavigation();
    const element = shallowRef<HTMLElement | null>(null);
    useMorph(
      () => element.value,
      navigation.minimized,
      navigation.scrollTransition,
    );
    return () =>
      h(
        motion.div as Component,
        {
          'data-slot': 'bottom-navigation-accessory',
          'data-minimized': navigation.minimized() ? '' : undefined,
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
        },
        slots,
      );
  },
});

export {
  BottomNavigation,
  BottomNavigationHighlight,
  BottomNavigationHighlightItem,
  BottomNavigationItem,
  BottomNavigationLabel,
  BottomNavigationAccessory,
  useBottomNavigation,
  type BottomNavigationProps,
  type BottomNavigationScrollBehavior,
  type BottomNavigationHighlightProps,
  type BottomNavigationHighlightItemProps,
  type BottomNavigationItemProps,
  type BottomNavigationLabelProps,
  type BottomNavigationLabelShow,
};
