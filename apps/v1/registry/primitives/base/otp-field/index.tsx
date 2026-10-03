'use client';

import * as React from 'react';
import { OTPField as OTPFieldPrimitive } from '@base-ui/react/otp-field';
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
type OTPFieldEntry = { value: string; start: number; end: number };

/**
 * Finds the characters that were inserted between two values. Characters that
 * only shifted (deleting in the middle moves the following ones) are not
 * considered new, so deleting never animates.
 */
function getEntry(prev: string, next: string): OTPFieldEntry {
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
const CARET_CSS = `@keyframes animate-ui-caret-blink{0%,70%,100%{opacity:1}20%,50%{opacity:0}}[data-slot="otp-field-caret"]{display:none;animation:animate-ui-caret-blink 1.25s ease-out infinite}[data-slot="otp-field-input"]:focus~[data-slot="otp-field-caret"]{display:block}@media (prefers-reduced-motion:reduce){[data-slot="otp-field-caret"]{animation:none}}`;

type OTPFieldContextType = {
  entry: OTPFieldEntry | null;
};

const [OTPFieldProvider, useOTPField] =
  getStrictContext<OTPFieldContextType>('OTPFieldContext');

type OTPFieldSlotContextType = {
  filled: boolean;
  index: number;
};

const [OTPFieldSlotProvider, useOTPFieldSlot] =
  getStrictContext<OTPFieldSlotContextType>('OTPFieldSlotContext');

type OTPFieldProps = React.ComponentProps<typeof OTPFieldPrimitive.Root>;

function OTPField({
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: OTPFieldProps) {
  const [entry, setEntry] = React.useState<OTPFieldEntry | null>(null);
  const prevValueRef = React.useRef(value ?? defaultValue ?? '');

  React.useEffect(() => {
    if (value !== undefined) prevValueRef.current = value;
  }, [value]);

  const handleValueChange = React.useCallback<
    NonNullable<OTPFieldProps['onValueChange']>
  >(
    (nextValue, eventDetails) => {
      setEntry(getEntry(prevValueRef.current, nextValue));
      prevValueRef.current = nextValue;
      onValueChange?.(nextValue, eventDetails);
    },
    [onValueChange],
  );

  return (
    <OTPFieldProvider value={{ entry }}>
      <ReducedMotionConfig>
        <style href="animate-ui-otp-field-caret" precedence="animate-ui">
          {CARET_CSS}
        </style>
        <OTPFieldPrimitive.Root
          data-slot="otp-field"
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          {...props}
        >
          {children}
        </OTPFieldPrimitive.Root>
      </ReducedMotionConfig>
    </OTPFieldProvider>
  );
}

type OTPFieldInputProps = Omit<
  React.ComponentProps<typeof OTPFieldPrimitive.Input>,
  'render' | 'children'
> & {
  /** Class name of the `<span>` that wraps the input, its character and caret. */
  containerClassName?: string;
  /** Style of the `<span>` that wraps the input, its character and caret. */
  containerStyle?: React.CSSProperties;
  /** Transition of a typed character. */
  transition?: Transition;
  /** Rendered after the input, inside the wrapper (e.g. `OTPFieldCaret`). */
  children?: React.ReactNode;
};

function OTPFieldInput({
  containerClassName,
  containerStyle,
  transition = motionTransition.press,
  children,
  ...props
}: OTPFieldInputProps) {
  const { entry } = useOTPField();
  const reduce = useShouldReduceMotion();

  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-input"
      {...props}
      render={(inputProps, state) => {
        const isEntering =
          state.filled &&
          entry !== null &&
          state.index >= entry.start &&
          state.index < entry.end &&
          entry.value[state.index] === state.value;
        const delay =
          isEntering && !reduce && entry.end - entry.start > 1
            ? (state.index - entry.start) * STAGGER
            : 0;
        const char = inputProps.type === 'password' ? '•' : state.value;

        return (
          <span
            data-slot="otp-field-slot"
            data-filled={state.filled || undefined}
            data-disabled={state.disabled || undefined}
            data-invalid={inputProps['aria-invalid'] ? true : undefined}
            className={containerClassName}
            style={{
              position: 'relative',
              display: 'inline-flex',
              ...containerStyle,
            }}
          >
            {/* The real value stays in the input; its glyph is hidden so the
                animated copy below can be seen. */}
            <input
              {...inputProps}
              style={{
                ...inputProps.style,
                WebkitTextFillColor: 'transparent',
                caretColor: 'transparent',
              }}
            />
            {state.filled && (
              <motion.span
                key={char}
                data-slot="otp-field-char"
                aria-hidden="true"
                initial={
                  isEntering
                    ? {
                        opacity: 0,
                        transform: reduce
                          ? 'scale(1)'
                          : `scale(${scale.enter})`,
                      }
                    : false
                }
                animate={{ opacity: 1, transform: 'scale(1)' }}
                transition={{ ...transition, delay }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                {char}
              </motion.span>
            )}
            <OTPFieldSlotProvider
              value={{ filled: state.filled, index: state.index }}
            >
              {children}
            </OTPFieldSlotProvider>
          </span>
        );
      }}
    />
  );
}

type OTPFieldCaretProps = React.ComponentProps<'span'>;

/**
 * A blinking caret shown while its input is focused and empty. Place it
 * inside `OTPFieldInput`. It stops blinking under reduced motion.
 */
function OTPFieldCaret({ style, ...props }: OTPFieldCaretProps) {
  const { filled } = useOTPFieldSlot();
  if (filled) return null;

  return (
    <span
      data-slot="otp-field-caret"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        margin: 'auto',
        pointerEvents: 'none',
        ...style,
      }}
      {...props}
    />
  );
}

type OTPFieldSeparatorProps = React.ComponentProps<
  typeof OTPFieldPrimitive.Separator
>;

function OTPFieldSeparator(props: OTPFieldSeparatorProps) {
  return (
    <OTPFieldPrimitive.Separator data-slot="otp-field-separator" {...props} />
  );
}

export {
  OTPField,
  OTPFieldInput,
  OTPFieldCaret,
  OTPFieldSeparator,
  useOTPField,
  useOTPFieldSlot,
  type OTPFieldProps,
  type OTPFieldInputProps,
  type OTPFieldCaretProps,
  type OTPFieldSeparatorProps,
  type OTPFieldContextType,
  type OTPFieldSlotContextType,
  type OTPFieldEntry,
};
