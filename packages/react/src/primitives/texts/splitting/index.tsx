'use client';

import * as React from 'react';
import {
  motion,
  type Variants,
  type TargetAndTransition,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type DefaultSplittingTextProps = Omit<
  HTMLMotionProps<'div'>,
  'children' | 'initial' | 'animate' | 'transition'
> & {
  /** Hidden state of each piece. */
  initial?: TargetAndTransition;
  /** Visible state of each piece. */
  animate?: TargetAndTransition;
  /** Transition of each piece. Its `delay` is added to the stagger. */
  transition?: Transition;
  /** Delay between two pieces, in seconds. Defaults to 0.05 (chars), 0.2 (words), 0.3 (lines). */
  stagger?: number;
  /** Delay before the first piece, in milliseconds. */
  delay?: number;
  /** Renders the text in its visible state, without animating. */
  disableAnimation?: boolean;
} & UseIsInViewOptions;

type CharsOrWordsSplittingTextProps = DefaultSplittingTextProps & {
  type?: 'chars' | 'words';
  text: string;
};

type LinesSplittingTextProps = DefaultSplittingTextProps & {
  type?: 'lines';
  text: string[];
};

type SplittingTextProps =
  CharsOrWordsSplittingTextProps | LinesSplittingTextProps;

const DEFAULT_INITIAL: TargetAndTransition = { x: 150, opacity: 0 };
const DEFAULT_ANIMATE: TargetAndTransition = { x: 0, opacity: 1 };
const DEFAULT_TRANSITION: Transition = { duration: 0.7, ease: 'easeOut' };

const DEFAULT_STAGGER = { chars: 0.05, words: 0.2, lines: 0.3 } as const;

const PIECE_STYLE: React.CSSProperties = { display: 'inline-block' };

const SplittingText: React.FC<SplittingTextProps> = (props) => (
  <ReducedMotionConfig remount>
    <SplittingTextContent {...props} />
  </ReducedMotionConfig>
);

const SplittingTextContent: React.FC<SplittingTextProps> = ({
  ref,
  text,
  type = 'chars',
  initial = DEFAULT_INITIAL,
  animate = DEFAULT_ANIMATE,
  transition: transitionProp,
  stagger,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  disableAnimation = false,
  ...props
}) => {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );
  const reduce = useShouldReduceMotion();
  const { tempo } = useMotionTokens();
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;

  // Reduced motion: every piece shows its final state at once, nothing moves.
  const still = disableAnimation || reduce;
  const kind = Array.isArray(text) ? 'lines' : type;
  const step = stagger ?? DEFAULT_STAGGER[kind] * tempo;
  const baseDelay = delay / 1000 + (transition.delay ?? 0);

  // Each piece gets its index through `custom`, so its delay is explicit and
  // doesn't depend on how pieces are nested (chars live inside word spans).
  const itemVariants: Variants = {
    hidden: still ? animate : initial,
    visible: (i: number) => ({
      ...animate,
      transition: still
        ? motionTransition.instant
        : { ...transition, delay: baseDelay + i * step },
    }),
  };

  const piece = (content: React.ReactNode, i: number, style = PIECE_STYLE) => (
    <motion.span key={i} custom={i} variants={itemVariants} style={style}>
      {content}
    </motion.span>
  );

  let visual: React.ReactNode;

  if (Array.isArray(text)) {
    visual = text.map((line, i) => (
      <React.Fragment key={`line-${i}`}>
        {piece(line, i)}
        {i < text.length - 1 ? <br /> : null}
      </React.Fragment>
    ));
  } else if (kind === 'words') {
    const tokens = text.match(/\S+\s*/g) ?? [];
    visual = tokens.map((token, i) => (
      <React.Fragment key={`word-${i}`}>
        {piece(token.trim(), i)}
        {/\s$/.test(token) ? ' ' : null}
      </React.Fragment>
    ));
  } else {
    let charIndex = 0;
    visual = text.split(/(\s+)/).map((token, wi) => {
      if (!token) return null;
      if (/^\s+$/.test(token)) return <span key={`space-${wi}`}>{token}</span>;
      // Words don't break in the middle: chars sit in a nowrap word span.
      return (
        <span
          key={`word-${wi}`}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {splitGraphemes(token).map((char) =>
            piece(char, charIndex++, {
              ...PIECE_STYLE,
              whiteSpace: 'pre',
            }),
          )}
        </span>
      );
    });
  }

  const label = Array.isArray(text) ? text.join(' ') : text;

  return (
    <motion.span
      ref={localRef}
      data-slot="splitting-text"
      initial="hidden"
      animate={isInView || still ? 'visible' : 'hidden'}
      {...props}
    >
      {/* The pieces are visual only: assistive tech reads the sr-only copy once. */}
      <span aria-hidden="true">{visual}</span>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {label}
      </span>
    </motion.span>
  );
};

export { SplittingText, type SplittingTextProps };
