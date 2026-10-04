'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import { getStrictContext } from '../utils/strict-context';
import { motionTokens, useShouldReduceMotion } from '../utils/motion';

// Shared by the Radix UI, Base UI and React Aria sliders. Animate UI v1 had no
// slider: they move like v1's switch thumb. While pressed (or dragged), the
// thumb stretches along the track, its width growing by 3/16 (a 16px thumb
// becomes 19px, v1's `pressedWidth`), and a press on the track glides the
// thumb and the range to the new value, both on v1's switch thumb spring
// (stiffness 300, damping 25).
//
// The libraries position the thumbs and the range with layout (percentage
// `left`/`width`), and dragging or the keyboard must follow instantly. Only a
// press on the track (a jump) glides: the parts jump in layout, and a
// transform offset springs back to identity (FLIP).

/**
 * Pointer travel (px) after which a press on the track becomes a drag. A drag
 * cancels the jump animation so the thumb sits under the pointer.
 */
const DRAG_THRESHOLD = 3;

/** v1's switch thumb transition (`SwitchThumb`), for the thumb and the range. */
const SLIDER_TRANSITION: Transition = motionTokens.spring.thumb;

/** v1's styled switch stretched its 16px thumb to 19px while pressed. */
const PRESSED_STRETCH = 19 / 16;

type SliderMotionItem = {
  /** Records the visual (transformed) and layout box before a press. */
  snapshot: () => void;
  /** FLIPs from the snapshot to the new layout box. */
  play: () => void;
  /** Stops any running animation and jumps to the layout box. */
  cancel: () => void;
};

type SliderMotionContext = {
  isPressing: boolean;
  register: (item: SliderMotionItem) => () => void;
  startPress: (event: React.PointerEvent) => void;
};

const [SliderMotionProvider, useSliderMotion] =
  getStrictContext<SliderMotionContext>('Slider.Root');

type PressState = { x: number; y: number; moved: boolean; pending: boolean };

/**
 * The root's side: tracks presses, and plays the parts' FLIP when the value
 * changes because of a press on the track. Call `startPress` from the
 * element that receives the press (capture phase), and pass a key that
 * changes with the values.
 */
function useSliderRootMotion({
  disabled,
  valuesKey,
}: {
  disabled?: boolean;
  valuesKey: string;
}) {
  const reduce = useShouldReduceMotion();
  const [isPressing, setIsPressing] = React.useState(false);
  const itemsRef = React.useRef(new Set<SliderMotionItem>());
  const pressRef = React.useRef<PressState | null>(null);
  const stopListeningRef = React.useRef<(() => void) | null>(null);

  const register = React.useCallback((item: SliderMotionItem) => {
    itemsRef.current.add(item);
    return () => {
      itemsRef.current.delete(item);
    };
  }, []);

  React.useEffect(() => () => stopListeningRef.current?.(), []);

  const startPress = (event: React.PointerEvent) => {
    if (disabled || event.button !== 0 || event.defaultPrevented) return;
    stopListeningRef.current?.();

    const press: PressState = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
      pending: !reduce,
    };
    pressRef.current = press;
    if (press.pending) itemsRef.current.forEach((item) => item.snapshot());
    setIsPressing(true);

    const onMove = (moveEvent: PointerEvent) => {
      if (press.moved) return;
      const distance = Math.hypot(
        moveEvent.clientX - press.x,
        moveEvent.clientY - press.y,
      );
      if (distance <= DRAG_THRESHOLD) return;
      // Direct manipulation: from now on the thumb follows the pointer.
      press.moved = true;
      press.pending = false;
      itemsRef.current.forEach((item) => item.cancel());
    };
    const onUp = () => {
      stopListening();
      if (pressRef.current === press) pressRef.current = null;
      setIsPressing(false);
    };
    const stopListening = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      stopListeningRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    stopListeningRef.current = stopListening;
  };

  React.useLayoutEffect(() => {
    const press = pressRef.current;
    if (press?.pending) {
      // A press on the track (a jump): FLIP from where the parts were.
      press.pending = false;
      // Measure after the library's own layout-effect updates have flushed
      // (Base UI's `thumbAlignment="edge"` places thumbs in a second pass).
      queueMicrotask(() => itemsRef.current.forEach((item) => item.play()));
    } else if (!press || press.moved) {
      // Keyboard, drag or programmatic change: instant.
      itemsRef.current.forEach((item) => item.cancel());
    }
  }, [valuesKey]);

  return { isPressing, register, startPress };
}

type FlipStart = { tx: number; ty: number; sx: number; sy: number };

const IDENTITY: FlipStart = { tx: 0, ty: 0, sx: 1, sy: 1 };

/** The box without our transform (keeping the library's own, if any). */
function measureLayout(el: HTMLElement, base: string) {
  const transform = el.style.transform;
  el.style.transform = base || 'none';
  const rect = el.getBoundingClientRect();
  el.style.transform = transform;
  return rect;
}

function sameBox(a: DOMRect, b: DOMRect) {
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

const toTransform = (base: string, [tx, ty, sx, sy]: number[]) =>
  `${base ? `${base} ` : ''}translateX(${tx}px) translateY(${ty}px) scaleX(${sx}) scaleY(${sy})`;

/**
 * FLIP for a part the library positions with layout. Returns the ref and the
 * `transform` motion value to put on the part's own element. `base` is a
 * transform the library already sets on it (React Aria's thumb centering).
 */
function useSliderPartMotion(
  kind: 'thumb' | 'range',
  transition: Transition,
  base = '',
) {
  const { register } = useSliderMotion();
  const ref = React.useRef<HTMLElement | null>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);

  const baseRef = React.useRef(base);
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    baseRef.current = base;
    transitionRef.current = transition;
  });

  const transform = useTransform([tx, ty, sx, sy], (values) =>
    toTransform(baseRef.current, values as number[]),
  );

  React.useEffect(() => {
    let snapshot: { visual: DOMRect; layout: DOMRect } | null = null;
    let controls: AnimationPlaybackControls[] = [];

    const stop = () => {
      controls.forEach((c) => c.stop());
      controls = [];
    };
    const set = (start: FlipStart) => {
      tx.jump(start.tx);
      ty.jump(start.ty);
      sx.jump(start.sx);
      sy.jump(start.sy);
      // Write it now so the first painted frame already starts from there.
      // (The motion value itself updates the style on the next frame.)
      if (ref.current) {
        ref.current.style.transform = toTransform(baseRef.current, [
          start.tx,
          start.ty,
          start.sx,
          start.sy,
        ]);
      }
    };

    return register({
      snapshot() {
        const el = ref.current;
        snapshot = el
          ? {
              visual: el.getBoundingClientRect(),
              layout: measureLayout(el, baseRef.current),
            }
          : null;
      },
      play() {
        const el = ref.current;
        const from = snapshot;
        snapshot = null;
        if (!el || !from) return;
        const layout = measureLayout(el, baseRef.current);
        // This part didn't move (the other thumb of a range slider).
        if (sameBox(layout, from.layout)) return;

        stop();
        const visual = from.visual;
        if (kind === 'thumb') {
          // Centers: unaffected by the press scale.
          set({
            tx:
              visual.left + visual.width / 2 - (layout.left + layout.width / 2),
            ty:
              visual.top + visual.height / 2 - (layout.top + layout.height / 2),
            sx: 1,
            sy: 1,
          });
        } else {
          // An empty range can't be scaled back from: show it as it is.
          if (layout.width < 1 || layout.height < 1) {
            set(IDENTITY);
            return;
          }
          set({
            tx: visual.left - layout.left,
            ty: visual.top - layout.top,
            sx: visual.width / layout.width,
            sy: visual.height / layout.height,
          });
        }
        const t = transitionRef.current;
        controls = [
          animate(tx, 0, t),
          animate(ty, 0, t),
          animate(sx, 1, t),
          animate(sy, 1, t),
        ];
      },
      cancel() {
        snapshot = null;
        const atRest =
          tx.get() === 0 && ty.get() === 0 && sx.get() === 1 && sy.get() === 1;
        if (controls.length === 0 && atRest) return;
        stop();
        set(IDENTITY);
      },
    });
  }, [kind, register, tx, ty, sx, sy]);

  return { ref, transform };
}

type Stretch = {
  size: MotionValue<number>;
  /** The thumb's own size along the track, measured at rest. */
  natural: number;
  axis: 'width' | 'height';
  stretched: boolean;
  controls: AnimationPlaybackControls | null;
};

/** The thumb's own size along the track (its CSS size, without ours). */
function naturalSize(el: HTMLElement, axis: 'width' | 'height') {
  const inline = el.style[axis];
  el.style[axis] = '';
  const size = axis === 'width' ? el.offsetWidth : el.offsetHeight;
  el.style[axis] = inline;
  return size;
}

/**
 * Stretches a thumb along the track while `pressed`, like v1's switch thumb:
 * its real width (its height when vertical), so its round ends stay round.
 * The libraries center the thumb on its value, so it grows on both sides.
 * None under reduced motion.
 */
function useThumbStretch(
  ref: React.RefObject<HTMLElement | null>,
  pressed: boolean,
  transition: Transition,
) {
  const reduce = useShouldReduceMotion();
  const stretchRef = React.useRef<Stretch | null>(null);
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let s = stretchRef.current;
    if (!s) {
      const stretch: Stretch = {
        size: motionValue(0),
        natural: 0,
        axis: 'width',
        stretched: false,
        controls: null,
      };
      stretch.size.on('change', (size) => {
        if (stretch.stretched) el.style[stretch.axis] = `${size}px`;
      });
      s = stretchRef.current = stretch;
    }
    const stretch = s;
    const press = pressed && !reduce;
    if (!press && !stretch.stretched) return;
    stretch.controls?.stop();
    if (press && !stretch.stretched) {
      const vertical =
        el.closest('[data-orientation]')?.getAttribute('data-orientation') ===
        'vertical';
      stretch.axis = vertical ? 'height' : 'width';
      stretch.natural = naturalSize(el, stretch.axis);
      stretch.stretched = true;
      stretch.size.jump(stretch.natural);
    }
    if (reduce) {
      stretch.stretched = false;
      el.style[stretch.axis] = '';
      return;
    }
    const target = press ? stretch.natural * PRESSED_STRETCH : stretch.natural;
    const controls = animate(stretch.size, target, transitionRef.current);
    stretch.controls = controls;
    void controls.then(() => {
      if (stretch.controls !== controls || press) return;
      // At rest: the thumb as the library rendered it.
      stretch.controls = null;
      stretch.stretched = false;
      el.style[stretch.axis] = '';
    });
  }, [ref, pressed, reduce]);

  React.useEffect(
    () => () => {
      stretchRef.current?.controls?.stop();
    },
    [],
  );
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

export {
  SLIDER_TRANSITION,
  SliderMotionProvider,
  useSliderMotion,
  useSliderRootMotion,
  useSliderPartMotion,
  useThumbStretch,
  assignRef,
};
