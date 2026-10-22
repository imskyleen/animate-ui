import { defineComponent, h, type Component, type PropType } from 'vue';
import { motion, type Transition } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const HIDDEN_SIZE = '0% 100%';
const VISIBLE_SIZE = '100% 100%';

const DEFAULT_TRANSITION: Transition = { duration: 2, ease: 'easeInOut' };

const highlightTextProps = {
  text: { type: String, required: true },
  transition: Object as PropType<Transition>,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
} as const;

type HighlightTextProps = {
  text: string;
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const HighlightTextContent = defineComponent({
  name: 'HighlightTextContent',
  inheritAttrs: false,
  props: highlightTextProps,
  setup(props, { attrs }) {
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    return () => {
      const transition = props.transition ?? defaultTransition.value;
      const shown = reduce.value || isInView.value;
      return h(
        motion.span as Component,
        {
          ...attrs,
          ref: (node: unknown) => {
            element.value =
              ((node as { $el?: HTMLElement } | null)?.$el as HTMLElement) ??
              null;
          },
          'data-slot': 'highlight-text',
          initial: reduce.value ? false : { backgroundSize: HIDDEN_SIZE },
          animate: { backgroundSize: shown ? VISIBLE_SIZE : HIDDEN_SIZE },
          transition:
            reduce.value || !shown
              ? motionTransition.instant
              : {
                  ...transition,
                  delay: (transition.delay ?? 0) + props.delay / 1000,
                },
          style: [
            {
              position: 'relative',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              display: 'inline-block',
            },
            attrs.style,
          ],
        },
        () => props.text,
      );
    };
  },
});

/** Text whose background sweeps in behind it, like a highlighter. */
const HighlightText = defineComponent({
  name: 'HighlightText',
  inheritAttrs: false,
  props: highlightTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(HighlightTextContent, { ...attrs, ...props }),
      );
  },
});

export { HighlightText, type HighlightTextProps };
