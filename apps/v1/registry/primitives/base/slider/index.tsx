'use client';

import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  spring,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

/**
 * Pointer travel (px) after which a press on the track becomes a drag. A drag
 * cancels the jump animation so the thumb sits under the pointer.
 */
const DRAG_THRESHOLD = 3;

type SliderMotionItem = {
  /** Records the visual (transformed) and layout box before a press. */
  snapshot: () => void;
  /** FLIPs from the snapshot to the new layout box. */
  play: () => void;
  /** Stops any running animation and jumps to the layout box. */
  cancel: () => void;
};

type SliderValues = number | readonly number[];

type SliderContextType = {
  values: SliderValues;
  isPressing: boolean;
  register: (item: SliderMotionItem) => () => void;
  startPress: (event: React.PointerEvent<HTMLDivElement>) => void;
};

const [SliderProvider, useSlider] =
  getStrictContext<SliderContextType>('SliderContext');

type SliderProps<Value extends SliderValues = SliderValues> =
  SliderPrimitive.Root.Props<Value>;

function Slider<Value extends SliderValues = SliderValues>(
  props: SliderProps<Value>,
) {
  return (
    <ReducedMotionConfig>
      <SliderRoot {...(props as unknown as SliderProps)} />
    </ReducedMotionConfig>
  );
}

type PressState = { x: number; y: number; moved: boolean; pending: boolean };

function SliderRoot({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  disabled,
  ...props
}: SliderProps) {
  const reduce = useShouldReduceMotion();
  const [values, setValues] = useControlledState<
    SliderValues,
    [SliderPrimitive.Root.ChangeEventDetails]
  >({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
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

  const startPress = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
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

  const valuesKey = String(values);

  React.useLayoutEffect(() => {
    const press = pressRef.current;
    if (press?.pending) {
      // A press on the track (a jump): FLIP from where the parts were.
      press.pending = false;
      // Measure after the library's own layout-effect updates have flushed
      // (with `thumbAlignment="edge"` the thumbs are placed in a second pass).
      queueMicrotask(() => itemsRef.current.forEach((item) => item.play()));
    } else if (!press || press.moved) {
      // Keyboard, drag or programmatic change: instant.
      itemsRef.current.forEach((item) => item.cancel());
    }
  }, [valuesKey]);

  return (
    <SliderProvider value={{ values, isPressing, register, startPress }}>
      <SliderPrimitive.Root
        data-slot="slider"
        value={values}
        onValueChange={setValues}
        min={min}
        disabled={disabled}
        {...props}
      />
    </SliderProvider>
  );
}

type SliderLabelProps = React.ComponentProps<typeof SliderPrimitive.Label>;

function SliderLabel(props: SliderLabelProps) {
  return <SliderPrimitive.Label data-slot="slider-label" {...props} />;
}

type SliderValueProps = React.ComponentProps<typeof SliderPrimitive.Value>;

function SliderValue(props: SliderValueProps) {
  return <SliderPrimitive.Value data-slot="slider-value" {...props} />;
}

type SliderControlProps = React.ComponentProps<typeof SliderPrimitive.Control>;

function SliderControl({ onPointerDownCapture, ...props }: SliderControlProps) {
  const { startPress } = useSlider();

  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      onPointerDownCapture={(event) => {
        onPointerDownCapture?.(event);
        if (!event.defaultPrevented) startPress(event);
      }}
      {...props}
    />
  );
}

type SliderTrackProps = React.ComponentProps<typeof SliderPrimitive.Track>;

function SliderTrack(props: SliderTrackProps) {
  return <SliderPrimitive.Track data-slot="slider-track" {...props} />;
}

type FlipStart = { tx: number; ty: number; sx: number; sy: number };

const IDENTITY: FlipStart = { tx: 0, ty: 0, sx: 1, sy: 1 };

function measureLayout(el: HTMLElement) {
  const transform = el.style.transform;
  el.style.transform = 'none';
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

/**
 * FLIP for a part the library positions with layout (`left`/`right`/`width`
 * percentages): the layout jumps, and a transform offset springs back to
 * identity. Only jumps use it; drags and keyboard changes are instant.
 */
function useSliderPartMotion(kind: 'thumb' | 'range', transition: Transition) {
  const { register } = useSlider();
  const ref = React.useRef<HTMLElement | null>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);
  // Press feedback (thumbs only).
  const press = useMotionValue(1);
  const transform = useMotionTemplate`translateX(${tx}px) translateY(${ty}px) scaleX(${sx}) scaleY(${sy}) scale(${press})`;

  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });

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
      // (The template itself updates on the next frame.)
      if (ref.current) {
        ref.current.style.transform = `translateX(${start.tx}px) translateY(${start.ty}px) scaleX(${start.sx}) scaleY(${start.sy}) scale(${press.get()})`;
      }
    };

    return register({
      snapshot() {
        const el = ref.current;
        snapshot = el
          ? { visual: el.getBoundingClientRect(), layout: measureLayout(el) }
          : null;
      },
      play() {
        const el = ref.current;
        const from = snapshot;
        snapshot = null;
        if (!el || !from) return;
        const layout = measureLayout(el);
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

type SliderIndicatorProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Indicator>,
  'render'
> & {
  transition?: Transition;
};

function SliderIndicator({
  transition = spring.snappy,
  ...props
}: SliderIndicatorProps) {
  const { ref, transform } = useSliderPartMotion('range', transition);

  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      {...props}
      render={
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          style={{ transform, transformOrigin: '0 0' }}
        />
      }
    />
  );
}

type SliderThumbProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Thumb>,
  'render'
> & {
  transition?: Transition;
  /** Scale of the thumb while it is pressed or dragged. */
  pressedScale?: number;
};

function SliderThumb({
  transition = spring.snappy,
  pressedScale = 1.15,
  onFocus,
  onBlur,
  ...props
}: SliderThumbProps) {
  const { isPressing } = useSlider();
  const reduce = useShouldReduceMotion();
  const [isFocused, setIsFocused] = React.useState(false);
  const { ref, transform, press } = useSliderPartMotion('thumb', transition);

  // The library focuses the thumb it moves, so the pressed thumb is the
  // focused one while the pointer is down.
  const isPressed = isPressing && isFocused;
  usePressScale(press, isPressed && !reduce ? pressedScale : 1, {
    transition,
    reduce,
  });

  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      // Base UI forwards focus handlers to the thumb's nested input.
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      {...props}
      render={
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          data-pressed={isPressed || undefined}
          style={{ transform }}
        />
      }
    />
  );
}

function usePressScale(
  press: MotionValue<number>,
  target: number,
  { transition, reduce }: { transition: Transition; reduce: boolean },
) {
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

export {
  Slider,
  SliderLabel,
  SliderValue,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  useSlider,
  type SliderProps,
  type SliderLabelProps,
  type SliderValueProps,
  type SliderControlProps,
  type SliderTrackProps,
  type SliderIndicatorProps,
  type SliderThumbProps,
  type SliderContextType,
};
