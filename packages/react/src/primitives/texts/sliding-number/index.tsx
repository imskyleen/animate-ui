'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
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

const ROLLER_TRANSITION: SpringOptions = {
  stiffness: 200,
  damping: 20,
  mass: 0.4,
};

const COUNT_TRANSITION: Transition = {
  ...motionTokens.spring.number,
  restDelta: 0.001,
  restSpeed: 0.01,
};

function intLength(units: number, factor: number) {
  return Math.floor(Math.abs(units) / factor).toString().length;
}

type Rolling = {
  units: MotionValue<number>;
  reduce: boolean;
  transition: SpringOptions;
};

type SlidingNumberRollerProps = Rolling & {
  place: number;
};

function SlidingNumberRoller({
  units,
  place,
  reduce,
  transition,
}: SlidingNumberRollerProps) {
  const digitOf = React.useCallback(
    (value: number) => Math.floor(Math.abs(value) / place) % 10,
    [place],
  );

  const [startDigit] = React.useState(() =>
    digitOf(units.getPrevious() ?? units.get()),
  );
  const position = useSpring(startDigit, transition);

  const roll = React.useCallback(
    (value: number) => {
      const digit = digitOf(value);
      if (reduce) position.jump(digit);
      else position.set(digit);
    },
    [digitOf, reduce, position],
  );

  useMotionValueEvent(units, 'change', roll);
  React.useEffect(() => roll(units.get()), [roll, units]);

  return (
    <span
      aria-hidden="true"
      data-slot="sliding-number-roller"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '1ch',
        overflowX: 'visible',
        overflowY: 'clip',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ visibility: 'hidden' }}>0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <SlidingNumberDisplay key={i} position={position} number={i} />
      ))}
    </span>
  );
}

type SlidingNumberDisplayProps = {
  position: MotionValue<number>;
  number: number;
};

function SlidingNumberDisplay({ position, number }: SlidingNumberDisplayProps) {
  const transform = useTransform(position, (latest) => {
    const current = ((latest % 10) + 10) % 10;
    let offset = (10 + number - current) % 10;
    if (offset > 5) offset -= 10;
    return `translateY(${offset * 100}%)`;
  });

  return (
    <motion.span
      data-slot="sliding-number-display"
      style={{
        transform,
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {number}
    </motion.span>
  );
}

type SlidingNumberProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  number: number;
  fromNumber?: number;
  onNumberChange?: (number: number) => void;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  thousandSeparator?: string;
  transition?: SpringOptions;
  delay?: number;
  initiallyStable?: boolean;
} & UseIsInViewOptions;

function SlidingNumber(props: SlidingNumberProps) {
  return (
    <ReducedMotionConfig remount>
      <SlidingNumberContent {...props} />
    </ReducedMotionConfig>
  );
}

function SlidingNumberContent({
  ref,
  number,
  fromNumber,
  onNumberChange,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  padStart = false,
  decimalSeparator = '.',
  decimalPlaces = 0,
  thousandSeparator,
  transition: transitionProp,
  delay = 0,
  initiallyStable = false,
  style,
  ...props
}: SlidingNumberProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLSpanElement>,
    { inView, inViewOnce, inViewMargin },
  );
  const reduce = useShouldReduceMotion();

  const defaultRollerTransition = useTempoTransition(
    ROLLER_TRANSITION as Transition,
  ) as SpringOptions;
  const transition = transitionProp ?? defaultRollerTransition;

  const countTransition = useTempoTransition(COUNT_TRANSITION);
  const countTransitionRef = React.useRef(countTransition);
  React.useEffect(() => {
    countTransitionRef.current = countTransition;
  });

  const isCounting = fromNumber !== undefined;
  const decimals = decimalPlaces;
  const factor = Math.pow(10, decimals);
  const toUnits = (value: number) => Math.round(value * factor);

  const initialValue = initiallyStable ? number : (fromNumber ?? 0);
  const value = useMotionValue(initialValue);
  const units = useMotionValue(toUnits(initialValue));

  const [layout, setLayout] = React.useState(() => ({
    intLength: intLength(toUnits(initialValue), factor),
    negative: toUnits(initialValue) < 0,
  }));

  useMotionValueEvent(value, 'change', (latest) => units.set(toUnits(latest)));
  useMotionValueEvent(units, 'change', (latest) => {
    const next = {
      intLength: intLength(latest, factor),
      negative: latest < 0,
    };
    setLayout((prev) =>
      prev.intLength === next.intLength && prev.negative === next.negative
        ? prev
        : next,
    );
    onNumberChange?.(latest / factor);
  });

  React.useEffect(() => {
    units.set(Math.round(value.get() * factor));
  }, [factor, units, value]);

  React.useEffect(() => {
    if (!isInView) {
      if (!isCounting && !initiallyStable) value.jump(0);
      return;
    }

    const timeoutId = setTimeout(
      () => {
        if (isCounting && !reduce)
          animate(value, number, countTransitionRef.current);
        else value.jump(number);
      },
      reduce ? 0 : delay,
    );
    return () => clearTimeout(timeoutId);
  }, [isInView, isCounting, initiallyStable, number, value, delay, reduce]);

  React.useEffect(() => () => value.stop(), [value]);

  const shownIntLength = padStart
    ? Math.max(Math.floor(Math.abs(number)).toString().length, layout.intLength)
    : layout.intLength;

  const intPlaces = Array.from(
    { length: shownIntLength },
    (_, i) => Math.pow(10, shownIntLength - i - 1) * factor,
  );
  const decPlaces = Array.from({ length: decimals }, (_, i) =>
    Math.pow(10, decimals - i - 1),
  );

  const rolling: Rolling = { units, reduce, transition };

  return (
    <motion.span
      ref={localRef}
      data-slot="sliding-number"
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      {...props}
    >
      <span className="sr-only" style={VISUALLY_HIDDEN}>
        {formatNumber(number, {
          decimals,
          decimalSeparator,
          thousandSeparator,
          padLength: padStart ? shownIntLength : 0,
        })}
      </span>

      {layout.negative && (
        <span aria-hidden="true" style={{ marginRight: '0.25rem' }}>
          -
        </span>
      )}

      {intPlaces.map((place, idx) => {
        const digitsToRight = intPlaces.length - idx - 1;
        const isSeparatorPosition =
          thousandSeparator !== undefined &&
          digitsToRight > 0 &&
          digitsToRight % 3 === 0;

        return (
          <React.Fragment key={`int-${place}`}>
            <SlidingNumberRoller place={place} {...rolling} />
            {isSeparatorPosition && (
              <span aria-hidden="true">{thousandSeparator}</span>
            )}
          </React.Fragment>
        );
      })}

      {decimals > 0 && (
        <>
          <span aria-hidden="true">{decimalSeparator}</span>
          {decPlaces.map((place) => (
            <SlidingNumberRoller
              key={`dec-${place}`}
              place={place}
              {...rolling}
            />
          ))}
        </>
      )}
    </motion.span>
  );
}

type FormatOptions = {
  decimals: number;
  decimalSeparator: string;
  thousandSeparator?: string;
  padLength: number;
};

function formatNumber(
  value: number,
  { decimals, decimalSeparator, thousandSeparator, padLength }: FormatOptions,
) {
  const fixed = Math.abs(value).toFixed(decimals);
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  const [intPart = '0', fracPart] = fixed.split('.');
  let int = intPart.padStart(padLength, '0');
  if (thousandSeparator !== undefined) {
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  }
  return fracPart
    ? `${sign}${int}${decimalSeparator}${fracPart}`
    : `${sign}${int}`;
}

export { SlidingNumber, type SlidingNumberProps };
