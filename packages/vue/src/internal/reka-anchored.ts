import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../utils/motion';
import { useAnchoredMotion, type AnchoredKind } from './anchored';
import {
  followCursorProps,
  provideFollowCursor,
  useFollowCursorHandler,
  useFollowCursorStyle,
  type FollowCursorProps,
} from './follow-cursor';

const isOn = (value: unknown) => value === '' || value === true;

const animationProps = {
  transition: Object as PropType<Transition>,
  exitTransition: Object as PropType<Transition>,
};

const PortalForceMountKey: InjectionKey<boolean> = Symbol(
  'AnimateUIPortalForceMount',
);

const AnchoredMotion = defineComponent({
  name: 'AnimatedAnchoredContent',
  props: {
    ...animationProps,
    open: Boolean,
    keepMounted: Boolean,
    kind: String as PropType<AnchoredKind>,
    as: { type: String, default: 'div' },
  },
  emits: ['exited'],
  setup(props, { emit, slots }) {
    const motionProps = useAnchoredMotion(() => props);
    const follow = useFollowCursorStyle();
    return () => {
      const { initial, animate, style } = motionProps.value;
      return h(
        (motion as unknown as Record<string, Component>)[props.as]!,
        {
          initial,
          animate,
          style: { ...style, ...follow() },
          inert: props.keepMounted && !props.open ? true : undefined,
          onAnimationComplete: (target: Record<string, unknown>) => {
            motionProps.settled(target);
            if (!props.open) emit('exited');
          },
        },
        slots,
      );
    };
  },
});

type RootContext = { open: Ref<boolean>; onOpen?: () => void };

/**
 * A reka-ui Portal and Content that animate like a popover, tooltip or
 * menu: shown while open (or force-mounted), kept through their exit, and
 * turned back from where they are if reopened on the way out.
 */
export function createRekaAnchored(
  parts: { Portal: Component; Content: Component },
  {
    name,
    kind,
    origin,
    useRoot,
  }: {
    name: string;
    kind: AnchoredKind;
    origin: string;
    useRoot: () => RootContext;
  },
) {
  const Portal = defineComponent({
    name: `${name}Portal`,
    inheritAttrs: false,
    props: { forceMount: Boolean },
    setup(props, { attrs, slots }) {
      provide(PortalForceMountKey, props.forceMount);
      return () => h(parts.Portal, attrs, slots);
    },
  });

  const Content = defineComponent({
    name: `${name}Content`,
    inheritAttrs: false,
    props: { ...animationProps, forceMount: Boolean },
    setup(props, { attrs, slots }) {
      const root = useRoot();
      const portalForceMount = inject(PortalForceMountKey, false);
      const keepMounted = () => props.forceMount || portalForceMount;
      const present = ref(root.open.value || keepMounted());
      watch(
        () => root.open.value,
        (open) => {
          if (open) present.value = true;
        },
        { flush: 'sync' },
      );
      // reka's tooltip announces its opening once open, and its own content,
      // still mounted (forced, or leaving), hears it and closes it: as Radix
      // does, the opening wins.
      if (kind === 'tooltip') {
        let opening = false;
        watch(
          () => root.open.value,
          (open) => {
            if (open) {
              opening = true;
              queueMicrotask(() => (opening = false));
            } else if (opening) root.onOpen?.();
          },
          { flush: 'sync' },
        );
      }
      const exited = () =>
        requestAnimationFrame(() => {
          if (!root.open.value && !keepMounted()) present.value = false;
        });
      return () => {
        if (isOn(attrs.asChild) || isOn(attrs['as-child']))
          return h(
            parts.Content,
            { ...attrs, forceMount: props.forceMount },
            slots,
          );
        if (!present.value && !keepMounted()) return null;
        return h(ReducedMotionConfig, null, () =>
          h(
            parts.Content,
            {
              ...attrs,
              style: [{ transformOrigin: origin }, attrs.style],
              forceMount: true,
              asChild: true,
            },
            {
              default: (slotProps: Record<string, unknown>) =>
                h(
                  AnchoredMotion,
                  {
                    open: root.open.value,
                    keepMounted: keepMounted(),
                    kind,
                    as: typeof attrs.as === 'string' ? attrs.as : 'div',
                    transition: props.transition,
                    exitTransition: props.exitTransition,
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

  return { Portal, Content };
}

/** A Root that lets its content follow the cursor over the trigger. */
export function createFollowCursorRoot(Root: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: followCursorProps,
    setup(props, { attrs, slots }) {
      provideFollowCursor(() => props as FollowCursorProps);
      return () => h(ReducedMotionConfig, null, () => h(Root, attrs, slots));
    },
  });
}

/** A Trigger feeding the cursor's offset to a following content. */
export function createFollowCursorTrigger(Trigger: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const onMousemove = useFollowCursorHandler();
      return () =>
        h(
          Trigger,
          {
            ...attrs,
            onMousemove: (event: MouseEvent) => {
              (attrs.onMousemove as ((e: MouseEvent) => void) | undefined)?.(
                event,
              );
              onMousemove(event);
            },
          },
          slots,
        );
    },
  });
}
