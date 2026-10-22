import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  provide,
  ref,
  watch,
  type Component,
  type InjectionKey,
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
import { VISUALLY_HIDDEN } from '../_text';

const DEFAULT_TRANSITION: Transition = { duration: 0.3, ease: 'easeOut' };

type RotatingTextContextType = {
  currentText: () => string;
  y: () => number;
  isInView: () => boolean;
  label: () => string;
};

const RotatingTextKey: InjectionKey<RotatingTextContextType> = Symbol(
  'AnimateUIRotatingText',
);

function useRotatingText() {
  const context = inject(RotatingTextKey, null);
  if (!context)
    throw new Error('RotatingText must be used within RotatingTextContainer');
  return context;
}

type RotatingTextContainerProps = {
  text: string | string[];
  duration?: number;
  y?: number;
  delay?: number;
  align?: 'start' | 'center' | 'end';
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

/** Holds the texts and when they turn: one after another, in a loop. */
const RotatingTextContainer = defineComponent({
  name: 'RotatingTextContainer',
  inheritAttrs: false,
  props: {
    text: {
      type: [String, Array] as PropType<string | string[]>,
      required: true,
    },
    y: { type: Number, default: -50 },
    duration: { type: Number, default: 2000 },
    delay: { type: Number, default: 0 },
    align: String as PropType<'start' | 'center' | 'end'>,
    inView: Boolean,
    inViewMargin: { type: String, default: '0px' },
    inViewOnce: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    const index = ref(0);
    const hasRotated = ref(false);
    const { element, isInView } = useIsInView(() => props);
    const onScreen = useInView(element);
    const pageVisible = usePageVisible();
    const texts = computed(() =>
      Array.isArray(props.text) ? props.text : [props.text],
    );
    const playing = computed(
      () =>
        texts.value.length > 1 &&
        isInView.value &&
        onScreen.value &&
        pageVisible.value,
    );

    watch(
      () =>
        [
          playing.value,
          index.value,
          texts.value.length,
          props.duration,
          props.delay,
          hasRotated.value,
        ] as const,
      ([isPlaying, , count, duration, delay, rotated], _, onCleanup) => {
        if (!isPlaying) return;
        const timeoutId = setTimeout(
          () => {
            hasRotated.value = true;
            index.value = (index.value + 1) % count;
          },
          rotated ? duration : delay,
        );
        onCleanup(() => clearTimeout(timeoutId));
      },
      { immediate: true },
    );

    const currentText = computed(
      () => texts.value[index.value % texts.value.length] ?? '',
    );
    provide(RotatingTextKey, {
      currentText: () => currentText.value,
      y: () => props.y,
      isInView: () => isInView.value,
      label: () => texts.value.join(', '),
    });

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: element,
          'data-slot': 'rotating-text-container',
          style: [{ overflow: 'hidden', paddingBlock: '0.25rem' }, attrs.style],
        },
        props.align
          ? h(
              'div',
              {
                'data-slot': 'rotating-text-frame',
                style: {
                  display: 'grid',
                  justifyItems: props.align,
                  alignItems: 'baseline',
                },
              },
              [
                ...[...new Set(texts.value)].map((item) =>
                  h(
                    'span',
                    {
                      key: item,
                      'aria-hidden': 'true',
                      style: {
                        gridArea: '1 / 1',
                        visibility: 'hidden',
                        whiteSpace: 'nowrap',
                      },
                    },
                    item,
                  ),
                ),
                h(
                  'div',
                  {
                    style: {
                      gridArea: '1 / 1',
                      justifySelf: props.align,
                      whiteSpace: 'nowrap',
                    },
                  },
                  slots.default?.(),
                ),
              ],
            )
          : slots.default?.(),
      );
  },
});

type RotatingTextProps = { transition?: Transition };

const RotatingTextContent = defineComponent({
  name: 'RotatingTextContent',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs }) {
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const context = useRotatingText();
    const reduce = useShouldReduceMotion();
    return () => {
      const travel = reduce.value ? 0 : context.y();
      return h(Fragment, [
        h(
          'span',
          { class: 'sr-only', style: VISUALLY_HIDDEN },
          context.label(),
        ),
        h(AnimatePresence as Component, { mode: 'wait' }, () =>
          context.isInView()
            ? h(
                motion.div as Component,
                {
                  key: context.currentText(),
                  'data-slot': 'rotating-text',
                  'aria-hidden': 'true',
                  transition: props.transition ?? defaultTransition.value,
                  initial: { opacity: 0, y: -travel },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: travel },
                  ...attrs,
                },
                () => context.currentText(),
              )
            : null,
        ),
      ]);
    };
  },
});

/** The current text: the next one comes in as it leaves. */
const RotatingText = defineComponent({
  name: 'RotatingText',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(RotatingTextContent, { ...attrs, ...props }),
      );
  },
});

export {
  RotatingTextContainer,
  RotatingText,
  useRotatingText,
  type RotatingTextContainerProps,
  type RotatingTextProps,
  type RotatingTextContextType,
};
