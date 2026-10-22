import {
  defineComponent,
  Fragment,
  h,
  type Component,
  type PropType,
  type VNode,
} from 'vue';
import { motion, type Transition, type Variants } from 'motion-v';

import { useIsInView } from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type Target = Record<string, unknown>;

const DEFAULT_INITIAL: Target = { x: 150, opacity: 0 };
const DEFAULT_ANIMATE: Target = { x: 0, opacity: 1 };
const DEFAULT_TRANSITION: Transition = { duration: 0.7, ease: 'easeOut' };

const DEFAULT_STAGGER = { chars: 0.05, words: 0.2, lines: 0.3 } as const;

const PIECE_STYLE = { display: 'inline-block' } as const;

const splittingTextProps = {
  text: {
    type: [String, Array] as PropType<string | string[]>,
    required: true,
  },
  type: {
    type: String as PropType<'chars' | 'words' | 'lines'>,
    default: 'chars',
  },
  initial: { type: Object as PropType<Target>, default: DEFAULT_INITIAL },
  animate: { type: Object as PropType<Target>, default: DEFAULT_ANIMATE },
  transition: Object as PropType<Transition>,
  stagger: Number,
  delay: { type: Number, default: 0 },
  inView: Boolean,
  inViewMargin: { type: String, default: '0px' },
  inViewOnce: { type: Boolean, default: true },
  disableAnimation: Boolean,
} as const;

type SplittingTextProps = {
  text: string | string[];
  type?: 'chars' | 'words' | 'lines';
  initial?: Target;
  animate?: Target;
  transition?: Transition;
  stagger?: number;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  disableAnimation?: boolean;
};

const SplittingTextContent = defineComponent({
  name: 'SplittingTextContent',
  inheritAttrs: false,
  props: splittingTextProps,
  setup(props, { attrs }) {
    const { element, isInView } = useIsInView(() => props);
    const reduce = useShouldReduceMotion();
    const tokens = useMotionTokens();
    const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION);

    return () => {
      const transition = props.transition ?? defaultTransition.value;
      const still = props.disableAnimation || reduce.value;
      const text = props.text;
      const kind = Array.isArray(text) ? 'lines' : props.type;
      const step = props.stagger ?? DEFAULT_STAGGER[kind] * tokens.value.tempo;
      const baseDelay = props.delay / 1000 + (transition.delay ?? 0);

      const itemVariants: Variants = {
        hidden: (still ? props.animate : props.initial) as Variants[string],
        visible: ((i: number) => ({
          ...props.animate,
          transition: still
            ? motionTransition.instant
            : { ...transition, delay: baseDelay + i * step },
        })) as Variants[string],
      };

      const piece = (
        content: string,
        i: number,
        style: Record<string, string> = PIECE_STYLE,
      ) =>
        h(
          motion.span as Component,
          { key: i, custom: i, variants: itemVariants, style },
          () => content,
        );

      let visual: (VNode | null)[];
      if (Array.isArray(text)) {
        visual = text.map((line, i) =>
          h(Fragment, { key: `line-${i}` }, [
            piece(line, i),
            i < text.length - 1 ? h('br') : null,
          ]),
        );
      } else if (kind === 'words') {
        const words = text.match(/\S+\s*/g) ?? [];
        visual = words.map((token, i) =>
          h(Fragment, { key: `word-${i}` }, [
            piece(token.trim(), i),
            /\s$/.test(token) ? ' ' : null,
          ]),
        );
      } else {
        let charIndex = 0;
        visual = text.split(/(\s+)/).map((token, wi) => {
          if (!token) return null;
          if (/^\s+$/.test(token))
            return h('span', { key: `space-${wi}` }, token);
          return h(
            'span',
            {
              key: `word-${wi}`,
              style: { display: 'inline-block', whiteSpace: 'nowrap' },
            },
            splitGraphemes(token).map((char) =>
              piece(char, charIndex++, { ...PIECE_STYLE, whiteSpace: 'pre' }),
            ),
          );
        });
      }

      const label = Array.isArray(text) ? text.join(' ') : text;
      return h(
        motion.span as Component,
        {
          ...attrs,
          ref: (node: unknown) => {
            element.value =
              ((node as { $el?: HTMLElement } | null)?.$el as HTMLElement) ??
              null;
          },
          'data-slot': 'splitting-text',
          initial: 'hidden',
          animate: isInView.value || still ? 'visible' : 'hidden',
        },
        () => [
          h('span', { 'aria-hidden': 'true' }, visual),
          h('span', { class: 'sr-only', style: VISUALLY_HIDDEN }, label),
        ],
      );
    };
  },
});

/** Text that comes in piece by piece: letters, words or lines. */
const SplittingText = defineComponent({
  name: 'SplittingText',
  inheritAttrs: false,
  props: splittingTextProps,
  setup(props, { attrs }) {
    return () =>
      h(ReducedMotionConfig, { remount: true }, () =>
        h(SplittingTextContent, { ...attrs, ...props }),
      );
  },
});

export { SplittingText, type SplittingTextProps };
