import { computed, defineComponent, h, type PropType } from 'vue';
import { motion, type Transition } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

const formatCharacter = (char: string) => (char === ' ' ? '\u00a0' : char);

const CHAR_STYLE = {
  position: 'absolute',
  display: 'inline-block',
  backfaceVisibility: 'hidden',
} as const;

const DEFAULT_TRANSITION: Transition = {
  duration: 0.5,
  delay: 0.1,
  ease: 'easeOut',
};

const BACK_OFFSET = 0.3;

const rollingTextProps = {
  text: { type: String, required: true },
  transition: Object as PropType<Transition>,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
} as const;

type RollingTextProps = {
  text: string;
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
};

const RollingTextContent = defineComponent({
  name: 'RollingTextContent',
  inheritAttrs: false,
  props: rollingTextProps,
  setup(props, { attrs }) {
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    const tokens = useMotionTokens();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);
    const words = computed(() =>
      props.text
        .split(/(\s+)/)
        .filter(Boolean)
        .map((part) =>
          /^\s+$/.test(part)
            ? { space: true as const, part }
            : { space: false as const, chars: splitGraphemes(part) },
        ),
    );

    return () => {
      const transition = props.transition ?? defaultTransition.value;
      const rolled = isInView.value || reduce.value;
      const stepDelay = transition.delay ?? 0;
      let charIdx = 0;
      return h(
        'span',
        { ...attrs, ref: element, 'data-slot': 'rolling-text' },
        [
          h(
            'span',
            { 'aria-hidden': 'true' },
            words.value.map((word, wi) => {
              if (word.space)
                return h('span', { key: `space-${wi}` }, word.part);
              return h(
                'span',
                {
                  key: `word-${wi}`,
                  style: { display: 'inline-block', whiteSpace: 'nowrap' },
                },
                word.chars.map((char, ci) => {
                  const charDelay = props.delay / 1000 + charIdx++ * stepDelay;
                  const label = formatCharacter(char);
                  return h(
                    'span',
                    {
                      key: `c-${wi}-${ci}`,
                      style: {
                        position: 'relative',
                        display: 'inline-block',
                        perspective: '9999999px',
                        transformStyle: 'preserve-3d',
                        width: 'auto',
                      },
                    },
                    [
                      h(
                        motion.span,
                        {
                          style: { ...CHAR_STYLE, transformOrigin: '50% 25%' },
                          initial: reduce.value ? false : { rotateX: 0 },
                          animate: rolled ? { rotateX: 90 } : undefined,
                          transition: reduce.value
                            ? motionTransition.instant
                            : { ...transition, delay: charDelay },
                        },
                        () => label,
                      ),
                      h(
                        motion.span,
                        {
                          style: { ...CHAR_STYLE, transformOrigin: '50% 100%' },
                          initial: reduce.value ? false : { rotateX: 90 },
                          animate: rolled ? { rotateX: 0 } : undefined,
                          transition: reduce.value
                            ? motionTransition.instant
                            : {
                                ...transition,
                                delay:
                                  charDelay + BACK_OFFSET * tokens.value.tempo,
                              },
                        },
                        () => label,
                      ),
                      h('span', { style: { visibility: 'hidden' } }, label),
                    ],
                  );
                }),
              );
            }),
          ),
          h('span', { class: 'sr-only', style: VISUALLY_HIDDEN }, props.text),
        ],
      );
    };
  },
});

/** Text whose letters roll over one after another, like a flip board. */
const RollingText = defineComponent({
  name: 'RollingText',
  inheritAttrs: false,
  props: rollingTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(RollingTextContent, { ...attrs, ...props }),
      );
  },
});

export { RollingText, type RollingTextProps };
