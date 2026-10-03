'use client';

import * as React from 'react';
import {
  animate,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import { getStrictContext } from '../utils/strict-context';
import { useShouldReduceMotion } from '../utils/motion';

// Shared by the Radix UI, Base UI and React Aria sliders.
//
// The libraries position the thumbs and the range with layout (percentage
// `left`/`width`), and dragging or the keyboard must follow instantly. Only a
// press on the track (a jump) animates: the parts jump in layout, and a
// transform offset springs back to identity (FLIP). The pressed thumb grows.

/**
 * Pointer travel (px) after which a press on the track becomes a drag. A drag
 * cancels the jump animation so the thumb sits under the pointer.
 */
const DRAG_THRESHOLD = 3;

/** Scale of a pressed (or dragged) thumb. */
const PRESSED_SCALE = 1.15;

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

const toTransform = (base: string, [tx, ty, sx, sy, press]: number[]) =>
  `${base ? `${base} ` : ''}translateX(${tx}px) translateY(${ty}px) scaleX(${sx}) scaleY(${sy}) scale(${press})`;

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
  // Press feedback (thumbs only).
  const press = useMotionValue(1);

  const baseRef = React.useRef(base);
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    baseRef.current = base;
    transitionRef.current = transition;
  });

  const transform = useTransform([tx, ty, sx, sy, press], (values) =>
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
          press.get(),
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
  }, [kind, register, tx, ty, sx, sy, press]);

  return { ref, transform, press };
}

/** Animates the press scale of a thumb (none under reduced motion). */
function usePressScale(
  press: MotionValue<number>,
  pressed: boolean,
  {
    transition,
    pressedScale,
  }: { transition: Transition; pressedScale: number },
) {
  const reduce = useShouldReduceMotion();
  const target = pressed && !reduce ? pressedScale : 1;
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });

  React.useEffect(() => {
    if (reduce) {
      press.jump(target);
      return;
    }
    const controls = animate(press, target, transitionRef.current);
    return () => controls.stop();
  }, [press, target, reduce]);
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

export {
  PRESSED_SCALE,
  SliderMotionProvider,
  useSliderMotion,
  useSliderRootMotion,
  useSliderPartMotion,
  usePressScale,
  assignRef,
};
