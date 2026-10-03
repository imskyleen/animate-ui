'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  type MotionTokens,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

const formatter = new Intl.NumberFormat('en-US');

function generateRange(
  max: number,
  step: number,
  sideItemsCount: number,
): number[] {
  const result: number[] = [];
  const end = max + sideItemsCount * step;
  for (let value = end; value >= 0; value -= step) {
    result.push(value);
  }
  return result;
}

type ScrollingNumberDirection = 'ltr' | 'rtl' | 'ttb' | 'btt';

type ScrollingNumberContextType = {
  number: number;
  step: number;
  itemsSize: number;
  sideItemsCount: number;
  displayedItemsCount: number;
  isInView: boolean;
  direction: ScrollingNumberDirection;
  isVertical: boolean;
  range: number[];
  onNumberChange?: (value: number) => void;
};

const [ScrollingNumberProvider, useScrollingNumber] =
  getStrictContext<ScrollingNumberContextType>('ScrollingNumberContext');

type ScrollingNumberContainerProps = React.ComponentProps<'div'> & {
  number: number;
  step: number;
  itemsSize?: number;
  sideItemsCount?: number;
  direction?: ScrollingNumberDirection;
  onNumberChange?: (value: number) => void;
} & UseIsInViewOptions;

function ScrollingNumberContainer({
  ref,
  number,
  step,
  itemsSize = 30,
  sideItemsCount = 2,
  direction = 'btt',
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  onNumberChange,
  style,
  children,
  ...props
}: ScrollingNumberContainerProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLDivElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const displayedItemsCount = React.useMemo(
    () => 1 + sideItemsCount * 2,
    [sideItemsCount],
  );
  const isVertical = React.useMemo(
    () => direction === 'btt' || direction === 'ttb',
    [direction],
  );
  const range = React.useMemo(
    () => generateRange(number, step, sideItemsCount),
    [number, step, sideItemsCount],
  );

  return (
    <ScrollingNumberProvider
      value={{
        number,
        step,
        itemsSize,
        sideItemsCount,
        displayedItemsCount,
        isInView,
        direction,
        isVertical,
        range,
        onNumberChange,
      }}
    >
      <div
        ref={localRef}
        data-slot="scrolling-number-container"
        data-direction={direction}
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: isVertical ? itemsSize * displayedItemsCount : undefined,
          width: !isVertical ? itemsSize * displayedItemsCount : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
        {/* The wheel is aria-hidden: screen readers get the number once. */}
        <span className="sr-only" style={VISUALLY_HIDDEN}>
          {formatter.format(number)}
        </span>
      </div>
    </ScrollingNumberProvider>
  );
}

type ScrollingNumberHighlightProps = React.ComponentProps<'div'>;

function ScrollingNumberHighlight({
  style,
  ...props
}: ScrollingNumberHighlightProps) {
  const { itemsSize, isVertical, direction } = useScrollingNumber();
  return (
    <div
      data-slot="scrolling-number-highlight"
      data-direction={direction}
      style={{
        position: 'absolute',
        height: isVertical ? itemsSize : undefined,
        width: !isVertical ? itemsSize : undefined,
        left: !isVertical ? '50%' : undefined,
        top: isVertical ? '50%' : undefined,
        transform: !isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
        zIndex: 0,
        ...style,
      }}
      {...props}
    />
  );
}

type ScrollingNumberProps = HTMLMotionProps<'div'> & {
  /** Delay before the wheel spins, in milliseconds. */
  delay?: number;
  /** Called once the wheel (nearly) lands on `number`. */
  onCompleted?: () => void;
};

/**
 * Spins fast through the range and settles on the target with a strong
 * ease-out tail.
 */
const defaultTransition = (tokens: MotionTokens): Transition => ({
  duration: 2 * tokens.tempo,
  ease: tokens.ease.out,
});

/**
 * A `transition` without a `type` or an `ease` is a set of spring options
 * (the original API, fed to a spring): animate it as a spring.
 */
function resolveTransition(
  transition: Transition | undefined,
  tokens: MotionTokens,
): Transition {
  if (!transition) return defaultTransition(tokens);
  if ('type' in transition || 'ease' in transition) return transition;
  return { type: 'spring', ...transition } as Transition;
}

const DIRECTION_FLEX: Record<
  ScrollingNumberDirection,
  React.CSSProperties['flexDirection']
> = {
  btt: 'column',
  ttb: 'column-reverse',
  rtl: 'row',
  ltr: 'row-reverse',
};

function ScrollingNumber(props: ScrollingNumberProps) {
  return (
    <ReducedMotionConfig remount>
      <ScrollingNumberContent {...props} />
    </ReducedMotionConfig>
  );
}

function ScrollingNumberContent({
  transition,
  delay = 0,
  onCompleted,
  style,
  ...props
}: ScrollingNumberProps) {
  const {
    itemsSize,
    sideItemsCount,
    displayedItemsCount,
    isInView,
    direction,
    isVertical,
    range,
    step,
    number,
    onNumberChange,
  } = useScrollingNumber();
  const reduce = useShouldReduceMotion();

  // btt / rtl move the strip forward (positive), ttb / ltr backward.
  const sign = direction === 'ttb' || direction === 'ltr' ? -1 : 1;
  const initialPosition = -sign * itemsSize * sideItemsCount;
  const finalPosition = sign * itemsSize * (range.length - displayedItemsCount);

  const position = useMotionValue(initialPosition);
  const transform = useTransform(position, (p) =>
    isVertical ? `translateY(${p}px)` : `translateX(${p}px)`,
  );

  // Read when the spin starts: a new inline transition object on every
  // render must not restart it.
  const tokens = useMotionTokens();
  const transitionRef = React.useRef({ transition, tokens });
  React.useEffect(() => {
    transitionRef.current = { transition, tokens };
  });

  React.useEffect(() => {
    if (!isInView) return;

    // Under reduced motion the wheel lands on the number right away.
    if (reduce) {
      position.jump(finalPosition);
      return;
    }

    // animate() starts from the current position and replaces the running
    // animation, so a new `number` retargets mid-spin.
    const timer = setTimeout(() => {
      const { transition, tokens } = transitionRef.current;
      animate(position, finalPosition, resolveTransition(transition, tokens));
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, finalPosition, position, delay, reduce]);

  React.useEffect(() => () => position.stop(), [position]);

  // Index of the range item (counted from the smallest value) under the
  // center slot.
  const indexAt = (p: number) => (sign * p) / itemsSize + sideItemsCount;
  const lastNumberRef = React.useRef<number | null>(null);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    completedRef.current = false;
  }, [number]);

  useMotionValueEvent(position, 'change', (p) => {
    const index = indexAt(p);
    const snapped = Math.min(Math.max(Math.round(index) * step, 0), number);
    if (snapped !== lastNumberRef.current) {
      lastNumberRef.current = snapped;
      onNumberChange?.(snapped);
    }

    const total = finalPosition - initialPosition;
    const progress = total === 0 ? 1 : (p - initialPosition) / total;
    if (!completedRef.current && progress >= 0.99) {
      completedRef.current = true;
      onCompleted?.();
    }
  });

  return (
    <motion.div
      // The strip lists every value it passes: screen readers read the
      // container's final number instead.
      aria-hidden="true"
      data-slot="scrolling-number"
      style={{
        position: 'absolute',
        top: direction === 'ttb' ? 0 : undefined,
        bottom: direction === 'btt' ? 0 : undefined,
        left: direction === 'ltr' ? 0 : undefined,
        right: direction === 'rtl' ? 0 : undefined,
        width: isVertical ? '100%' : undefined,
        height: !isVertical ? '100%' : undefined,
        display: 'flex',
        zIndex: 1,
        flexDirection: DIRECTION_FLEX[direction],
        transform,
        ...style,
      }}
      {...props}
    />
  );
}

type ScrollingNumberItemsProps = Omit<React.ComponentProps<'div'>, 'children'>;

function ScrollingNumberItems({ style, ...props }: ScrollingNumberItemsProps) {
  const { range, direction, itemsSize, isVertical } = useScrollingNumber();
  return range.map((value) => (
    <div
      key={value}
      data-slot="scrolling-number-item"
      data-value={value}
      data-direction={direction}
      style={{
        height: isVertical ? itemsSize : undefined,
        width: !isVertical ? itemsSize : undefined,
        ...style,
      }}
      {...props}
    >
      {formatter.format(value)}
    </div>
  ));
}

export {
  ScrollingNumberContainer,
  ScrollingNumber,
  ScrollingNumberHighlight,
  ScrollingNumberItems,
  useScrollingNumber,
  type ScrollingNumberContainerProps,
  type ScrollingNumberProps,
  type ScrollingNumberHighlightProps,
  type ScrollingNumberItemsProps,
  type ScrollingNumberDirection,
  type ScrollingNumberContextType,
};
