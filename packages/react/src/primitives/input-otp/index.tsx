'use client';

import * as React from 'react';
import {
  OTPInput as BaseOTPInput,
  OTPInputContext,
  type OTPInputProps,
  type RenderProps,
} from 'input-otp';
import {
  animate,
  createGeneratorEasing,
  generateLinearEasing,
  spring,
  supportsLinearEasing,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  toCssTiming,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
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
// Animations API: the glyph grows in from nothing as it fades in, on a spring
// that never goes past its size (`spring.glyph`). It's a copy that grows, by
// a transform, laid exactly over the slot's own text (the slot's box, borders,
// padding, layout and font), while the slot's text is hidden (`color`
// transparent); the copy goes in the frame the slot's text shows again, at
// the same place. A growing `font-size` was laid out again on every frame:
// the line box grew with it and the glyph snapped up and down a pixel as it
// grew, then once more as it ended (measured on the GPU). A paste staggers
// its characters like v1's text splitting (50ms).
//
// - The active slot's ring glides from slot to slot, like Animate UI's
//   highlights: an overlay in the container wears the ring the slot's own
//   styles paint (the end of its box-shadow transition, or its box-shadow),
//   while the slot's box-shadow is held at its resting value (inline), and
//   springs to the next active slot on `spring.highlight`. It's read again
//   on every render (an invalid code turns it red), fades in where the focus
//   lands, and out where it is when the field loses it.
// - A character deleted from the end (Backspace) shrinks to half its size
//   and fades out where it was (`transition.popOut`), as a copy too (from
//   where it was if it was still growing in): the slot is already empty.
// - A code completed (the last slot filled) runs a wave through the slots:
//   each one rises a few pixels and springs back, one after the other; the
//   ring and the copies on a slot ride its wave.
//
// Under reduced motion characters only fade (the slot's `color`, no copy),
// the ring moves to the next slot at once (it still fades in and out),
// nothing shrinks or waves, and the fake caret (any CSS animation inside a
// slot) stops blinking.

/** A character growing in, without going past its size. */
const SPRING: Transition = motionTokens.spring.glyph;
/** The ring gliding to the next slot: the highlights' spring. */
const RING_TRANSITION: Transition = motionTokens.spring.highlight;
/** The ring showing up or going: a highlight's fade. */
const RING_FADE: Transition = motionTokens.transition.color;
/** A deleted character shrinking out, quicker than it came. */
const GHOST_TRANSITION: Transition = motionTokens.transition.popOut;
/** Where a deleted character shrinks to. */
const GHOST_SCALE = 0.5;

/** Delay between characters that arrive together (paste, autofill), in seconds. */
const STAGGER = 0.05;

/** The completion wave: how far each slot rises (px), and its rise (s). */
const WAVE_RISE = 4;
const WAVE_UP = 0.1;
/** Each slot springs back down, lively: the popped checks' spring. */
const WAVE_DOWN: Transition = motionTokens.spring.checkPop;
/** Delay between the slots of the wave, in seconds. */
const WAVE_STAGGER = 0.04;
/** The wave starts once the last character has mostly grown in (s). */
const WAVE_AFTER = 0.12;
/** Its Web Animations, by id (tests and devtools tell them apart). */
const WAVE_ID = 'animate-ui-otp-wave';

const SLOT_SELECTOR = '[data-slot="input-otp-slot"]';

/**
 * Finds the characters that were inserted between two values: `[start, end)`
 * of `next`. Characters that only shifted (deleting in the middle moves the
 * following ones) are not considered new, so deleting never grows one in.
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

/** A slot's own animation: its text hidden (or fading in). */
const running = new WeakMap<Element, Animation>();

/** The overlays, laid over the container: never in the way of the input. */
const OVERLAY_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  pointerEvents: 'none',
  // Above the active slot (shadcn/ui lifts it with z-10).
  zIndex: 10,
};
const RING_STYLE: React.CSSProperties = {
  ...OVERLAY_STYLE,
  boxSizing: 'border-box',
  opacity: 0,
};

/** A spring as a Web Animations timing: its duration (ms) and easing. */
function springTiming(transition: Transition) {
  const { ease, duration } = createGeneratorEasing(transition, 100, spring);
  return {
    duration: duration * 1000,
    easing: supportsLinearEasing()
      ? generateLinearEasing(ease, duration * 1000)
      : 'ease-out',
  };
}

/** A `translate` computed value, as px: `'none'`, `'4px'`, `'0px -4px'`. */
function translateOf(el: Element) {
  const [x = 0, y = 0] = getComputedStyle(el)
    .translate.split(' ')
    .map((part) => parseFloat(part) || 0);
  return { x, y };
}

type Box = { left: number; top: number; width: number; height: number };

/**
 * `el`'s box in `container`'s padding box, to the subpixel: in the
 * container's own units (a dialog scaling it in doesn't count), without the
 * wave's translate (what rides on `el` rides its wave on its own).
 */
function boxIn(container: HTMLElement, el: HTMLElement): Box {
  const outer = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  // offsetWidth is rounded to whole pixels: only a difference beyond that is
  // a transform.
  const scaleOf = (shown: number, laid: number) =>
    laid && Math.abs(shown - laid) >= 1 ? shown / laid : 1;
  const scaleX = scaleOf(outer.width, container.offsetWidth);
  const scaleY = scaleOf(outer.height, container.offsetHeight);
  const moved = translateOf(el);
  return {
    left: (rect.left - outer.left) / scaleX - container.clientLeft - moved.x,
    top: (rect.top - outer.top) / scaleY - container.clientTop - moved.y,
    width: rect.width / scaleX,
    height: rect.height / scaleY,
  };
}

const sameBox = (a: Box | null, b: Box) =>
  a !== null &&
  Math.abs(a.left - b.left) < 0.01 &&
  Math.abs(a.top - b.top) < 0.01 &&
  Math.abs(a.width - b.width) < 0.01 &&
  Math.abs(a.height - b.height) < 0.01;

/** The text properties a copy takes from its slot. */
const TEXT_PROPERTIES = [
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontStretch',
  'fontKerning',
  'fontFeatureSettings',
  'fontVariationSettings',
  'fontVariantNumeric',
  'fontVariantLigatures',
  'fontVariantCaps',
  'fontOpticalSizing',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'textShadow',
  'color',
  'webkitTextFillColor',
  'webkitTextStrokeWidth',
  'webkitTextStrokeColor',
] as const;

/**
 * A copy of `text` laid exactly as `slot` lays its own: its box, borders
 * (transparent), padding, layout and font, at its place in `container`.
 */
function glyphCopy(container: HTMLElement, slot: HTMLElement, text: string) {
  const style = getComputedStyle(slot);
  const box = boxIn(container, slot);
  const copy = document.createElement('span');
  copy.textContent = text;
  Object.assign(copy.style, {
    position: 'absolute',
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderTopWidth: style.borderTopWidth,
    borderRightWidth: style.borderRightWidth,
    borderBottomWidth: style.borderBottomWidth,
    borderLeftWidth: style.borderLeftWidth,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    display: style.display,
    flexDirection: style.flexDirection,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    textAlign: style.textAlign,
    whiteSpace: 'pre',
  });
  for (const property of TEXT_PROPERTIES)
    (copy.style as unknown as Record<string, string>)[property] = (
      style as unknown as Record<string, string>
    )[property]!;
  return copy;
}

/**
 * Starts on `el` the waves running on `slot`, in step: a copy, or the ring,
 * placed over a slot that rises.
 */
function rideWave(slot: Element, el: Element) {
  for (const wave of slot.getAnimations()) {
    if (wave.id !== WAVE_ID) continue;
    const effect = wave.effect as KeyframeEffect;
    const ride = el.animate(effect.getKeyframes(), {
      ...(effect.getTiming() as KeyframeAnimationOptions),
      id: WAVE_ID,
      composite: 'add',
    });
    if (wave.startTime !== null) ride.startTime = wave.startTime;
    else ride.currentTime = wave.currentTime;
  }
}

function cancelWaves(el: Element) {
  for (const animation of el.getAnimations())
    if (animation.id === WAVE_ID) animation.cancel();
}

const RADII = [
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
] as const;

type Ring = { boxShadow: string; radii: string[] };

/**
 * The ring `slot`'s own styles paint now that it's active, while the slot
 * keeps painting its resting box-shadow (held inline): the overlay wears the
 * ring. With a transition on it, the ring is where that transition goes, the
 * rest where it comes from (the transition is cancelled, its other
 * transitions, its border color's, go on).
 */
function takeRing(slot: HTMLElement): Ring {
  slot.style.removeProperty('box-shadow');
  const style = getComputedStyle(slot);
  const painted = style.boxShadow;
  const transition = shadowTransition(slot);
  const frames = transition
    ? (transition.effect as KeyframeEffect).getKeyframes()
    : null;
  const ring = frames ? String(frames.at(-1)!.boxShadow) : painted;
  const rest = frames ? String(frames[0]!.boxShadow) : 'none';
  transition?.cancel();
  if (ring !== 'none') {
    slot.style.boxShadow = rest;
    // Back from the ring to its rest: not a transition either.
    void getComputedStyle(slot).boxShadow;
    shadowTransition(slot)?.cancel();
  }
  return { boxShadow: ring, radii: RADII.map((corner) => style[corner]) };
}

/** `slot`'s running box-shadow transition (a `transition-all`), if any. */
function shadowTransition(slot: HTMLElement) {
  return slot
    .getAnimations()
    .find(
      (animation): animation is CSSTransition =>
        animation instanceof CSSTransition &&
        animation.transitionProperty === 'box-shadow',
    );
}

type RingState = {
  /** The slot it's on (the active one), whose ring it wears. */
  slot: HTMLElement | null;
  shown: boolean;
  box: Box | null;
  radii: string[];
  glide: AnimationPlaybackControls | null;
  fade: Animation | null;
};

type SlotsMotionProps = {
  slots: RenderProps['slots'];
  inputRef: React.RefObject<HTMLInputElement | null>;
  children?: React.ReactNode;
};

/** Animates the slots of the characters that were just entered. */
function SlotsMotion({ slots, inputRef, children }: SlotsMotionProps) {
  const { tempo } = useMotionTokens();
  const transition = useTempoTransition(SPRING);
  const ringTransition = useTempoTransition(RING_TRANSITION);
  const ringFade = useTempoTransition(RING_FADE);
  const ghostTransition = useTempoTransition(GHOST_TRANSITION);
  const waveDown = useTempoTransition(WAVE_DOWN);
  const reduce = useShouldReduceMotion();
  // The value is contiguous from the first slot.
  const value = slots.map((slot) => slot.char ?? '').join('');
  const prevValueRef = React.useRef(value);
  const ringRef = React.useRef<HTMLSpanElement>(null);
  const glyphsRef = React.useRef<HTMLSpanElement>(null);
  const ringStateRef = React.useRef<RingState>({
    slot: null,
    shown: false,
    box: null,
    radii: [],
    glide: null,
    fade: null,
  });
  // Deleted characters still shrinking out, by slot.
  const leavingRef = React.useRef(new Map<HTMLElement, HTMLElement>());
  // Characters growing in: their copies, by slot.
  const enteringRef = React.useRef(new Map<HTMLElement, HTMLElement>());

  const getContainer = React.useCallback(
    () =>
      inputRef.current?.closest<HTMLElement>('[data-input-otp-container]') ??
      null,
    [inputRef],
  );

  /**
   * Places the ring on `box` (gliding there when it's shown and moving is
   * allowed), always through Motion, which keeps the values it glides from.
   */
  const placeRing = React.useCallback(
    (box: Box, radii: string[], glide: boolean) => {
      const ring = ringRef.current;
      const state = ringStateRef.current;
      if (!ring) return;
      state.glide?.stop();
      state.box = box;
      state.radii = radii;
      state.glide = animate(
        ring,
        {
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          ...Object.fromEntries(RADII.map((corner, i) => [corner, radii[i]])),
        },
        glide ? ringTransition : { duration: 0 },
      );
    },
    [ringTransition],
  );

  // The ring follows the active slot, after every render (input-otp renders
  // its slots again when the value, the selection, the focus or the hover
  // changes): the slot it's on, how that slot paints its ring, and its box.
  React.useLayoutEffect(() => {
    const container = getContainer();
    const ring = ringRef.current;
    if (!container || !ring) return;
    const state = ringStateRef.current;
    const active = container.querySelector<HTMLElement>(
      `${SLOT_SELECTOR}[data-active="true"]`,
    );
    const moved = active !== state.slot;
    if (moved) {
      // The slot it leaves paints its own box-shadow again.
      state.slot?.style.removeProperty('box-shadow');
      state.slot = active;
    }

    const fadeTo = (opacity: number) => {
      state.fade?.cancel();
      const from = getComputedStyle(ring).opacity;
      ring.style.opacity = String(opacity);
      const { duration, easing } = toCssTiming(ringFade);
      state.fade = ring.animate([{ opacity: from }, { opacity }], {
        duration,
        easing,
      });
    };

    const worn = active ? takeRing(active) : null;
    // No active slot, or one whose styles paint no ring: nothing to wear.
    if (!active || !worn || worn.boxShadow === 'none') {
      if (state.shown) fadeTo(0);
      state.shown = false;
      return;
    }
    ring.style.boxShadow = worn.boxShadow;
    const box = boxIn(container, active);
    if (
      !moved &&
      state.shown &&
      sameBox(state.box, box) &&
      worn.radii.join() === state.radii.join()
    )
      return;
    placeRing(box, worn.radii, state.shown && !reduce);
    if (moved) {
      // It rides the wave of the slot it's on, if one runs.
      cancelWaves(ring);
      rideWave(active, ring);
    }
    if (!state.shown) fadeTo(1);
    state.shown = true;
  });

  // The container laid out again without a render (a responsive width):
  // the ring goes to its slot's new place at once.
  React.useEffect(() => {
    const container = getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const state = ringStateRef.current;
      if (!state.shown || !state.slot) return;
      const box = boxIn(container, state.slot);
      if (!sameBox(state.box, box)) placeRing(box, state.radii, false);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [getContainer, placeRing]);

  React.useLayoutEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    if (prev === value) return;

    const container = getContainer();
    const layer = glyphsRef.current;
    if (!container || typeof Element.prototype.animate !== 'function') return;
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(SLOT_SELECTOR),
    );
    const leaving = leavingRef.current;
    const entering = enteringRef.current;

    // Deleted from the end: each character shrinks out where it was, from
    // where it was (still growing in, it leaves from there).
    if (
      !reduce &&
      layer &&
      prev.length > value.length &&
      prev.startsWith(value)
    ) {
      const { duration, easing } = toCssTiming(ghostTransition);
      for (let index = value.length; index < prev.length; index++) {
        const slot = elements[index];
        if (!slot) continue;
        let from = { opacity: 1, scale: 1 };
        const growing = entering.get(slot);
        if (growing) {
          const style = getComputedStyle(growing);
          from = {
            opacity: Number(style.opacity),
            scale: style.scale === 'none' ? 1 : parseFloat(style.scale),
          };
          growing.remove();
          entering.delete(slot);
        }
        running.get(slot)?.cancel();
        leaving.get(slot)?.remove();
        // Still waiting its turn in a paste: nothing showed.
        if (from.opacity < 0.01) continue;
        const ghost = glyphCopy(container, slot, prev[index]!);
        ghost.dataset.glyph = 'leave';
        layer.append(ghost);
        leaving.set(slot, ghost);
        rideWave(slot, ghost);
        const shrink = ghost.animate(
          [
            { opacity: from.opacity, scale: from.scale },
            { opacity: 0, scale: Math.min(GHOST_SCALE, from.scale) },
          ],
          { duration, easing, fill: 'forwards' },
        );
        const done = () => {
          ghost.remove();
          if (leaving.get(slot) === ghost) leaving.delete(slot);
        };
        shrink.finished.then(done, done);
      }
    }

    // Copies over slots whose character is no longer theirs (a deletion in
    // the middle shifted them): gone, the slot shows its own text.
    for (const [slot, copy] of entering) {
      const index = elements.indexOf(slot);
      if (index !== -1 && copy.textContent === value[index]) continue;
      copy.remove();
      entering.delete(slot);
      running.get(slot)?.cancel();
    }

    const { start, end } = getEntry(prev, value);
    if (end <= start) return;
    // The character growing in grows from nothing: no copy leaving over it.
    for (let index = start; index < end; index++) {
      const slot = elements[index];
      if (!slot) continue;
      leaving.get(slot)?.remove();
      leaving.delete(slot);
    }

    // The spring as a progress curve and its duration.
    const { duration, easing } = springTiming(transition);
    const stagger = !reduce && end - start > 1 ? STAGGER * tempo : 0;

    for (let index = start; index < end; index++) {
      const el = elements[index];
      if (!el) continue;
      running.get(el)?.cancel();
      entering.get(el)?.remove();
      entering.delete(el);
      const delay = (index - start) * stagger * 1000;
      if (reduce || !layer) {
        // It only fades: one keyframe at offset 0, ending on its own style.
        const animation = el.animate([{ offset: 0, color: 'transparent' }], {
          duration,
          delay,
          easing,
          // Waiting characters of a paste stay hidden until their turn.
          fill: 'backwards',
        });
        running.set(el, animation);
        continue;
      }
      // Its copy grows in over it while its own text is hidden; the copy goes
      // as the text shows again, in the same frame.
      const copy = glyphCopy(container, el, value[index]!);
      copy.dataset.glyph = 'enter';
      layer.append(copy);
      rideWave(el, copy);
      copy.animate(
        [
          { opacity: 0, scale: 0 },
          { opacity: getComputedStyle(el).opacity, scale: 1 },
        ],
        { duration, delay, easing, fill: 'both' },
      );
      const hidden = el.animate(
        [
          {
            color: 'transparent',
            webkitTextFillColor: 'transparent',
            textShadow: 'none',
          },
          {
            color: 'transparent',
            webkitTextFillColor: 'transparent',
            textShadow: 'none',
          },
        ],
        { duration, delay, fill: 'backwards' },
      );
      running.set(el, hidden);
      entering.set(el, copy);
      const done = () => {
        copy.remove();
        if (entering.get(el) === copy) entering.delete(el);
      };
      hidden.finished.then(done, done);
    }

    // The last slot filled: a wave runs through them, once the characters
    // that just came in have mostly grown in. One wave at a time.
    if (reduce || value.length < elements.length || prev.length >= value.length)
      return;
    const up = WAVE_UP * tempo * 1000;
    const down = springTiming(waveDown);
    const waveStart = ((end - start - 1) * stagger + WAVE_AFTER * tempo) * 1000;
    const keyframes: Keyframe[] = [
      { translate: '0px 0px', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      {
        translate: `0px ${-WAVE_RISE}px`,
        offset: up / (up + down.duration),
        easing: down.easing,
      },
      { translate: '0px 0px' },
    ];
    const ring = ringRef.current;
    const ringSlot = ringStateRef.current.slot;
    if (ring) cancelWaves(ring);
    elements.forEach((slot, index) => {
      cancelWaves(slot);
      const timing: KeyframeAnimationOptions = {
        id: WAVE_ID,
        duration: up + down.duration,
        delay: waveStart + index * WAVE_STAGGER * tempo * 1000,
        // Added to the slot's own translate, if it has one.
        composite: 'add',
      };
      slot.animate(keyframes, timing);
      // The ring on it, and its copies, ride along.
      for (const rider of [
        slot === ringSlot ? ring : null,
        entering.get(slot),
        leaving.get(slot),
      ]) {
        if (!rider) continue;
        cancelWaves(rider);
        rider.animate(keyframes, timing);
      }
    });
  }, [
    value,
    reduce,
    transition,
    ghostTransition,
    waveDown,
    tempo,
    getContainer,
  ]);

  React.useEffect(() => {
    getContainer()?.toggleAttribute('data-reduced-motion', reduce);
  }, [reduce, getContainer]);

  // Unmounting: the slot it was on paints its own box-shadow again, and the
  // slots hidden under a copy show their text.
  React.useEffect(() => {
    const state = ringStateRef.current;
    const leaving = leavingRef.current;
    const entering = enteringRef.current;
    return () => {
      state.slot?.style.removeProperty('box-shadow');
      state.slot = null;
      state.shown = false;
      state.box = null;
      leaving.forEach((ghost) => ghost.remove());
      leaving.clear();
      entering.forEach((copy, slot) => {
        copy.remove();
        running.get(slot)?.cancel();
      });
      entering.clear();
    };
  }, []);

  return (
    <>
      {children}
      <span
        ref={glyphsRef}
        aria-hidden
        data-slot="input-otp-ghosts"
        style={OVERLAY_STYLE}
      />
      <span
        ref={ringRef}
        aria-hidden
        data-slot="input-otp-ring"
        style={RING_STYLE}
      />
    </>
  );
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
