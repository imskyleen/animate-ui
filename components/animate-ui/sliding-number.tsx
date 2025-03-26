'use client';

import * as React from 'react';
import {
  useSpring,
  useTransform,
  type MotionValue,
  motion,
} from 'motion/react';
import useMeasure from 'react-use-measure';

import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

const TRANSITION = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
  mass: 0.4,
};

interface NumberProps {
  prevValue: number;
  value: number;
  place: number;
}

const NumberRoller = ({ prevValue, value, place }: NumberProps) => {
  const startNumber = Math.floor(prevValue / place) % 10;
  const targetNumber = Math.floor(value / place) % 10;
  const animatedValue = useSpring(startNumber, TRANSITION);

  React.useEffect(() => {
    animatedValue.set(targetNumber);
  }, [targetNumber, animatedValue]);

  const [measureRef, { height }] = useMeasure();

  return (
    <div
      ref={measureRef}
      className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums"
    >
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <NumberDisplay
          key={i}
          motionValue={animatedValue}
          number={i}
          height={height}
        />
      ))}
    </div>
  );
};

interface NumberDisplayProps {
  motionValue: MotionValue<number>;
  number: number;
  height: number;
}

const NumberDisplay = ({ motionValue, number, height }: NumberDisplayProps) => {
  const y = useTransform(motionValue, (latest) => {
    if (!height) return 0;
    const currentNumber = latest % 10;
    const offset = (10 + number - currentNumber) % 10;
    let translateY = offset * height;
    if (offset > 5) translateY -= 10 * height;
    return translateY;
  });

  if (!height) {
    return <span className="invisible absolute">{number}</span>;
  }

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
    >
      {number}
    </motion.span>
  );
};

interface SlidingNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: number;
  startOnView?: boolean;
  padStart?: boolean;
  decimalSeparator?: string;
}

const SlidingNumber = React.forwardRef<HTMLSpanElement, SlidingNumberProps>(
  (
    {
      number,
      className,
      startOnView = false,
      padStart = false,
      decimalSeparator = '.',
      ...props
    },
    ref,
  ) => {
    const [viewRef, inView] = useInView<HTMLSpanElement>({ threshold: 0.1 });
    React.useImperativeHandle(ref, () => viewRef.current!);

    const prevNumberRef = React.useRef<number>(0);

    const effectiveNumber = React.useMemo(
      () => (startOnView && !inView ? 0 : Math.abs(number)),
      [number, startOnView, inView],
    );

    const numberStr = effectiveNumber.toString();
    let [newIntStr] = numberStr.split('.');
    const [, newDecStr] = numberStr.split('.');
    newIntStr =
      padStart && newIntStr.length === 1 ? '0' + newIntStr : newIntStr;

    const prevStr = prevNumberRef.current.toString();
    let [prevIntStr = ''] = prevStr.split('.');
    const [, prevDecStr = ''] = prevStr.split('.');
    prevIntStr =
      padStart && prevIntStr.length === 1 ? '0' + prevIntStr : prevIntStr;

    const adjustedPrevInt = React.useMemo(() => {
      return prevIntStr.length > newIntStr.length
        ? prevIntStr.slice(-newIntStr.length)
        : prevIntStr.padStart(newIntStr.length, '0');
    }, [prevIntStr, newIntStr]);

    const adjustedPrevDec = React.useMemo(() => {
      if (!newDecStr) return '';
      return prevDecStr.length > newDecStr.length
        ? prevDecStr.slice(0, newDecStr.length)
        : prevDecStr.padEnd(newDecStr.length, '0');
    }, [prevDecStr, newDecStr]);

    React.useEffect(() => {
      if (!startOnView || inView) {
        prevNumberRef.current = effectiveNumber;
      }
    }, [effectiveNumber, inView, startOnView]);

    const intDigitCount = newIntStr.length;
    const intPlaces = React.useMemo(
      () =>
        Array.from({ length: intDigitCount }, (_, i) =>
          Math.pow(10, intDigitCount - i - 1),
        ),
      [intDigitCount],
    );
    const decPlaces = React.useMemo(
      () =>
        newDecStr
          ? Array.from({ length: newDecStr.length }, (_, i) =>
              Math.pow(10, newDecStr.length - i - 1),
            )
          : [],
      [newDecStr],
    );

    const newDecValue = newDecStr ? parseInt(newDecStr, 10) : 0;
    const prevDecValue = adjustedPrevDec ? parseInt(adjustedPrevDec, 10) : 0;

    return (
      <span
        ref={viewRef}
        className={cn('flex items-center', className)}
        {...props}
      >
        {!(startOnView && !inView) && number < 0 && (
          <span className="mr-1">-</span>
        )}

        {intPlaces.map((place) => (
          <NumberRoller
            key={`int-${place}`}
            prevValue={parseInt(adjustedPrevInt, 10)}
            value={parseInt(newIntStr, 10)}
            place={place}
          />
        ))}

        {newDecStr && (
          <>
            <span>{decimalSeparator}</span>
            {decPlaces.map((place) => (
              <NumberRoller
                key={`dec-${place}`}
                prevValue={prevDecValue}
                value={newDecValue}
                place={place}
              />
            ))}
          </>
        )}
      </span>
    );
  },
);

SlidingNumber.displayName = 'SlidingNumber';

export { SlidingNumber, type SlidingNumberProps };
