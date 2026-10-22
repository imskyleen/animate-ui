import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type InjectionKey,
  type PropType,
  type ShallowRef,
} from 'vue';
import {
  injectToastProviderContext,
  Primitive,
  ToastDescription as RekaToastDescription,
  ToastProvider as RekaToastProvider,
  ToastRoot as RekaToastRoot,
  ToastTitle as RekaToastTitle,
  type ToastObject,
  type ToastProviderProps as RekaToastProviderProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  toCssTiming,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
  type CssTiming,
} from '../../../utils/motion';
import {
  DISMISS_TRANSITION,
  TOAST_TRANSITION,
} from '../../../internal/modal-motion';
import { HIDDEN_SCALE, POPOVER_TRANSITION } from '../../../internal/anchored';
import {
  iconOf,
  moveDrag,
  showIcon,
  startDrag,
  swapContent,
  swipeStyle,
  takeSnapshot,
  throwTiming,
  PROGRESS,
  PROGRESS_BAR,
  PROGRESS_CSS,
  type Direction,
  type Drag,
  type Labels,
} from '../../../internal/toast-motion';

const GAP = '0.75rem';
const PEEK = '0.75rem';
const ANCHORED_SCALE = HIDDEN_SCALE.tooltip;
const RISE_SCALE = motionTokens.scale.toast;
const RISE_BLUR = motionTokens.blur.surface;
const FADE_TRANSITION = motionTokens.transition.fade;
const DEFAULT_TIMEOUT = 5000;
const CASCADE_WINDOW = 150;

// Base UI's swipe, which reka's single-direction swipe replaces here.
const SWIPE_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const OPPOSITE_DIRECTION_DAMPING_FACTOR = 0.5;
const MIN_DRAG_THRESHOLD = 1;
const SWIPE_IGNORE =
  'button,a,input,textarea,[role="button"],[data-swipe-ignore]';

const STYLE_ID = 'animate-ui-reka-ui-toast';

type Style = Record<string, string | number | undefined>;
type TransitionStatus = 'starting' | 'ending' | undefined;

type ToastSettings = {
  timeout: number;
  progressBar: boolean;
  swipeDirection: Direction | Direction[] | undefined;
  disableSwipe: boolean;
};

const ToastSettingsKey: InjectionKey<() => ToastSettings> =
  Symbol('ToastSettings');

type ToastRootState = {
  index: () => number;
  expanded: () => boolean;
  labels: {
    title: ShallowRef<HTMLElement | null>;
    description: ShallowRef<HTMLElement | null>;
  };
};

const ToastRootStateKey: InjectionKey<ToastRootState> =
  Symbol('ToastRootState');

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

function transitionStyle(
  properties: string[],
  timing: CssTiming,
  delay?: string,
): Style {
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${timing.duration}ms`,
    transitionTimingFunction: timing.easing,
    transitionDelay: delay ?? '0ms',
  };
}

function getDirections(swipeDirection: Direction | Direction[] | undefined) {
  return (
    Array.isArray(swipeDirection)
      ? swipeDirection
      : swipeDirection
        ? [swipeDirection]
        : ['down', 'right']
  ) as Direction[];
}

function getSide(directions: Direction[]) {
  return directions.includes('up') && !directions.includes('down')
    ? 'top'
    : 'bottom';
}

function useCascade() {
  const last: { expanded?: boolean; at: number } = { at: -Infinity };
  return (expanded: boolean) => {
    if (last.expanded !== undefined && last.expanded !== expanded)
      last.at = performance.now();
    last.expanded = expanded;
    return performance.now() - last.at < CASCADE_WINDOW;
  };
}

function displacementOf(direction: Direction, x: number, y: number) {
  if (direction === 'up') return -y;
  if (direction === 'down') return y;
  if (direction === 'left') return -x;
  return x;
}

function transformOf(element: HTMLElement) {
  const m = new DOMMatrix(
    getComputedStyle(element).transform.replace('none', ''),
  );
  return { x: m.m41, y: m.m42, scale: Math.hypot(m.a, m.b) };
}

type StackState = {
  transitionStatus: TransitionStatus;
  expanded: boolean;
  limited: boolean;
  swiping: boolean;
  swipeDirection: Direction | undefined;
};

type StackOptions = {
  side: 'top' | 'bottom';
  reduce: boolean;
  anchored: boolean;
  enter: CssTiming;
  exit: CssTiming;
  cascade: string | undefined;
  swipe: Style | null;
  thrown: CssTiming | null;
};

function stackStyle(
  state: StackState,
  { side, reduce, anchored, enter, exit, cascade, swipe, thrown }: StackOptions,
): Style {
  const ending = state.transitionStatus === 'ending';
  const starting = state.transitionStatus === 'starting';
  const hidden = starting || ending || state.limited;

  if (state.swiping) return swipe ?? { opacity: hidden ? 0 : 1 };

  if (anchored) {
    return {
      opacity: hidden ? 0 : 1,
      ...transitionStyle(
        reduce ? ['opacity'] : ['transform', 'opacity', 'height'],
        ending ? exit : enter,
      ),
      transform: `scale(${hidden && !reduce ? ANCHORED_SCALE : 1})`,
      transformOrigin: 'var(--transform-origin)',
    };
  }

  const swiped = ending ? state.swipeDirection : undefined;
  const timing = swiped && thrown ? thrown : ending ? exit : enter;
  const properties = !reduce
    ? ['transform', 'opacity', 'height', 'filter']
    : swiped
      ? ['transform', 'opacity']
      : ['opacity', 'filter'];
  const style: Style = {
    opacity: hidden ? 0 : 1,
    ...transitionStyle(properties, timing, ending ? undefined : cascade),
  };

  const dir = side === 'top' ? -1 : 1;
  const behindScale = 'max(0.9, calc(1 - var(--toast-index) * 0.05))';
  const restScale = state.expanded ? '1' : behindScale;
  const clamp = 'var(--toast-frontmost-height, var(--toast-height, 0px))';
  const restY = state.expanded
    ? `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-offset-y, 0px) + var(--toast-index, 0) * ${GAP}))`
    : `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-index, 0) * ${PEEK} + (1 - ${behindScale}) * ${clamp}))`;

  let exitX = '0px';
  let exitY = '0px';
  let scale = restScale;
  if ((starting || ending) && !swiped) {
    style.filter = RISE_BLUR;
    if (!reduce) {
      exitY = `${dir * 100}%`;
      scale = `calc(${restScale} * ${RISE_SCALE})`;
    }
  }
  if (swiped === 'down') exitY = '100%';
  if (swiped === 'up') exitY = '-100%';
  if (swiped === 'right') exitX = '100%';
  if (swiped === 'left') exitX = '-100%';

  style.transform = `translateX(calc(var(--toast-swipe-movement-x, 0px) + ${exitX})) translateY(calc(${restY} + ${exitY})) scale(${scale})`;
  style.transformOrigin = side === 'top' ? 'top' : 'bottom';
  return style;
}

type ToastProviderProps = RekaToastProviderProps & {
  progressBar?: boolean;
};

const ToastProvider = defineComponent({
  name: 'ToastProvider',
  inheritAttrs: false,
  props: {
    progressBar: { type: Boolean, default: true },
    duration: Number,
    swipeDirection: [String, Array] as PropType<Direction | Direction[]>,
    disableSwipe: Boolean,
  },
  setup(props, { attrs, slots }) {
    provide(ToastSettingsKey, () => ({
      timeout: props.duration ?? DEFAULT_TIMEOUT,
      progressBar: props.progressBar,
      swipeDirection: props.swipeDirection,
      disableSwipe: props.disableSwipe,
    }));
    return () =>
      h(
        RekaToastProvider,
        { ...attrs, duration: props.duration, disableSwipe: true },
        slots,
      );
  },
});

type ToastRootProps = {
  toast: ToastObject;
  swipeDirection?: Direction | Direction[];
  transition?: Transition;
  exitTransition?: Transition;
  progressBar?: boolean;
  as?: string;
  asChild?: boolean;
};

const rootProps = {
  toast: { type: Object as PropType<ToastObject>, required: true as const },
  swipeDirection: [String, Array] as PropType<Direction | Direction[]>,
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
  progressBar: { type: Boolean, default: undefined },
  as: String,
  asChild: Boolean,
};

const RootMotion = defineComponent({
  name: 'ToastRootMotion',
  inheritAttrs: false,
  props: rootProps,
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const tokens = useMotionTokens();
    const settings = inject(ToastSettingsKey, () => ({
      timeout: DEFAULT_TIMEOUT,
      progressBar: true,
      swipeDirection: undefined,
      disableSwipe: false,
    }));
    const provider = injectToastProviderContext();
    const anchored = computed(() => props.toast.positionerProps != null);
    const enterTiming = useTempoTransition(
      () =>
        props.transition ??
        (anchored.value ? POPOVER_TRANSITION : TOAST_TRANSITION),
    );
    const exitTiming = useTempoTransition(
      () =>
        props.exitTransition ??
        (anchored.value
          ? (props.transition ?? POPOVER_TRANSITION)
          : DISMISS_TRANSITION),
    );
    const fadeTiming = useTempoTransition(() => FADE_TRANSITION);
    const directions = computed(() =>
      getDirections(props.swipeDirection ?? settings().swipeDirection),
    );
    const swipeDirections = computed(() =>
      anchored.value || settings().disableSwipe ? [] : directions.value,
    );
    const side = computed(() => getSide(directions.value));
    const cascading = useCascade();

    const element = shallowRef<HTMLElement | null>(null);
    const status = ref<TransitionStatus>('starting');
    const kept = ref(true);
    const index = ref(0);
    const limited = ref(false);
    const title = shallowRef<HTMLElement | null>(null);
    const description = shallowRef<HTMLElement | null>(null);
    const labels: Labels = {
      title: () => title.value,
      description: () => description.value,
    };
    provide(ToastRootStateKey, {
      index: () => index.value,
      expanded: () => provider.expanded.value,
      labels: { title, description },
    });

    const swiping = ref(false);
    const realSwipe = ref(false);
    const locked = ref<'horizontal' | 'vertical' | null>(null);
    const swipeDirection = ref<Direction | undefined>();
    const dragOffset = ref({ x: 0, y: 0 });
    const initial = ref({ x: 0, y: 0, scale: 1 });
    let drag: Drag | null = null;
    let activePointer: number | null = null;
    let dragStart = { x: 0, y: 0 };
    let cancelBaseline = { x: 0, y: 0 };
    let intended: Direction | undefined;
    let maxDisplacement = 0;
    let cancelled = false;
    let firstMove = false;
    let stopDocument: (() => void) | null = null;

    const read = () => {
      const el = element.value;
      if (!el) return;
      index.value =
        Number(el.style.getPropertyValue('--reka-toast-index')) || 0;
      limited.value = el.hasAttribute('data-limited');
    };
    let observer: MutationObserver | null = null;
    watch(element, (el) => {
      observer?.disconnect();
      if (!el) return;
      read();
      observer = new MutationObserver(read);
      observer.observe(el, { attributeFilter: ['style', 'data-limited'] });
    });

    const close = () => provider.toastStore.close(props.toast.id);

    function damped(deltaX: number, deltaY: number) {
      const list = swipeDirections.value;
      const damp = (delta: number) =>
        delta > 0
          ? delta ** OPPOSITE_DIRECTION_DAMPING_FACTOR
          : -(Math.abs(delta) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
      const dampX =
        (deltaX > 0 && !list.includes('right')) ||
        (deltaX < 0 && !list.includes('left'));
      const dampY =
        (deltaY > 0 && !list.includes('down')) ||
        (deltaY < 0 && !list.includes('up'));
      return {
        x: dampX ? damp(deltaX) : deltaX,
        y: dampY ? damp(deltaY) : deltaY,
      };
    }

    function swipeEnd(event: PointerEvent) {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      stopDocument?.();
      stopDocument = null;
      if (event.type === 'pointerup' && drag?.pointerId === event.pointerId)
        drag.releasedAt = event.timeStamp;
      if (event.type === 'pointercancel') drag = null;
      swiping.value = false;
      realSwipe.value = false;
      locked.value = null;
      const start = initial.value;
      if (event.type === 'pointercancel' || cancelled) {
        dragOffset.value = { x: start.x, y: start.y };
        swipeDirection.value = undefined;
        return;
      }
      const deltaX = dragOffset.value.x - start.x;
      const deltaY = dragOffset.value.y - start.y;
      const dismiss = swipeDirections.value.find(
        (direction) =>
          displacementOf(direction, deltaX, deltaY) > SWIPE_THRESHOLD,
      );
      if (dismiss) {
        swipeDirection.value = dismiss;
        close();
      } else {
        dragOffset.value = { x: start.x, y: start.y };
        swipeDirection.value = undefined;
      }
    }

    function onPointerdown(event: PointerEvent) {
      if (event.button !== 0) return;
      drag = startDrag(event);
      if (!swipeDirections.value.length) return;
      const target = event.target as Element | null;
      if (target?.closest(SWIPE_IGNORE)) return;
      cancelled = false;
      intended = undefined;
      maxDisplacement = 0;
      activePointer = event.pointerId;
      dragStart = { x: event.clientX, y: event.clientY };
      cancelBaseline = dragStart;
      const el = event.currentTarget as HTMLElement;
      const transform = transformOf(el);
      initial.value = transform;
      dragOffset.value = { x: transform.x, y: transform.y };
      provider.hovering.value = true;
      swiping.value = true;
      realSwipe.value = false;
      locked.value = null;
      firstMove = true;
      stopDocument?.();
      const doc = el.ownerDocument;
      doc.addEventListener('pointerup', swipeEnd);
      doc.addEventListener('pointercancel', swipeEnd);
      stopDocument = () => {
        doc.removeEventListener('pointerup', swipeEnd);
        doc.removeEventListener('pointercancel', swipeEnd);
      };
      el.setPointerCapture?.(event.pointerId);
    }

    function onPointermove(event: PointerEvent) {
      if (drag) moveDrag(drag, event, directions.value);
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      if (firstMove) {
        dragStart = { x: event.clientX, y: event.clientY };
        firstMove = false;
      }
      const { clientX, clientY, movementX, movementY } = event;
      if (
        (movementY < 0 && clientY > cancelBaseline.y) ||
        (movementY > 0 && clientY < cancelBaseline.y)
      )
        cancelBaseline = { x: cancelBaseline.x, y: clientY };
      if (
        (movementX < 0 && clientX > cancelBaseline.x) ||
        (movementX > 0 && clientX < cancelBaseline.x)
      )
        cancelBaseline = { x: clientX, y: cancelBaseline.y };
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      const cancelX = clientX - cancelBaseline.x;
      const cancelY = clientY - cancelBaseline.y;
      const list = swipeDirections.value;
      const horizontal = list.includes('left') || list.includes('right');
      const vertical = list.includes('up') || list.includes('down');
      let lockedNow = locked.value;
      if (
        !realSwipe.value &&
        Math.hypot(deltaX, deltaY) >= MIN_DRAG_THRESHOLD
      ) {
        realSwipe.value = true;
        if (horizontal && vertical) {
          lockedNow =
            Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
          locked.value = lockedNow;
        }
      }
      if (!intended) {
        let candidate: Direction | undefined;
        if (lockedNow === 'vertical') {
          if (deltaY > 0) candidate = 'down';
          else if (deltaY < 0) candidate = 'up';
        } else if (lockedNow === 'horizontal') {
          if (deltaX > 0) candidate = 'right';
          else if (deltaX < 0) candidate = 'left';
        } else if (Math.abs(deltaX) >= Math.abs(deltaY))
          candidate = deltaX > 0 ? 'right' : 'left';
        else candidate = deltaY > 0 ? 'down' : 'up';
        if (candidate && list.includes(candidate)) {
          intended = candidate;
          maxDisplacement = displacementOf(candidate, deltaX, deltaY);
          swipeDirection.value = candidate;
        }
      } else {
        const current = displacementOf(intended, cancelX, cancelY);
        if (current > SWIPE_THRESHOLD) {
          cancelled = false;
          swipeDirection.value = intended;
        } else if (
          !(list.includes('left') && list.includes('right')) &&
          !(list.includes('up') && list.includes('down')) &&
          maxDisplacement - current >= REVERSE_CANCEL_THRESHOLD
        )
          cancelled = true;
      }
      const delta = damped(deltaX, deltaY);
      let x = initial.value.x;
      let y = initial.value.y;
      if (lockedNow !== 'vertical' && horizontal) x += delta.x;
      if (lockedNow !== 'horizontal' && vertical) y += delta.y;
      dragOffset.value = { x, y };
    }

    function onPointerup(event: PointerEvent) {
      if (drag?.pointerId === event.pointerId)
        drag.releasedAt = event.timeStamp;
      swipeEnd(event);
    }

    function onPointercancel(event: PointerEvent) {
      drag = null;
      swipeEnd(event);
    }

    onBeforeUnmount(() => {
      stopDocument?.();
      observer?.disconnect();
    });

    onMounted(() => {
      const el = element.value;
      // reka teleports each toast to the end of the viewport: newest first, like Base UI.
      const first = el?.parentElement?.firstElementChild;
      if (el && first && first !== el && !anchored.value)
        el.parentElement!.insertBefore(el, first);
      const icon = el && iconOf(el);
      if (icon)
        showIcon(
          icon,
          props.toast.status,
          tokens.value.transition.check.delay,
          tokens.value,
          reduce.value,
        );
      // Reading the height lays the starting style out, so the change below transitions.
      void el?.offsetHeight;
      status.value = undefined;
    });

    let lastStatus = props.toast.status;
    watch(
      () => [props.toast.status, props.toast.title, props.toast.description],
      () => {
        const snapshot = takeSnapshot(element.value, labels);
        if (!snapshot) return;
        void nextTick(() => {
          const typeChanged = lastStatus !== props.toast.status;
          lastStatus = props.toast.status;
          swapContent(
            element.value,
            snapshot,
            typeChanged,
            props.toast.status,
            tokens.value,
            toCssTiming(enterTiming.value),
            reduce.value,
            labels,
          );
        });
      },
      { flush: 'pre' },
    );

    let exiting = 0;
    watch(
      () => props.toast.open,
      (open) => {
        const run = ++exiting;
        if (open) {
          if (status.value === 'ending') status.value = undefined;
          kept.value = true;
          return;
        }
        status.value = 'ending';
        void nextTick(() =>
          requestAnimationFrame(async () => {
            const el = element.value;
            while (el?.isConnected && run === exiting) {
              const running = el.getAnimations();
              if (!running.length) break;
              await Promise.all(running.map((a) => a.finished.catch(() => {})));
            }
            if (run === exiting) kept.value = false;
          }),
        );
      },
    );

    const setElement = (node: unknown) => {
      element.value = elementOf(node);
    };

    return () => {
      const expanded = provider.expanded.value;
      const cascade =
        cascading(expanded) && !reduce.value
          ? `calc(var(--toast-index, 0) * ${tokens.value.stagger.stack * 1000}ms)`
          : undefined;
      const state: StackState = {
        transitionStatus: status.value,
        expanded,
        limited: limited.value,
        swiping: swiping.value,
        swipeDirection: swipeDirection.value,
      };
      const offset = dragOffset.value;
      const start = initial.value;
      const progressBar = props.progressBar ?? settings().progressBar;
      const duration = props.toast.duration ?? settings().timeout;
      const fade = toCssTiming(fadeTiming.value);
      const style: Style = {
        userSelect: 'none',
        touchAction: swipeDirections.value.length ? 'none' : undefined,
        transition: swiping.value ? 'none' : undefined,
        transform: swiping.value
          ? `translateX(${offset.x}px) translateY(${offset.y}px) scale(${start.scale})`
          : undefined,
        '--toast-swipe-movement-x': `${offset.x - start.x}px`,
        '--toast-swipe-movement-y': `${offset.y - start.y}px`,
        '--toast-index': 'var(--reka-toast-index)',
        '--toast-offset-y': 'var(--reka-toast-offset-y)',
        '--toast-height': 'var(--reka-toast-height)',
        '--toast-frontmost-height': 'var(--reka-toast-frontmost-height)',
        ...stackStyle(state, {
          side: side.value,
          reduce: reduce.value,
          anchored: anchored.value,
          enter: toCssTiming(enterTiming.value),
          exit: toCssTiming(exitTiming.value),
          cascade,
          swipe:
            state.swiping && drag ? swipeStyle(drag, directions.value) : null,
          thrown:
            state.transitionStatus === 'ending' && state.swipeDirection && drag
              ? throwTiming(drag, state.swipeDirection)
              : null,
        }),
        ...(progressBar && {
          '--animate-ui-toast-fade-duration': `${fade.duration}ms`,
          '--animate-ui-toast-fade-ease': fade.easing,
          '--animate-ui-toast-cascade': cascade ?? '0ms',
        }),
      };
      return h(
        RekaToastRoot,
        mergeProps({ style }, attrs, {
          ref: setElement,
          toast: props.toast,
          as: props.as,
          asChild: props.asChild,
          forceMount: kept.value,
          'data-starting-style': status.value === 'starting' ? '' : undefined,
          'data-ending-style': status.value === 'ending' ? '' : undefined,
          'data-swiping': swiping.value ? '' : undefined,
          'data-type': props.toast.status,
          onPointerdown,
          onPointermove,
          onPointerup,
          onPointercancel,
        }),
        {
          default: (slotProps: Record<string, unknown>) => [
            slots.default?.(slotProps),
            progressBar && !anchored.value
              ? h(RemainingTime, {
                  duration,
                  running: props.toast.status !== 'loading' && duration > 0,
                  ending: status.value === 'ending',
                })
              : null,
          ],
        },
      );
    };
  },
});

const ToastRoot = defineComponent({
  name: 'ToastRoot',
  inheritAttrs: false,
  props: rootProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(RootMotion, { ...props, ...attrs }, slots),
      );
  },
});

const TINT_VAR = '--animate-ui-toast-progress-color';
const TINTED = 'data-tinted';

function injectStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = PROGRESS_CSS;
  doc.head.append(style);
}

const RemainingTime = defineComponent({
  name: 'ToastRemainingTime',
  props: {
    duration: { type: Number, required: true },
    running: { type: Boolean, required: true },
    ending: { type: Boolean, required: true },
  },
  setup(props) {
    const bar = shallowRef<HTMLElement | null>(null);
    let animation: Animation | null = null;
    const windowFocused = ref(
      typeof document === 'undefined' ? true : document.hasFocus(),
    );
    const onFocusChange = () => {
      windowFocused.value = document.hasFocus();
    };

    const rootOf = () => bar.value?.parentElement?.parentElement ?? null;

    const sync = () => {
      const root = rootOf();
      if (!animation || !root) return;
      const paused =
        props.ending ||
        !windowFocused.value ||
        root.hasAttribute('data-expanded');
      if (paused && animation.playState === 'running') animation.pause();
      if (!paused && animation.playState === 'paused') animation.play();
    };

    let observer: MutationObserver | null = null;
    const start = () => {
      animation?.cancel();
      animation = null;
      observer?.disconnect();
      observer = null;
      const el = bar.value;
      if (!props.running || !el) return;
      injectStyle(el.ownerDocument);
      animation = el.animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        { duration: props.duration, easing: 'linear', fill: 'forwards' },
      );
      const root = rootOf();
      const icon = root?.querySelector('[data-slot="toast-icon"] > *');
      const tint = icon && root ? getComputedStyle(icon).color : null;
      if (tint && tint !== getComputedStyle(root!).color) {
        el.style.setProperty(TINT_VAR, tint);
        el.setAttribute(TINTED, '');
      } else {
        el.style.removeProperty(TINT_VAR);
        el.removeAttribute(TINTED);
      }
      if (root) {
        observer = new MutationObserver(sync);
        observer.observe(root, { attributeFilter: ['data-expanded'] });
      }
      sync();
    };

    onMounted(() => {
      window.addEventListener('focus', onFocusChange, true);
      window.addEventListener('blur', onFocusChange, true);
    });
    watch([bar, () => props.running, () => props.duration], start, {
      flush: 'post',
    });
    watch([() => props.ending, windowFocused], sync, { flush: 'post' });
    onBeforeUnmount(() => {
      window.removeEventListener('focus', onFocusChange, true);
      window.removeEventListener('blur', onFocusChange, true);
      animation?.cancel();
      observer?.disconnect();
    });

    return () =>
      props.running
        ? h('div', { [PROGRESS]: '', 'aria-hidden': 'true' }, [
            h('div', {
              ref: (node: unknown) => {
                bar.value = node instanceof HTMLElement ? node : null;
              },
              [PROGRESS_BAR]: '',
            }),
          ])
        : null;
  },
});

type ToastContentProps = {
  transition?: Transition;
  as?: string;
  asChild?: boolean;
};

const ToastContent = defineComponent({
  name: 'ToastContent',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
    as: { type: String, default: 'div' },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const tokens = useMotionTokens();
    const cascading = useCascade();
    const root = inject(ToastRootStateKey, null);
    const timing = useTempoTransition(
      () => props.transition ?? FADE_TRANSITION,
    );
    return () => {
      const expanded = root?.expanded() ?? false;
      const style = transitionStyle(
        ['opacity'],
        toCssTiming(timing.value),
        cascading(expanded) && !reduce.value
          ? `calc(var(--toast-index, 0) * ${tokens.value.stagger.stack * 1000}ms)`
          : undefined,
      );
      return h(
        Primitive,
        mergeProps({ style }, attrs, {
          as: props.as,
          asChild: props.asChild,
          'data-behind': (root?.index() ?? 0) > 0 ? '' : undefined,
          'data-expanded': expanded ? '' : undefined,
        }),
        slots,
      );
    };
  },
});

function labelPart(
  name: string,
  Part: typeof RekaToastTitle | typeof RekaToastDescription,
  key: 'title' | 'description',
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const root = inject(ToastRootStateKey, null);
      const register = (node: unknown) => {
        if (root) root.labels[key].value = elementOf(node);
      };
      return () => h(Part, { ...attrs, ref: register }, slots);
    },
  }) as unknown as typeof Part;
}

const ToastTitle = labelPart('ToastTitle', RekaToastTitle, 'title');
const ToastDescription = labelPart(
  'ToastDescription',
  RekaToastDescription,
  'description',
);

export {
  ToastAction,
  ToastArrow,
  ToastClose,
  ToastPortal,
  ToastPositioner,
  ToastViewport,
  createToastManager,
  useToastManager,
  type ToastActionProps,
  type ToastAddOptions,
  type ToastArrowProps,
  type ToastCloseProps,
  type ToastDescriptionProps,
  type ToastManager,
  type ToastObject,
  type ToastPortalProps,
  type ToastPositionerProps,
  type ToastPromiseOptions,
  type ToastTitleProps,
  type ToastUpdateOptions,
  type ToastViewportProps,
} from 'reka-ui';

export {
  ToastProvider,
  ToastRoot,
  ToastContent,
  ToastTitle,
  ToastDescription,
  type ToastProviderProps,
  type ToastRootProps,
  type ToastContentProps,
};
