'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { usePageVisible } from '../../../utils/use-page-visible';
import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type TypingPhase = 'typing' | 'holding' | 'erasing' | 'done';

type TypingState = {
  index: number;
  count: number;
  phase: TypingPhase;
};

const INITIAL_STATE: TypingState = { index: 0, count: 0, phase: 'typing' };

type TypingTextContextType = {
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  /** False when the cursor should hold still (off screen, hidden tab, reduced motion). */
  canBlink: boolean;
};

const [TypingTextProvider, useTypingText] =
  getStrictContext<TypingTextContextType>('TypingTextContext');

type TypingTextProps = React.ComponentProps<'span'> & {
  /** Delay per typed or erased character, in milliseconds. */
  duration?: number;
  /** Delay before typing starts, in milliseconds. */
  delay?: number;
  /** Erase the last text and start over from the first one. */
  loop?: boolean;
  /** Pause on a fully typed text before erasing it, in milliseconds. */
  holdDelay?: number;
  text: string | string[];
} & UseIsInViewOptions;

function TypingText(props: TypingTextProps) {
  return (
    <ReducedMotionConfig>
      <TypingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function TypingTextContent({
  ref,
  children,
  duration = 100,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  loop = false,
  holdDelay = 1000,
  text,
  ...props
}: TypingTextProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const reduce = useShouldReduceMotion();
  const pageVisible = usePageVisible();
  // Actual visibility, independent of the `inView` start trigger. Assumed
  // visible until measured, so the cursor starts blinking on mount and fades
  // in as typing begins.
  const onScreen = useInView(localRef, { initial: true });

  // Inline arrays get a new identity every render: only restart typing when
  // the texts themselves change.
  const textsKey = JSON.stringify(typeof text === 'string' ? [text] : text);
  const texts = React.useMemo(
    () => JSON.parse(textsKey) as string[],
    [textsKey],
  );
  const segments = React.useMemo(() => texts.map(splitGraphemes), [texts]);

  const [isTyping, setIsTyping] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!isInView) return;
    const timeoutId = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeoutId);
  }, [isInView, delay]);

  // Timings are read when the next character is scheduled, so changing them
  // mid-animation takes effect without restarting.
  const timingRef = React.useRef({ duration, holdDelay });
  React.useEffect(() => {
    timingRef.current = { duration, holdDelay };
  });

  // The visible text is written straight to the DOM: typing a character
  // never re-renders React.
  const textRef = React.useRef<HTMLSpanElement>(null);
  const stateRef = React.useRef<TypingState>({ ...INITIAL_STATE });

  const write = React.useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    const { index, count } = stateRef.current;
    el.textContent = (segments[index] ?? []).slice(0, count).join('');
  }, [segments]);

  // New texts restart from scratch (typing is that kind of effect). Under
  // reduced motion the final text is shown at once.
  React.useLayoutEffect(() => {
    if (reduce) {
      const last = segments.length - 1;
      const index = loop ? 0 : last;
      stateRef.current = {
        index,
        count: segments[index]?.length ?? 0,
        phase: 'done',
      };
    } else {
      stateRef.current = { ...INITIAL_STATE };
    }
    write();
  }, [segments, loop, reduce, write]);

  // A loop pauses off screen and in a hidden tab; a single run only in a
  // hidden tab (it then finishes where it is, it doesn't wait to be seen).
  const paused = !pageVisible || (loop && !onScreen);

  React.useEffect(() => {
    if (reduce || !started || paused) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = (ms: number) => {
      timeoutId = setTimeout(step, ms);
    };

    // One tick per `duration`: a typed (or erased) character per tick, plus
    // one tick on the full (or empty) text before holding (or typing the
    // next one). The cursor turns solid as soon as a text starts.
    function step() {
      const state = stateRef.current;
      const length = segments[state.index]?.length ?? 0;
      const isLast = state.index === segments.length - 1;
      const timing = timingRef.current;

      switch (state.phase) {
        case 'typing':
          if (state.count < length) {
            state.count++;
            write();
            schedule(timing.duration);
          } else if (isLast && !loop) {
            setIsTyping(false);
            state.phase = 'done';
          } else {
            setIsTyping(false);
            state.phase = 'holding';
            schedule(timing.holdDelay);
          }
          break;
        case 'holding':
          setIsTyping(true);
          state.phase = 'erasing';
          schedule(timing.duration);
          break;
        case 'erasing':
          if (state.count > 0) {
            state.count--;
            write();
          } else {
            state.index = isLast ? 0 : state.index + 1;
            state.phase = 'typing';
          }
          schedule(timing.duration);
          break;
        case 'done':
          break;
      }
    }

    // Resuming after a pause continues where it stopped.
    const { phase, count } = stateRef.current;
    if (phase === 'typing' && count === 0) setIsTyping(true);
    if (phase !== 'done') {
      schedule(
        phase === 'holding'
          ? timingRef.current.holdDelay
          : timingRef.current.duration,
      );
    }

    return () => clearTimeout(timeoutId);
  }, [segments, loop, reduce, started, paused, write]);

  // Screen readers get every text once, never the partial ones.
  const srText = texts.join(', ');

  return (
    <TypingTextProvider
      value={{
        isTyping: isTyping && !reduce,
        setIsTyping,
        canBlink: !reduce && pageVisible && onScreen,
      }}
    >
      <span ref={localRef} data-slot="typing-text" {...props}>
        <span className="sr-only" style={VISUALLY_HIDDEN}>
          {srText}
        </span>
        <span ref={textRef} aria-hidden />
        {children}
      </span>
    </TypingTextProvider>
  );
}

type TypingTextCursorProps = Omit<HTMLMotionProps<'span'>, 'children'>;

function TypingTextCursor({
  style,
  variants,
  ...props
}: TypingTextCursorProps) {
  const { isTyping, canBlink } = useTypingText();

  return (
    <motion.span
      data-slot="typing-text-cursor"
      aria-hidden
      variants={{
        blinking: {
          opacity: [0, 0, 1, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0,
            ease: 'linear',
            times: [0, 0.5, 0.5, 1],
          },
        },
        visible: {
          opacity: 1,
        },
        ...variants,
      }}
      // The blink is a loop: it holds still while typing, off screen, in a
      // hidden tab and under reduced motion.
      animate={isTyping || !canBlink ? 'visible' : 'blinking'}
      style={{
        display: 'inline-block',
        height: '16px',
        transform: 'translateY(2px)',
        width: '1px',
        backgroundColor: 'currentColor',
        ...style,
      }}
      {...props}
    />
  );
}

export {
  TypingText,
  TypingTextCursor,
  type TypingTextProps,
  type TypingTextCursorProps,
};
