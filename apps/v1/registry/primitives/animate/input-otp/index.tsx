'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { motion, type Transition } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

/** Delay between characters that arrive together (paste, autofill). */
const STAGGER = 0.025;

/** Characters of `value` in [start, end) were just typed or pasted. */
type InputOTPEntry = { value: string; start: number; end: number };

/**
 * Finds the characters that were inserted between two values. Characters that
 * only shifted (deleting in the middle moves the following ones) are not
 * considered new, so deleting never animates.
 */
function getEntry(prev: string, next: string): InputOTPEntry {
  let start = 0;
  while (
    start < prev.length &&
    start < next.length &&
    prev[start] === next[start]
  ) {
    start++;
  }
  let end = next.length;
  let prevEnd = prev.length;
  while (
    end > start &&
    prevEnd > start &&
    next[end - 1] === prev[prevEnd - 1]
  ) {
    end--;
    prevEnd--;
  }
  return { value: next, start, end };
}

// The fake caret blinks with CSS; React 19 hoists and dedupes this sheet.
const CARET_CSS = `@keyframes animate-ui-caret-blink{0%,70%,100%{opacity:1}20%,50%{opacity:0}}[data-slot="input-otp-caret"]{animation:animate-ui-caret-blink 1.25s ease-out infinite}@media (prefers-reduced-motion:reduce){[data-slot="input-otp-caret"]{animation:none}}`;

type InputOTPContextType = {
  entry: InputOTPEntry | null;
};

const [InputOTPProvider, useInputOTP] =
  getStrictContext<InputOTPContextType>('InputOTPContext');

type InputOTPSlotContextType = {
  index: number;
  char: string | null;
  isActive: boolean;
  hasFakeCaret: boolean;
};

const [InputOTPSlotProvider, useInputOTPSlot] =
  getStrictContext<InputOTPSlotContextType>('InputOTPSlotContext');

type InputOTPProps = React.ComponentProps<typeof OTPInput>;

function InputOTP({ value, onChange, ...props }: InputOTPProps) {
  const [entry, setEntry] = React.useState<InputOTPEntry | null>(null);
  const prevValueRef = React.useRef(
    value ?? (typeof props.defaultValue === 'string' ? props.defaultValue : ''),
  );

  React.useEffect(() => {
    if (value !== undefined) prevValueRef.current = value;
  }, [value]);

  const handleChange = React.useCallback(
    (nextValue: string) => {
      setEntry(getEntry(prevValueRef.current, nextValue));
      prevValueRef.current = nextValue;
      return onChange?.(nextValue);
    },
    [onChange],
  );

  return (
    <InputOTPProvider value={{ entry }}>
      <ReducedMotionConfig>
        <style href="animate-ui-input-otp-caret" precedence="animate-ui">
          {CARET_CSS}
        </style>
        <OTPInput
          data-slot="input-otp"
          value={value}
          onChange={handleChange}
          {...props}
        />
      </ReducedMotionConfig>
    </InputOTPProvider>
  );
}

type InputOTPGroupProps = React.ComponentProps<'div'>;

function InputOTPGroup(props: InputOTPGroupProps) {
  return <div data-slot="input-otp-group" {...props} />;
}

type InputOTPSlotProps = React.ComponentProps<'div'> & {
  index: number;
  /** Transition of a typed character. */
  transition?: Transition;
};

function InputOTPSlot({
  index,
  transition = motionTransition.press,
  children,
  ...props
}: InputOTPSlotProps) {
  const { slots } = React.use(OTPInputContext);
  const { entry } = useInputOTP();
  const reduce = useShouldReduceMotion();

  const slot = slots?.[index];
  const char = slot?.char ?? null;
  const isActive = slot?.isActive ?? false;
  const hasFakeCaret = slot?.hasFakeCaret ?? false;

  const isEntering =
    char !== null &&
    entry !== null &&
    index >= entry.start &&
    index < entry.end &&
    entry.value[index] === char;
  const delay =
    isEntering && !reduce && entry.end - entry.start > 1
      ? (index - entry.start) * STAGGER
      : 0;

  return (
    <InputOTPSlotProvider value={{ index, char, isActive, hasFakeCaret }}>
      <div
        data-slot="input-otp-slot"
        data-active={isActive}
        data-filled={char !== null}
        {...props}
      >
        {char !== null && (
          <motion.span
            key={char}
            data-slot="input-otp-char"
            initial={
              isEntering
                ? {
                    opacity: 0,
                    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
                  }
                : false
            }
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ ...transition, delay }}
            style={{ display: 'inline-block' }}
          >
            {char}
          </motion.span>
        )}
        {children}
      </div>
    </InputOTPSlotProvider>
  );
}

type InputOTPCaretProps = React.ComponentProps<'div'>;

/**
 * A blinking caret shown in the active, empty slot. Place it inside
 * `InputOTPSlot`. It stops blinking under reduced motion.
 */
function InputOTPCaret(props: InputOTPCaretProps) {
  const { hasFakeCaret } = useInputOTPSlot();
  if (!hasFakeCaret) return null;

  return <div data-slot="input-otp-caret" aria-hidden="true" {...props} />;
}

type InputOTPSeparatorProps = React.ComponentProps<'div'>;

function InputOTPSeparator(props: InputOTPSeparatorProps) {
  return <div data-slot="input-otp-separator" role="separator" {...props} />;
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPCaret,
  InputOTPSeparator,
  useInputOTP,
  useInputOTPSlot,
  type InputOTPProps,
  type InputOTPGroupProps,
  type InputOTPSlotProps,
  type InputOTPCaretProps,
  type InputOTPSeparatorProps,
  type InputOTPContextType,
  type InputOTPSlotContextType,
  type InputOTPEntry,
};
