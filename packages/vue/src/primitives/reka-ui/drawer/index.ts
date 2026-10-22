import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import {
  DrawerContent as RekaDrawerContent,
  DrawerOverlay as RekaDrawerOverlay,
  DrawerRoot as RekaDrawerRoot,
  injectDrawerRootContext,
  type DrawerContentProps as RekaDrawerContentProps,
  type DrawerOverlayProps as RekaDrawerOverlayProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  DRAWER_EXIT_TRANSITION,
  DRAWER_TRANSITION,
  OVERLAY_TRANSITION,
} from '../../../internal/modal-motion';

const STYLE_ID = 'animate-ui-reka-ui-drawer';

const THROW_DURATION = 360;

// Base UI's own swipe dismissal: half the popup's size, or a fast enough flick.
const MIN_SWIPE_THRESHOLD = 10;
const FAST_SWIPE_VELOCITY = 0.5;
const MIN_VELOCITY_DURATION = 50;

const POPUP = ':where([data-animate-ui-drawer="popup"])';
const POPUP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="popup"]${selector})`;
const BACKDROP_IS = (selector: string) =>
  `:where([data-animate-ui-drawer="backdrop"]${selector})`;

const CSS = `
@property --animate-ui-backdrop-level {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}
${POPUP} {
  --animate-ui-drawer-dx: var(--drawer-swipe-movement-x, 0px);
  --animate-ui-drawer-dy: calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px));
  --animate-ui-drawer-rest: translate3d(var(--translate-x, var(--animate-ui-drawer-dx)), var(--translate-y, var(--animate-ui-drawer-dy)), 0) scale(var(--stack-scale, 1));
  transform: var(--animate-ui-drawer-rest);
  transition-property: transform, opacity, height, filter, box-shadow;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${POPUP_IS(':is([data-swipe-direction="down"], [data-swipe-direction="up"])')} { --animate-ui-drawer-dx: 0px; }
${POPUP_IS(':is([data-swipe-direction="left"], [data-swipe-direction="right"])')} { --animate-ui-drawer-dy: 0px; }
${POPUP_IS('[data-swipe-direction="down"]')} { --animate-ui-drawer-closed: translate3d(0, 100%, 0); }
${POPUP_IS('[data-swipe-direction="up"]')} { --animate-ui-drawer-closed: translate3d(0, -100%, 0); }
${POPUP_IS('[data-swipe-direction="right"]')} { --animate-ui-drawer-closed: translate3d(100%, 0, 0); }
${POPUP_IS('[data-swipe-direction="left"]')} { --animate-ui-drawer-closed: translate3d(-100%, 0, 0); }
${POPUP_IS(':is([data-starting-style], [data-ending-style])')} {
  transform: var(--closed-transform, var(--animate-ui-drawer-closed));
  box-shadow: none;
}
${POPUP_IS('[data-ending-style]')} {
  transition-duration: var(--animate-ui-drawer-exit-duration);
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${POPUP_IS('[data-ending-style][data-swipe-dismiss]')} {
  transition-duration: calc(var(--drawer-swipe-strength, 1) * ${THROW_DURATION}ms);
  transition-timing-function: linear;
}
${POPUP_IS(':is([data-swiping], [data-nested-drawer-swiping]):not([data-ending-style])')} {
  transition-duration: 0ms;
}
${POPUP_IS('[data-animate-ui-reduce]:not([data-swipe-dismiss]):is([data-starting-style], [data-ending-style])')} {
  transform: var(--animate-ui-drawer-rest);
  opacity: 0;
}
${BACKDROP_IS('')} {
  --animate-ui-backdrop-level: max(var(--drawer-overlay-min-opacity, 0), calc(1 - var(--drawer-swipe-progress, 0)));
  opacity: var(--animate-ui-backdrop-level);
  transition-property: --animate-ui-backdrop-level;
  transition-duration: var(--animate-ui-drawer-duration);
  transition-timing-function: var(--animate-ui-drawer-ease);
}
${BACKDROP_IS(':is([data-starting-style], [data-ending-style])')} { --animate-ui-backdrop-level: 0; }
${BACKDROP_IS('[data-animate-ui-backdrop]')} {
  opacity: 1;
  background-color: color-mix(in srgb, var(--animate-ui-backdrop-color) calc(var(--animate-ui-backdrop-level) * 100%), transparent) !important;
}
${BACKDROP_IS('[data-animate-ui-backdrop-blur]')} {
  -webkit-backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
  backdrop-filter: blur(calc(var(--animate-ui-backdrop-blur) * var(--animate-ui-backdrop-level))) !important;
}
${BACKDROP_IS('[data-ending-style]')} {
  transition-duration: var(--animate-ui-drawer-exit-duration);
  transition-timing-function: var(--animate-ui-drawer-exit-ease);
}
${BACKDROP_IS('[data-swiping]:not([data-ending-style])')} { transition-duration: 0ms; }
`;

type AnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type DrawerContentProps = RekaDrawerContentProps & AnimationProps;
type DrawerOverlayProps = RekaDrawerOverlayProps & AnimationProps;

type TransitionStatus = 'starting' | 'ending' | undefined;

type DrawerState = {
  /** Why the drawer last closed, as reka-ui reports it to `update:open`. */
  reason: Ref<string | undefined>;
  /** The overlay, which the popup waits for as it leaves, like Base UI's. */
  overlay: Ref<HTMLElement | null>;
  popup: Ref<HTMLElement | null>;
  /** When the current press on the popup started. */
  press: { time: number } | null;
};

type Direction = 'up' | 'down' | 'left' | 'right';

function displacement(direction: Direction, x: number, y: number) {
  if (direction === 'up') return -y;
  if (direction === 'down') return y;
  if (direction === 'left') return -x;
  return x;
}

/** Whether Base UI would let a swipe of the popup dismiss it, as reka-ui asks to. */
function swipeDismisses(
  popup: HTMLElement,
  direction: Direction,
  time: number,
) {
  const style = popup.style;
  const x =
    parseFloat(style.getPropertyValue('--drawer-swipe-movement-x')) || 0;
  const y =
    parseFloat(style.getPropertyValue('--drawer-swipe-movement-y')) || 0;
  const delta = displacement(direction, x, y);
  if (delta <= 0) return false;
  if (delta / Math.max(time, MIN_VELOCITY_DURATION) >= FAST_SWIPE_VELOCITY)
    return true;
  const size =
    direction === 'left' || direction === 'right'
      ? popup.offsetWidth
      : popup.offsetHeight;
  return delta > Math.max(size * 0.5, MIN_SWIPE_THRESHOLD);
}

const DrawerStateKey: InjectionKey<DrawerState> = Symbol('DrawerState');

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

function injectStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  doc.head.append(style);
}

function useTimingVariables(
  props: () => AnimationProps,
  fallback: Transition,
  exitFallback?: Transition,
) {
  const enter = useTempoTransition(() => props().transition ?? fallback);
  const exit = useTempoTransition(
    () =>
      props().exitTransition ?? exitFallback ?? props().transition ?? fallback,
  );
  return computed(() => {
    const into = toCssTiming(enter.value);
    const out = toCssTiming(exit.value);
    return {
      '--animate-ui-drawer-duration': `${into.duration}ms`,
      '--animate-ui-drawer-ease': into.easing,
      '--animate-ui-drawer-exit-duration': `${out.duration}ms`,
      '--animate-ui-drawer-exit-ease': out.easing,
    };
  });
}

/**
 * Keeps a part mounted through its CSS exit, like Base UI: `data-starting-style`
 * on the frame it mounts, `data-ending-style` while it leaves, until its transitions end.
 */
function usePresence(
  open: () => boolean,
  element: Ref<HTMLElement | null>,
  holdFor: () => HTMLElement | null = () => null,
) {
  const status = ref<TransitionStatus>(open() ? 'starting' : undefined);
  const kept = ref(open());
  let run = 0;

  const start = () => {
    status.value = 'starting';
    void nextTick(() => {
      // Reading the height lays the starting style out, so the change below transitions.
      void element.value?.offsetHeight;
      if (status.value === 'starting') status.value = undefined;
    });
  };

  onMounted(() => {
    if (open()) start();
  });

  watch(open, (isOpen) => {
    const id = ++run;
    if (isOpen) {
      const leaving = status.value === 'ending' && kept.value;
      kept.value = true;
      if (leaving) status.value = undefined;
      else start();
      return;
    }
    if (!kept.value) return;
    status.value = 'ending';
    void nextTick(() =>
      requestAnimationFrame(async () => {
        const el = element.value;
        while (el?.isConnected && id === run) {
          const running = [
            ...el.getAnimations(),
            ...(holdFor()?.getAnimations() ?? []),
          ];
          if (!running.length) break;
          await Promise.all(running.map((a) => a.finished.catch(() => {})));
        }
        if (id === run) {
          kept.value = false;
          status.value = undefined;
        }
      }),
    );
  });

  return { status, kept };
}

const DrawerRoot = defineComponent({
  name: 'DrawerRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const state: DrawerState = {
      reason: ref<string | undefined>(),
      overlay: shallowRef(null),
      popup: shallowRef(null),
      press: null,
    };
    provide(DrawerStateKey, state);
    const onOpen = (
      open: boolean,
      details?: { reason?: string; cancel?: () => void },
    ) => {
      const popup = state.popup.value;
      const snaps = (attrs.snapPoints ?? attrs['snap-points']) as
        unknown[] | undefined;
      if (
        !open &&
        details?.reason === 'swipe' &&
        popup &&
        state.press &&
        !snaps?.length &&
        !swipeDismisses(
          popup,
          (popup.getAttribute('data-swipe-direction') ?? 'down') as Direction,
          performance.now() - state.press.time,
        )
      ) {
        details.cancel?.();
        return;
      }
      state.reason.value = open ? undefined : details?.reason;
      const listener = attrs['onUpdate:open'];
      for (const each of Array.isArray(listener) ? listener : [listener])
        if (typeof each === 'function') each(open, details);
    };
    return () =>
      h(RekaDrawerRoot, { ...attrs, 'onUpdate:open': onOpen }, slots);
  },
});

const contentProps = {
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
};

const ContentMotion = defineComponent({
  name: 'DrawerContentMotion',
  inheritAttrs: false,
  props: contentProps,
  setup(props, { attrs, slots }) {
    const root = injectDrawerRootContext();
    const drawer = inject(DrawerStateKey, null);
    const reduce = useShouldReduceMotion();
    const variables = useTimingVariables(
      () => props,
      DRAWER_TRANSITION,
      DRAWER_EXIT_TRANSITION,
    );
    const element = shallowRef<HTMLElement | null>(null);
    const { status, kept } = usePresence(
      () => root.open.value,
      element,
      () => drawer?.overlay.value ?? null,
    );
    onMounted(() => injectStyle(document));

    const setElement = (node: unknown) => {
      element.value = elementOf(node);
      if (drawer) drawer.popup.value = element.value;
    };
    const onPress = () => {
      if (drawer) drawer.press = { time: performance.now() };
    };

    return () =>
      h(
        RekaDrawerContent,
        {
          ...attrs,
          style: [variables.value, attrs.style],
          ref: setElement,
          onPointerdownCapture: onPress,
          onTouchstartCapture: onPress,
          forceMount: kept.value || undefined,
          'data-animate-ui-drawer': 'popup',
          'data-animate-ui-reduce': reduce.value ? '' : undefined,
          'data-starting-style': status.value === 'starting' ? '' : undefined,
          'data-ending-style': status.value === 'ending' ? '' : undefined,
          'data-swipe-dismiss':
            status.value === 'ending' && drawer?.reason.value === 'swipe'
              ? ''
              : undefined,
        },
        slots,
      );
  },
});

const DrawerContent = defineComponent({
  name: 'DrawerContent',
  inheritAttrs: false,
  props: contentProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ContentMotion, { ...props, ...attrs }, slots),
      );
  },
});

function holdBackdrop(node: HTMLElement) {
  const { style } = node;
  const transition = style.getPropertyValue('transition');
  style.setProperty('transition', 'none');
  node.removeAttribute('data-animate-ui-backdrop');
  node.removeAttribute('data-animate-ui-backdrop-blur');
  const computed = getComputedStyle(node);
  if (computed.backgroundImage === 'none') {
    style.setProperty('--animate-ui-backdrop-color', computed.backgroundColor);
    node.setAttribute('data-animate-ui-backdrop', '');
    const filter = computed.backdropFilter;
    const blur = /^blur\(([\d.]+)px\)$/.exec(filter)?.[1];
    if (blur || filter === 'none') {
      style.setProperty('--animate-ui-backdrop-blur', `${blur ?? 0}px`);
      node.setAttribute('data-animate-ui-backdrop-blur', '');
    }
  }
  void getComputedStyle(node).backgroundColor;
  if (transition) style.setProperty('transition', transition);
  else style.removeProperty('transition');
}

const DrawerOverlay = defineComponent({
  name: 'DrawerOverlay',
  inheritAttrs: false,
  props: contentProps,
  setup(props, { attrs, slots }) {
    const root = injectDrawerRootContext();
    const drawer = inject(DrawerStateKey, null);
    const variables = useTimingVariables(() => props, OVERLAY_TRANSITION);
    const element = shallowRef<HTMLElement | null>(null);
    watch(element, (node) => {
      if (drawer) drawer.overlay.value = node;
    });
    const { status, kept } = usePresence(() => root.open.value, element);
    const progress = ref(root.nestedSwipeProgressStore.getSnapshot());
    const unsubscribe = root.nestedSwipeProgressStore.subscribe(() => {
      progress.value = root.nestedSwipeProgressStore.getSnapshot();
    });
    onMounted(() => injectStyle(document));

    watch(
      [element, () => attrs.class],
      ([node], _, onCleanup) => {
        if (!node) return;
        holdBackdrop(node);
        const hold = () => holdBackdrop(node);
        const observer = new MutationObserver(hold);
        observer.observe(node.ownerDocument.documentElement, {
          attributes: true,
          attributeFilter: ['class', 'style', 'data-theme'],
        });
        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        scheme.addEventListener('change', hold);
        onCleanup(() => {
          observer.disconnect();
          scheme.removeEventListener('change', hold);
        });
      },
      { flush: 'post' },
    );
    onBeforeUnmount(unsubscribe);

    const setElement = (node: unknown) => {
      element.value = elementOf(node);
    };

    return () =>
      h(
        RekaDrawerOverlay,
        {
          ...attrs,
          style: [
            variables.value,
            // reka-ui leaves the overlay's progress at 0: it follows the popup's swipe here.
            { '--drawer-swipe-progress': String(progress.value) },
            attrs.style,
          ],
          ref: setElement,
          forceMount: kept.value || undefined,
          'data-animate-ui-drawer': 'backdrop',
          'data-starting-style': status.value === 'starting' ? '' : undefined,
          'data-ending-style': status.value === 'ending' ? '' : undefined,
        },
        slots,
      );
  },
});

export {
  DrawerClose,
  DrawerDescription,
  DrawerHandle,
  DrawerIndent,
  DrawerIndentBackground,
  DrawerPortal,
  DrawerProvider,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
  DrawerVirtualKeyboardProvider,
  type DrawerCloseProps,
  type DrawerContentEmits,
  type DrawerDescriptionProps,
  type DrawerHandleProps,
  type DrawerPortalProps,
  type DrawerRootEmits,
  type DrawerRootProps,
  type DrawerTitleProps,
  type DrawerTriggerProps,
} from 'reka-ui';

export {
  DrawerRoot,
  DrawerContent,
  DrawerOverlay,
  type DrawerContentProps,
  type DrawerOverlayProps,
};
