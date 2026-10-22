import {
  defineComponent,
  Fragment,
  h,
  isVNode,
  type Component,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { useIsInView } from '../../../utils/use-is-in-view';
import { Slot } from '../../slot';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

type Slide = {
  direction?: SlideDirection;
  offset?: number;
};

type Fade = { initialOpacity?: number; opacity?: number };

type Zoom = {
  initialScale?: number;
  scale?: number;
};

type Blur = {
  initialBlur?: number;
  blur?: number;
};

const DEFAULT_SLIDE_DIRECTION: SlideDirection = 'up';
const DEFAULT_SLIDE_OFFSET = 100;
const DEFAULT_FADE_INITIAL_OPACITY = 0;
const DEFAULT_FADE_OPACITY = 1;
const DEFAULT_ZOOM_INITIAL_SCALE = 0.5;
const DEFAULT_ZOOM_SCALE = 1;
const DEFAULT_BLUR_INITIAL_BLUR = 10;
const DEFAULT_BLUR_BLUR = 0;
const DEFAULT_TRANSITION: Transition = motionTokens.spring.entrance;

const effectProps = {
  transition: Object as PropType<Transition>,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
  blur: { type: [Object, Boolean] as PropType<Blur | boolean>, default: false },
  slide: {
    type: [Object, Boolean] as PropType<Slide | boolean>,
    default: false,
  },
  fade: { type: [Object, Boolean] as PropType<Fade | boolean>, default: false },
  zoom: { type: [Object, Boolean] as PropType<Zoom | boolean>, default: false },
  asChild: Boolean,
} as const;

type EffectProps = {
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  blur?: Blur | boolean;
  slide?: Slide | boolean;
  fade?: Fade | boolean;
  zoom?: Zoom | boolean;
  asChild?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

const EffectInner = defineComponent({
  name: 'EffectInner',
  inheritAttrs: false,
  props: effectProps,
  setup(props, { attrs, slots }) {
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();

    return () => {
      const base = props.transition ?? defaultTransition.value;
      const hidden: Record<string, unknown> = {};
      const visible: Record<string, unknown> = {};
      const { slide, fade, zoom, blur } = props;

      if (slide && !reduce.value) {
        const offset =
          typeof slide === 'boolean'
            ? DEFAULT_SLIDE_OFFSET
            : (slide.offset ?? DEFAULT_SLIDE_OFFSET);
        const direction =
          typeof slide === 'boolean'
            ? DEFAULT_SLIDE_DIRECTION
            : (slide.direction ?? DEFAULT_SLIDE_DIRECTION);
        const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
        hidden[axis] =
          direction === 'right' || direction === 'down' ? -offset : offset;
        visible[axis] = 0;
      }
      if (fade) {
        hidden.opacity =
          typeof fade === 'boolean'
            ? DEFAULT_FADE_INITIAL_OPACITY
            : (fade.initialOpacity ?? DEFAULT_FADE_INITIAL_OPACITY);
        visible.opacity =
          typeof fade === 'boolean'
            ? DEFAULT_FADE_OPACITY
            : (fade.opacity ?? DEFAULT_FADE_OPACITY);
      }
      if (zoom && !reduce.value) {
        hidden.scale =
          typeof zoom === 'boolean'
            ? DEFAULT_ZOOM_INITIAL_SCALE
            : (zoom.initialScale ?? DEFAULT_ZOOM_INITIAL_SCALE);
        visible.scale =
          typeof zoom === 'boolean'
            ? DEFAULT_ZOOM_SCALE
            : (zoom.scale ?? DEFAULT_ZOOM_SCALE);
      }
      if (blur) {
        hidden.filter =
          typeof blur === 'boolean'
            ? `blur(${DEFAULT_BLUR_INITIAL_BLUR}px)`
            : `blur(${blur.initialBlur ?? DEFAULT_BLUR_INITIAL_BLUR}px)`;
        visible.filter =
          typeof blur === 'boolean'
            ? `blur(${DEFAULT_BLUR_BLUR}px)`
            : `blur(${blur.blur ?? DEFAULT_BLUR_BLUR}px)`;
      }
      if (reduce.value && (slide || zoom)) {
        hidden.opacity ??= DEFAULT_FADE_INITIAL_OPACITY;
        visible.opacity ??= DEFAULT_FADE_OPACITY;
      }

      return h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          initial: 'hidden',
          animate: isInView.value ? 'visible' : 'hidden',
          exit: 'hidden',
          variants: { hidden, visible },
          transition: {
            ...base,
            delay: (base.delay ?? 0) + props.delay / 1000,
          },
          ...attrs,
        },
        slots,
      );
    };
  },
});

/** An entrance: it slides, fades, zooms and unblurs in, once in view if asked. */
const Effect = defineComponent({
  name: 'Effect',
  inheritAttrs: false,
  props: effectProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(EffectInner, { ...attrs, ...props }, slots),
      );
  },
});

type EffectsProps = EffectProps & { holdDelay?: number };

function flatten(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((node) =>
    isVNode(node) && node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : isVNode(node) && typeof node.type === 'symbol'
        ? []
        : [node],
  );
}

/** Its children come in one after another, `hold-delay` apart. */
const Effects = defineComponent({
  name: 'Effects',
  inheritAttrs: false,
  props: { ...effectProps, holdDelay: { type: Number, default: 0 } },
  setup(props, { attrs, slots }) {
    return () => {
      const { holdDelay, delay, ...rest } = props;
      return flatten(slots.default?.()).map((child, index) =>
        h(
          Effect,
          {
            ...attrs,
            ...rest,
            key: child.key ?? index,
            delay: delay + index * holdDelay,
          },
          () => child,
        ),
      );
    };
  },
});

export {
  Effect,
  Effects,
  type EffectProps,
  type EffectsProps,
  type SlideDirection,
  type Slide,
  type Fade,
  type Zoom,
  type Blur,
};
