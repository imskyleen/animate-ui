'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  useMotionTokens,
  transition as motionTransition,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

const formatCharacter = (char: string) => (char === ' ' ? ' ' : char);

const CHAR_STYLE: React.CSSProperties = {
  position: 'absolute',
  display: 'inline-block',
  backfaceVisibility: 'hidden',
};

// The front copy rolls away from its upper quarter while the back copy rolls
// in from its baseline, 0.3s later, which reads as the letter turning over.
const FRONT_REST = 'rotateX(0deg)';
const FRONT_ROLLED = 'rotateX(90deg)';
const BACK_REST = 'rotateX(90deg)';
const BACK_ROLLED = 'rotateX(0deg)';
const BACK_OFFSET = 0.3;

type RollingTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  text: string;
  /**
   * Transition of each letter. Its `delay` is the stagger between letters
   * (in seconds), not a start delay: use the `delay` prop for that.
   */
  transition?: Transition;
  /** Delay before the first letter rolls, in milliseconds. */
  delay?: number;
} & UseIsInViewOptions;

function RollingText(props: RollingTextProps) {
  return (
    <ReducedMotionConfig remount>
      <RollingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function RollingTextContent({
  ref,
  text,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  transition: transitionProp,
  delay = 0,
  ...props
}: RollingTextProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );
  const reduce = useShouldReduceMotion();
  const tokens = useMotionTokens();
  // 0.5s per letter, 0.1s apart, paced by the provider's tempo.
  const transition: Transition = transitionProp ?? {
    duration: 0.5 * tokens.tempo,
    delay: 0.1,
    ease: tokens.ease.out,
  };

  // Reduced motion: no rotation at all, the letters sit in their final state.
  // Once rolled, the text stays rolled (leaving the viewport doesn't reverse it).
  const rolled = isInView || reduce;

  const words = React.useMemo(
    () =>
      text
        .split(/(\s+)/)
        .filter(Boolean)
        .map((part) =>
          /^\s+$/.test(part)
            ? { space: true as const, part }
            : { space: false as const, chars: splitGraphemes(part) },
        ),
    [text],
  );
  const stepDelay = transition.delay ?? 0;

  let charIdx = 0;

  return (
    <span ref={localRef} data-slot="rolling-text" {...props}>
      {/* The letters are visual only: assistive tech reads the sr-only copy once. */}
      <span aria-hidden="true">
        {words.map((word, wi) => {
          if (word.space) return <span key={`space-${wi}`}>{word.part}</span>;

          return (
            <span
              key={`word-${wi}`}
              style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
            >
              {word.chars.map((char, ci) => {
                const charDelay = delay / 1000 + charIdx++ * stepDelay;
                const label = formatCharacter(char);

                return (
                  <span
                    key={`c-${wi}-${ci}`}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      perspective: '9999999px',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <motion.span
                      style={{ ...CHAR_STYLE, transformOrigin: '50% 25%' }}
                      initial={reduce ? false : { transform: FRONT_REST }}
                      animate={rolled ? { transform: FRONT_ROLLED } : undefined}
                      transition={
                        reduce
                          ? motionTransition.instant
                          : { ...transition, delay: charDelay }
                      }
                    >
                      {label}
                    </motion.span>
                    <motion.span
                      style={{ ...CHAR_STYLE, transformOrigin: '50% 100%' }}
                      initial={reduce ? false : { transform: BACK_REST }}
                      animate={rolled ? { transform: BACK_ROLLED } : undefined}
                      transition={
                        reduce
                          ? motionTransition.instant
                          : { ...transition, delay: charDelay + BACK_OFFSET }
                      }
                    >
                      {label}
                    </motion.span>
                    {/* Reserves the letter's width, the copies are absolute. */}
                    <span style={{ visibility: 'hidden' }}>{label}</span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>

      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {text}
      </span>
    </span>
  );
}

export { RollingText, type RollingTextProps };
