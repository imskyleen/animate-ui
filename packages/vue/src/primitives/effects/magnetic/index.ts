import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { motion, motionValue, useSpring, type SpringOptions } from 'motion-v';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot } from '../../slot';

type MagneticProps = {
  strength?: number;
  range?: number;
  springOptions?: SpringOptions;
  onlyOnHover?: boolean;
  disableOnTouch?: boolean;
  asChild?: boolean;
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 100,
  damping: 10,
  mass: 0.5,
};

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function useCanHover() {
  const canHover = ref(false);
  let query: MediaQueryList | null = null;
  const update = () => (canHover.value = query?.matches ?? false);
  onMounted(() => {
    query = window.matchMedia(HOVER_QUERY);
    update();
    query.addEventListener('change', update);
  });
  onBeforeUnmount(() => query?.removeEventListener('change', update));
  return canHover;
}

const magneticProps = {
  strength: { type: Number, default: 0.5 },
  range: { type: Number, default: 120 },
  springOptions: Object as PropType<SpringOptions>,
  onlyOnHover: Boolean,
  disableOnTouch: { type: Boolean, default: true },
  asChild: Boolean,
} as const;

const call = (handler: unknown, event: Event) =>
  (handler as ((e: Event) => void) | undefined)?.(event);

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  return element instanceof HTMLElement ? element : null;
};

const MagneticInner = defineComponent({
  name: 'MagneticInner',
  inheritAttrs: false,
  props: magneticProps,
  setup(props, { attrs, slots }) {
    const defaultSpringOptions = useTempoTransition(
      () => DEFAULT_SPRING_OPTIONS,
    );
    const element = shallowRef<HTMLElement | null>(null);
    const canHover = useCanHover();
    const reduce = useShouldReduceMotion();
    const enabled = computed(
      () => !reduce.value && (canHover.value || !props.disableOnTouch),
    );
    let active = !props.onlyOnHover;
    watch(
      () => props.onlyOnHover,
      (only) => (active = !only),
    );

    const rawX = motionValue(0);
    const rawY = motionValue(0);
    const options = (props.springOptions ??
      defaultSpringOptions.value) as SpringOptions;
    const x = useSpring(rawX, options);
    const y = useSpring(rawY, options);

    const reset = () => {
      rawX.set(0);
      rawY.set(0);
    };
    const compute = (event: MouseEvent) => {
      const el = element.value;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const dx = event.clientX - (left + width / 2);
      const dy = event.clientY - (top + height / 2);
      const dist = Math.hypot(dx, dy);
      if (active && dist <= props.range) {
        const factor = (1 - dist / props.range) * props.strength;
        rawX.set(dx * factor);
        rawY.set(dy * factor);
      } else {
        reset();
      }
    };

    watch(enabled, (now) => {
      if (!now) reset();
    });
    watch(
      () => [enabled.value, props.onlyOnHover, element.value] as const,
      ([isEnabled, only, el], _, onCleanup) => {
        if (!isEnabled || only || !el) return;
        let inView = false;
        const handleMove = (event: MouseEvent) => {
          if (inView) compute(event);
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry?.isIntersecting ?? false;
          if (!inView) reset();
        });
        observer.observe(el);
        window.addEventListener('mousemove', handleMove);
        onCleanup(() => {
          observer.disconnect();
          window.removeEventListener('mousemove', handleMove);
          reset();
        });
      },
      { flush: 'post', immediate: true },
    );

    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          ...attrs,
          ref: (node: unknown) => {
            element.value = elementOf(node);
          },
          style: [{ display: 'inline-block' }, attrs.style, { x, y }],
          onMouseenter: (event: MouseEvent) => {
            if (props.onlyOnHover && enabled.value) active = true;
            call(attrs.onMouseenter, event);
          },
          onMouseleave: (event: MouseEvent) => {
            if (props.onlyOnHover) active = false;
            reset();
            call(attrs.onMouseleave, event);
          },
          onMousemove: (event: MouseEvent) => {
            if (props.onlyOnHover && enabled.value) compute(event);
            call(attrs.onMousemove, event);
          },
        },
        slots,
      );
  },
});

/** Content pulled towards the pointer as it comes near, on a spring. */
const Magnetic = defineComponent({
  name: 'Magnetic',
  inheritAttrs: false,
  props: magneticProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(MagneticInner, { ...attrs, ...props }, slots),
      );
  },
});

export { Magnetic, type MagneticProps };
