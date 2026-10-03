'use client';

import * as React from 'react';
import {
  animate,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../utils/motion';

// Switch thumbs. shadcn/ui moves the thumb with a `translate` class that
// changes with the state (`data-checked:translate-x-[calc(100%-2px)]`). The
// class still decides where the thumb rests; on a change, the thumb is put
// back where it was with a `transform` and springs to its new place (FLIP).
// Only `transform` animates: never `left`, `margin` or `width`.

/** Animation props of a switch thumb. */
type ThumbAnimationProps = {
  /** Transition of the thumb gliding to its new side. Defaults to `spring.snappy`. */
  transition?: Transition;
};

/** The thumb's horizontal offset from its track, in the track's own pixels. */
function measure(thumb: HTMLElement | SVGElement) {
  const track = thumb.parentElement;
  // A CSS transition on `translate` (shadcn's `transition-transform`) would
  // report where the thumb starts, not where it ends: skip it, the spring
  // replaces it.
  const transition = thumb.style.transition;
  thumb.style.transition = 'none';
  const box = thumb.getBoundingClientRect();
  thumb.style.transition = transition;
  if (!track) return box.left;
  const trackBox = track.getBoundingClientRect();
  // The track may be scaled by its press feedback.
  const scale = track.offsetWidth > 0 ? trackBox.width / track.offsetWidth : 1;
  return (box.left - trackBox.left) / (scale || 1);
}

/**
 * Writes the thumb's transform without letting a CSS transition on
 * `transform` (shadcn's `transition-transform`) animate the jump.
 */
function setTransform(thumb: HTMLElement | SVGElement, transform: string) {
  const transition = thumb.style.transition;
  thumb.style.transition = 'none';
  thumb.style.transform = transform;
  // Applied now, while transitions are off.
  void getComputedStyle(thumb).transform;
  thumb.style.transition = transition;
}

/** The offset our own transform currently adds (0 when at rest). */
function currentOffset(thumb: HTMLElement | SVGElement) {
  const transform = getComputedStyle(thumb).transform;
  if (!transform || transform === 'none') return 0;
  return new DOMMatrixReadOnly(transform).m41;
}

/**
 * Glides `getThumb()` to its new resting place each time `checked` changes.
 * Call inside `ReducedMotionConfig`.
 */
function useThumbGlide(
  getThumb: () => HTMLElement | SVGElement | null | undefined,
  checked: boolean,
  { transition }: ThumbAnimationProps = {},
) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const glide = transition ?? tokens.spring.snappy;
  const lastRef = React.useRef<{ checked: boolean; x: number } | null>(null);
  const runningRef = React.useRef<AnimationPlaybackControls | null>(null);

  React.useLayoutEffect(() => {
    const thumb = getThumb();
    if (!thumb) return;
    const previous = lastRef.current;
    if (previous && previous.checked === checked) return;

    // Stop where it is: `stop()` commits the current offset to the style.
    runningRef.current?.stop();
    runningRef.current = null;
    // Measured first: it also cancels a CSS transition the new `translate`
    // class would start.
    const box = measure(thumb);
    // Where the thumb rests now, without our transform.
    const offset = currentOffset(thumb);
    const x = box - offset;
    lastRef.current = { checked, x };
    if (!previous) return;

    // Where it was on screen, relative to where it rests now.
    const from = previous.x + offset - x;
    if (reduce || Math.abs(from) < 0.5) {
      setTransform(thumb, '');
      return;
    }
    setTransform(thumb, `translateX(${from}px)`);
    const animation = animate(
      thumb,
      { transform: [`translateX(${from}px)`, 'translateX(0px)'] },
      glide,
    );
    runningRef.current = animation;
    animation.then(() => {
      if (runningRef.current !== animation) return;
      runningRef.current = null;
      // At rest: leave the element's style as the library rendered it.
      setTransform(thumb, '');
    });
  });
}

export { useThumbGlide, type ThumbAnimationProps };
