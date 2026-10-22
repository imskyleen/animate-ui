import {
  defineComponent,
  h,
  inject,
  provide,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import {
  motion,
  motionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
  type Transition,
} from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { Slot } from '../../slot';

type TiltContextType = {
  sRX: MotionValue<number>;
  sRY: MotionValue<number>;
  transition: () => SpringOptions;
};

const TiltKey: InjectionKey<TiltContextType> = Symbol('AnimateUITilt');

type TiltProps = {
  maxTilt?: number;
  perspective?: number;
  transition?: SpringOptions;
  asChild?: boolean;
};

const DEFAULT_TRANSITION: SpringOptions = {
  stiffness: 300,
  damping: 25,
  mass: 0.5,
};

const tiltProps = {
  maxTilt: { type: Number, default: 10 },
  perspective: { type: Number, default: 800 },
  transition: {
    type: Object as PropType<SpringOptions>,
    default: () => DEFAULT_TRANSITION,
  },
  asChild: Boolean,
} as const;

const call = (handler: unknown, event: Event) =>
  (handler as ((e: Event) => void) | undefined)?.(event);

const TiltInner = defineComponent({
  name: 'TiltInner',
  inheritAttrs: false,
  props: tiltProps,
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion();
    const rX = motionValue(0);
    const rY = motionValue(0);
    const sRX = useSpring(rX, props.transition);
    const sRY = useSpring(rY, props.transition);
    provide(TiltKey, { sRX, sRY, transition: () => props.transition });

    watch(
      reduce,
      (now) => {
        if (!now) return;
        rX.jump(0);
        rY.jump(0);
        sRX.jump(0);
        sRY.jump(0);
      },
      { immediate: true },
    );

    const onMousemove = (event: MouseEvent) => {
      call(attrs.onMousemove, event);
      if (reduce.value) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      rY.set(nx * props.maxTilt);
      rX.set(-ny * props.maxTilt);
    };
    const onMouseleave = (event: MouseEvent) => {
      call(attrs.onMouseleave, event);
      rX.set(0);
      rY.set(0);
    };

    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          ...attrs,
          style: [
            {
              perspective: `${props.perspective}px`,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            },
            attrs.style,
          ],
          onMousemove,
          onMouseleave,
        },
        slots,
      );
  },
});

/** A surface that tilts towards the pointer moving over it. */
const Tilt = defineComponent({
  name: 'Tilt',
  inheritAttrs: false,
  props: tiltProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(TiltInner, { ...attrs, ...props }, slots),
      );
  },
});

type TiltContentProps = { transition?: Transition; asChild?: boolean };

/** What tilts, inside Tilt. */
const TiltContent = defineComponent({
  name: 'TiltContent',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition>, asChild: Boolean },
  setup(props, { attrs, slots }) {
    const context = inject(TiltKey, null);
    if (!context) throw new Error('TiltContent must be used within Tilt');
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          ...attrs,
          style: [
            {
              rotateX: context.sRX,
              rotateY: context.sRY,
              willChange: 'transform',
            },
            attrs.style,
          ],
          transition: props.transition ?? context.transition(),
        },
        slots,
      );
  },
});

export { Tilt, TiltContent, type TiltProps, type TiltContentProps };
