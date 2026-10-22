import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
  type Component,
  type PropType,
  type Ref,
} from 'vue';
import { injectDialogRootContext, Primitive } from 'reka-ui';
import { Motion, motion, type Transition } from 'motion-v';

import { ReducedMotionConfig, useShouldReduceMotion } from '../utils/motion';
import {
  getContentTargets,
  getModalSide,
  useBackdropFade,
  useContentTransitions,
  useOverlayTransitions,
  type FlipDirection,
} from './modal-motion';

const isOn = (value: unknown) => value === '' || value === true;

const animationProps = {
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
};

const CLOSING = 'data-animate-ui-closing';

/** Clicks go through a closing part: reka sets its own pointer-events inline. */
function closingProps(open: boolean) {
  if (typeof document !== 'undefined' && !document.getElementById(CLOSING)) {
    const style = document.createElement('style');
    style.id = CLOSING;
    style.textContent = `[${CLOSING}]{pointer-events:none!important}`;
    document.head.append(style);
  }
  return open ? {} : { [CLOSING]: '' };
}

const OverlayMotion = defineComponent({
  name: 'AnimatedOverlay',
  props: { ...animationProps, open: Boolean, asChild: Boolean },
  emits: ['exited'],
  setup(props, { emit, slots }) {
    const element = ref<HTMLElement | null>(null);
    const transitions = useOverlayTransitions(() => props);
    const { fadeIn, fadeOut } = useBackdropFade(element, transitions);
    onMounted(() => void fadeIn());
    watch(
      () => props.open,
      async (open) => {
        if (open) return void fadeIn();
        await fadeOut();
        if (!props.open) emit('exited');
      },
    );
    return () =>
      h(
        Primitive,
        {
          asChild: props.asChild,
          ref: (node: unknown) => {
            const el = (node as { $el?: unknown } | null)?.$el ?? node;
            element.value = el instanceof HTMLElement ? el : null;
          },
          ...closingProps(props.open),
        },
        slots,
      );
  },
});

const ContentMotion = defineComponent({
  name: 'AnimatedContent',
  props: {
    ...animationProps,
    open: Boolean,
    from: String as PropType<FlipDirection>,
    asChild: Boolean,
  },
  emits: ['exited'],
  setup(props, { attrs, emit, slots }) {
    const reduce = useShouldReduceMotion();
    const side = () => getModalSide(attrs['data-side']);
    const { enter, exit } = useContentTransitions(side, () => props);
    const entered = ref(false);
    onMounted(() => requestAnimationFrame(() => (entered.value = true)));
    return () => {
      const targets = getContentTargets({
        side: side(),
        from: props.from,
        reduce: reduce.value,
        enter: enter(),
        exit: exit(),
      });
      return h(
        props.asChild ? (Motion as Component) : (motion.div as Component),
        {
          ...(props.asChild && { asChild: true }),
          initial: targets.initial,
          animate: !props.open
            ? targets.exit
            : entered.value
              ? targets.animate
              : targets.initial,
          ...closingProps(props.open),
          onAnimationComplete: () => {
            if (!props.open) emit('exited');
          },
        },
        slots,
      );
    };
  },
});

type Presence = { present: Ref<boolean>; exiting: Set<symbol> };

const presences = new WeakMap<object, Presence>();

/**
 * Mounted while open, and through the exit that follows. A modal's parts
 * leave together, once the last one has played its exit, as Radix's do.
 */
function usePresent(
  root: NonNullable<ReturnType<typeof injectDialogRootContext>>,
) {
  let shared = presences.get(root);
  if (!shared) {
    shared = { present: ref(root.open.value), exiting: new Set() };
    presences.set(root, shared);
  }
  const { present, exiting } = shared;
  const id = Symbol();
  watch(
    () => root.open.value,
    (open) => {
      if (open) {
        present.value = true;
        exiting.clear();
      } else exiting.add(id);
    },
    { flush: 'sync' },
  );
  return {
    present,
    exited: () => {
      exiting.delete(id);
      if (exiting.size > 0) return;
      // A frame later, so its last frame (fully out) is painted.
      requestAnimationFrame(() => {
        if (!root.open.value && exiting.size === 0) present.value = false;
      });
    },
  };
}

/**
 * Animated Overlay and Content for a reka-ui modal, rendered `asChild` onto
 * our own elements and kept mounted through their exit: reopened on the way
 * out, they turn back from where they are.
 */
export function createRekaModal(
  parts: { Overlay: Component; Content: Component },
  name: string,
) {
  const Overlay = defineComponent({
    name: `${name}Overlay`,
    inheritAttrs: false,
    props: { ...animationProps, forceMount: Boolean },
    setup(props, { attrs, slots }) {
      const root = injectDialogRootContext();
      const { present, exited } = usePresent(root);
      return () => {
        const asChild = isOn(attrs.asChild) || isOn(attrs['as-child']);
        if (!present.value) return null;
        return h(ReducedMotionConfig, null, () =>
          h(parts.Overlay, { ...attrs, forceMount: true, asChild: true }, () =>
            h(
              OverlayMotion,
              {
                open: root.open.value,
                transition: props.transition,
                exitTransition: props.exitTransition,
                onExited: exited,
                asChild,
              },
              slots,
            ),
          ),
        );
      };
    },
  });

  const Content = defineComponent({
    name: `${name}Content`,
    inheritAttrs: false,
    props: {
      ...animationProps,
      from: String as PropType<FlipDirection>,
      forceMount: Boolean,
    },
    setup(props, { attrs, slots }) {
      const root = injectDialogRootContext();
      const { present, exited } = usePresent(root);
      // A press that began while closed (the one opening it) isn't outside.
      const startedClosed = new WeakSet<Event>();
      const note = (event: Event) => startedClosed.add(event);
      watch(
        () => root.open.value,
        (open, _, onCleanup) => {
          if (open) return;
          document.addEventListener('pointerdown', note, true);
          onCleanup(() =>
            document.removeEventListener('pointerdown', note, true),
          );
        },
        { immediate: true },
      );
      // Focus goes back to the trigger after the exit, unless it moved on meanwhile.
      const onCloseAutoFocus = (event: Event) => {
        const active = document.activeElement;
        const content = (event.target as Element | null) ?? null;
        if (
          active &&
          active !== document.body &&
          !(content instanceof Element && content.contains(active))
        )
          event.preventDefault();
        (attrs.onCloseAutoFocus as ((e: Event) => void) | undefined)?.(event);
      };
      const onPointerDownOutside = (
        event: CustomEvent<{ originalEvent: PointerEvent }>,
      ) => {
        if (startedClosed.has(event.detail.originalEvent))
          event.preventDefault();
        (attrs.onPointerDownOutside as ((e: Event) => void) | undefined)?.(
          event,
        );
      };
      return () => {
        const asChild = isOn(attrs.asChild) || isOn(attrs['as-child']);
        if (!present.value) return null;
        return h(ReducedMotionConfig, null, () =>
          h(
            parts.Content,
            {
              ...attrs,
              onPointerDownOutside,
              onCloseAutoFocus,
              forceMount: true,
              asChild: true,
              // Leaving, it lets clicks through to the page.
              ...(root.open.value
                ? null
                : { disableOutsidePointerEvents: false }),
            },
            {
              default: (slotProps: Record<string, unknown>) =>
                h(
                  ContentMotion,
                  {
                    open: root.open.value,
                    from: props.from,
                    transition: props.transition,
                    exitTransition: props.exitTransition,
                    onExited: exited,
                    asChild,
                  },
                  () => slots.default?.(slotProps),
                ),
            },
          ),
        );
      };
    },
  });

  return { Overlay, Content };
}
