import {
  defineComponent,
  h,
  inject,
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
  animate,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
  type CheckAnimation,
} from '../utils/motion';
import { HIDDEN_SCALE, MENU_TRANSITION } from './anchored';
import { staggerRows, useStaggerTiming } from './stagger';
import { provideHighlightScope, useItemHighlight } from './item-highlight';
import {
  createCheckGroup,
  PickKey,
  providePicks,
  usePickHold,
  type CheckGroup,
  type Picked,
} from './item-indicator';
import {
  elementOf,
  isOn,
  ItemCheckFromState,
  withHighlight,
} from './reka-menu';

type ListState = {
  open: () => boolean;
  picked: () => Picked;
  multiple: () => boolean;
};

const ListStateKey: InjectionKey<ListState> = Symbol('AnimateUIList');
const ListGroupKey: InjectionKey<CheckGroup> = Symbol('AnimateUIListChecks');

/** A root whose open state, and whether it closed on a pick, its parts read. */
export function createListRoot(Root: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      open: { type: Boolean, default: undefined },
      defaultOpen: Boolean,
    },
    emits: ['update:open'],
    setup(props, { attrs, emit, slots }) {
      const own = ref(props.defaultOpen);
      const open = () => (props.open === undefined ? own.value : props.open);
      const picked = ref<Picked>(false);
      const picks = providePicks();
      provide(ListStateKey, {
        open,
        picked: () => picked.value,
        multiple: () => isOn(attrs.multiple),
      });
      const setOpen = (next: boolean) => {
        picked.value = !next && picks.wasPicked();
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

/** A Portal that, like the list it holds, never keeps a closed list mounted. */
export function createListPortal(Portal: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: { forceMount: Boolean },
    setup(_, { attrs, slots }) {
      return () => h(Portal, attrs, slots);
    },
  });
}

/**
 * The list: from its trigger (`position="popper"`), it scales in from 0.9
 * with a fade; laid in place, it only fades. It leaves the same way, a beat
 * later after a pick, so the check is seen.
 */
export function createListContent(
  Content: Component,
  name: string,
  { origin }: { origin: string },
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      forceMount: Boolean,
      transition: Object as PropType<Transition>,
      exitTransition: Object as PropType<Transition>,
    },
    setup(props, { attrs, slots }) {
      const state = inject(ListStateKey, null);
      const reduce = useShouldReduceMotion();
      const enter = useTempoTransition(
        () => props.transition ?? MENU_TRANSITION,
      );
      const leave = useTempoTransition(
        () => props.exitTransition ?? props.transition ?? MENU_TRANSITION,
      );
      const hold = usePickHold();
      provide(ListGroupKey, createCheckGroup());
      provideHighlightScope(() => Boolean(state?.open()));
      const id = useId();
      const present = ref(Boolean(state?.open()));
      let openedAt = -Infinity;
      watch(
        () => state?.open(),
        (open) => {
          if (!open) return;
          present.value = true;
          openedAt = performance.now();
        },
        { flush: 'sync', immediate: true },
      );
      // While it leaves, or for the press that reopened it, it doesn't close.
      const guard = (handler: unknown) => (event: Event) => {
        (handler as ((e: Event) => void) | undefined)?.(event);
        const cause = (event as CustomEvent<{ originalEvent?: Event } | null>)
          .detail?.originalEvent;
        if (!state?.open() || (cause && cause.timeStamp < openedAt))
          event.preventDefault();
      };

      const popper = () => attrs.position === 'popper';
      const hidden = () =>
        popper()
          ? { opacity: 0, scale: reduce.value ? 1 : HIDDEN_SCALE.menu }
          : { opacity: 0 };
      let shown: HTMLElement | null = null;
      let controls: AnimationPlaybackControls | null = null;
      const stagger = useStaggerTiming();
      let unstagger: (() => void) | null = null;
      watch(
        () => [present.value, Boolean(state?.open())] as const,
        ([isPresent, open]) => {
          if (!isPresent || !state) {
            shown = null;
            return;
          }
          const el = document.querySelector<HTMLElement>(
            `[data-animate-ui-list="${id}"]`,
          );
          if (!el) return;
          const fresh = el !== shown;
          shown = el;
          controls?.stop();
          if (open) {
            if (fresh && !reduce.value) unstagger = staggerRows(el, stagger());
            const from = hidden();
            controls = animate(
              el,
              fresh
                ? Object.fromEntries(
                    Object.entries(from).map(([key, value]) => [
                      key,
                      [value, 1],
                    ]),
                  )
                : popper()
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1 },
              enter.value,
            );
            return;
          }
          unstagger?.();
          unstagger = null;
          const picked = state.picked();
          const exit =
            picked && !reduce.value
              ? {
                  ...leave.value,
                  delay:
                    ((leave.value as { delay?: number }).delay ?? 0) +
                    hold(picked as CheckAnimation),
                }
              : leave.value;
          const leaving = animate(el, hidden(), exit);
          controls = leaving;
          void leaving.then(() => {
            if (controls !== leaving) return;
            requestAnimationFrame(() => {
              if (!state.open()) present.value = false;
            });
          });
        },
        { flush: 'post', immediate: true },
      );

      return () => {
        if (!state || isOn(attrs.asChild) || isOn(attrs['as-child']))
          return h(Content, attrs, slots);
        if (!present.value) return h(Content, attrs, slots);
        const open = state.open();
        return h(
          Content,
          {
            ...attrs,
            onEscapeKeyDown: guard(attrs.onEscapeKeyDown),
            onPointerDownOutside: guard(attrs.onPointerDownOutside),
            forceMount: true,
            'data-animate-ui-list': id,
            inert: !open || undefined,
            style: [
              {
                transformOrigin: popper() ? `var(${origin})` : undefined,
                isolation: 'isolate',
              },
              attrs.style,
            ],
          },
          slots,
        );
      };
    },
  });
}

/** An item that wears the list's highlight, and marks a pick so the list holds. */
export function createListItem(Item: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const picks = inject(PickKey, null);
      const highlight = useItemHighlight(() => isOn(attrs.disabled));
      const element = shallowRef<HTMLElement | null>(null);
      const onSelect = (event: Event) => {
        (attrs.onSelect as ((e: Event) => void) | undefined)?.(event);
        const item = element.value;
        if (
          event.defaultPrevented ||
          isOn(attrs.disabled) ||
          item?.getAttribute('data-state') === 'checked'
        )
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

/** The chosen item's check: drawn or popped in, gliding to the next choice. */
export function createListItemIndicator(
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
      const state = inject(ListStateKey, null);
      const group = inject(ListGroupKey, null);
      return () => {
        if (!state || !group || isOn(attrs.asChild) || isOn(attrs['as-child']))
          return h(
            ItemIndicator,
            { ...attrs, forceMount: props.forceMount },
            slots,
          );
        const multiple = state.multiple();
        return h(
          ItemIndicator,
          { ...attrs, forceMount: true, asChild: true },
          {
            default: () =>
              h(
                ItemCheckFromState,
                {
                  multiple,
                  group: multiple ? null : group,
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
