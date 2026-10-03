'use client';

import * as React from 'react';
import {
  OTPInput as BaseOTPInput,
  OTPInputContext,
  type OTPInputProps,
  type RenderProps,
} from 'input-otp';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../utils/motion';

// A drop-in replacement for the `input-otp` package: the same exports with the
// same API, plus motion. shadcn/ui's InputOTP (every base) works unchanged.
//
// How: the slots are the user's markup (shadcn/ui renders the `char` of
// OTPInputContext as plain text in a `data-slot="input-otp-slot"` div), and
// the context keeps input-otp's values, strings included. After each change,
// the characters that were just typed or pasted are found by comparing the
// old and new values, and their slots — the `[data-slot="input-otp-slot"]`
// elements of the container, in index order — are animated with the Web
// Animations API: the text fades in (`color` from transparent) while its
// `font-size` grows from 95%, which scales the glyph alone, not the slot's
// box. A paste staggers its characters. Only those two properties are
// animated, from an explicit first keyframe to the slot's own style, so the
// slot's classes, transitions and rings are untouched. Deleting is instant,
// and characters that only shift because one before them was removed don't
// animate. Under reduced motion characters only fade, and the fake caret
// (any CSS animation inside a slot) stops blinking.

/** Delay between characters that arrive together (paste, autofill), in seconds. */
const STAGGER = 0.025;

const SLOT_SELECTOR = '[data-slot="input-otp-slot"]';

/**
 * Finds the characters that were inserted between two values: `[start, end)`
 * of `next`. Characters that only shifted (deleting in the middle moves the
 * following ones) are not considered new, so deleting never animates.
 */
function getEntry(prev: string, next: string) {
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
  return { start, end };
}

// The fake caret's blink is the user's CSS: stop it under reduced motion (the
// OS setting, or `data-reduced-motion`, set from Motion's config). React 19
// hoists and dedupes this sheet.
const REDUCED_MOTION_CSS = `@media (prefers-reduced-motion:reduce){[data-input-otp-container] ${SLOT_SELECTOR} *{animation:none!important}}[data-input-otp-container][data-reduced-motion] ${SLOT_SELECTOR} *{animation:none!important}`;

const running = new WeakMap<Element, Animation>();

type SlotsMotionProps = {
  slots: RenderProps['slots'];
  inputRef: React.RefObject<HTMLInputElement | null>;
  children?: React.ReactNode;
};

/** Animates the slots of the characters that were just entered. */
function SlotsMotion({ slots, inputRef, children }: SlotsMotionProps) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  // The value is contiguous from the first slot.
  const value = slots.map((slot) => slot.char ?? '').join('');
  const prevValueRef = React.useRef(value);

  const getContainer = React.useCallback(
    () => inputRef.current?.closest('[data-input-otp-container]') ?? null,
    [inputRef],
  );

  React.useLayoutEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    if (prev === value) return;
    const { start, end } = getEntry(prev, value);
    if (end <= start) return;

    const container = getContainer();
    if (!container || typeof Element.prototype.animate !== 'function') return;
    const elements = container.querySelectorAll<HTMLElement>(SLOT_SELECTOR);
    const { duration, ease } = tokens.transition.press;
    const stagger = !reduce && end - start > 1 ? STAGGER * tokens.tempo : 0;

    for (let index = start; index < end; index++) {
      const el = elements[index];
      if (!el) continue;
      running.get(el)?.cancel();
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      const from: Keyframe = { offset: 0, color: 'transparent' };
      if (!reduce && fontSize > 0)
        from.fontSize = `${fontSize * tokens.scale.enter}px`;
      // One keyframe at offset 0: it ends on the slot's own style.
      const animation = el.animate([from], {
        duration: duration * 1000,
        delay: (index - start) * stagger * 1000,
        easing: `cubic-bezier(${ease.join(', ')})`,
        // Waiting characters of a paste stay hidden until their turn.
        fill: 'backwards',
      });
      running.set(el, animation);
    }
  }, [value, reduce, tokens, getContainer]);

  React.useEffect(() => {
    getContainer()?.toggleAttribute('data-reduced-motion', reduce);
  }, [reduce, getContainer]);

  return children;
}

function SlotsMotionFromContext({
  inputRef,
  children,
}: Omit<SlotsMotionProps, 'slots'>) {
  const { slots } = React.use(OTPInputContext);
  return (
    <SlotsMotion slots={slots} inputRef={inputRef}>
      {children}
    </SlotsMotion>
  );
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  function OTPInput({ render, children, ...props }, forwardedRef) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const ref = React.useMemo(
      () => mergeRefs(inputRef, forwardedRef),
      [forwardedRef],
    );

    return (
      <ReducedMotionConfig>
        <style href="animate-ui-input-otp" precedence="animate-ui">
          {REDUCED_MOTION_CSS}
        </style>
        {render ? (
          <BaseOTPInput
            ref={ref}
            {...props}
            render={(renderProps) => (
              <SlotsMotion slots={renderProps.slots} inputRef={inputRef}>
                {render(renderProps)}
              </SlotsMotion>
            )}
          />
        ) : (
          <BaseOTPInput ref={ref} {...props}>
            <SlotsMotionFromContext inputRef={inputRef}>
              {children}
            </SlotsMotionFromContext>
          </BaseOTPInput>
        )}
      </ReducedMotionConfig>
    );
  },
) as typeof BaseOTPInput;

export { OTPInput, OTPInputContext };
export {
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type OTPInputProps,
  type RenderProps,
  type SlotProps,
} from 'input-otp';
