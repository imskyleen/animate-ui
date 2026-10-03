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
} from '@/registry/hooks/use-is-in-view';
import {
  ease,
  tempo,
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

/** Each digit settles quickly, without overshoot. */
const DEFAULT_ROLLER_TRANSITION: SpringOptions = {
  visualDuration: 0.25 * tempo,
  bounce: 0,
};

/** Counting from `fromNumber`: fast through the range, slow on the last digits. */
const COUNT_TRANSITION: Transition = {
  duration: 3 * tempo,
  ease: ease.out,
};

function countDecimals(value: number) {
  if (!Number.isFinite(value)) return 0;
  const [, fraction = ''] = String(value).split('.');
  return Math.min(fraction.length, 20);
}

function intLength(units: number, factor: number) {
  return Math.floor(Math.abs(units) / factor).toString().length;
}

type Rolling = {
  /**
   * The displayed value as an integer number of the smallest shown unit
   * (`12.34` with two decimals is `1234`). Every roller reads its digit from
   * it, so counting never re-renders React per frame.
   */
  units: MotionValue<number>;
  reduce: boolean;
  transition: SpringOptions;
};

type SlidingNumberRollerProps = Rolling & {
  /** Place of the digit, in units (1 for the last shown digit, 10, 100…). */
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

  // A roller mounting mid-change (a new leading digit) rolls in from the
  // digit the previous value had at its place, usually 0.
  const [startDigit] = React.useState(() =>
    digitOf(units.getPrevious() ?? units.get()),
  );
  const digitRef = React.useRef(startDigit);
  // Unbounded position: 9 -> 0 moves one step forward instead of rolling
  // back through every digit.
  const positionRef = React.useRef(startDigit);
  const position = useSpring(startDigit, transition);

  const roll = React.useCallback(
    (value: number) => {
      const digit = digitOf(value);
      const current = digitRef.current;
      if (digit === current) return;

      // Roll in the direction the number moves: up when it grows.
      const previous = units.getPrevious() ?? value;
      const delta =
        Math.abs(value) >= Math.abs(previous)
          ? (digit - current + 10) % 10
          : -((current - digit + 10) % 10);

      digitRef.current = digit;
      positionRef.current += delta;
      if (reduce) position.jump(positionRef.current);
      else position.set(positionRef.current);
    },
    [digitOf, units, reduce, position],
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
      {/* Sizes the roller; the digits are stacked on top of it. */}
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
  // Percentages of the digit's own height: no measuring, correct on the
  // first frame and when the font size changes.
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
  /**
   * When set, the number counts from it to `number`, every digit rolling on
   * the way. Otherwise each digit rolls straight to its new value.
   */
  fromNumber?: number;
  /** Called with the displayed value each time it changes. */
  onNumberChange?: (number: number) => void;
  padStart?: boolean;
  decimalSeparator?: string;
  /**
   * Decimal places to show. Defaults to the number of decimals of `number`.
   */
  decimalPlaces?: number;
  thousandSeparator?: string;
  /** Spring of each digit roller. */
  transition?: SpringOptions;
  /** Delay before the number changes, in milliseconds. */
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
  decimalPlaces,
  thousandSeparator,
  transition = DEFAULT_ROLLER_TRANSITION,
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

  const isCounting = fromNumber !== undefined;
  const decimals = decimalPlaces ?? countDecimals(number);
  const factor = Math.pow(10, decimals);
  const toUnits = (value: number) => Math.round(value * factor);

  // Without `fromNumber`, digits roll from 0 once the number is in view.
  const initialValue = initiallyStable ? number : (fromNumber ?? 0);
  const value = useMotionValue(initialValue);
  const units = useMotionValue(toUnits(initialValue));

  // Only the layout (digit count and sign) goes through React, and it
  // changes a handful of times per count, not per frame.
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

  // `decimalPlaces` changed: re-express the current value in the new unit.
  React.useEffect(() => {
    units.set(Math.round(value.get() * factor));
  }, [factor, units, value]);

  React.useEffect(() => {
    if (!isInView) {
      // Replays from 0 when it leaves and re-enters the view (inViewOnce false).
      if (!isCounting && !initiallyStable) value.jump(0);
      return;
    }

    const timeoutId = setTimeout(
      () => {
        // Counting retargets from the current value; a direct change lets
        // each roller's spring retarget on its own.
        if (isCounting && !reduce) animate(value, number, COUNT_TRANSITION);
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
      {/* Screen readers read the target once, not every rolled digit. */}
      <span className="sr-only">
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
