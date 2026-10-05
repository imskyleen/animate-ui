'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';

type HighlightTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
  delay?: number;
} & UseIsInViewOptions;

function HighlightText({
  ref,
  text,
  style,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  transition = { duration: 2, ease: 'easeInOut' },
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

  return (
    <motion.span
      ref={localRef}
      data-slot="highlight-text"
      initial={{ backgroundSize: '0% 100%' }}
      animate={isInView ? { backgroundSize: '100% 100%' } : undefined}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
      }}
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
