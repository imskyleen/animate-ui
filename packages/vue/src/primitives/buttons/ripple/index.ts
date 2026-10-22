import {
  defineComponent,
  Fragment,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot } from '../../slot';
import { callHandler, SCALE_SPRING, TAP_SCALE } from '../_button';

const RIPPLE_TRANSITION: Transition = { duration: 0.6, ease: 'easeOut' };

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type RippleButtonContextType = {
  ripples: Ref<Ripple[]>;
};

const RippleButtonKey: InjectionKey<RippleButtonContextType> = Symbol(
  'AnimateUIRippleButton',
);

function useRippleButton() {
  const context = inject(RippleButtonKey, null);
  if (!context)
    throw new Error('RippleButtonRipples must be used within a RippleButton');
  return context;
}

type RippleButtonProps = {
  hoverScale?: number;
  tapScale?: number;
  asChild?: boolean;
  transition?: Transition;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

const RippleButtonContent = defineComponent({
  name: 'RippleButtonContent',
  inheritAttrs: false,
  props: {
    hoverScale: { type: Number, default: 1 },
    tapScale: { type: Number, default: TAP_SCALE },
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const tokens = useMotionTokens();
    const defaultTransition = useTempoTransition(() => SCALE_SPRING);
    const reduce = useShouldReduceMotion();
    const ripples = ref<Ripple[]>([]);
    const button = ref<HTMLElement | null>(null);
    let nextId = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)));

    const createRipple = (event: MouseEvent) => {
      const element = button.value;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const x =
        (event.clientX - rect.left) * (element.offsetWidth / rect.width);
      const y =
        (event.clientY - rect.top) * (element.offsetHeight / rect.height);
      const ripple: Ripple = { id: nextId++, x, y };
      ripples.value = [...ripples.value, ripple];
      const timer = setTimeout(() => {
        timers.delete(timer);
        ripples.value = ripples.value.filter((r) => r.id !== ripple.id);
      }, 600 * tokens.value.tempo);
      timers.add(timer);
    };

    provide(RippleButtonKey, { ripples });
    return () =>
      h(
        (props.asChild ? Slot : motion.button) as Component,
        {
          'data-slot': 'ripple-button',
          initial: reduce.value ? undefined : { transform: 'scale(1)' },
          whilePress: reduce.value
            ? undefined
            : { transform: `scale(${props.tapScale})` },
          whileHover:
            reduce.value || props.hoverScale === 1
              ? undefined
              : { transform: `scale(${props.hoverScale})` },
          transition: props.transition ?? defaultTransition.value,
          ...attrs,
          ref: (node: unknown) => {
            button.value = elementOf(node);
          },
          style: [{ position: 'relative', overflow: 'hidden' }, attrs.style],
          onClick: (event: MouseEvent) => {
            createRipple(event);
            callHandler(attrs.onClick, event);
          },
        },
        slots,
      );
  },
});

/** A button that sends a ripple out from where it was clicked. */
const RippleButton = defineComponent({
  name: 'RippleButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(RippleButtonContent as Component, attrs, slots),
      );
  },
});

type RippleButtonRipplesProps = {
  color?: string;
  scale?: number;
  asChild?: boolean;
  transition?: Transition;
};

/** The ripples: each one grows from the click and fades. */
const RippleButtonRipples = defineComponent({
  name: 'RippleButtonRipples',
  inheritAttrs: false,
  props: {
    color: { type: String, default: 'var(--ripple-button-ripple-color)' },
    scale: { type: Number, default: 10 },
    asChild: Boolean,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const { ripples } = useRippleButton();
    const defaultTransition = useTempoTransition(() => RIPPLE_TRANSITION);
    const reduce = useShouldReduceMotion();
    return () =>
      h(
        Fragment,
        ripples.value.map((ripple) =>
          h(
            (props.asChild ? Slot : motion.span) as Component,
            {
              key: ripple.id,
              initial: { scale: reduce.value ? props.scale : 0, opacity: 0.5 },
              animate: { scale: props.scale, opacity: 0 },
              transition: props.transition ?? defaultTransition.value,
              ...attrs,
              style: [
                {
                  position: 'absolute',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  width: '20px',
                  height: '20px',
                  backgroundColor: props.color,
                  top: `${ripple.y - 10}px`,
                  left: `${ripple.x - 10}px`,
                },
                attrs.style,
              ],
            },
            slots,
          ),
        ),
      );
  },
});

export {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
  type RippleButtonRipplesProps,
};
