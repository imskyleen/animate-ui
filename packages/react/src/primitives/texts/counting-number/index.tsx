'use client';

import * as React from 'react';
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type SpringOptions,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

const DEFAULT_TRANSITION: SpringOptions = {
  stiffness: motionTokens.spring.number.stiffness,
  damping: motionTokens.spring.number.damping,
};

function resolveTransition(transition: SpringOptions | Transition): Transition {
  if ('type' in transition || 'ease' in transition) {
    return transition as Transition;
  }
  return {
    type: 'spring',
    restDelta: 0.001,
    restSpeed: 0.01,
    ...transition,
  } as Transition;
}

type FormatOptions = {
  decimals: number;
  decimalSeparator: string;
  thousandSeparator: string | undefined;
  padLength: number;
};

function formatNumber(
  value: number,
  { decimals, decimalSeparator, thousandSeparator, padLength }: FormatOptions,
) {
  const fixed = Math.abs(value).toFixed(decimals);
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  const [intPart = '0', fracPart] = fixed.split('.');
  const padded = intPart.padStart(padLength, '0');
  const paddedInt =
    thousandSeparator === undefined
      ? padded
      : padded.replace(/\B(?=(\d{3})+$)/g, thousandSeparator);
  return fracPart
    ? `${sign}${paddedInt}${decimalSeparator}${fracPart}`
    : `${sign}${paddedInt}`;
}

type CountingNumberProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  thousandSeparator?: string;
  transition?: SpringOptions | Transition;
  delay?: number;
  initiallyStable?: boolean;
} & UseIsInViewOptions;

function CountingNumber(props: CountingNumberProps) {
  return (
    <ReducedMotionConfig remount>
      <CountingNumberContent {...props} />
    </ReducedMotionConfig>
  );
}

function CountingNumberContent({
  ref,
  number,
  fromNumber = 0,
  padStart = false,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  decimalSeparator = '.',
  thousandSeparator,
  transition: transitionProp,
  decimalPlaces = 0,
  delay = 0,
  initiallyStable = false,
  ...props
}: CountingNumberProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLSpanElement>,
    { inView, inViewOnce, inViewMargin },
  );
  const visualRef = React.useRef<HTMLSpanElement>(null);
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(
    DEFAULT_TRANSITION as Transition,
  );
  const transition = transitionProp ?? defaultTransition;

  const formatOptions: FormatOptions = {
    decimals: decimalPlaces,
    decimalSeparator,
    thousandSeparator,
    padLength: padStart ? Math.floor(Math.abs(number)).toString().length : 0,
  };

  const value = useMotionValue(initiallyStable ? number : fromNumber);

  useMotionValueEvent(value, 'change', (latest) => {
    const node = visualRef.current;
    if (!node) return;
    const text = formatNumber(latest, formatOptions);
    if (node.firstChild instanceof Text) node.firstChild.nodeValue = text;
    else node.textContent = text;
  });

  const transitionRef = React.useRef(transition);
  React.useEffect(() => {
    transitionRef.current = transition;
  });

  React.useEffect(() => {
    if (!isInView) return;

    if (reduce) {
      value.jump(number);
      return;
    }

    const timeoutId = setTimeout(() => {
      animate(value, number, resolveTransition(transitionRef.current));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isInView, number, value, delay, reduce]);

  React.useEffect(() => () => value.stop(), [value]);

  return (
    <span ref={localRef} data-slot="counting-number" {...props}>
      <span aria-hidden="true" ref={visualRef}>
        {formatNumber(value.get(), formatOptions)}
      </span>
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {formatNumber(number, formatOptions)}
      </span>
    </span>
  );
}

export { CountingNumber, type CountingNumberProps };
