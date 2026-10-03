'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'motion/react';

import { usePageVisible } from '@/registry/hooks/use-page-visible';
import {
  ReducedMotionConfig,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

/** Splits into user-perceived characters, so emoji and accents stay whole. */
function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: 'grapheme',
    });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

const REST_TRANSFORM = 'translate(0px, 0px) scale(1) rotateY(0deg)';
const WAVE_TRANSFORM = 'translate(5px, -5px) scale(1.1) rotateY(15deg)';

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

  // The shimmer loops forever: it pauses off screen and in a hidden tab, and
  // stops under reduced motion (color and transform strings are not covered by
  // Motion's reduced motion). Pausing resets to the resting state, which is
  // invisible since nobody is looking.
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
      <span className="sr-only">{text}</span>
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
              color: 'var(--color)',
              ...(wave ? { transform: REST_TRANSFORM } : {}),
            }}
            animate={
              playing
                ? {
                    color: [
                      'var(--color)',
                      'var(--shimmering-color)',
                      'var(--color)',
                    ],
                    ...(wave
                      ? {
                          transform: [
                            REST_TRANSFORM,
                            WAVE_TRANSFORM,
                            REST_TRANSFORM,
                          ],
                        }
                      : {}),
                  }
                : {
                    color: 'var(--color)',
                    ...(wave ? { transform: REST_TRANSFORM } : {}),
                  }
            }
            transition={
              playing
                ? {
                    duration,
                    repeat: Infinity,
                    repeatType: 'loop',
                    repeatDelay: chars.length * 0.05,
                    delay: (i * duration) / chars.length,
                    // A symmetric pulse on text already on screen, not an
                    // entrance.
                    ease: 'easeInOut',
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
