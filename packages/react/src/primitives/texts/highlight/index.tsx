'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const HIDDEN_SIZE = '0% 100%';
const VISIBLE_SIZE = '100% 100%';

const DEFAULT_TRANSITION: Transition = { duration: 2, ease: 'easeInOut' };

type HighlightTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
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
  transition: transitionProp,
  delay = 0,
  ...props
}: HighlightTextProps) {
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;

  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const reduce = useShouldReduceMotion();
  const shown = reduce || isInView;

  return (
    <motion.span
      ref={localRef}
      data-slot="highlight-text"
      initial={reduce ? false : { backgroundSize: HIDDEN_SIZE }}
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
