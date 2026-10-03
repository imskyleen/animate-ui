'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';
import {
  ReducedMotionConfig,
  ease,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

// Module-level so the default keeps a stable identity across renders.
const DEFAULT_TRANSITION: Transition = { duration: 2, ease: ease.out };

const HIDDEN_SIZE = '0% 100%';
const VISIBLE_SIZE = '100% 100%';

type HighlightTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
  /** Delay before the highlight starts, in milliseconds. */
  delay?: number;
} & UseIsInViewOptions;

function HighlightText(props: HighlightTextProps) {
  return (
    <ReducedMotionConfig remount>
      <HighlightTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function HighlightTextContent({
  ref,
  text,
  style,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  transition = DEFAULT_TRANSITION,
  delay = 0,
  ...props
}: HighlightTextProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  // backgroundSize is not covered by Motion's reduced motion: under reduced
  // motion the highlight is simply there.
  const reduce = useShouldReduceMotion();
  const shown = reduce || isInView;

  return (
    <motion.span
      ref={localRef}
      data-slot="highlight-text"
      initial={reduce ? false : { backgroundSize: HIDDEN_SIZE }}
      // Resetting (instantly, it is off screen) when leaving the viewport lets
      // `inViewOnce={false}` replay the sweep on the next entrance.
      animate={{ backgroundSize: shown ? VISIBLE_SIZE : HIDDEN_SIZE }}
      transition={
        reduce || !shown
          ? motionTransition.instant
          : { ...transition, delay: (transition?.delay ?? 0) + delay / 1000 }
      }
      style={{
        position: 'relative',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        display: 'inline-block',
        ...style,
      }}
      {...props}
    >
      {text}
    </motion.span>
  );
}

export { HighlightText, type HighlightTextProps };
