import {
  onBeforeUnmount,
  onMounted,
  onUpdated,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import {
  animate,
  cancelFrame,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion-v';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

type ThumbAnimationProps = {
  transition?: Transition;
};

const THUMB_TRANSITION: Transition = motionTokens.spring.thumb;

const PRESSED_STRETCH = 19 / 16;

const SwitchPressedKey: InjectionKey<Ref<boolean>> = Symbol(
  'AnimateUISwitchPressed',
);

type Rest = {
  left: number;
  width: number;
  anchor: number;
};

type ThumbMotion = {
  x: MotionValue<number>;
  width: MotionValue<number>;
  stretched: boolean;
  unit: number;
  lean: number;
  shift: number;
  natural: number;
  rest: Rest | null;
  committed: { checked: boolean; pressed: boolean } | null;
  controls: AnimationPlaybackControls[];
  pending: (() => void) | null;
  run: number;
};

type Thumb = HTMLElement;

function withoutTransitions<T>(thumb: Thumb, read: () => T): T {
  const transition = thumb.style.transition;
  thumb.style.transition = 'none';
  const result = read();
  thumb.style.transition = transition;
  return result;
}

function scaleOf(track: HTMLElement | null) {
  if (!track || track.offsetWidth === 0) return 1;
  return track.getBoundingClientRect().width / track.offsetWidth || 1;
}

function visualLeft(thumb: Thumb) {
  const track = thumb.parentElement;
  const box = thumb.getBoundingClientRect();
  if (!track) return box.left;
  return (box.left - track.getBoundingClientRect().left) / scaleOf(track);
}

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

function widthOf(thumb: Thumb) {
  return parseFloat(getComputedStyle(thumb).width) || thumb.offsetWidth;
}

function naturalWidth(thumb: Thumb) {
  return withoutTransitions(thumb, () => {
    const inline = thumb.style.width;
    thumb.style.width = '';
    const natural = widthOf(thumb);
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
    unit: 1,
    lean: 0,
    shift: 0,
    natural: 0,
    rest: null,
    committed: null,
    controls: [],
    pending: null,
    run: 0,
  };
}

function snapped(m: ThumbMotion, width: number) {
  return m.natural + Math.round((width - m.natural) * m.unit) / m.unit;
}

function unitOf(thumb: Thumb) {
  const zoom = (thumb as Thumb & { currentCSSZoom?: number }).currentCSSZoom;
  return (thumb.ownerDocument.defaultView?.devicePixelRatio || 1) * (zoom || 1);
}

function write(thumb: Thumb, m: ThumbMotion) {
  withoutTransitions(thumb, () => {
    let shift = 0;
    if (m.stretched) {
      const width = m.width.get();
      const painted = snapped(m, width);
      shift = m.lean * (painted - width);
      thumb.style.width = `${painted}px`;
    }
    m.shift = shift;
    thumb.style.transform = `translateX(${m.x.get() + shift}px)`;
    return getComputedStyle(thumb).transform;
  });
}

function settleWhereSeen(m: ThumbMotion) {
  if (!m.stretched) return;
  const width = m.width.get();
  const painted = snapped(m, width);
  m.x.jump(m.x.get() + m.lean * (painted - width));
  m.width.jump(painted);
}

function stop(m: ThumbMotion) {
  m.controls.forEach((control) => control.stop());
  m.controls = [];
  if (m.pending) cancelFrame(m.pending);
  m.pending = null;
}

function settle(thumb: Thumb, m: ThumbMotion) {
  stop(m);
  m.stretched = false;
  m.x.jump(0);
  thumb.style.transform = '';
  thumb.style.width = '';
}

/**
 * Glides the thumb from where it was to where the library's CSS puts it, and
 * stretches it toward the travel while pressed.
 */
function useSwitchThumb(
  getThumb: () => Thumb | null | undefined,
  state: () => { checked: boolean; pressed: boolean },
  transition: () => Transition | undefined,
) {
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(() => transition() ?? THUMB_TRANSITION);
  const m = createThumbMotion();

  const update = () => {
    const thumb = getThumb();
    if (thumb) write(thumb, m);
  };
  const stopX = m.x.on('change', update);
  const stopWidth = m.width.on('change', () => {
    if (m.stretched) update();
  });

  function sync() {
    const thumb = getThumb();
    const { checked, pressed } = state();
    const previous = m.committed;
    m.committed = { checked, pressed };
    if (!thumb) return;

    const flipped = previous !== null && previous.checked !== checked;
    const pressChanged = previous !== null && previous.pressed !== pressed;

    if (!flipped && !pressChanged) {
      if (m.controls.length === 0 && !m.stretched)
        m.rest = measureRest(thumb, m.x.get(), widthOf(thumb), false);
      return;
    }

    if (reduce.value) {
      settle(thumb, m);
      m.rest = measureRest(thumb, 0, widthOf(thumb), false);
      return;
    }

    m.unit = unitOf(thumb);
    let xVelocity = m.x.getVelocity();
    const widthVelocity = flipped ? 0 : m.width.getVelocity();
    stop(m);
    settleWhereSeen(m);
    if (!m.stretched) m.natural = naturalWidth(thumb);
    const natural = m.natural;
    const width = m.stretched ? m.width.get() : natural;
    const x = m.x.get();

    if (flipped) {
      const before = m.rest;
      const now = measureRest(thumb, x, width, width !== natural || pressed);
      if (before) {
        const was = before.left - before.anchor * (width - before.width) + x;
        m.x.jump(was - now.left);
        xVelocity = 0;
      }
      m.rest = now;
    } else if (pressed) {
      m.rest = measureRest(thumb, x, width, true);
    }

    const stretchedWidth =
      natural + Math.round(natural * (PRESSED_STRETCH - 1) * m.unit) / m.unit;
    const targetWidth = pressed ? stretchedWidth : natural;
    let targetX = 0;
    const rest = m.rest;
    if (rest) {
      const track = thumb.parentElement;
      const restLeft = rest.left - rest.anchor * (natural - rest.width);
      const atEnd =
        track !== null && restLeft + natural / 2 > track.offsetWidth / 2;
      if (pressed)
        targetX = -((atEnd ? 1 : 0) - rest.anchor) * (stretchedWidth - natural);
      m.lean = atEnd ? rest.anchor - 1 : rest.anchor;
    }

    if (!m.stretched) {
      m.stretched = true;
      m.width.jump(width);
    }
    const id = ++m.run;
    m.controls = [
      animate(m.x, targetX, {
        restDelta: 0.005,
        restSpeed: 0.01,
        ...spring.value,
        velocity: xVelocity,
      }),
      animate(m.width, targetWidth, {
        ...spring.value,
        velocity: widthVelocity,
      }),
    ];
    void Promise.all(m.controls).then(() => {
      if (m.run !== id) return;
      m.controls = [];
      if (m.committed?.pressed) return;
      settle(thumb, m);
      m.rest = measureRest(thumb, 0, widthOf(thumb), false);
    });
  }

  onMounted(sync);
  onUpdated(sync);
  watch(
    () => {
      const { checked, pressed } = state();
      return [checked, pressed];
    },
    sync,
    { flush: 'post' },
  );
  onBeforeUnmount(() => {
    stopX();
    stopWidth();
    stop(m);
  });
}

export {
  SwitchPressedKey,
  THUMB_TRANSITION,
  useSwitchThumb,
  type ThumbAnimationProps,
};
