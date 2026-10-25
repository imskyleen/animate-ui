import {
  computed,
  defineComponent,
  h,
  inject,
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
            if (!inAccessory(event)) collapsed.value = false;
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

const FOLDED_SIZE = ['width', 'paddingLeft', 'paddingRight'] as const;

function useFold(
  element: () => HTMLElement | null,
  folded: () => boolean,
  transition: () => Transition,
) {
  let size: Record<string, number> | null = null;
  let wasFolded = false;

  watch(
    folded,
    (isFolded) => {
      const el = element();
      if (!el || isFolded === wasFolded) return;
      wasFolded = isFolded;
      if (isFolded && !el.style.width) {
        const style = getComputedStyle(el);
        size = {
          width: el.getBoundingClientRect().width,
          paddingLeft: parseFloat(style.paddingLeft),
          paddingRight: parseFloat(style.paddingRight),
        };
      }
      const target = size;
      if (!target) return;
      const px = (key: string) => (isFolded ? '0px' : `${target[key]}px`);
      const options = transition();
      const controls = animateMini(
        el,
        {
          width: px('width'),
          paddingLeft: px('paddingLeft'),
          paddingRight: px('paddingRight'),
          opacity: isFolded ? 0 : 1,
          filter: isFolded ? 'blur(4px)' : 'blur(0px)',
        },
        options.type === 'spring' ? { ...options, type: spring } : options,
      );
      if (!isFolded)
        controls.then(() => {
          if (wasFolded) return;
          for (const key of FOLDED_SIZE) el.style[key] = '';
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
    const folded = () => navigation.minimized() && !isActive();

    provide(BottomNavigationItemKey, { isActive });
    useFold(() => element.value, folded, navigation.scrollTransition);

    return () => {
      const active = isActive();
      return h(
        (props.asChild ? Slot : motion.a) as Component,
        {
          'data-slot': 'bottom-navigation-item',
          'data-state': active ? 'active' : 'inactive',
          'aria-current': active ? 'page' : undefined,
          inert: folded() || undefined,
          initial: reduce.value ? undefined : { transform: 'scale(1)' },
          whilePress: reduce.value
            ? undefined
            : { transform: `scale(${props.tapScale})` },
          transition: props.transition ?? press.value,
          ...attrs,
          style:
            navigation.scrollBehavior() === 'minimize'
              ? [{ overflow: 'hidden' }, attrs.style]
              : attrs.style,
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
  transition?: Transition;
};

/** The selected item's name: opens to its width out of a blur, closed it takes no room. */
const BottomNavigationLabel = defineComponent({
  name: 'BottomNavigationLabel',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const item = inject(BottomNavigationItemKey, null);
    if (!item)
      throw new Error(
        'BottomNavigationLabel must be used within BottomNavigationItem',
      );
    const slide = useTempoTransition(() => LABEL_TRANSITION);

    return () => {
      const { class: className, style, ...rest } = attrs;
      const shown = item.isActive();
      return h(
        motion.span as Component,
        {
          'data-slot': 'bottom-navigation-label',
          ...rest,
          style: [
            {
              display: 'inline-flex',
              flexShrink: 0,
              overflow: 'clip',
              whiteSpace: 'nowrap',
            },
            style,
          ],
          initial: false,
          animate: shown
            ? { width: 'auto', opacity: 1, filter: 'blur(0px)' }
            : { width: 0, opacity: 0, filter: 'blur(4px)' },
          transition: props.transition ?? slide.value,
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

/** Sits beside the bar, folded or not; pressing it leaves the bar folded. */
const BottomNavigationAccessory = defineComponent({
  name: 'BottomNavigationAccessory',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        motion.div as Component,
        { 'data-slot': 'bottom-navigation-accessory', ...attrs },
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
};
