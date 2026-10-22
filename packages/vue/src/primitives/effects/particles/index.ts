import {
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import { AnimatePresence, motion, type Transition } from 'motion-v';

import { Slot } from '../../slot';
import { useIsInView } from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

type ParticlesContextType = {
  animate: () => boolean;
  isInView: () => boolean;
};

const ParticlesKey: InjectionKey<ParticlesContextType> =
  Symbol('AnimateUIParticles');

type ParticlesProps = {
  animate?: boolean;
  asChild?: boolean;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

/** Holds the particles: they burst out while `animate` is on. */
const Particles = defineComponent({
  name: 'Particles',
  inheritAttrs: false,
  props: {
    animate: { type: Boolean, default: true },
    asChild: Boolean,
    inView: Boolean,
    inViewMargin: { type: String, default: '0px' },
    inViewOnce: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    const { element, isInView } = useIsInView(() => props);
    provide(ParticlesKey, {
      animate: () => props.animate,
      isInView: () => isInView.value,
    });
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          (props.asChild ? Slot : motion.div) as Component,
          {
            ...attrs,
            ref: (node: unknown) => {
              element.value = elementOf(node);
            },
            style: [{ position: 'relative' }, attrs.style],
          },
          slots,
        ),
      );
  },
});

type ParticlesEffectProps = {
  side?: Side;
  align?: Align;
  count?: number;
  radius?: number;
  spread?: number;
  duration?: number;
  holdDelay?: number;
  sideOffset?: number;
  alignOffset?: number;
  delay?: number;
  transition?: Transition;
};

/** The particles: they burst out from a side of their parent and fade. */
const ParticlesEffect = defineComponent({
  name: 'ParticlesEffect',
  inheritAttrs: false,
  props: {
    side: { type: String as PropType<Side>, default: 'top' },
    align: { type: String as PropType<Align>, default: 'center' },
    count: { type: Number, default: 6 },
    radius: { type: Number, default: 30 },
    spread: { type: Number, default: 360 },
    duration: { type: Number, default: 0.8 },
    holdDelay: { type: Number, default: 0.05 },
    sideOffset: { type: Number, default: 0 },
    alignOffset: { type: Number, default: 0 },
    delay: { type: Number, default: 0 },
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs }) {
    const context = inject(ParticlesKey, null);
    if (!context)
      throw new Error('ParticlesEffect must be used within Particles');
    const reduce = useShouldReduceMotion();
    return () => {
      const isVertical = props.side === 'top' || props.side === 'bottom';
      const alignPct =
        props.align === 'start' ? '0%' : props.align === 'end' ? '100%' : '50%';
      const top = isVertical
        ? props.side === 'top'
          ? `calc(0% - ${props.sideOffset}px)`
          : `calc(100% + ${props.sideOffset}px)`
        : `calc(${alignPct} + ${props.alignOffset}px)`;
      const left = isVertical
        ? `calc(${alignPct} + ${props.alignOffset}px)`
        : props.side === 'left'
          ? `calc(0% - ${props.sideOffset}px)`
          : `calc(100% + ${props.sideOffset}px)`;
      const containerStyle = {
        position: 'absolute',
        top,
        left,
        transform: 'translate(-50%, -50%)',
      };
      const fullCircle = props.spread % 360 === 0 && props.spread !== 0;
      const angleStep =
        (props.spread * (Math.PI / 180)) /
        (fullCircle ? Math.max(1, props.count) : Math.max(1, props.count - 1));
      const shown = context.animate() && context.isInView() && !reduce.value;
      return h(AnimatePresence as Component, null, () =>
        shown
          ? [...Array(props.count)].map((_, i) => {
              const angle = i * angleStep;
              const x = Math.round(Math.cos(angle) * props.radius * 100) / 100;
              const y = Math.round(Math.sin(angle) * props.radius * 100) / 100;
              return h(motion.div as Component, {
                key: i,
                ...attrs,
                style: [containerStyle, attrs.style],
                initial: { scale: 0, opacity: 0 },
                animate: {
                  x: `${x}px`,
                  y: `${y}px`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                },
                transition: {
                  duration: props.duration,
                  delay: props.delay + i * props.holdDelay,
                  ease: 'easeOut',
                  ...props.transition,
                },
              });
            })
          : [],
      );
    };
  },
});

export {
  Particles,
  ParticlesEffect,
  type ParticlesProps,
  type ParticlesEffectProps,
};
