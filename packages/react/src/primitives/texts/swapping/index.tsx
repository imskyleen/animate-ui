'use client';

import * as React from 'react';
import { motion, useInView, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { usePageVisible } from '../../../utils/use-page-visible';
import { VISUALLY_HIDDEN, splitGraphemes } from '../_text';

type SwappingTextDirection = 'up' | 'down';

const DEFAULT_TRANSITION: Transition = {
  duration: 0.2,
  ease: motionTokens.ease.fill,
};

const SHIFT = 0.5;
const BLUR = 'blur(2px)';

type SwappingTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  text: string | string[];
  duration?: number;
  delay?: number;
  direction?: SwappingTextDirection;
  stagger?: number;
  transition?: Transition;
};

type Swap = {
  id: number;
  from: string[];
  to: string[];
  widths: { from: number[]; to: number[] } | null;
};

function SwappingText(props: SwappingTextProps) {
  return (
    <ReducedMotionConfig>
      <SwappingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function measure(element: HTMLElement, chars: string[]) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return null;
  const style = getComputedStyle(element);
  context.font = style.font;
  const spacing = parseFloat(style.letterSpacing) || 0;
  return chars.map((char) => context.measureText(char).width + spacing);
}

function SwappingTextContent({
  text: textProp,
  duration = 2000,
  delay = 0,
  direction = 'up',
  stagger = 0.04,
  transition: transitionProp,
  style,
  ...props
}: SwappingTextProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;
  const ref = React.useRef<HTMLSpanElement>(null);
  const texts = Array.isArray(textProp) ? textProp : [textProp];
  const count = texts.length;
  const [index, setIndex] = React.useState(0);
  const onScreen = useInView(ref);
  const pageVisible = usePageVisible();
  const cycling = count > 1 && onScreen && pageVisible;
  const [hasCycled, setHasCycled] = React.useState(false);

  React.useEffect(() => {
    if (!cycling) return;
    const timeoutId = setTimeout(
      () => {
        setHasCycled(true);
        setIndex((current) => (current + 1) % count);
      },
      hasCycled ? duration : delay + duration,
    );
    return () => clearTimeout(timeoutId);
  }, [cycling, index, count, duration, delay, hasCycled]);

  const text = texts[index % count] ?? '';
  const chars = React.useMemo(() => splitGraphemes(text), [text]);
  const [swap, setSwap] = React.useState<Swap>(() => ({
    id: 0,
    from: chars,
    to: chars,
    widths: null,
  }));

  const doneRef = React.useRef(0);
  React.useLayoutEffect(() => {
    doneRef.current = 0;
  }, [swap.id]);

  React.useLayoutEffect(() => {
    setSwap((current) => {
      if (current.to.join('') === chars.join('')) return current;
      const element = ref.current;
      const from = measure(element!, current.to);
      const to = measure(element!, chars);
      return {
        id: current.id + 1,
        from: current.to,
        to: chars,
        widths: from && to ? { from, to } : null,
      };
    });
  }, [chars]);

  const slots = Math.max(swap.from.length, swap.to.length);
  const sign = direction === 'up' ? 1 : -1;
  const enter = `${sign * SHIFT}em`;
  const exit = `${-sign * SHIFT}em`;
  let order = 0;
  const swapping = Array.from(
    { length: slots },
    (_, i) => (swap.from[i] ?? '') !== (swap.to[i] ?? ''),
  ).filter(Boolean).length;
  const settle = () => {
    doneRef.current += 1;
    if (doneRef.current < swapping) return;
    const id = swap.id;
    setSwap((current) =>
      current.id === id
        ? { ...current, from: current.to, widths: null }
        : current,
    );
  };

  return (
    <span
      ref={ref}
      data-slot="swapping-text"
      style={{ display: 'inline-block', whiteSpace: 'pre', ...style }}
      {...props}
    >
      <span aria-hidden="true" style={{ display: 'inline-flex' }}>
        {Array.from({ length: slots }, (_, i) => {
          const from = swap.from[i] ?? '';
          const to = swap.to[i] ?? '';
          const animated = swap.id > 0 && from !== to && !reduce;
          if (!animated) {
            if (!to) return null;
            return (
              <span key={`${swap.id}-${i}`} style={{ display: 'inline-block' }}>
                {to}
              </span>
            );
          }
          const timing = { ...transition, delay: order++ * stagger };
          const widths = swap.widths;
          return (
            <motion.span
              key={`${swap.id}-${i}`}
              data-slot="swapping-text-slot"
              style={{ position: 'relative', display: 'inline-block' }}
              initial={widths ? { width: widths.from[i] ?? 0 } : false}
              animate={widths ? { width: widths.to[i] ?? 0 } : { opacity: 1 }}
              transition={timing}
              onAnimationComplete={settle}
            >
              {from && (
                <motion.span
                  data-slot="swapping-text-out"
                  style={{ position: 'absolute', left: 0, top: 0 }}
                  initial={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  animate={{ y: exit, opacity: 0, filter: BLUR }}
                  transition={timing}
                >
                  {from}
                </motion.span>
              )}
              {to && (
                <motion.span
                  data-slot="swapping-text-in"
                  style={{
                    position: widths ? 'absolute' : 'relative',
                    left: 0,
                    top: 0,
                    display: 'inline-block',
                  }}
                  initial={{ y: enter, opacity: 0, filter: BLUR }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={timing}
                >
                  {to}
                </motion.span>
              )}
              {widths && (
                <span style={{ visibility: 'hidden' }}>{to || ' '}</span>
              )}
            </motion.span>
          );
        })}
      </span>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {text}
      </span>
    </span>
  );
}

export { SwappingText, type SwappingTextProps, type SwappingTextDirection };
