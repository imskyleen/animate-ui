import {
  defineComponent,
  h,
  inject,
  isVNode,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from './anchored';
import { provideHighlightScope, useItemHighlight } from './item-highlight';
import {
  createCheckGroup,
  ItemCheck,
  PickKey,
  providePicks,
  usePickHold,
  type CheckGroup,
  type Picked,
} from './item-indicator';
import type { CheckAnimation } from '../utils/motion';

const isOn = (value: unknown) => value === '' || value === true;

const elementOf = (node: unknown) =>
  ((node as { $el?: unknown } | null)?.$el ?? node) as HTMLElement | null;

type MenuState = { open: () => boolean; picked: () => Picked };

const MenuStateKey: InjectionKey<MenuState> = Symbol('AnimateUIMenuState');
const PortalForceMountKey: InjectionKey<boolean> = Symbol(
  'AnimateUIMenuPortalForceMount',
);
const IndicatorItemKey: InjectionKey<{ kind: 'checkbox' | 'radio' }> = Symbol(
  'AnimateUIMenuIndicatorItem',
);
const RadioGroupKey: InjectionKey<CheckGroup> = Symbol(
  'AnimateUIMenuRadioGroup',
);

const CLOSING = 'data-animate-ui-closing';

function closingProps(open: boolean) {
  if (typeof document !== 'undefined' && !document.getElementById(CLOSING)) {
    const style = document.createElement('style');
    style.id = CLOSING;
    style.textContent = `[${CLOSING}]{pointer-events:none!important}`;
    document.head.append(style);
  }
  return open ? {} : { [CLOSING]: '' };
}

const animationProps = {
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
};

/** A menu root (or sub) whose open state, and whether it closed on a pick, its parts read. */
export function createMenuRoot(
  Root: Component,
  name: string,
  { sub = false }: { sub?: boolean } = {},
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      open: { type: Boolean, default: undefined },
      defaultOpen: Boolean,
    },
    emits: ['update:open'],
    setup(props, { attrs, emit, slots }) {
      const parent = inject(MenuStateKey, null);
      const own = ref(props.defaultOpen);
      const open = () => (props.open === undefined ? own.value : props.open);
      const picked = ref<Picked>(false);
      const picks = sub ? null : providePicks();
      provide(MenuStateKey, {
        open,
        picked: () => (sub ? (parent?.picked() ?? false) : picked.value),
      });
      const setOpen = (next: boolean) => {
        if (picks) picked.value = !next && picks.wasPicked();
        own.value = next;
        emit('update:open', next);
      };
      return () =>
        h(ReducedMotionConfig, null, () =>
          h(Root, { ...attrs, open: open(), 'onUpdate:open': setOpen }, slots),
        );
    },
  });
}

export function createMenuPortal(Portal: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: { forceMount: Boolean },
    setup(props, { attrs, slots }) {
      provide(PortalForceMountKey, props.forceMount);
      return () => h(Portal, attrs, slots);
    },
  });
}

type ContentOptions = {
  origin: string;
  sub?: boolean;
  returnFocus: 'trigger' | 'previous' | 'none';
};

const ContentMotion = defineComponent({
  name: 'AnimatedMenuContent',
  inheritAttrs: false,
  props: {
    ...animationProps,
    open: Boolean,
    keepMounted: Boolean,
    origin: { type: String, required: true },
    sub: Boolean,
    returnFocus: {
      type: String as PropType<ContentOptions['returnFocus']>,
      required: true,
    },
    onReturned: Function as PropType<() => void>,
  },
  emits: ['exited'],
  setup(props, { attrs, emit, slots }) {
    const state = inject(MenuStateKey)!;
    const reduce = useShouldReduceMotion();
    const enter = useTempoTransition(() => props.transition ?? MENU_TRANSITION);
    const leave = useTempoTransition(
      () => props.exitTransition ?? props.transition ?? MENU_TRANSITION,
    );
    const hold = usePickHold();
    const element = shallowRef<HTMLElement | null>(null);
    const settledClosed = ref(!props.open);
    if (!props.sub) provideHighlightScope(() => props.open);

    let previousFocus: Element | null = null;
    onMounted(() => {
      previousFocus = document.activeElement;
    });
    watch(
      () => props.open,
      (open) => {
        if (open) {
          settledClosed.value = false;
          previousFocus = document.activeElement;
          return;
        }
        const node = element.value;
        if (!node || props.returnFocus === 'none') return;
        const doc = node.ownerDocument;
        if (!node.contains(doc.activeElement)) return;
        const target =
          props.returnFocus === 'trigger'
            ? doc.getElementById(node.getAttribute('aria-labelledby') ?? '')
            : previousFocus;
        if (target instanceof HTMLElement) {
          target.focus({ preventScroll: true });
          props.onReturned?.();
        }
      },
      { flush: 'sync' },
    );

    return () => {
      const hidden = {
        opacity: 0,
        scale: reduce.value ? 1 : HIDDEN_SCALE.menu,
      };
      const picked = state.picked();
      const exit: Transition =
        picked && !reduce.value
          ? {
              ...leave.value,
              delay:
                ((leave.value as { delay?: number }).delay ?? 0) +
                hold(picked as CheckAnimation),
            }
          : leave.value;
      return h(
        motion.div as Component,
        {
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          initial: hidden,
          animate: props.open
            ? { opacity: 1, scale: 1, transition: enter.value }
            : { ...hidden, transition: exit },
          style: [
            attrs.style,
            {
              transformOrigin: `var(${props.origin})`,
              isolation: 'isolate',
              ...(props.keepMounted && settledClosed.value && !props.open
                ? { visibility: 'hidden' }
                : null),
            },
          ],
          ...closingProps(props.open),
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

type OutsideEvent = Event & { detail?: { originalEvent?: Event } };

/**
 * A menu's content: it scales in from 0.9 with a fade, from its trigger,
 * leaves the same way (a beat later after a pick, so the check is seen),
 * and gives the focus back at once.
 */
export function createMenuContent(
  Content: Component,
  name: string,
  options: ContentOptions,
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: { ...animationProps, forceMount: Boolean },
    setup(props, { attrs, slots }) {
      const state = inject(MenuStateKey, null);
      const portalForceMount = inject(PortalForceMountKey, false);
      const keepMounted = () => props.forceMount || portalForceMount;
      const present = ref(Boolean(state?.open()) || keepMounted());
      let openedAt = -Infinity;
      let returned = false;
      watch(
        () => state?.open(),
        (open) => {
          if (!open) return;
          present.value = true;
          openedAt = performance.now();
          returned = false;
        },
        { flush: 'sync', immediate: true },
      );
      const exited = () =>
        requestAnimationFrame(() => {
          if (!state?.open() && !keepMounted()) present.value = false;
        });
      const guard = (handler: unknown) => (event: OutsideEvent) => {
        (handler as ((e: Event) => void) | undefined)?.(event);
        const cause = event.detail?.originalEvent;
        if (!state?.open() || (cause && cause.timeStamp < openedAt))
          event.preventDefault();
      };

      return () => {
        if (!state || isOn(attrs.asChild) || isOn(attrs['as-child']))
          return h(Content, { ...attrs, forceMount: props.forceMount }, slots);
        if (!present.value && !keepMounted()) return null;
        const open = state.open();
        return h(ReducedMotionConfig, null, () =>
          h(
            Content,
            {
              ...attrs,
              forceMount: true,
              asChild: true,
              onEscapeKeyDown: guard(attrs.onEscapeKeyDown),
              onPointerDownOutside: guard(attrs.onPointerDownOutside),
              onFocusOutside: guard(attrs.onFocusOutside),
              onInteractOutside: guard(attrs.onInteractOutside),
              onCloseAutoFocus: (event: Event) => {
                (attrs.onCloseAutoFocus as ((e: Event) => void) | undefined)?.(
                  event,
                );
                if (returned) event.preventDefault();
              },
            },
            {
              default: (slotProps: Record<string, unknown>) =>
                h(
                  ContentMotion,
                  {
                    open,
                    keepMounted: keepMounted(),
                    origin: options.origin,
                    sub: Boolean(options.sub),
                    returnFocus: options.returnFocus,
                    transition: props.transition,
                    exitTransition: props.exitTransition,
                    onReturned: () => (returned = true),
                    onExited: exited,
                  },
                  () => slots.default?.(slotProps),
                ),
            },
          ),
        );
      };
    },
  });
}

/** Appends the highlight inside the item, or inside the element given `as-child`. */
function withHighlight(
  children: VNode[] | undefined,
  copies: VNode[],
  asChild: boolean,
) {
  if (copies.length === 0) return children;
  if (!asChild) return [...(children ?? []), ...copies];
  const [first, ...rest] = children ?? [];
  if (!isVNode(first) || typeof first.type !== 'string') return children;
  const own = Array.isArray(first.children)
    ? (first.children as VNode[])
    : typeof first.children === 'string'
      ? [first.children]
      : [];
  return [h(first.type, first.props, [...own, ...copies]), ...rest];
}

/** An item that wears its list's highlight. */
export function createMenuItem(Item: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const highlight = useItemHighlight(() => isOn(attrs.disabled));
      return () => {
        const asChild = isOn(attrs.asChild) || isOn(attrs['as-child']);
        return h(
          Item,
          {
            ...attrs,
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

/** A checkbox or radio item: it marks a pick, so the menu holds while its check shows. */
export function createMenuCheckItem(
  Item: Component,
  name: string,
  kind: 'checkbox' | 'radio',
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      provide(IndicatorItemKey, { kind });
      const picks = inject(PickKey, null);
      const highlight = useItemHighlight(() => isOn(attrs.disabled));
      const element = shallowRef<HTMLElement | null>(null);
      const onSelect = (event: Event) => {
        (attrs.onSelect as ((e: Event) => void) | undefined)?.(event);
        if (event.defaultPrevented) return;
        const item = element.value;
        if (kind === 'radio' && item?.getAttribute('data-state') === 'checked')
          return;
        const look = picks?.checkOf(item) ?? false;
        if (look) picks?.markPick(look);
      };
      return () => {
        const asChild = isOn(attrs.asChild) || isOn(attrs['as-child']);
        return h(
          Item,
          {
            ...attrs,
            onSelect,
            ref: (node: unknown) => {
              element.value = elementOf(node);
              highlight.setElement(element.value);
            },
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

export function createMenuRadioGroup(RadioGroup: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      provide(RadioGroupKey, createCheckGroup());
      return () => h(RadioGroup, attrs, slots);
    },
  });
}

/** The check of a checkbox or radio item, drawn or popped in and out. */
export function createMenuItemIndicator(
  ItemIndicator: Component,
  name: string,
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      forceMount: Boolean,
      animation: String as PropType<CheckAnimation>,
      transition: Object as PropType<Transition>,
    },
    setup(props, { attrs, slots }) {
      const item = inject(IndicatorItemKey, null);
      const group = inject(RadioGroupKey, null);
      return () => {
        if (!item || isOn(attrs.asChild) || isOn(attrs['as-child']))
          return h(
            ItemIndicator,
            { ...attrs, forceMount: props.forceMount },
            slots,
          );
        return h(
          ItemIndicator,
          { ...attrs, forceMount: true, asChild: true },
          {
            default: () =>
              h(
                ItemCheckFromState,
                {
                  multiple: item.kind === 'checkbox',
                  group: item.kind === 'radio' ? group : null,
                  animation: props.animation,
                  transition: props.transition,
                },
                slots,
              ),
          },
        );
      };
    },
  });
}

/** Reads the checked state reka puts on the indicator (`data-state`). */
const ItemCheckFromState = defineComponent({
  name: 'AnimatedItemIndicator',
  inheritAttrs: false,
  props: {
    multiple: Boolean,
    group: Object as PropType<CheckGroup | null>,
    animation: String as PropType<CheckAnimation>,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = attrs['data-state'];
      return h(
        ItemCheck,
        {
          ...attrs,
          ...props,
          checked: state === 'checked' || state === 'indeterminate',
          indeterminate: state === 'indeterminate',
        },
        slots,
      );
    };
  },
});

export type { MenuState };
