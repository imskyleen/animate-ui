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
  useId,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import {
  NavigationMenuContent as RekaNavigationMenuContent,
  NavigationMenuIndicator as RekaNavigationMenuIndicator,
  NavigationMenuItem as RekaNavigationMenuItem,
  NavigationMenuLink as RekaNavigationMenuLink,
  NavigationMenuList as RekaNavigationMenuList,
  NavigationMenuRoot as RekaNavigationMenuRoot,
  NavigationMenuSub as RekaNavigationMenuSub,
  NavigationMenuTrigger as RekaNavigationMenuTrigger,
  NavigationMenuViewport as RekaNavigationMenuViewport,
  injectNavigationMenuContext,
  useDirection,
  type NavigationMenuContentProps as RekaNavigationMenuContentProps,
  type NavigationMenuIndicatorProps as RekaNavigationMenuIndicatorProps,
  type NavigationMenuViewportProps as RekaNavigationMenuViewportProps,
} from 'reka-ui';
import {
  animate,
  motion,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  MORPH_TRANSITION,
} from '../../../internal/anchored';
import { useStaggerOnOpen } from '../../../internal/stagger';
import {
  ContentSwapper,
  MoveFollower,
  useSwapTimings,
  type Way,
} from '../../../internal/content-swap';
import {
  HIGHLIGHT_TRANSITION,
  provideTriggerHighlightScope,
  useTriggerHighlight,
} from '../../../internal/item-highlight';
import { elementOf, isOn, withHighlight } from '../../../internal/reka-menu';
import { createVarSprings } from '../../../internal/var-springs';

type PresenceAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type NavigationMenuContentProps = RekaNavigationMenuContentProps &
  PresenceAnimationProps;
type NavigationMenuViewportProps = RekaNavigationMenuViewportProps &
  PresenceAnimationProps;
type NavigationMenuIndicatorProps = RekaNavigationMenuIndicatorProps &
  PresenceAnimationProps;

type MenuState = {
  value: () => string;
  orientation: () => 'horizontal' | 'vertical';
  dir: () => 'ltr' | 'rtl';
  hasViewport: () => boolean;
  registerViewport: () => () => void;
  viewportShown: () => boolean;
  showViewport: (shown: boolean) => void;
  swapper: ContentSwapper;
  clicked: (item: string) => void;
  pointerEntered: () => void;
  justOpened: (item: string) => boolean;
  keptOpen: (item: string) => void;
};

const PATIENT_CLICK = 500;

const htmlElementOf = (node: unknown) => {
  const element = elementOf(node);
  return element instanceof HTMLElement ? element : null;
};

const MenuStateKey: InjectionKey<MenuState> = Symbol('AnimateUINavigationMenu');
const ItemValueKey: InjectionKey<() => string> = Symbol(
  'AnimateUINavigationMenuItem',
);

const animationProps = {
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
};

const valueProps = {
  modelValue: { type: String, default: undefined },
  defaultValue: { type: String, default: '' },
  orientation: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
};

function useMenuState(
  props: { modelValue?: string; defaultValue: string; orientation: string },
  emit: (value: string) => void,
  dir: () => 'ltr' | 'rtl',
) {
  const own = ref(props.defaultValue);
  const value = () =>
    props.modelValue === undefined ? own.value : props.modelValue;
  const viewports = ref(0);
  const viewportShown = ref(false);
  let opened = { item: '', at: -Infinity, byClick: false };
  let clicked: string | null = null;

  const state: MenuState = {
    value,
    orientation: () => props.orientation as 'horizontal' | 'vertical',
    dir,
    hasViewport: () => viewports.value > 0,
    registerViewport: () => {
      viewports.value += 1;
      return () => {
        viewports.value -= 1;
      };
    },
    viewportShown: () => viewportShown.value,
    showViewport: (shown) => {
      viewportShown.value = shown;
    },
    swapper: new ContentSwapper(),
    clicked: (item) => {
      clicked = item;
    },
    pointerEntered: () => {
      clicked = null;
    },
    justOpened: (item) =>
      opened.item === item &&
      !opened.byClick &&
      performance.now() - opened.at < PATIENT_CLICK,
    keptOpen: (item) => {
      if (opened.item === item) opened = { ...opened, byClick: true };
    },
  };
  provide(MenuStateKey, state);
  provideTriggerHighlightScope();

  const onChange = (next: string) => {
    const previous = value();
    own.value = next;
    emit(next);
    if (next === previous) return;
    opened = next
      ? { item: next, at: performance.now(), byClick: clicked === next }
      : { item: '', at: -Infinity, byClick: false };
  };
  return { value, onChange };
}

/** The menu: its triggers share one highlight, its content swaps in place. */
const NavigationMenuRoot = defineComponent({
  name: 'NavigationMenuRoot',
  inheritAttrs: false,
  props: {
    ...valueProps,
    dir: String as PropType<'ltr' | 'rtl'>,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const dir = useDirection(computed(() => props.dir));
    const { value, onChange } = useMenuState(
      props,
      (next) => emit('update:modelValue', next),
      () => dir.value,
    );
    return () =>
      h(
        RekaNavigationMenuRoot,
        {
          ...attrs,
          dir: props.dir,
          orientation: props.orientation,
          modelValue: value(),
          'onUpdate:modelValue': (next: string) => onChange(next ?? ''),
        },
        slots,
      );
  },
}) as unknown as typeof RekaNavigationMenuRoot;

const NavigationMenuSub = defineComponent({
  name: 'NavigationMenuSub',
  inheritAttrs: false,
  props: valueProps,
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const parent = inject(MenuStateKey, null);
    const { value, onChange } = useMenuState(
      props,
      (next) => emit('update:modelValue', next),
      () => parent?.dir() ?? 'ltr',
    );
    return () =>
      h(
        RekaNavigationMenuSub,
        {
          ...attrs,
          orientation: props.orientation,
          modelValue: value(),
          'onUpdate:modelValue': (next: string) => onChange(next ?? ''),
        },
        slots,
      );
  },
}) as unknown as typeof RekaNavigationMenuSub;

const NavigationMenuList = defineComponent({
  name: 'NavigationMenuList',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        RekaNavigationMenuList,
        { ...attrs, style: [{ isolation: 'isolate' }, attrs.style] },
        slots,
      );
  },
}) as unknown as typeof RekaNavigationMenuList;

const NavigationMenuItem = defineComponent({
  name: 'NavigationMenuItem',
  inheritAttrs: false,
  props: { value: String },
  setup(props, { attrs, slots }) {
    const fallback = useId();
    const value = () => props.value || fallback;
    provide(ItemValueKey, value);
    return () => h(RekaNavigationMenuItem, { ...attrs, value: value() }, slots);
  },
}) as unknown as typeof RekaNavigationMenuItem;

function highlighted(Part: Component, name: string, trigger: boolean) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const menu = inject(MenuStateKey, null);
      const item = trigger ? inject(ItemValueKey, null) : null;
      const reka = trigger ? injectNavigationMenuContext(null) : null;
      const highlight = useTriggerHighlight(() => isOn(attrs.disabled));
      let wasClickClose = false;
      const onPointerenter = () => {
        wasClickClose = false;
        menu?.pointerEntered();
      };
      // Closed by a click, the pointer moving on the trigger doesn't reopen it.
      const onPointermove = (event: PointerEvent) => {
        if (wasClickClose) event.preventDefault();
      };
      // reka-ui ignores a click for 300ms after the pointer moves: like Radix,
      // a click toggles the item, unless the pointer has just opened it.
      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented || !menu || !item || !reka) return;
        event.stopImmediatePropagation();
        const value = item();
        const open = menu.value() === value;
        if (
          open &&
          event.detail > 0 &&
          !(event.currentTarget as Element).matches('a[href]') &&
          menu.justOpened(value)
        ) {
          event.preventDefault();
          menu.keptOpen(value);
          return;
        }
        menu.clicked(value);
        reka.onItemSelect(open ? '' : value);
        wasClickClose = open;
      };
      return () => {
        const asChild = isOn(attrs.asChild) || isOn(attrs['as-child']);
        const own = trigger
          ? {
              onPointerenter: [attrs.onPointerenter, onPointerenter],
              onPointermove: [attrs.onPointermove, onPointermove],
              onClick: [attrs.onClick, onClick],
            }
          : {};
        return h(
          Part,
          {
            ...attrs,
            ...own,
            ref: (node: unknown) => highlight.setElement(elementOf(node)),
          },
          {
            default: (slotProps: Record<string, unknown>) =>
              withHighlight(
                slots.default?.(slotProps),
                highlight.render(),
                asChild,
              ),
          },
        );
      };
    },
  });
}

/**
 * A trigger: it wears the triggers' highlight, and a click right after the
 * pointer opened its item keeps it open instead of closing it.
 */
const NavigationMenuTrigger = highlighted(
  RekaNavigationMenuTrigger,
  'NavigationMenuTrigger',
  true,
) as unknown as typeof RekaNavigationMenuTrigger;

const NavigationMenuLink = highlighted(
  RekaNavigationMenuLink,
  'NavigationMenuLink',
  false,
) as unknown as typeof RekaNavigationMenuLink;

function wayOf(motionAttribute: unknown, menu: MenuState | null): Way | null {
  if (typeof motionAttribute !== 'string') return null;
  if (!motionAttribute.startsWith('from-')) return null;
  const axis = menu?.orientation() === 'vertical' ? 'y' : 'x';
  const motion = motionAttribute === 'from-end' ? 1 : -1;
  const sign = axis === 'y' && menu?.dir() === 'rtl' ? -motion : motion;
  return { axis, sign };
}

/** A content shown in the viewport: it hands over to the next in place. */
const ViewportContentMotion = defineComponent({
  name: 'NavigationMenuViewportContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = inject(MenuStateKey, null);
    const element = shallowRef<HTMLElement | null>(null);
    const way = wayOf(attrs['data-motion'], menu);
    const id = (attrs.id as string | undefined) ?? null;
    provideTriggerHighlightScope();
    onMounted(() => {
      if (menu && element.value) menu.swapper.enter(element.value, id, way);
    });
    onBeforeUnmount(() => {
      if (menu && element.value) menu.swapper.leave(element.value, id);
    });
    useStaggerOnOpen(
      () => element.value,
      () => true,
      { fresh: () => way === null },
    );
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: element,
          style: [{ isolation: 'isolate' }, attrs.style],
        },
        slots.default?.(),
      );
  },
});

/** A content without a viewport: it scales in and out on its own. */
const InlineContentMotion = defineComponent({
  name: 'NavigationMenuInlineContent',
  inheritAttrs: false,
  props: {
    ...animationProps,
    open: Boolean,
    keepMounted: Boolean,
  },
  emits: ['exited'],
  setup(props, { attrs, emit, slots }) {
    const reduce = useShouldReduceMotion();
    const menu = inject(MenuStateKey, null);
    const enter = useTempoTransition(() => props.transition ?? MENU_TRANSITION);
    const leave = useTempoTransition(
      () => props.exitTransition ?? props.transition ?? MENU_TRANSITION,
    );
    const settledClosed = ref(!props.open);
    watch(
      () => props.open,
      (open) => {
        if (open) settledClosed.value = false;
      },
      { flush: 'sync' },
    );
    provideTriggerHighlightScope();
    const element = shallowRef<HTMLElement | null>(null);
    useStaggerOnOpen(
      () => element.value,
      () => props.open,
    );
    return () => {
      const hidden = {
        opacity: 0,
        scale: reduce.value ? 1 : HIDDEN_SCALE.menu,
      };
      return h(
        motion.div as Component,
        {
          ...attrs,
          ref: (node: unknown) => {
            const el = (node as { $el?: unknown } | null)?.$el ?? node;
            element.value = el instanceof HTMLElement ? el : null;
          },
          initial: hidden,
          animate: props.open
            ? { opacity: 1, scale: 1, transition: enter.value }
            : { ...hidden, transition: leave.value },
          style: [
            {
              transformOrigin: menu?.dir() === 'rtl' ? 'top right' : 'top left',
              isolation: 'isolate',
              ...(props.keepMounted && settledClosed.value && !props.open
                ? { visibility: 'hidden' }
                : null),
            },
            attrs.style,
          ],
          onAnimationComplete: () => {
            if (props.open) return;
            if (props.keepMounted) settledClosed.value = true;
            emit('exited');
          },
        },
        slots,
      );
    };
  },
});

const NavigationMenuContent = defineComponent({
  name: 'NavigationMenuContent',
  inheritAttrs: false,
  props: { ...animationProps, forceMount: Boolean },
  setup(props, { attrs, slots }) {
    const menu = inject(MenuStateKey, null);
    const item = inject(ItemValueKey, null);
    const open = () => Boolean(menu && item && menu.value() === item());
    const present = ref(open());
    watch(
      open,
      (now) => {
        if (now) present.value = true;
      },
      { flush: 'sync' },
    );
    const exited = () =>
      requestAnimationFrame(() => {
        if (!open()) present.value = false;
      });

    return () => {
      if (!menu || !item)
        return h(
          RekaNavigationMenuContent,
          { ...attrs, forceMount: props.forceMount },
          slots,
        );
      // Once the viewport is gone, reka-ui would render the last content in place.
      if (menu.hasViewport()) {
        if (!open() && !menu.viewportShown()) return null;
        return h(
          RekaNavigationMenuContent,
          { ...attrs, forceMount: props.forceMount, asChild: true },
          { default: () => h(ViewportContentMotion, null, slots) },
        );
      }
      if (!open() && !present.value && !props.forceMount) return null;
      return h(ReducedMotionConfig, null, () =>
        h(
          RekaNavigationMenuContent,
          { ...attrs, forceMount: true, asChild: true },
          {
            default: () =>
              h(
                InlineContentMotion,
                {
                  open: open(),
                  keepMounted: props.forceMount,
                  transition: props.transition,
                  exitTransition: props.exitTransition,
                  onExited: exited,
                },
                slots,
              ),
          },
        ),
      );
    };
  },
}) as unknown as typeof RekaNavigationMenuContent;

const WIDTH = '--reka-navigation-menu-viewport-width';
const HEIGHT = '--reka-navigation-menu-viewport-height';

/** The size of the content shown in the viewport, springing to the next one's. */
function useActiveContentSize(
  viewport: () => HTMLElement | null,
  options: () => { transition: Transition; reduce: boolean },
) {
  watch(
    viewport,
    (node, _, onCleanup) => {
      if (!node) return;
      const springs = createVarSprings(node, [], () => ({
        ...options(),
        momentum: true,
      }));
      let content: HTMLElement | null = null;
      let heading: { width: number; height: number } | null = null;
      const measure = () => {
        if (!content) return;
        const next = {
          width: content.offsetWidth,
          height: content.offsetHeight,
        };
        if (
          heading &&
          next.width === heading.width &&
          next.height === heading.height
        )
          return;
        heading = next;
        springs.set(WIDTH, next.width);
        springs.set(HEIGHT, next.height);
      };
      const resizeObserver = new ResizeObserver(measure);
      const track = () => {
        const active =
          Array.from(node.children).find(
            (child): child is HTMLElement =>
              child instanceof HTMLElement &&
              !child.hidden &&
              !child.dataset.motion?.startsWith('to-') &&
              !child.hasAttribute('data-animate-ui-handoff'),
          ) ?? null;
        if (active === content) return;
        if (content) resizeObserver.unobserve(content);
        content = active;
        if (content) {
          resizeObserver.observe(content);
          measure();
        }
      };
      const mutationObserver = new MutationObserver(track);
      mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['data-motion', 'hidden'],
      });
      track();
      onCleanup(() => {
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        springs.stop();
      });
    },
    { flush: 'post', immediate: true },
  );
}

/**
 * The viewport: it drops in with a scale and a fade, its size springs from
 * content to content, and the content it shows changes in place.
 */
const NavigationMenuViewport = defineComponent({
  name: 'NavigationMenuViewport',
  inheritAttrs: false,
  props: { ...animationProps, forceMount: Boolean },
  setup(props, { attrs, slots }) {
    const menu = inject(MenuStateKey, null);
    if (menu) onBeforeUnmount(menu.registerViewport());
    const reduce = useShouldReduceMotion();
    const enter = useTempoTransition(() => props.transition ?? MENU_TRANSITION);
    const leave = useTempoTransition(
      () => props.exitTransition ?? props.transition ?? MENU_TRANSITION,
    );
    const morph = useTempoTransition(
      () => props.transition ?? MORPH_TRANSITION,
    );
    if (menu)
      useSwapTimings(
        menu.swapper,
        () => morph.value,
        () => reduce.value,
      );

    const open = () => Boolean(menu?.value());
    const present = ref(open());
    watch(
      open,
      (now) => {
        if (now) present.value = true;
      },
      { flush: 'sync' },
    );
    if (menu)
      watch(
        () => present.value || props.forceMount,
        (shown) => menu.showViewport(shown),
        { immediate: true, flush: 'sync' },
      );
    const element = shallowRef<HTMLElement | null>(null);
    useActiveContentSize(
      () => element.value,
      () => ({ transition: morph.value, reduce: reduce.value }),
    );
    // reka-ui places the viewport under the open trigger: it glides there,
    // and the contents it swaps stay where they are on screen.
    watch(
      element,
      (node, _, onCleanup) => {
        if (!menu || !node || typeof node.animate !== 'function') return;
        const swapper = menu.swapper;
        const follower = new MoveFollower(node, node, () => ({
          move: swapper.move ?? { duration: 0 },
          reduce: swapper.reduce,
        }));
        follower.start();
        const unfollow = swapper.follow(follower);
        onCleanup(() => {
          follower.stop();
          unfollow();
        });
      },
      { flush: 'post', immediate: true },
    );

    const settledClosed = ref(false);
    let shown: HTMLElement | null = null;
    let controls: AnimationPlaybackControls | null = null;
    watch(
      () => [element.value, open()] as const,
      ([el, isOpen]) => {
        if (!el) {
          shown = null;
          return;
        }
        const hidden = {
          opacity: 0,
          scale: reduce.value ? 1 : HIDDEN_SCALE.menu,
        };
        const fresh = el !== shown;
        shown = el;
        controls?.stop();
        if (isOpen) {
          settledClosed.value = false;
          controls = animate(
            el,
            fresh
              ? { opacity: [0, 1], scale: [hidden.scale, 1] }
              : { opacity: 1, scale: 1 },
            enter.value,
          );
          return;
        }
        if (fresh) return;
        const leaving = animate(el, hidden, leave.value);
        controls = leaving;
        void leaving.then(() => {
          if (controls !== leaving) return;
          if (props.forceMount) settledClosed.value = true;
          requestAnimationFrame(() => {
            if (!open()) present.value = false;
          });
        });
      },
      { flush: 'post' },
    );

    return () => {
      if (!menu)
        return h(
          RekaNavigationMenuViewport,
          { ...attrs, forceMount: props.forceMount },
          slots,
        );
      const vertical = menu.orientation() === 'vertical';
      return h(ReducedMotionConfig, null, () =>
        h(
          RekaNavigationMenuViewport,
          {
            ...attrs,
            forceMount: present.value || props.forceMount,
            ref: (node: unknown) => {
              element.value = htmlElementOf(node);
            },
            style: [
              {
                transformOrigin: vertical
                  ? menu.dir() === 'rtl'
                    ? 'center right'
                    : 'center left'
                  : 'top center',
                ...(props.forceMount && settledClosed.value && !open()
                  ? { visibility: 'hidden' }
                  : null),
              },
              attrs.style,
            ],
          },
          slots,
        ),
      );
    };
  },
}) as unknown as typeof RekaNavigationMenuViewport;

const SIZE = '--reka-navigation-menu-indicator-size';
const POSITION = '--reka-navigation-menu-indicator-position';

/** The indicator: it fades in under the open trigger and glides to the next. */
const NavigationMenuIndicator = defineComponent({
  name: 'NavigationMenuIndicator',
  inheritAttrs: false,
  props: { ...animationProps, forceMount: Boolean },
  setup(props, { attrs, slots }) {
    const menu = inject(MenuStateKey, null);
    const reduce = useShouldReduceMotion();
    const spring = useTempoTransition(
      () => props.transition ?? HIGHLIGHT_TRANSITION,
    );
    const exit = useTempoTransition(
      () => props.exitTransition ?? { ...HIGHLIGHT_TRANSITION, delay: 0.2 },
    );
    const visible = () => Boolean(menu?.value());
    const present = ref(visible());
    watch(
      visible,
      (now) => {
        if (now) present.value = true;
      },
      { flush: 'sync' },
    );
    const element = shallowRef<HTMLElement | null>(null);
    watch(
      element,
      (node, _, onCleanup) => {
        if (!node) return;
        const springs = createVarSprings(node, [SIZE, POSITION], () => ({
          transition: spring.value,
          reduce: reduce.value,
        }));
        onCleanup(() => springs.stop());
      },
      { flush: 'post', immediate: true },
    );
    let shown: HTMLElement | null = null;
    let controls: AnimationPlaybackControls | null = null;
    watch(
      () => [element.value, visible()] as const,
      ([el, isVisible]) => {
        if (!el) {
          shown = null;
          return;
        }
        const fresh = el !== shown;
        shown = el;
        controls?.stop();
        if (isVisible) {
          controls = animate(el, { opacity: fresh ? [0, 1] : 1 }, spring.value);
          return;
        }
        if (fresh) return;
        const leaving = animate(el, { opacity: 0 }, exit.value);
        controls = leaving;
        void leaving.then(() => {
          if (controls !== leaving) return;
          requestAnimationFrame(() => {
            if (!visible()) present.value = false;
          });
        });
      },
      { flush: 'post' },
    );

    return () => {
      if (!menu)
        return h(
          RekaNavigationMenuIndicator,
          { ...attrs, forceMount: props.forceMount },
          slots,
        );
      return h(ReducedMotionConfig, null, () =>
        h(
          RekaNavigationMenuIndicator,
          {
            ...attrs,
            forceMount: present.value || props.forceMount,
            ref: (node: unknown) => {
              element.value = htmlElementOf(node);
            },
          },
          slots,
        ),
      );
    };
  },
}) as unknown as typeof RekaNavigationMenuIndicator;

export {
  type NavigationMenuRootProps,
  type NavigationMenuRootEmits,
  type NavigationMenuSubProps,
  type NavigationMenuSubEmits,
  type NavigationMenuListProps,
  type NavigationMenuItemProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuLinkProps,
  type NavigationMenuLinkEmits,
  type NavigationMenuContentEmits,
} from 'reka-ui';

export {
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuViewport,
  NavigationMenuIndicator,
  type NavigationMenuContentProps,
  type NavigationMenuViewportProps,
  type NavigationMenuIndicatorProps,
};
