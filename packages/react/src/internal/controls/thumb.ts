'use client';

import * as React from 'react';
import {
  animate,
  cancelFrame,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

// Switch thumbs, as Animate UI v1's `SwitchThumb`. While the switch is
// pressed, the thumb stretches toward the middle of the track (v1:
// `pressedAnimation={{ width }}`, a 16px thumb stretched to 19px). When the
// state changes, it springs to its new side (v1: a `layout` animation) while
// its width springs back. Both on one spring (stiffness 300, damping 25). The
// track's colour is the component's CSS: v1 changed it at once.
//
// shadcn/ui places the thumb with a `translate` class that changes with the
// state (`data-checked:translate-x-[calc(100%-2px)]`). The class still decides
// where the thumb rests; on a change, the thumb is put back where it was with
// a `transform` and springs to its new place (FLIP), as v1's layout animation
// did. The width is the thumb's real width (a scale would squash its round
// ends), like v1's.

/** Animation props of a switch thumb. */
type ThumbAnimationProps = {
  /**
   * Transition of the thumb: its stretch while pressed, and its glide to the
   * other side. Defaults to a spring (stiffness 300, damping 25).
   */
  transition?: Transition;
};

/** v1's `SwitchThumb` transition. */
const THUMB_TRANSITION: Transition = motionTokens.spring.thumb;

/** v1's styled switch stretched its 16px thumb to 19px (`pressedWidth`). */
const PRESSED_STRETCH = 19 / 16;

/** Pressed state of the switch, for its thumb (Radix UI and Base UI roots). */
const SwitchPressedContext = React.createContext(false);

/** Where the thumb rests in its track. */
type Rest = {
  /** Left edge in the track's pixels, without our offset, at `width`. */
  left: number;
  /** The thumb's width when measured. */
  width: number;
  /** How the left edge follows the width (see `growthAnchor`). */
  anchor: number;
};

type ThumbMotion = {
  /** Our horizontal offset (px), on top of the library's placement. */
  x: MotionValue<number>;
  /** Our width (px), while `stretched`. */
  width: MotionValue<number>;
  stretched: boolean;
  /** The thumb's own width, measured at rest. */
  natural: number;
  rest: Rest | null;
  committed: { checked: boolean; pressed: boolean } | null;
  controls: AnimationPlaybackControls[];
  /** Animations waiting for the next frame to start. */
  pending: (() => void) | null;
  run: number;
};

type Thumb = HTMLElement;

/**
 * Runs `read` with CSS transitions off: layout reads report end values, and a
 * transition the new state would start (shadcn's `transition-transform` on
 * the `translate` class) never starts.
 */
function withoutTransitions<T>(thumb: Thumb, read: () => T): T {
  const transition = thumb.style.transition;
  thumb.style.transition = 'none';
  const result = read();
  thumb.style.transition = transition;
  return result;
}

/** The track's scale on screen (a transformed ancestor), 1 at rest. */
function scaleOf(track: HTMLElement | null) {
  if (!track || track.offsetWidth === 0) return 1;
  return track.getBoundingClientRect().width / track.offsetWidth || 1;
}

/** The thumb's left edge in its track, in the track's pixels, as on screen. */
function visualLeft(thumb: Thumb) {
  const track = thumb.parentElement;
  const box = thumb.getBoundingClientRect();
  if (!track) return box.left;
  return (box.left - track.getBoundingClientRect().left) / scaleOf(track);
}

/**
 * How much a width change moves the thumb's left edge back: 0 when it grows
 * to the right, 1 when it grows to the left (a thumb pushed to the end, like
 * v1's `justify-end`), 0.5 when centered, -1 when its offset follows its
 * width (shadcn/ui's checked thumb, `translate-x-[calc(100%-2px)]`).
 */
function growthAnchor(thumb: Thumb, width: number) {
  const probe = 8;
  return withoutTransitions(thumb, () => {
    const inline = thumb.style.width;
    thumb.style.width = `${width}px`;
    const before = visualLeft(thumb);
    thumb.style.width = `${width + probe}px`;
    const after = visualLeft(thumb);
    thumb.style.width = inline;
    return Math.round(((before - after) / probe) * 100) / 100;
  });
}

/** The thumb's own width (its CSS width, without ours). */
function naturalWidth(thumb: Thumb) {
  return withoutTransitions(thumb, () => {
    const inline = thumb.style.width;
    thumb.style.width = '';
    const natural = thumb.offsetWidth;
    thumb.style.width = inline;
    return natural;
  });
}

function measureRest(
  thumb: Thumb,
  x: number,
  width: number,
  withAnchor: boolean,
): Rest {
  const left = withoutTransitions(thumb, () => visualLeft(thumb)) - x;
  return {
    left,
    width,
    anchor: withAnchor ? growthAnchor(thumb, width) : 0,
  };
}

function createThumbMotion(): ThumbMotion {
  return {
    x: motionValue(0),
    width: motionValue(0),
    stretched: false,
    natural: 0,
    rest: null,
    committed: null,
    controls: [],
    pending: null,
    run: 0,
  };
}

/** Stops what moves the thumb, and what was about to. */
function stop(m: ThumbMotion) {
  m.controls.forEach((control) => control.stop());
  m.controls = [];
  if (m.pending) cancelFrame(m.pending);
  m.pending = null;
}

/** Back to the library's own styles: no offset, no width of ours. */
function settle(thumb: Thumb, m: ThumbMotion) {
  stop(m);
  m.stretched = false;
  m.x.jump(0);
  thumb.style.transform = '';
  thumb.style.width = '';
}

/**
 * Animates the thumb `getThumb()` returns: stretched while `pressed`, gliding
 * to its new side when `checked` changes. Call inside `ReducedMotionConfig`.
 */
function useSwitchThumb(
  getThumb: () => Thumb | null | undefined,
  {
    checked,
    pressed,
    transition,
  }: ThumbAnimationProps & { checked: boolean; pressed: boolean },
) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? THUMB_TRANSITION);
  const getThumbRef = React.useRef(getThumb);
  const motionRef = React.useRef<ThumbMotion | null>(null);

  React.useLayoutEffect(() => {
    getThumbRef.current = getThumb;
  });

  // Our offset and width, written on the thumb as they move.
  React.useLayoutEffect(() => {
    const m = (motionRef.current ??= createThumbMotion());
    const stopX = m.x.on('change', (x) => {
      const thumb = getThumbRef.current();
      if (thumb) thumb.style.transform = `translateX(${x}px)`;
    });
    const stopWidth = m.width.on('change', (width) => {
      const thumb = getThumbRef.current();
      if (thumb && m.stretched) thumb.style.width = `${width}px`;
    });
    return () => {
      stopX();
      stopWidth();
      stop(m);
    };
  }, []);

  React.useLayoutEffect(() => {
    const m = (motionRef.current ??= createThumbMotion());
    const thumb = getThumbRef.current();
    const previous = m.committed;
    m.committed = { checked, pressed };
    if (!thumb) return;

    const flipped = previous !== null && previous.checked !== checked;
    const pressChanged = previous !== null && previous.pressed !== pressed;

    if (!flipped && !pressChanged) {
      // Mounted, or re-rendered for another reason: note where it rests.
      if (m.controls.length === 0 && !m.stretched)
        m.rest = measureRest(thumb, m.x.get(), thumb.offsetWidth, false);
      return;
    }

    if (reduce) {
      settle(thumb, m);
      m.rest = measureRest(thumb, 0, thumb.offsetWidth, false);
      return;
    }

    if (!m.stretched) m.natural = naturalWidth(thumb);
    const natural = m.natural;
    const width = m.stretched ? m.width.get() : natural;
    const x = m.x.get();

    if (flipped) {
      const before = m.rest;
      // The width changes after a press: its effect on the new resting
      // place is needed to turn back mid-way.
      const now = measureRest(thumb, x, width, width !== natural || pressed);
      if (before) {
        // Where it was on screen, with the width it has now.
        const was = before.left - before.anchor * (width - before.width) + x;
        // Kept there: it springs to its new place from where it was.
        m.x.jump(was - now.left);
      }
      m.rest = now;
    } else if (pressed) {
      m.rest = measureRest(thumb, x, width, true);
    }

    // Pressed: stretched toward the middle of the track, the opposite edge
    // staying where it rests.
    const stretchedWidth = natural * PRESSED_STRETCH;
    const targetWidth = pressed ? stretchedWidth : natural;
    let targetX = 0;
    const rest = m.rest;
    if (pressed && rest) {
      const track = thumb.parentElement;
      const restLeft = rest.left - rest.anchor * (natural - rest.width);
      const atEnd =
        track !== null && restLeft + natural / 2 > track.offsetWidth / 2;
      targetX = -((atEnd ? 1 : 0) - rest.anchor) * (stretchedWidth - natural);
    }

    stop(m);
    if (!m.stretched) {
      m.stretched = true;
      m.width.jump(width);
    }
    const id = ++m.run;
    // Started right away, as v1's `animate`/`layout` props were: the
    // spring's clock starts with this frame, so the first painted frame is
    // already a little way in, exactly like production.
    const start = () => {
      m.pending = null;
      if (m.run !== id) return;
      m.controls = [
        // v1's layout animation sprang a 0–1000 progress: it settles to a
        // hundredth of a pixel, not to Motion's default half pixel.
        animate(m.x, targetX, { restDelta: 0.005, restSpeed: 0.01, ...spring }),
        animate(m.width, targetWidth, spring),
      ];
      void Promise.all(m.controls).then(() => {
        if (m.run !== id) return;
        m.controls = [];
        if (m.committed?.pressed) return;
        settle(thumb, m);
        m.rest = measureRest(thumb, 0, thumb.offsetWidth, false);
      });
    };
    start();
  });
}

export {
  SwitchPressedContext,
  THUMB_TRANSITION,
  useSwitchThumb,
  type ThumbAnimationProps,
};
