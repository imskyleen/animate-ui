import {
  computed,
  defineComponent,
  h,
  ref,
  shallowRef,
  useId,
  watch,
  type Component,
  type PropType,
} from 'vue';
import { AnimatePresence, motion, useInView, type Transition } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import {
  blur,
  ReducedMotionConfig,
  spring,
  transition as tokens,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  VISUALLY_HIDDEN,
  matchGraphemes,
  measureAdvances,
  splitGraphemes,
  type Grapheme,
} from '../_text';

type Target = Record<string, unknown>;

function toCrossfade<T>(target: T): T {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return target;
  }
  const { opacity } = target as { opacity?: unknown };
  return (opacity === undefined ? {} : { opacity }) as T;
}

const DEFAULT_INITIAL = { opacity: 0, y: '0.12em', filter: blur.tooltip };
const DEFAULT_ANIMATE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const DEFAULT_EXIT = { opacity: 0, filter: blur.tooltip };
const DEFAULT_TRANSITION: Transition = {
  ...spring.selection,
  opacity: tokens.reveal,
  filter: tokens.reveal,
};
const EXIT_TRANSITION: Transition = tokens.swap;
// New letters come in once the leaving ones are going, one after the other.
const ENTER_DELAY = 0.08;
const STAGGER = 0.012;

function delayed(transition: Transition, delay: number): Transition {
  const result: Record<string, unknown> = { ...transition, delay };
  for (const [key, value] of Object.entries(transition))
    if (value && typeof value === 'object' && !Array.isArray(value))
      result[key] = { ...value, delay };
  return result as Transition;
}

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
    const exitTransition = useTempoTransition(() => EXIT_TRANSITION);
    const motionTokens = useMotionTokens();
    const uniqueId = useId();
    let nextId = 0;
    const newId = () => `${uniqueId}-${nextId++}`;

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
    const chars = shallowRef<Grapheme[]>(
      splitGraphemes(currentText.value).map((label) => ({
        id: newId(),
        label,
      })),
    );
    let known = new Set(chars.value.map((char) => char.id));
    watch(currentText, (text) => {
      chars.value = matchGraphemes(chars.value, splitGraphemes(text), newId);
    });

    // Each letter takes its advance in the whole text, so kerning holds.
    const mirror = ref<HTMLElement | null>(null);
    const letters = new Map<string, HTMLElement>();
    watch(
      [chars, mirror],
      ([list, node], _, onCleanup) => {
        known = new Set(list.map((char) => char.id));
        if (!node) return;
        const fit = () => {
          const advances = measureAdvances(
            node,
            list.map((char) => char.label),
          );
          list.forEach((char, i) => {
            const letter = letters.get(char.id);
            if (letter && advances[i] !== undefined)
              letter.style.width = `${advances[i]}px`;
          });
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(node);
        onCleanup(() => observer.disconnect());
      },
      { flush: 'post', immediate: true },
    );

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
          h(
            'span',
            { 'aria-hidden': 'true', style: { position: 'relative' } },
            [
              h(
                'span',
                {
                  ref: mirror,
                  style: {
                    position: 'absolute',
                    insetInlineStart: 0,
                    top: 0,
                    visibility: 'hidden',
                    whiteSpace: 'pre',
                    pointerEvents: 'none',
                  },
                },
                chars.value.map((char) => char.label).join(''),
              ),
              h(
                AnimatePresence as Component,
                { mode: 'popLayout', initial: false },
                () => {
                  let order = 0;
                  return chars.value.map((char) => {
                    const delay = known.has(char.id)
                      ? 0
                      : (ENTER_DELAY + STAGGER * order++) *
                        motionTokens.value.tempo;
                    const exit =
                      props.exit === DEFAULT_EXIT && !props.transition
                        ? { ...props.exit, transition: exitTransition.value }
                        : props.exit;
                    return h(
                      motion.span as Component,
                      {
                        key: char.id,
                        ref: (node: unknown) => {
                          const element =
                            (node as { $el?: unknown } | null)?.$el ?? node;
                          if (element instanceof HTMLElement)
                            letters.set(char.id, element);
                          else letters.delete(char.id);
                        },
                        layout: 'position',
                        style: { display: 'inline-block', whiteSpace: 'pre' },
                        initial: look(props.initial),
                        animate: look(props.animate),
                        exit: look(exit),
                        variants: props.variants,
                        transition: delay
                          ? delayed(transition, delay)
                          : transition,
                      },
                      () => char.label,
                    );
                  });
                },
              ),
            ],
          ),
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
