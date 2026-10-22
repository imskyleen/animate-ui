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
  motionTokens,
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  VISUALLY_HIDDEN,
  matchGraphemes,
  measureAdvances,
  splitGraphemes,
  type Grapheme,
} from '../_text';

function toCrossfade<T>(target: T): T {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return target;
  }
  const { opacity } = target as { opacity?: unknown };
  return (opacity === undefined ? {} : { opacity }) as T;
}

const { blur, spring, transition: tokens } = motionTokens;
const DEFAULT_INITIAL = { opacity: 0, y: '0.12em', filter: blur.tooltip };
const DEFAULT_ANIMATE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const DEFAULT_EXIT = { opacity: 0, filter: blur.tooltip };
const DEFAULT_TRANSITION: Transition = {
  ...spring.selection,
  opacity: tokens.reveal,
  filter: tokens.reveal,
};
const EXIT_TRANSITION: Transition = tokens.swap;
// New letters come in once the leaving ones are going, one after the other.
const ENTER_DELAY = 0.08;
const STAGGER = 0.012;

function delayed(transition: Transition, delay: number): Transition {
  const result: Record<string, unknown> = { ...transition, delay };
  for (const [key, value] of Object.entries(transition))
    if (value && typeof value === 'object' && !Array.isArray(value))
      result[key] = { ...value, delay };
  return result as Transition;
}

type MorphingTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  delay?: number;
  loop?: boolean;
  holdDelay?: number;
  text: string | string[];
} & UseIsInViewOptions;

function enteringOrder(
  chars: readonly Grapheme[],
  known: ReadonlySet<string>,
  id: string,
) {
  let order = 0;
  for (const char of chars) {
    if (char.id === id) return order;
    if (!known.has(char.id)) order++;
  }
  return order;
}

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
  const exitTransition = useTempoTransition(EXIT_TRANSITION);
  const { tempo } = useMotionTokens();
  const transition = transitionProp ?? defaultTransition;

  const uniqueId = React.useId();
  const nextId = React.useRef(0);

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

  const [chars, setChars] = React.useState<Grapheme[]>(() =>
    splitGraphemes(currentText).map((label) => ({
      id: `${uniqueId}-${nextId.current++}`,
      label,
    })),
  );
  const [shown, setShown] = React.useState(currentText);
  if (shown !== currentText) {
    setShown(currentText);
    setChars((previous) =>
      matchGraphemes(
        previous,
        splitGraphemes(currentText),
        () => `${uniqueId}-${nextId.current++}`,
      ),
    );
  }
  const known = React.useRef(new Set(chars.map((char) => char.id)));

  // Each letter takes its advance in the whole text, so kerning holds.
  const mirrorRef = React.useRef<HTMLSpanElement>(null);
  const letters = React.useRef(new Map<string, HTMLElement>());
  React.useLayoutEffect(() => {
    known.current = new Set(chars.map((char) => char.id));
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const fit = () => {
      const advances = measureAdvances(
        mirror,
        chars.map((char) => char.label),
      );
      chars.forEach((char, i) => {
        const letter = letters.current.get(char.id);
        if (letter && advances[i] !== undefined)
          letter.style.width = `${advances[i]}px`;
      });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(mirror);
    return () => observer.disconnect();
  }, [chars]);

  return (
    <motion.span ref={localRef} data-slot="morphing-text" {...props}>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {currentText}
      </span>
      <span aria-hidden="true" style={{ position: 'relative' }}>
        <span
          ref={mirrorRef}
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            top: 0,
            visibility: 'hidden',
            whiteSpace: 'pre',
            pointerEvents: 'none',
          }}
        >
          {chars.map((char) => char.label).join('')}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          {chars.map((char) => {
            const delay = known.current.has(char.id)
              ? 0
              : (ENTER_DELAY +
                  STAGGER * enteringOrder(chars, known.current, char.id)) *
                tempo;
            const exitTarget =
              exit === DEFAULT_EXIT && !transitionProp
                ? { ...exit, transition: exitTransition }
                : exit;
            return (
              <motion.span
                key={char.id}
                ref={(node: HTMLSpanElement | null) => {
                  if (node) letters.current.set(char.id, node);
                  else letters.current.delete(char.id);
                }}
                layout="position"
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                initial={reduce ? toCrossfade(initial) : initial}
                animate={reduce ? toCrossfade(animate) : animate}
                exit={reduce ? toCrossfade(exitTarget) : exitTarget}
                variants={variants}
                transition={delay ? delayed(transition, delay) : transition}
              >
                {char.label}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

export { MorphingText, type MorphingTextProps };
