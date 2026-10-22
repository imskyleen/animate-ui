import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { layoutHeight } from '../../../internal/screen-scale';
import { Slot } from '../../slot';

const AUTO_HEIGHT_TRANSITION: Transition = motionTokens.spring.height;

type AutoHeightOptions = {
  includeParentBox?: boolean;
  includeSelfBox?: boolean;
};

function boxOf(element: HTMLElement) {
  const cs = getComputedStyle(element);
  if (cs.boxSizing !== 'border-box') return 0;
  return (
    (parseFloat(cs.paddingTop || '0') || 0) +
    (parseFloat(cs.paddingBottom || '0') || 0) +
    (parseFloat(cs.borderTopWidth || '0') || 0) +
    (parseFloat(cs.borderBottomWidth || '0') || 0)
  );
}

/** The height of an element's content, kept up to date as it changes. */
function useAutoHeight(
  deps: () => unknown[] = () => [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  },
) {
  const element = shallowRef<HTMLElement | null>(null);
  const height = ref(0);
  const measure = () => {
    const el = element.value;
    if (!el) return 0;
    let extra = 0;
    if (options.includeParentBox && el.parentElement)
      extra += boxOf(el.parentElement);
    if (options.includeSelfBox) extra += boxOf(el);
    const dpr = window.devicePixelRatio || 1;
    return Math.ceil((layoutHeight(el) + extra) * dpr) / dpr;
  };

  let observer: ResizeObserver | null = null;
  watch(
    () => [element.value, ...deps()],
    ([el]) => {
      observer?.disconnect();
      observer = null;
      if (!(el instanceof HTMLElement)) return;
      height.value = measure();
      observer = new ResizeObserver(() => {
        const next = measure();
        requestAnimationFrame(() => (height.value = next));
      });
      observer.observe(el);
      if (options.includeParentBox && el.parentElement)
        observer.observe(el.parentElement);
    },
    { flush: 'post', immediate: true },
  );
  watch(
    height,
    (value) => {
      if (value !== 0) return;
      const next = measure();
      if (next !== 0) height.value = next;
    },
    { flush: 'post' },
  );
  onBeforeUnmount(() => observer?.disconnect());
  return { element, height };
}

type AutoHeightProps = {
  deps?: unknown[];
  animate?: Record<string, unknown>;
  transition?: Transition;
  asChild?: boolean;
};

const autoHeightProps = {
  deps: { type: Array as PropType<unknown[]>, default: () => [] },
  animate: Object as PropType<Record<string, unknown>>,
  transition: Object as PropType<Transition>,
  asChild: Boolean,
} as const;

const AutoHeightInner = defineComponent({
  name: 'AutoHeightInner',
  inheritAttrs: false,
  props: autoHeightProps,
  setup(props, { attrs, slots }) {
    const spring = useTempoTransition(
      () => props.transition ?? AUTO_HEIGHT_TRANSITION,
    );
    const reduce = useShouldReduceMotion();
    const { element, height } = useAutoHeight(() => props.deps);
    return () =>
      h(
        (props.asChild ? Slot : motion.div) as Component,
        {
          ...attrs,
          style: [{ overflow: 'hidden' }, attrs.style],
          animate: { height: height.value, ...props.animate },
          transition: reduce.value ? { duration: 0 } : spring.value,
        },
        () => h('div', { ref: element }, slots.default?.()),
      );
  },
});

/** A box whose height springs to its content's as it changes. */
const AutoHeight = defineComponent({
  name: 'AutoHeight',
  inheritAttrs: false,
  props: autoHeightProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(AutoHeightInner, { ...attrs, ...props }, slots),
      );
  },
});

export { AutoHeight, useAutoHeight, type AutoHeightProps };
