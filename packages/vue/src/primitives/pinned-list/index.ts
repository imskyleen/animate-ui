import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
  watch,
} from 'vue';
import {
  AnimatePresence,
  LayoutGroup,
  layoutGroupInjectionKey,
  motion,
  type Transition,
} from 'motion-v';

import { Slot } from '../slot';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { callHandler } from '../../internal/handlers';

const ITEM_TRANSITION: Transition = {
  stiffness: 320,
  damping: 25,
  mass: 0.8,
  type: 'spring',
};
const LABEL_TRANSITION: Transition = {
  duration: 0.22,
  ease: motionTokens.ease.out,
  layout: ITEM_TRANSITION,
};
const TRIGGER_TRANSITION: Transition = motionTokens.spring.press;

type PinnedListContextType = {
  movingId: Ref<string | null>;
  pin: (id: string) => void;
};

type PinnedListItemContextType = {
  id: () => string;
};

const PinnedListKey: InjectionKey<PinnedListContextType> = Symbol(
  'AnimateUIPinnedList',
);
const PinnedListItemKey: InjectionKey<PinnedListItemContextType> = Symbol(
  'AnimateUIPinnedListItem',
);

function usePinnedList() {
  const context = inject(PinnedListKey, null);
  if (!context)
    throw new Error('usePinnedList must be used within a PinnedList');
  return context;
}

function usePinnedListItem() {
  const context = inject(PinnedListItemKey, null);
  if (!context)
    throw new Error('usePinnedListItem must be used within a PinnedListItem');
  return context;
}

/** A list whose items glide between the pinned and unpinned groups. */
const PinnedList = defineComponent({
  name: 'PinnedList',
  inheritAttrs: false,
  emits: ['pinnedChange'],
  setup(_, { attrs, slots, emit }) {
    const movingId = ref<string | null>(null);
    provide(PinnedListKey, {
      movingId,
      pin: (id) => {
        movingId.value = id;
        emit('pinnedChange', id);
      },
    });
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          motion.div as Component,
          { 'data-slot': 'pinned-list', ...attrs },
          () => h(LayoutGroup as Component, null, slots),
        ),
      );
  },
});

const part = (name: string, slot: string) =>
  defineComponent({
    name,
    setup(_, { slots }) {
      return () => h('div', { 'data-slot': slot }, slots.default?.());
    },
  });

/** The pinned group. */
const PinnedListPinned = part('PinnedListPinned', 'pinned-list-pinned');

/** The unpinned group. */
const PinnedListUnpinned = part('PinnedListUnpinned', 'pinned-list-unpinned');

/** A group's items. */
const PinnedListItems = part('PinnedListItems', 'pinned-list-items');

type PinnedListLabelProps = {
  hide?: boolean;
  asChild?: boolean;
  transition?: Transition;
};

/** A group's label: it fades away while the group is empty. */
const PinnedListLabel = defineComponent({
  name: 'PinnedListLabel',
  inheritAttrs: false,
  props: {
    hide: Boolean,
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => LABEL_TRANSITION);
    // A label mounting measures the layout at once: the items below must have saved theirs first.
    const group = inject(layoutGroupInjectionKey, null);
    watch(
      () => props.hide,
      () => group?.group?.dirty(),
      { flush: 'pre' },
    );
    return () =>
      h(AnimatePresence as Component, { initial: false }, () =>
        props.hide
          ? null
          : h(
              (props.asChild ? Slot : motion.p) as Component,
              {
                layout: true,
                key: 'pinned-list-label',
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: props.transition ?? defaultTransition.value,
                ...attrs,
              },
              slots,
            ),
      );
  },
});

type PinnedListItemProps = {
  id: string;
  customTrigger?: boolean;
  asChild?: boolean;
  transition?: Transition;
};

/** An item: a click (or its trigger) moves it to the other group. */
const PinnedListItem = defineComponent({
  name: 'PinnedListItem',
  inheritAttrs: false,
  props: {
    id: { type: String, required: true },
    customTrigger: Boolean,
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => ITEM_TRANSITION);
    const { movingId, pin } = usePinnedList();
    const reduce = useShouldReduceMotion();
    provide(PinnedListItemKey, { id: () => props.id });
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'data-slot': 'pinned-list-item',
          layoutId: `pinned-list-item-${props.id}`,
          onLayoutAnimationComplete: () => {
            if (props.id === movingId.value) movingId.value = null;
          },
          transition: props.transition ?? defaultTransition.value,
          whilePress:
            !props.customTrigger && !reduce.value
              ? { scale: motionTokens.scale.press }
              : undefined,
          ...attrs,
          style: [
            {
              position: 'relative',
              zIndex: movingId.value === props.id ? 10 : undefined,
            },
            attrs.style,
          ],
          onClick: (event: MouseEvent) => {
            if (!props.customTrigger) pin(props.id);
            callHandler(attrs.onClick, event);
          },
        },
        slots,
      );
  },
});

type PinnedListTriggerProps = {
  asChild?: boolean;
};

/** A button in the item that moves it, when the item has `custom-trigger`. */
const PinnedListTrigger = defineComponent({
  name: 'PinnedListTrigger',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => TRIGGER_TRANSITION);
    const { pin } = usePinnedList();
    const { id } = usePinnedListItem();
    const reduce = useShouldReduceMotion();
    return () =>
      h(
        (props.asChild ? Slot : motion.button) as Component,
        {
          'data-slot': 'pinned-list-trigger',
          whilePress: reduce.value
            ? undefined
            : { scale: motionTokens.scale.press },
          transition: defaultTransition.value,
          ...attrs,
          onClick: (event: MouseEvent) => {
            event.stopPropagation();
            pin(id());
            callHandler(attrs.onClick, event);
          },
        },
        slots,
      );
  },
});

export {
  PinnedList,
  PinnedListPinned,
  PinnedListUnpinned,
  PinnedListLabel,
  PinnedListItems,
  PinnedListItem,
  PinnedListTrigger,
  usePinnedList,
  usePinnedListItem,
  type PinnedListLabelProps,
  type PinnedListItemProps,
  type PinnedListTriggerProps,
  type PinnedListContextType,
  type PinnedListItemContextType,
};
