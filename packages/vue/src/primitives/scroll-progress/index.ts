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
} from 'vue';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'motion-v';

import { Slot } from '../slot';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../utils/motion';

type ScrollProgressDirection = 'horizontal' | 'vertical';

type ScrollProgressContextType = {
  container: Ref<HTMLElement | null>;
  progress: () => MotionValue<number>;
  scale: () => MotionValue<number>;
  size: () => MotionValue<string>;
  direction: () => ScrollProgressDirection;
  global: () => boolean;
};

const ScrollProgressKey: InjectionKey<ScrollProgressContextType> = Symbol(
  'AnimateUIScrollProgress',
);

function useScrollProgress() {
  const context = inject(ScrollProgressKey, null);
  if (!context)
    throw new Error(
      'useScrollProgress must be used within a ScrollProgressProvider',
    );
  return context;
}

type ScrollProgressProviderProps = {
  global?: boolean;
  transition?: SpringOptions;
  direction?: ScrollProgressDirection;
};

const toPercent = (value: number) => `${value * 100}%`;

const ScrollProgressProviderInner = defineComponent({
  name: 'ScrollProgressProviderInner',
  props: {
    global: Boolean,
    transition: {
      type: Object as PropType<SpringOptions>,
      default: () => ({ stiffness: 250, damping: 40, bounce: 0 }),
    },
    direction: {
      type: String as PropType<ScrollProgressDirection>,
      default: 'vertical',
    },
  },
  setup(props, { slots }) {
    const container = ref<HTMLElement | null>(null);
    const reduce = useShouldReduceMotion();
    const { scrollXProgress, scrollYProgress } = useScroll(() =>
      props.global ? {} : { container },
    );
    const progress = () =>
      props.direction === 'vertical' ? scrollYProgress : scrollXProgress;
    const smoothedY = useSpring(scrollYProgress, props.transition);
    const smoothedX = useSpring(scrollXProgress, props.transition);
    const sizes = {
      y: useTransform(scrollYProgress, toPercent),
      x: useTransform(scrollXProgress, toPercent),
      smoothedY: useTransform(smoothedY, toPercent),
      smoothedX: useTransform(smoothedX, toPercent),
    };
    const vertical = () => props.direction === 'vertical';

    provide(ScrollProgressKey, {
      container,
      progress,
      scale: () =>
        reduce.value ? progress() : vertical() ? smoothedY : smoothedX,
      size: () =>
        reduce.value
          ? vertical()
            ? sizes.y
            : sizes.x
          : vertical()
            ? sizes.smoothedY
            : sizes.smoothedX,
      direction: () => props.direction,
      global: () => props.global,
    });
    return () => slots.default?.();
  },
});

/** Follows how far a container (or the page) is scrolled. */
const ScrollProgressProvider = defineComponent({
  name: 'ScrollProgressProvider',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ScrollProgressProviderInner as Component, attrs, slots),
      );
  },
});

type ScrollProgressMode = 'width' | 'height' | 'scaleY' | 'scaleX';

type ScrollProgressProps = {
  mode?: ScrollProgressMode;
  asChild?: boolean;
};

/** The bar: its size (or scale) follows the scroll. */
const ScrollProgress = defineComponent({
  name: 'ScrollProgress',
  inheritAttrs: false,
  props: {
    mode: { type: String as PropType<ScrollProgressMode>, default: 'width' },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const context = useScrollProgress();
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'data-slot': 'scroll-progress',
          'data-direction': context.direction(),
          'data-mode': props.mode,
          'data-global': context.global(),
          ...attrs,
          style: [
            {
              [props.mode]:
                props.mode === 'width' || props.mode === 'height'
                  ? context.size()
                  : context.scale(),
            },
            attrs.style,
          ],
        },
        slots,
      );
  },
});

type ScrollProgressContainerProps = {
  asChild?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

/** The scrolling container followed, unless the provider is `global`. */
const ScrollProgressContainer = defineComponent({
  name: 'ScrollProgressContainer',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const context = useScrollProgress();
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          'data-slot': 'scroll-progress-container',
          'data-direction': context.direction(),
          'data-global': context.global(),
          ...attrs,
          ref: (node: unknown) => {
            context.container.value = elementOf(node);
          },
        },
        slots,
      );
  },
});

export {
  ScrollProgressProvider,
  ScrollProgress,
  ScrollProgressContainer,
  useScrollProgress,
  type ScrollProgressProviderProps,
  type ScrollProgressProps,
  type ScrollProgressContainerProps,
  type ScrollProgressDirection,
  type ScrollProgressMode,
  type ScrollProgressContextType,
};
