'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type HTMLMotionProps,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';
import { getStrictContext } from '@/registry/lib/get-strict-context';

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
      />
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
  delay?: number;
  onCompleted?: () => void;
};

function ScrollingNumber({
  transition = { stiffness: 90, damping: 30 },
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

  const motionKey: 'x' | 'y' = isVertical ? 'y' : 'x';
  const initialOffset = itemsSize * sideItemsCount;
  const travel = itemsSize * (range.length - displayedItemsCount);

  let initialPosition: number;
  let finalPosition: number;

  switch (direction) {
    case 'btt':
      initialPosition = -initialOffset;
      finalPosition = travel;
      break;
    case 'ttb':
      initialPosition = initialOffset;
      finalPosition = -travel;
      break;
    case 'rtl':
      initialPosition = -initialOffset;
      finalPosition = travel;
      break;
    case 'ltr':
      initialPosition = initialOffset;
      finalPosition = -travel;
      break;
    default:
      initialPosition = -initialOffset;
      finalPosition = travel;
  }

  const posMotion: MotionValue<number> = useMotionValue(initialPosition);
  const posSpring = useSpring(posMotion, transition);

  React.useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      posMotion.set(finalPosition);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, finalPosition, posMotion, delay]);

  const currentIndex = useTransform(
    posSpring,
    (p) => Math.abs(p) / itemsSize + sideItemsCount,
  );
  const currentValue = useTransform(currentIndex, (idx) => idx * step);
  const snappedValue = useTransform(
    currentIndex,
    (idx) => Math.round(idx) * step,
  );

  const completedTransform = useTransform(
    currentValue,
    (val) => val >= number * 0.99,
  );

  React.useEffect(() => {
    const unsubscribe = completedTransform.on('change', (latest) => {
      if (latest) onCompleted?.();
    });
    return unsubscribe;
  }, [completedTransform, onCompleted]);

  React.useEffect(() => {
    const unsub = snappedValue.on('change', (val) => {
      const bounded = val < 0 ? 0 : val > number ? number : val;
      onNumberChange?.(bounded);
    });
    return unsub;
  }, [snappedValue, onNumberChange, number]);

  const directionMap: Record<
    ScrollingNumberDirection,
    React.CSSProperties['flexDirection']
  > = {
    btt: 'column',
    ttb: 'column-reverse',
    rtl: 'row',
    ltr: 'row-reverse',
  };

  return (
    <motion.div
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
        flexDirection: directionMap[direction],
        [motionKey]: posSpring,
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
