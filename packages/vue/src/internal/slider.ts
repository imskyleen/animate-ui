import {
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion-v';

import { motionTokens, useShouldReduceMotion } from '../utils/motion';

const DRAG_THRESHOLD = 3;

const SLIDER_TRANSITION: Transition = motionTokens.spring.slider;

const PRESSED_STRETCH = 19 / 16;

const THUMB_TRANSFORM = '--reka-slider-thumb-transform';

type SliderMotionItem = {
  snapshot: () => void;
  play: () => void;
  cancel: () => void;
  unmoved: (on: boolean) => void;
};

type SliderMotionContext = {
  isPressing: Ref<boolean>;
  register: (item: SliderMotionItem) => () => void;
  startPress: (event: PointerEvent) => void;
};

const SliderMotionKey: InjectionKey<SliderMotionContext> =
  Symbol('SliderMotion');

function useSliderMotion() {
  const context = inject(SliderMotionKey, null);
  if (!context) throw new Error('SliderThumb must be used within SliderRoot');
  return context;
}

type PressState = { x: number; y: number; moved: boolean; pending: boolean };

function useSliderRootMotion(
  options: () => { disabled?: boolean; valuesKey: string },
) {
  const reduce = useShouldReduceMotion();
  const isPressing = ref(false);
  const items = new Set<SliderMotionItem>();
  let press: PressState | null = null;
  let stopListening: (() => void) | null = null;

  const register = (item: SliderMotionItem) => {
    items.add(item);
    return () => {
      items.delete(item);
    };
  };

  onBeforeUnmount(() => stopListening?.());

  const startPress = (event: PointerEvent) => {
    if (options().disabled || event.button !== 0 || event.defaultPrevented)
      return;
    stopListening?.();

    const current: PressState = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
      pending: !reduce.value,
    };
    press = current;
    if (current.pending) items.forEach((item) => item.snapshot());
    isPressing.value = true;

    // reka-ui measures the thumb where it shows to keep the pointer's offset on it.
    const root = event.currentTarget as HTMLElement;
    const beforeMove = () => items.forEach((item) => item.unmoved(true));
    const onMove = (moveEvent: PointerEvent) => {
      items.forEach((item) => item.unmoved(false));
      if (current.moved) return;
      const distance = Math.hypot(
        moveEvent.clientX - current.x,
        moveEvent.clientY - current.y,
      );
      if (distance <= DRAG_THRESHOLD) return;
      current.moved = true;
      current.pending = false;
      items.forEach((item) => item.cancel());
    };
    const onUp = () => {
      stop();
      if (press === current) press = null;
      isPressing.value = false;
    };
    const stop = () => {
      root.removeEventListener('pointermove', beforeMove, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      stopListening = null;
    };

    root.addEventListener('pointermove', beforeMove, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    stopListening = stop;
  };

  watch(
    () => options().valuesKey,
    () => {
      if (press?.pending) {
        press.pending = false;
        queueMicrotask(() => items.forEach((item) => item.play()));
      } else if (!press || press.moved) {
        items.forEach((item) => item.cancel());
      }
    },
    { flush: 'post' },
  );

  const context: SliderMotionContext = { isPressing, register, startPress };
  provide(SliderMotionKey, context);
  return context;
}

type FlipStart = { tx: number; ty: number; sx: number; sy: number };

const IDENTITY: FlipStart = { tx: 0, ty: 0, sx: 1, sy: 1 };

const toTransform = (base: string, [tx, ty, sx, sy]: number[]) =>
  `${base ? `${base} ` : ''}translateX(${tx}px) translateY(${ty}px) scaleX(${sx}) scaleY(${sy})`;

/** reka-ui positions a thumb through its own transform, kept in a CSS variable. */
function partStyle(el: HTMLElement, kind: 'thumb' | 'range') {
  if (kind === 'range')
    return {
      base: () => '',
      write: (value: string) => (el.style.transform = value),
      clear: () => (el.style.transform = ''),
    };
  const base = () =>
    el.parentElement
      ? getComputedStyle(el.parentElement).getPropertyValue(THUMB_TRANSFORM).trim()
      : '';
  return {
    base,
    write: (value: string) => el.style.setProperty(THUMB_TRANSFORM, value),
    clear: () => el.style.removeProperty(THUMB_TRANSFORM),
  };
}

function measureLayout(el: HTMLElement, kind: 'thumb' | 'range') {
  const style = partStyle(el, kind);
  const inline = el.getAttribute('style');
  style.clear();
  const rect = el.getBoundingClientRect();
  if (inline === null) el.removeAttribute('style');
  else el.setAttribute('style', inline);
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

function useSliderPartMotion(
  kind: 'thumb' | 'range',
  transition: () => Transition,
) {
  const { register } = useSliderMotion();
  const element = ref<HTMLElement | null>(null);
  const values = [motionValue(0), motionValue(0), motionValue(1), motionValue(1)];
  const [tx, ty, sx, sy] = values as [
    MotionValue<number>,
    MotionValue<number>,
    MotionValue<number>,
    MotionValue<number>,
  ];

  const render = () => {
    const el = element.value;
    if (!el) return;
    const style = partStyle(el, kind);
    const now = values.map((value) => value.get());
    const atRest = now[0] === 0 && now[1] === 0 && now[2] === 1 && now[3] === 1;
    if (atRest) style.clear();
    else style.write(toTransform(style.base(), now));
  };
  const unsubscribe = values.map((value) => value.on('change', render));

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
    render();
  };

  const unregister = register({
    snapshot() {
      const el = element.value;
      snapshot = el
        ? {
            visual: el.getBoundingClientRect(),
            layout: measureLayout(el, kind),
          }
        : null;
    },
    play() {
      const el = element.value;
      const from = snapshot;
      snapshot = null;
      if (!el || !from) return;
      const layout = measureLayout(el, kind);
      if (sameBox(layout, from.layout)) return;

      stop();
      const visual = from.visual;
      if (kind === 'thumb') {
        set({
          tx: visual.left + visual.width / 2 - (layout.left + layout.width / 2),
          ty: visual.top + visual.height / 2 - (layout.top + layout.height / 2),
          sx: 1,
          sy: 1,
        });
      } else {
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
      const t = transition();
      const rest = (size: number): Transition =>
        t.type === 'spring'
          ? { restDelta: 0.5 / size, restSpeed: 2 / size, ...t }
          : t;
      controls = [
        animate(tx, 0, t),
        animate(ty, 0, t),
        animate(sx, 1, rest(layout.width)),
        animate(sy, 1, rest(layout.height)),
      ];
    },
    unmoved(on) {
      const el = element.value;
      if (!el) return;
      if (on) partStyle(el, kind).clear();
      else render();
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

  onBeforeUnmount(() => {
    unregister();
    stop();
    unsubscribe.forEach((off) => off());
  });

  return element;
}

type Stretch = {
  size: MotionValue<number>;
  natural: number;
  axis: 'width' | 'height';
  stretched: boolean;
  controls: AnimationPlaybackControls | null;
};

function naturalSize(el: HTMLElement, axis: 'width' | 'height') {
  const inline = el.style[axis];
  el.style[axis] = '';
  const size = axis === 'width' ? el.offsetWidth : el.offsetHeight;
  el.style[axis] = inline;
  return size;
}

function useThumbStretch(
  element: Ref<HTMLElement | null>,
  pressed: () => boolean,
  transition: () => Transition,
) {
  const reduce = useShouldReduceMotion();
  let stretch: Stretch | null = null;

  watch(
    () => [pressed(), reduce.value] as const,
    ([isPressed, isReduced]) => {
      const el = element.value;
      if (!el) return;
      if (!stretch) {
        const created: Stretch = {
          size: motionValue(0),
          natural: 0,
          axis: 'width',
          stretched: false,
          controls: null,
        };
        created.size.on('change', (size) => {
          if (created.stretched) el.style[created.axis] = `${size}px`;
        });
        stretch = created;
      }
      const s = stretch;
      const press = isPressed && !isReduced;
      if (!press && !s.stretched) return;
      s.controls?.stop();
      if (press && !s.stretched) {
        const vertical =
          el.closest('[data-orientation]')?.getAttribute('data-orientation') ===
          'vertical';
        s.axis = vertical ? 'height' : 'width';
        s.natural = naturalSize(el, s.axis);
        s.stretched = true;
        s.size.jump(s.natural);
      }
      if (isReduced) {
        s.stretched = false;
        el.style[s.axis] = '';
        return;
      }
      const target = press ? s.natural * PRESSED_STRETCH : s.natural;
      const controls = animate(s.size, target, transition());
      s.controls = controls;
      void controls.then(() => {
        if (s.controls !== controls || press) return;
        s.controls = null;
        s.stretched = false;
        el.style[s.axis] = '';
      });
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => stretch?.controls?.stop());
}

export {
  SLIDER_TRANSITION,
  useSliderMotion,
  useSliderRootMotion,
  useSliderPartMotion,
  useThumbStretch,
};
