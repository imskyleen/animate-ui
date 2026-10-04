'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  useInView,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

const DEFAULT_TRANSITION: Transition = { duration: 0.3, ease: 'easeOut' };

type RotatingTextContextType = {
  currentText: string;
  y: number;
  isInView: boolean;
  /** What assistive tech reads: every word once, never the cycling one. */
  label: string;
};

const [RotatingTextProvider, useRotatingText] =
  getStrictContext<RotatingTextContextType>('RotatingTextContext');

type RotatingTextContainerProps = React.ComponentProps<'div'> & {
  text: string | string[];
  /** Interval between two swaps, in milliseconds. */
  duration?: number;
  /** Travel of the swap, in pixels: the new text enters from `-y` and the old one leaves to `y`. */
  y?: number;
  /** Delay before the first swap, in milliseconds. */
  delay?: number;
} & UseIsInViewOptions;

function RotatingTextContainer({
  ref,
  text,
  y = -50,
  duration = 2000,
  delay = 0,
  style,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  ...props
}: RotatingTextContainerProps) {
  const [index, setIndex] = React.useState(0);
  const [hasRotated, setHasRotated] = React.useState(false);

  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLDivElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  // The cycle pauses off screen and in a hidden tab. Under reduced motion it
  // keeps cycling, as a plain crossfade (see RotatingText): the words are
  // content, stopping would hide all but the first one.
  const onScreen = useInView(localRef);
  const pageVisible = usePageVisible();

  const texts = Array.isArray(text) ? text : [text];
  const count = texts.length;
  const playing = count > 1 && isInView && onScreen && pageVisible;

  React.useEffect(() => {
    if (!playing) return;
    // The first swap comes after `delay` (right away by default), then one
    // every `duration`.
    const timeoutId = setTimeout(
      () => {
        setHasRotated(true);
        setIndex((prev) => (prev + 1) % count);
      },
      hasRotated ? duration : delay,
    );
    return () => clearTimeout(timeoutId);
  }, [playing, index, count, duration, delay, hasRotated]);

  // The array can shrink while the index points past its end.
  const currentText = texts[index % count] ?? '';
  const label = texts.join(', ');

  const value = React.useMemo(
    () => ({ currentText, y, isInView, label }),
    [currentText, y, isInView, label],
  );

  return (
    <RotatingTextProvider value={value}>
      <div
        ref={localRef}
        data-slot="rotating-text-container"
        style={{
          overflow: 'hidden',
          paddingBlock: '0.25rem',
          ...style,
        }}
        {...props}
      />
    </RotatingTextProvider>
  );
}

type RotatingTextProps = Omit<HTMLMotionProps<'div'>, 'children'>;

function RotatingText(props: RotatingTextProps) {
  return (
    <ReducedMotionConfig>
      <RotatingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function RotatingTextContent({
  transition: transitionProp,
  ...props
}: RotatingTextProps) {
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;
  const { currentText, y, isInView, label } = useRotatingText();
  const reduce = useShouldReduceMotion();
  // Reduced motion: no travel, the texts crossfade in place.
  const travel = reduce ? 0 : y;

  return (
    <>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {label}
      </span>
      {/* mode="wait": the old text leaves before the new one comes in. */}
      <AnimatePresence mode="wait">
        {isInView && (
          <motion.div
            key={currentText}
            data-slot="rotating-text"
            aria-hidden="true"
            transition={transition}
            initial={{ opacity: 0, y: -travel }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: travel }}
            {...props}
          >
            {currentText}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export {
  RotatingTextContainer,
  RotatingText,
  useRotatingText,
  type RotatingTextContainerProps,
  type RotatingTextProps,
  type RotatingTextContextType,
};
