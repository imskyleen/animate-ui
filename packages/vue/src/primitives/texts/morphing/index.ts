import {
  computed,
  defineComponent,
  h,
  ref,
  useId,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { AnimatePresence, motion, useInView, type Transition } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type Target = Record<string, unknown>;

function toCrossfade<T>(target: T): T {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return target;
  }
  const { opacity } = target as { opacity?: unknown };
  return (opacity === undefined ? {} : { opacity }) as T;
}

const DEFAULT_INITIAL = { opacity: 0, scale: 0.8, filter: 'blur(10px)' };
const DEFAULT_ANIMATE = { opacity: 1, scale: 1, filter: 'blur(0px)' };
const DEFAULT_EXIT = { opacity: 0, scale: 0.8, filter: 'blur(10px)' };
const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 125,
  damping: 25,
  mass: 0.4,
};

const morphingTextProps = {
  text: {
    type: [String, Array] as PropType<string | string[]>,
    required: true,
  },
  initial: { type: Object as PropType<Target>, default: DEFAULT_INITIAL },
  animate: { type: Object as PropType<Target>, default: DEFAULT_ANIMATE },
  exit: { type: Object as PropType<Target>, default: DEFAULT_EXIT },
  variants: Object as PropType<Record<string, Target>>,
  transition: Object as PropType<Transition>,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
  loop: Boolean,
  holdDelay: { type: Number, default: 2500 },
} as const;

type MorphingTextProps = {
  text: string | string[];
  initial?: Target;
  animate?: Target;
  exit?: Target;
  variants?: Record<string, Target>;
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  loop?: boolean;
  holdDelay?: number;
};

const MorphingTextContent = defineComponent({
  name: 'MorphingTextContent',
  inheritAttrs: false,
  props: morphingTextProps,
  setup(props, { attrs }) {
    const { element, isInView } = useIsInView(() => props);
    const onScreen = useInView(element);
    const pageVisible = usePageVisible();
    const reduce = useShouldReduceMotion();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const uniqueId = useId();

    const texts = computed(() =>
      Array.isArray(props.text) ? props.text : [props.text],
    );
    const currentIndex = ref(0);
    const started = ref(false);

    watch(
      () => [isInView.value, started.value, props.delay] as const,
      ([inView, isStarted, delay], _, onCleanup) => {
        if (!inView || isStarted) return;
        const timeoutId = setTimeout(() => (started.value = true), delay);
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );

    const index = computed(() =>
      Math.min(currentIndex.value, texts.value.length - 1),
    );
    const playing = computed(() => {
      const count = texts.value.length;
      const finished = !props.loop && index.value >= count - 1;
      return (
        started.value &&
        count > 1 &&
        !finished &&
        onScreen.value &&
        pageVisible.value
      );
    });

    watch(
      () =>
        [
          playing.value,
          index.value,
          texts.value.length,
          props.holdDelay,
        ] as const,
      ([isPlaying, , count, holdDelay], _, onCleanup) => {
        if (!isPlaying) return;
        const timeoutId = setTimeout(
          () => (currentIndex.value = (currentIndex.value + 1) % count),
          holdDelay,
        );
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );

    const currentText = computed(() => texts.value[index.value] ?? '');
    const chars = computed(() => {
      const counts = new Map<string, number>();
      return splitGraphemes(currentText.value).map((raw) => {
        const key = raw.normalize('NFC');
        const n = (counts.get(key) ?? 0) + 1;
        counts.set(key, n);
        return {
          layoutId: `${uniqueId}-${key}-${n}`,
          label: key === ' ' ? '\u00a0' : key,
        };
      });
    });

    return () => {
      const transition = props.transition ?? defaultTransition.value;
      const look = (target: Target) =>
        reduce.value ? toCrossfade(target) : target;
      return h(
        'span',
        {
          ...attrs,
          ref: element,
          'data-slot': 'morphing-text',
        },
        [
          h(
            'span',
            { class: 'sr-only', style: VISUALLY_HIDDEN },
            currentText.value,
          ),
          h('span', { 'aria-hidden': 'true' }, [
            h(
              AnimatePresence as Component,
              { mode: 'popLayout', initial: false },
              () =>
                chars.value.map((char) =>
                  h(
                    motion.span as Component,
                    {
                      key: char.layoutId,
                      layoutId: char.layoutId,
                      style: { display: 'inline-block' },
                      initial: look(props.initial),
                      animate: look(props.animate),
                      exit: look(props.exit),
                      variants: props.variants,
                      transition,
                    },
                    () => char.label,
                  ),
                ),
            ),
          ]),
        ],
      );
    };
  },
});

/** Text whose letters morph into the next text's, the shared ones in place. */
const MorphingText = defineComponent({
  name: 'MorphingText',
  inheritAttrs: false,
  props: morphingTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(MorphingTextContent, { ...attrs, ...props }),
      );
  },
});

export { MorphingText, type MorphingTextProps };
