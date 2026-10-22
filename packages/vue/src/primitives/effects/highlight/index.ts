import {
  cloneVNode,
  defineComponent,
  Fragment,
  h,
  inject,
  isVNode,
  mergeProps,
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
  type VNode,
} from 'vue';
import { AnimatePresence, motion, type Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.highlight;

const INSTANT: Transition = { duration: 0 };

type HighlightMode = 'children' | 'parent';

type Bounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type HighlightContextType = {
  mode: () => HighlightMode;
  activeValue: () => string | null;
  previousValue: () => string | null;
  changes: () => number;
  setActiveValue: (value: string | null) => void;
  setBounds: (bounds: DOMRect) => void;
  clearBounds: () => void;
  id: string;
  hover: () => boolean;
  click: () => boolean;
  className: () => unknown;
  style: () => unknown;
  setActiveClassName: (className: string) => void;
  transition: () => Transition;
  disabled: () => boolean;
  enabled: () => boolean;
  exitDelay: () => number;
  forceUpdateBounds: () => boolean | undefined;
};

const HighlightKey: InjectionKey<HighlightContextType> =
  Symbol('AnimateUIHighlight');

function useHighlight() {
  const context = inject(HighlightKey, null);
  if (!context) throw new Error('useHighlight must be used within a Highlight');
  return context;
}

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function useCanHover() {
  const canHover = ref(false);
  let query: MediaQueryList | null = null;
  const update = () => (canHover.value = query?.matches ?? false);
  onMounted(() => {
    query = window.matchMedia(HOVER_QUERY);
    update();
    query.addEventListener('change', update);
  });
  onBeforeUnmount(() => query?.removeEventListener('change', update));
  return canHover;
}

const M = motion as unknown as Record<string, Component>;

const ParentHighlight = defineComponent({
  name: 'ParentHighlight',
  props: {
    bounds: Object as PropType<Bounds | null>,
    transition: { type: Object as PropType<Transition>, required: true },
    exitDelay: { type: Number, required: true },
    surfaceClass: null,
    surfaceStyle: null,
  },
  setup(props) {
    const reduce = useShouldReduceMotion();
    return () => {
      const t = props.transition;
      const move: Transition = reduce.value
        ? { ...t, top: INSTANT, left: INSTANT, width: INSTANT, height: INSTANT }
        : t;
      const b = props.bounds;
      return h(
        AnimatePresence as Component,
        { initial: false, mode: 'wait' },
        () =>
          b
            ? h(M.div!, {
                'data-slot': 'motion-highlight',
                animate: { ...b, opacity: 1 },
                initial: { ...b, opacity: 0 },
                exit: {
                  opacity: 0,
                  transition: {
                    ...t,
                    delay: (t.delay ?? 0) + props.exitDelay / 1000,
                  },
                },
                transition: move,
                style: [
                  { position: 'absolute', zIndex: 0 },
                  props.surfaceStyle,
                ],
                class: props.surfaceClass,
              })
            : null,
      );
    };
  },
});

type HighlightProps = {
  as?: string;
  mode?: HighlightMode;
  modelValue?: string | null;
  defaultValue?: string | null;
  transition?: Transition;
  hover?: boolean;
  click?: boolean;
  disabled?: boolean;
  enabled?: boolean;
  exitDelay?: number;
  controlledItems?: boolean;
  itemsClassName?: string;
  boundsOffset?: Partial<Bounds>;
  containerClassName?: string;
  forceUpdateBounds?: boolean;
};

function children(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((node) =>
    isVNode(node) && node.type === Fragment && Array.isArray(node.children)
      ? children(node.children as VNode[])
      : isVNode(node) && typeof node.type === 'symbol'
        ? []
        : [node],
  );
}

/**
 * One surface behind the active item, gliding from item to item: follows
 * clicks (or hover) among its children.
 */
const Highlight = defineComponent({
  name: 'Highlight',
  inheritAttrs: false,
  props: {
    as: { type: String, default: 'div' },
    mode: { type: String as PropType<HighlightMode>, default: 'children' },
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: {
      type: String as PropType<string | null>,
      default: undefined,
    },
    transition: Object as PropType<Transition>,
    hover: Boolean,
    click: { type: Boolean, default: true },
    disabled: Boolean,
    enabled: { type: Boolean, default: true },
    exitDelay: { type: Number, default: 200 },
    controlledItems: Boolean,
    itemsClassName: String,
    boundsOffset: Object as PropType<Partial<Bounds>>,
    containerClassName: String,
    forceUpdateBounds: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const tokens = useMotionTokens();
    const transition = useTempoTransition(
      () => props.transition ?? HIGHLIGHT_TRANSITION,
    );
    const exitDelay = () => props.exitDelay * tokens.value.tempo;
    const container = shallowRef<HTMLElement | null>(null);

    const internal = ref<string | null>(props.defaultValue ?? null);
    watch(
      () => props.defaultValue,
      (value) => {
        if (value !== undefined) internal.value = value;
      },
    );
    const activeValue = () =>
      props.modelValue !== undefined ? props.modelValue : internal.value;
    const values = ref({
      current: activeValue() ?? null,
      previous: null as string | null,
      changes: 0,
    });
    watch(
      () => activeValue() ?? null,
      (current) => {
        if (values.value.current === current) return;
        values.value = {
          current,
          previous: values.value.current,
          changes: values.value.changes + 1,
        };
      },
      { flush: 'sync' },
    );
    const bounds = ref<Bounds | null>(null);
    const activeClassName = ref('');

    const setActiveValue = (id: string | null) => {
      if (id === activeValue()) return;
      if (props.modelValue === undefined) internal.value = id;
      emit('update:modelValue', id);
    };
    const setBounds = (rect: DOMRect) => {
      const el = container.value;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const offset = props.boundsOffset ?? {};
      const next: Bounds = {
        top: rect.top - box.top + (offset.top ?? 0),
        left: rect.left - box.left + (offset.left ?? 0),
        width: rect.width + (offset.width ?? 0),
        height: rect.height + (offset.height ?? 0),
      };
      const prev = bounds.value;
      if (
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
      )
        return;
      bounds.value = next;
    };
    const clearBounds = () => {
      if (bounds.value !== null) bounds.value = null;
    };

    const id = useId();
    provide(HighlightKey, {
      mode: () => props.mode,
      activeValue,
      previousValue: () => values.value.previous,
      changes: () => values.value.changes,
      setActiveValue,
      setBounds,
      clearBounds,
      id,
      hover: () => props.hover,
      click: () => props.click,
      className: () => attrs.class,
      style: () => attrs.style,
      setActiveClassName: (name) => (activeClassName.value = name),
      transition: () => transition.value,
      disabled: () => props.disabled,
      enabled: () => props.enabled,
      exitDelay,
      forceUpdateBounds: () => props.forceUpdateBounds,
    });

    watch(
      () => [props.mode, container.value, activeValue()] as const,
      ([mode, el, active], _, onCleanup) => {
        if (mode !== 'parent' || !el) return;
        const onScroll = () => {
          if (!active) return;
          const activeEl = el.querySelector<HTMLElement>(
            `[data-value="${active}"][data-highlight="true"]`,
          );
          if (activeEl) setBounds(activeEl.getBoundingClientRect());
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        onCleanup(() => el.removeEventListener('scroll', onScroll));
      },
      { flush: 'post', immediate: true },
    );

    return () => {
      const own = slots.default?.();
      if (!props.enabled) return h(ReducedMotionConfig, null, () => own);
      const items = props.controlledItems
        ? own
        : children(own).map((child, index) =>
            h(
              HighlightItem,
              { key: index, class: props.itemsClassName },
              () => child,
            ),
          );
      const content =
        props.mode === 'parent'
          ? h(
              props.as,
              {
                ref: container,
                'data-slot': 'motion-highlight-container',
                style: { position: 'relative', zIndex: 1 },
                class: props.containerClassName,
              },
              [
                h(ParentHighlight, {
                  bounds: bounds.value,
                  transition: transition.value,
                  exitDelay: exitDelay(),
                  surfaceStyle: attrs.style,
                  surfaceClass: [attrs.class, activeClassName.value],
                }),
                items,
              ],
            )
          : items;
      return h(ReducedMotionConfig, null, () => content);
    };
  },
});

type HighlightItemProps = {
  as?: string;
  id?: string;
  value?: string;
  transition?: Transition;
  activeClassName?: string;
  disabled?: boolean;
  exitDelay?: number;
  asChild?: boolean;
  forceUpdateBounds?: boolean;
};

function firstElement(nodes: VNode[] | undefined): VNode | null {
  for (const node of nodes ?? []) {
    if (!isVNode(node)) continue;
    if (node.type === Fragment && Array.isArray(node.children)) {
      const inner = firstElement(node.children as VNode[]);
      if (inner) return inner;
    } else if (typeof node.type !== 'symbol') return node;
  }
  return null;
}

const elementOf = (node: unknown) => {
  const el = (node as { $el?: unknown } | null)?.$el ?? node;
  return el instanceof HTMLElement ? el : null;
};

const call = (handler: unknown, event: Event) =>
  (handler as ((e: Event) => void) | undefined)?.(event);

/** An item of a Highlight: the surface comes behind it when it's active. */
const HighlightItem = defineComponent({
  name: 'HighlightItem',
  inheritAttrs: false,
  props: {
    as: { type: String, default: 'div' },
    id: String,
    value: String,
    transition: Object as PropType<Transition>,
    activeClassName: String,
    disabled: { type: Boolean, default: undefined },
    exitDelay: Number,
    asChild: Boolean,
    forceUpdateBounds: { type: Boolean, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const itemId = useId();
    const context = useHighlight();
    const tokens = useMotionTokens();
    const ownTransition = useTempoTransition(() => props.transition);
    const canHover = useCanHover();
    const element = shallowRef<HTMLElement | null>(null);
    const surfaceKey = ref('rest');
    const childValue = ref<string>(itemId);

    const isActive = () => context.activeValue() === childValue.value;
    const isDisabled = () =>
      props.disabled === undefined ? context.disabled() : props.disabled;

    watch(
      () =>
        [
          context.mode(),
          isActive(),
          isDisabled(),
          context.activeValue(),
          props.activeClassName,
          props.forceUpdateBounds,
          context.forceUpdateBounds(),
          element.value,
        ] as const,
      (
        [
          mode,
          active,
          disabled,
          activeValue,
          activeClassName,
          force,
          contextForce,
        ],
        _,
        onCleanup,
      ) => {
        if (mode !== 'parent') return;
        let frame = 0;
        let previous: DOMRect | null = null;
        const shouldUpdate =
          force === true || (contextForce && force !== false);
        const update = () => {
          const el = element.value;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (shouldUpdate) {
            if (
              previous &&
              previous.top === rect.top &&
              previous.left === rect.left &&
              previous.width === rect.width &&
              previous.height === rect.height
            ) {
              frame = requestAnimationFrame(update);
              return;
            }
            previous = rect;
            frame = requestAnimationFrame(update);
          }
          context.setBounds(rect);
        };
        let observer: ResizeObserver | undefined;
        if (active && disabled) context.clearBounds();
        else if (active) {
          update();
          context.setActiveClassName(activeClassName ?? '');
          const node = element.value;
          if (node && !shouldUpdate) {
            observer = new ResizeObserver(() => update());
            observer.observe(node);
            const host = node.closest(
              '[data-slot="motion-highlight-container"]',
            );
            if (host) observer.observe(host);
          }
        } else if (!activeValue) context.clearBounds();
        onCleanup(() => {
          observer?.disconnect();
          if (shouldUpdate) cancelAnimationFrame(frame);
        });
      },
      { flush: 'post', immediate: true },
    );

    return () => {
      const child = firstElement(slots.default?.());
      if (!child) return slots.default?.();
      const childProps = (child.props ?? {}) as Record<string, unknown>;
      childValue.value =
        props.id ??
        props.value ??
        (childProps['data-value'] as string | undefined) ??
        (childProps.id as string | undefined) ??
        itemId;
      const value = childValue.value;
      const active = isActive();
      const handOff = context.activeValue() !== null;
      const previousValue = context.previousValue();
      const handedTo =
        active && previousValue !== null && previousValue !== value;
      const wantedKey = handedTo ? `to-${context.changes()}` : surfaceKey.value;
      if (wantedKey !== surfaceKey.value) surfaceKey.value = wantedKey;
      const disabled = isDisabled();
      const itemTransition = ownTransition.value ?? context.transition();
      const itemExitDelay =
        props.exitDelay === undefined
          ? context.exitDelay()
          : props.exitDelay * tokens.value.tempo;
      const fade = {
        hidden: (handingOff: boolean) => ({
          opacity: 0,
          transition: handingOff
            ? { duration: 0 }
            : {
                ...itemTransition,
                delay: (itemTransition?.delay ?? 0) + itemExitDelay / 1000,
              },
        }),
        shown: { opacity: 1 },
      };
      const dataAttributes = {
        'data-active': active ? 'true' : 'false',
        'data-disabled': disabled,
        'data-value': value,
        'data-highlight': true,
      };
      const notOverriding = (extra: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(extra).filter(
            ([key]) => childProps[key] === undefined,
          ),
        );
      const handler =
        (
          name: 'onClick' | 'onMouseenter' | 'onMouseleave',
          next: string | null,
          on: boolean,
        ) =>
        (event: Event) => {
          if (on) context.setActiveValue(next);
          if (props.asChild) call(childProps[name], event);
          call(attrs[name], event);
        };
      const hover = context.hover() && canHover.value;
      const handlers = {
        onMouseenter: handler('onMouseenter', value, hover),
        onMouseleave: handler('onMouseleave', null, hover),
        onClick: handler('onClick', value, !context.hover() && context.click()),
      };
      const { class: ownClass, style: ownStyle, ...rest } = attrs;
      const surface = () =>
        h(
          AnimatePresence as Component,
          { initial: false, custom: handOff },
          () =>
            active && !disabled
              ? h(M.div!, {
                  key: wantedKey,
                  layoutId: `transition-background-${context.id}`,
                  'data-slot': 'motion-highlight',
                  style: [
                    { position: 'absolute', zIndex: 0 },
                    context.style(),
                    ownStyle,
                  ],
                  class: [context.className(), props.activeClassName],
                  transition: itemTransition,
                  layoutCrossfade: false,
                  custom: handOff,
                  variants: fade,
                  initial: handedTo ? false : 'hidden',
                  animate: 'shown',
                  exit: 'hidden',
                  ...dataAttributes,
                })
              : null,
        );
      const ref = (node: unknown) => {
        element.value = elementOf(node);
      };

      if (props.asChild) {
        if (context.mode() === 'children') {
          const merged = mergeProps(
            notOverriding({
              ...dataAttributes,
              'data-slot': 'motion-highlight-item-container',
            }),
            rest,
            handlers,
            { key: value, ref, class: [childProps.class, 'relative'] },
          );
          return h(child.type as Component, merged, [
            surface(),
            h(
              props.as,
              {
                'data-slot': 'motion-highlight-item',
                style: { position: 'relative', zIndex: 1 },
                class: ownClass,
                ...dataAttributes,
              },
              child.children as VNode[],
            ),
          ]);
        }
        return cloneVNode(
          child,
          {
            ref,
            ...notOverriding({
              ...dataAttributes,
              'data-slot': 'motion-highlight-item',
            }),
            ...handlers,
          },
          true,
        );
      }

      if (!context.enabled()) return child;
      return h(
        props.as,
        {
          key: value,
          ref,
          'data-slot': 'motion-highlight-item-container',
          class: [context.mode() === 'children' && 'relative', ownClass],
          ...dataAttributes,
          ...rest,
          ...handlers,
        },
        [
          context.mode() === 'children' ? surface() : null,
          cloneVNode(child, {
            style: [{ position: 'relative', zIndex: 1 }, childProps.style],
            ...notOverriding({
              ...dataAttributes,
              'data-slot': 'motion-highlight-item',
            }),
          }),
        ],
      );
    };
  },
});

export {
  Highlight,
  HighlightItem,
  useHighlight,
  type HighlightProps,
  type HighlightItemProps,
};
