'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

function toCrossfade<T>(target: T): T {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return target;
  }
  const { opacity } = target as { opacity?: unknown };
  return (opacity === undefined ? {} : { opacity }) as T;
}

const DEFAULT_INITIAL = { opacity: 0, scale: 0.8, filter: 'blur(10px)' };
const DEFAULT_ANIMATE = { opacity: 1, scale: 1, filter: 'blur(0px)' };
const DEFAULT_EXIT = { opacity: 0, scale: 0.8, filter: 'blur(10px)' };
const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 125,
  damping: 25,
  mass: 0.4,
};

type MorphingTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  delay?: number;
  loop?: boolean;
  holdDelay?: number;
  text: string | string[];
} & UseIsInViewOptions;

function MorphingText(props: MorphingTextProps) {
  return (
    <ReducedMotionConfig>
      <MorphingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function MorphingTextContent({
  ref,
  text,
  initial = DEFAULT_INITIAL,
  animate = DEFAULT_ANIMATE,
  exit = DEFAULT_EXIT,
  variants,
  transition: transitionProp,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  loop = false,
  holdDelay = 2500,
  ...props
}: MorphingTextProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const onScreen = useInView(localRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();

  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;

  const uniqueId = React.useId();

  const texts = Array.isArray(text) ? text : [text];
  const count = texts.length;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!isInView || started) return;
    const timeoutId = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeoutId);
  }, [isInView, started, delay]);

  const index = Math.min(currentIndex, count - 1);
  const finished = !loop && index >= count - 1;
  const playing = started && count > 1 && !finished && onScreen && pageVisible;

  React.useEffect(() => {
    if (!playing) return;
    const timeoutId = setTimeout(
      () => setCurrentIndex((prev) => (prev + 1) % count),
      holdDelay,
    );
    return () => clearTimeout(timeoutId);
  }, [playing, index, count, holdDelay]);

  const currentText = texts[index] ?? '';

  const chars = React.useMemo(() => {
    const counts = new Map<string, number>();
    return splitGraphemes(currentText).map((raw) => {
      const key = raw.normalize('NFC');
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return {
        layoutId: `${uniqueId}-${key}-${n}`,
        label: key === ' ' ? ' ' : key,
      };
    });
  }, [currentText, uniqueId]);

  return (
    <motion.span ref={localRef} data-slot="morphing-text" {...props}>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {currentText}
      </span>
      <span aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          {chars.map((char) => (
            <motion.span
              key={char.layoutId}
              layoutId={char.layoutId}
              style={{ display: 'inline-block' }}
              initial={reduce ? toCrossfade(initial) : initial}
              animate={reduce ? toCrossfade(animate) : animate}
              exit={reduce ? toCrossfade(exit) : exit}
              variants={variants}
              transition={transition}
            >
              {char.label}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

export { MorphingText, type MorphingTextProps };
