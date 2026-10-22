import {
  computed,
  defineComponent,
  h,
  shallowRef,
  type Component,
  type PropType,
} from 'vue';
import { motion, useInView, type Transition } from 'motion-v';

import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  scaleTransition,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

const WAVE_REST = { x: 0, y: 0, scale: 1, rotateY: 0 };
const WAVE = {
  x: [0, 5, 0],
  y: [0, -5, 0],
  scale: [1, 1.1, 1],
  rotateY: [0, 15, 0],
};

const shimmeringTextProps = {
  text: { type: String, required: true },
  duration: { type: Number, default: 1 },
  transition: Object as PropType<Transition>,
  wave: Boolean,
  color: { type: String, default: 'var(--color-neutral-500)' },
  shimmeringColor: { type: String, default: 'var(--color-neutral-300)' },
} as const;

type ShimmeringTextProps = {
  text: string;
  duration?: number;
  transition?: Transition;
  wave?: boolean;
  color?: string;
  shimmeringColor?: string;
};

const ShimmeringTextContent = defineComponent({
  name: 'ShimmeringTextContent',
  inheritAttrs: false,
  props: shimmeringTextProps,
  setup(props, { attrs }) {
    const element = shallowRef<HTMLElement | null>(null);
    const tokens = useMotionTokens();
    const inView = useInView(element);
    const pageVisible = usePageVisible();
    const reduce = useShouldReduceMotion();
    const chars = computed(() => splitGraphemes(props.text ?? ''));

    return () => {
      const playing = inView.value && pageVisible.value && !reduce.value;
      const count = chars.value.length;
      return h(
        'span',
        {
          ...attrs,
          ref: element,
          'data-slot': 'shimmering-text',
          style: [
            {
              '--shimmering-color': props.shimmeringColor,
              '--color': props.color,
              color: 'var(--color)',
              position: 'relative',
              display: 'inline-block',
              perspective: '500px',
            },
            attrs.style,
          ],
        },
        [
          h('span', { class: 'sr-only', style: VISUALLY_HIDDEN }, props.text),
          h(
            'span',
            {
              'aria-hidden': 'true',
              style: { display: 'inline-block', perspective: 'inherit' },
            },
            chars.value.map((char, i) =>
              h(
                motion.span as Component,
                {
                  key: i,
                  style: {
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    transformStyle: 'preserve-3d',
                  },
                  initial: {
                    ...(props.wave ? { scale: 1, rotateY: 0 } : {}),
                    color: 'var(--color)',
                  },
                  animate: playing
                    ? {
                        ...(props.wave ? WAVE : {}),
                        color: [
                          'var(--color)',
                          'var(--shimmering-color)',
                          'var(--color)',
                        ],
                      }
                    : {
                        ...(props.wave ? WAVE_REST : {}),
                        color: 'var(--color)',
                      },
                  transition: playing
                    ? {
                        ...scaleTransition(
                          {
                            duration: props.duration,
                            repeat: Infinity,
                            repeatType: 'loop',
                            repeatDelay: count * 0.05,
                            delay: (i * props.duration) / count,
                            ease: 'easeInOut',
                          },
                          tokens.value.tempo,
                        ),
                        ...props.transition,
                      }
                    : motionTransition.instant,
                },
                () => char,
              ),
            ),
          ),
        ],
      );
    };
  },
});

/** Text a light shimmers across, letter after letter. */
const ShimmeringText = defineComponent({
  name: 'ShimmeringText',
  inheritAttrs: false,
  props: shimmeringTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ShimmeringTextContent, { ...attrs, ...props }),
      );
  },
});

export { ShimmeringText, type ShimmeringTextProps };
