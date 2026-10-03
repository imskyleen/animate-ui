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
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  type MotionTokens,
} from '../../../utils/motion';
import { VISUALLY_HIDDEN } from '../_text';

/**
 * Strong ease-out: the count races through the bulk of the range and
 * slows down on the last digits, so the final value is readable as it lands.
 */
const defaultTransition = (tokens: MotionTokens): Transition => ({
  duration: 3 * tokens.tempo,
  ease: tokens.ease.out,
});

/**
 * A `transition` without a `type` or an `ease` is a set of spring options
 * (the original `SpringOptions` API): animate it as a spring.
 */
function resolveTransition(
  transition: SpringOptions | Transition | undefined,
  tokens: MotionTokens,
): Transition {
  if (!transition) return defaultTransition(tokens);
  if ('type' in transition || 'ease' in transition) {
    return transition as Transition;
  }
  return { type: 'spring', ...transition } as Transition;
}

function countDecimals(value: number) {
  if (!Number.isFinite(value)) return 0;
  const [, fraction = ''] = String(value).split('.');
  return Math.min(fraction.length, 20);
}

type FormatOptions = {
  decimals: number;
  decimalSeparator: string;
  /** Integer length to pad to with leading zeros (0: no padding). */
  padLength: number;
};

function formatNumber(
  value: number,
  { decimals, decimalSeparator, padLength }: FormatOptions,
) {
  const fixed = Math.abs(value).toFixed(decimals);
  // No "-0" while counting through zero.
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  const [intPart = '0', fracPart] = fixed.split('.');
  const paddedInt = intPart.padStart(padLength, '0');
  return fracPart
    ? `${sign}${paddedInt}${decimalSeparator}${fracPart}`
    : `${sign}${paddedInt}`;
}

type CountingNumberProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  /**
   * Decimal places to show. Defaults to the number of decimals of `number`
   * (`12.5` shows one decimal, `2025` none).
   */
  decimalPlaces?: number;
  /**
   * Transition of the count. Spring options (`stiffness`, `damping`,
   * `bounce`, `visualDuration`…) animate as a spring; any Motion transition
   * with a `type` or an `ease` is used as is. Defaults to a 3s strong ease-out.
   */
  transition?: SpringOptions | Transition;
  /** Delay before counting, in milliseconds. */
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
  transition,
  decimalPlaces,
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
  const tokens = useMotionTokens();

  const formatOptions: FormatOptions = {
    decimals: decimalPlaces ?? countDecimals(number),
    decimalSeparator,
    padLength: padStart ? Math.floor(Math.abs(number)).toString().length : 0,
  };

  const value = useMotionValue(initiallyStable ? number : fromNumber);

  // The ticking value is written straight to the DOM: no React render per
  // frame. Writing the existing text node keeps the node React owns.
  useMotionValueEvent(value, 'change', (latest) => {
    const node = visualRef.current;
    if (!node) return;
    const text = formatNumber(latest, formatOptions);
    if (node.firstChild instanceof Text) node.firstChild.nodeValue = text;
    else node.textContent = text;
  });

  // Read when the count starts: a new inline transition object on every
  // render must not restart it.
  const transitionRef = React.useRef({ transition, tokens });
  React.useEffect(() => {
    transitionRef.current = { transition, tokens };
  });

  React.useEffect(() => {
    if (!isInView) return;

    // Under reduced motion the number jumps to its target, without delay.
    if (reduce) {
      value.jump(number);
      return;
    }

    // animate() starts from the current value and replaces the running
    // animation, so a new `number` retargets mid-count instead of restarting.
    const timeoutId = setTimeout(() => {
      const { transition, tokens } = transitionRef.current;
      animate(value, number, resolveTransition(transition, tokens));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isInView, number, value, delay, reduce]);

  React.useEffect(() => () => value.stop(), [value]);

  return (
    <span ref={localRef} data-slot="counting-number" {...props}>
      {/* Screen readers get the target once, never the ticking values. */}
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
