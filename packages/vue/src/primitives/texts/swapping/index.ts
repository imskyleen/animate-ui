import {
  computed,
  defineComponent,
  h,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { motion, useInView, type Transition } from 'motion-v';

import {
  ReducedMotionConfig,
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { usePageVisible } from '../../../utils/use-page-visible';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type SwappingTextDirection = 'up' | 'down';

const DEFAULT_TRANSITION: Transition = {
  duration: 0.2,
  ease: motionTokens.ease.fill,
};

const SHIFT = 0.5;
const BLUR = 'blur(2px)';

type Swap = {
  id: number;
  from: string[];
  to: string[];
  widths: { from: number[]; to: number[] } | null;
};

function measure(element: HTMLElement, chars: string[]) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return null;
  const style = getComputedStyle(element);
  context.font = style.font;
  const spacing = parseFloat(style.letterSpacing) || 0;
  return chars.map((char) => context.measureText(char).width + spacing);
}

const swappingTextProps = {
  text: {
    type: [String, Array] as PropType<string | string[]>,
    required: true,
  },
  duration: { type: Number, default: 2000 },
  delay: { type: Number, default: 0 },
  direction: { type: String as PropType<SwappingTextDirection>, default: 'up' },
  stagger: { type: Number, default: 0.04 },
  transition: Object as PropType<Transition>,
} as const;

type SwappingTextProps = {
  text: string | string[];
  duration?: number;
  delay?: number;
  direction?: SwappingTextDirection;
  stagger?: number;
  transition?: Transition;
};

const SwappingTextContent = defineComponent({
  name: 'SwappingTextContent',
  inheritAttrs: false,
  props: swappingTextProps,
  setup(props, { attrs }) {
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const element = shallowRef<HTMLElement | null>(null);
    const texts = computed(() =>
      Array.isArray(props.text) ? props.text : [props.text],
    );
    const index = ref(0);
    const onScreen = useInView(element);
    const pageVisible = usePageVisible();
    const cycling = computed(
      () => texts.value.length > 1 && onScreen.value && pageVisible.value,
    );
    const hasCycled = ref(false);

    watch(
      () =>
        [
          cycling.value,
          index.value,
          texts.value.length,
          props.duration,
          props.delay,
          hasCycled.value,
        ] as const,
      ([isCycling, , count, duration, delay, cycled], _, onCleanup) => {
        if (!isCycling) return;
        const timeoutId = setTimeout(
          () => {
            hasCycled.value = true;
            index.value = (index.value + 1) % count;
          },
          cycled ? duration : delay + duration,
        );
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );

    const text = computed(
      () => texts.value[index.value % texts.value.length] ?? '',
    );
    const chars = computed(() => splitGraphemes(text.value));
    const swap = ref<Swap>({
      id: 0,
      from: chars.value,
      to: chars.value,
      widths: null,
    });
    let done = 0;

    watch(chars, (next) => {
      const current = swap.value;
      if (current.to.join('') === next.join('')) return;
      const el = element.value;
      const from = el ? measure(el, current.to) : null;
      const to = el ? measure(el, next) : null;
      done = 0;
      swap.value = {
        id: current.id + 1,
        from: current.to,
        to: next,
        widths: from && to ? { from, to } : null,
      };
    });

    return () => {
      const current = swap.value;
      const transition = props.transition ?? defaultTransition.value;
      const slots = Math.max(current.from.length, current.to.length);
      const sign = props.direction === 'up' ? 1 : -1;
      const enter = `${sign * SHIFT}em`;
      const exit = `${-sign * SHIFT}em`;
      let order = 0;
      const swapping = Array.from(
        { length: slots },
        (_, i) => (current.from[i] ?? '') !== (current.to[i] ?? ''),
      ).filter(Boolean).length;
      const settle = () => {
        done += 1;
        if (done < swapping) return;
        const id = current.id;
        if (swap.value.id === id)
          swap.value = { ...swap.value, from: swap.value.to, widths: null };
      };

      return h(
        'span',
        {
          ...attrs,
          ref: element,
          'data-slot': 'swapping-text',
          style: [{ display: 'inline-block', whiteSpace: 'pre' }, attrs.style],
        },
        [
          h(
            'span',
            { 'aria-hidden': 'true', style: { display: 'inline-flex' } },
            Array.from({ length: slots }, (_, i) => {
              const from = current.from[i] ?? '';
              const to = current.to[i] ?? '';
              const animated = current.id > 0 && from !== to && !reduce.value;
              if (!animated) {
                if (!to) return null;
                return h(
                  'span',
                  {
                    key: `${current.id}-${i}`,
                    style: { display: 'inline-block' },
                  },
                  to,
                );
              }
              const timing = { ...transition, delay: order++ * props.stagger };
              const widths = current.widths;
              return h(
                motion.span as Component,
                {
                  key: `${current.id}-${i}`,
                  'data-slot': 'swapping-text-slot',
                  style: { position: 'relative', display: 'inline-block' },
                  initial: widths ? { width: widths.from[i] ?? 0 } : false,
                  animate: widths
                    ? { width: widths.to[i] ?? 0 }
                    : { opacity: 1 },
                  transition: timing,
                  onAnimationComplete: settle,
                },
                () => [
                  from
                    ? h(
                        motion.span as Component,
                        {
                          'data-slot': 'swapping-text-out',
                          style: { position: 'absolute', left: '0', top: '0' },
                          initial: { y: 0, opacity: 1, filter: 'blur(0px)' },
                          animate: { y: exit, opacity: 0, filter: BLUR },
                          transition: timing,
                        },
                        () => from,
                      )
                    : null,
                  to
                    ? h(
                        motion.span as Component,
                        {
                          'data-slot': 'swapping-text-in',
                          style: {
                            position: widths ? 'absolute' : 'relative',
                            left: '0',
                            top: '0',
                            display: 'inline-block',
                          },
                          initial: { y: enter, opacity: 0, filter: BLUR },
                          animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
                          transition: timing,
                        },
                        () => to,
                      )
                    : null,
                  widths
                    ? h('span', { style: { visibility: 'hidden' } }, to || ' ')
                    : null,
                ],
              );
            }),
          ),
          h('span', { class: 'sr-only', style: VISUALLY_HIDDEN }, text.value),
        ],
      );
    };
  },
});

/** Text whose changed letters swap one after another, out and in. */
const SwappingText = defineComponent({
  name: 'SwappingText',
  inheritAttrs: false,
  props: swappingTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(SwappingTextContent, { ...attrs, ...props }),
      );
  },
});

export { SwappingText, type SwappingTextProps, type SwappingTextDirection };
