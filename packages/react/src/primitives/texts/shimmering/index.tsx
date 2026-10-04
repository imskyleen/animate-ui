'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'motion/react';

import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  scaleTransition,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

const WAVE_REST = { x: 0, y: 0, scale: 1, rotateY: 0 };
const WAVE = {
  x: [0, 5, 0],
  y: [0, -5, 0],
  scale: [1, 1.1, 1],
  rotateY: [0, 15, 0],
};

type ShimmeringTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
  duration?: number;
  wave?: boolean;
  color?: string;
  shimmeringColor?: string;
};

function ShimmeringText(props: ShimmeringTextProps) {
  return (
    <ReducedMotionConfig>
      <ShimmeringTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function ShimmeringTextContent({
  ref,
  text,
  duration = 1,
  transition,
  wave = false,
  color = 'var(--color-neutral-500)',
  shimmeringColor = 'var(--color-neutral-300)',
  style,
  ...props
}: ShimmeringTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);
  const { tempo } = useMotionTokens();

  // The shimmer loops forever: it pauses off screen and in a hidden tab, and
  // stops under reduced motion (color is not covered by Motion's reduced
  // motion). Pausing resets to the resting state, which is invisible since
  // nobody is looking.
  const inView = useInView(localRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const chars = React.useMemo(() => splitGraphemes(text ?? ''), [text]);

  return (
    <motion.span
      ref={localRef}
      data-slot="shimmering-text"
      style={
        {
          '--shimmering-color': shimmeringColor,
          '--color': color,
          color: 'var(--color)',
          position: 'relative',
          display: 'inline-block',
          perspective: '500px',
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Screen readers read the text once, not character by character. */}
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {text}
      </span>
      <span
        aria-hidden
        style={{ display: 'inline-block', perspective: 'inherit' }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              transformStyle: 'preserve-3d',
            }}
            initial={{
              ...(wave ? { scale: 1, rotateY: 0 } : {}),
              color: 'var(--color)',
            }}
            animate={
              playing
                ? {
                    ...(wave ? WAVE : {}),
                    color: [
                      'var(--color)',
                      'var(--shimmering-color)',
                      'var(--color)',
                    ],
                  }
                : {
                    ...(wave ? WAVE_REST : {}),
                    color: 'var(--color)',
                  }
            }
            transition={
              playing
                ? {
                    ...scaleTransition(
                      {
                        duration,
                        repeat: Infinity,
                        repeatType: 'loop',
                        repeatDelay: chars.length * 0.05,
                        delay: (i * duration) / chars.length,
                        ease: 'easeInOut',
                      },
                      tempo,
                    ),
                    ...transition,
                  }
                : motionTransition.instant
            }
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}

export { ShimmeringText, type ShimmeringTextProps };
