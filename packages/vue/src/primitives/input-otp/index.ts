import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watch,
  type Component,
  type PropType,
} from 'vue';
import {
  animate,
  createGeneratorEasing,
  generateLinearEasing,
  spring,
  supportsLinearEasing,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion-v';
import { OTPInput as BaseOTPInput, type SlotProps } from 'vue-input-otp';

import {
  motionTokens,
  ReducedMotionConfig,
  toCssTiming,
  useMotionTokens,
  useReducedMotionSetting,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

const SPRING: Transition = motionTokens.spring.glyph;
const RING_TRANSITION: Transition = motionTokens.spring.highlight;
const RING_FADE: Transition = motionTokens.transition.color;
const GHOST_TRANSITION: Transition = motionTokens.transition.popOut;
const GHOST_SCALE = 0.5;

const STAGGER = 0.05;

const LANDING = 0.05;
const LANDING_SCALE = 0.7;
const LANDING_OPACITY = 0.6;
const LANDING_ORIGIN = '50% 80%';

const CLEAR_STAGGER = 0.05;
const CLEAR_DROP = 6;

const WAVE_RISE = 4;
const WAVE_UP = 0.1;
const WAVE_DOWN: Transition = motionTokens.spring.checkPop;
const WAVE_STAGGER = 0.04;
const WAVE_AFTER = 0.12;
const WAVE_ID = 'animate-ui-otp-wave';

const SLOT_SELECTOR = '[data-slot="input-otp-slot"]';

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

const REDUCED_MOTION_CSS = `@media (prefers-reduced-motion:reduce){[data-input-otp-container]:not([data-full-motion]) ${SLOT_SELECTOR} *{animation:none!important}}[data-input-otp-container][data-reduced-motion] ${SLOT_SELECTOR} *{animation:none!important}`;

const running = new WeakMap<Element, Animation>();

const OVERLAY_STYLE = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  pointerEvents: 'none',
  zIndex: 10,
};
const RING_STYLE = {
  ...OVERLAY_STYLE,
  boxSizing: 'border-box',
  opacity: 0,
};

function springTiming(transition: Transition) {
  const { ease, duration } = createGeneratorEasing(transition, 100, spring);
  return {
    duration: duration * 1000,
    easing: supportsLinearEasing()
      ? generateLinearEasing(ease, duration * 1000)
      : 'ease-out',
  };
}

function translateOf(el: Element) {
  const [x = 0, y = 0] = getComputedStyle(el)
    .translate.split(' ')
    .map((part) => parseFloat(part) || 0);
  return { x, y };
}

type Box = { left: number; top: number; width: number; height: number };

function boxIn(container: HTMLElement, el: HTMLElement): Box {
  const outer = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
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
    void getComputedStyle(slot).boxShadow;
    shadowTransition(slot)?.cancel();
  }
  return { boxShadow: ring, radii: RADII.map((corner) => style[corner]) };
}

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
  slot: HTMLElement | null;
  shown: boolean;
  box: Box | null;
  radii: string[];
  glide: AnimationPlaybackControls | null;
  fade: Animation | null;
};

const STYLE_ID = 'animate-ui-input-otp';

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = REDUCED_MOTION_CSS;
  document.head.appendChild(style);
}

const SlotsMotion = defineComponent({
  name: 'InputOTPSlotsMotion',
  props: {
    slots: { type: Array as PropType<SlotProps[]>, required: true },
  },
  setup(props, { slots: children }) {
    const tokens = useMotionTokens();
    const tempo = () => tokens.value.tempo;
    const transition = useTempoTransition(() => SPRING);
    const ringTransition = useTempoTransition(() => RING_TRANSITION);
    const ringFade = useTempoTransition(() => RING_FADE);
    const ghostTransition = useTempoTransition(() => GHOST_TRANSITION);
    const waveDown = useTempoTransition(() => WAVE_DOWN);
    const reduce = useShouldReduceMotion();
    const setting = useReducedMotionSetting();
    const valueOf = () => props.slots.map((slot) => slot.char ?? '').join('');
    let prevValue = valueOf();
    let ringValue = prevValue;
    const ring = shallowRef<HTMLSpanElement | null>(null);
    const glyphs = shallowRef<HTMLSpanElement | null>(null);
    const ringState: RingState = {
      slot: null,
      shown: false,
      box: null,
      radii: [],
      glide: null,
      fade: null,
    };
    const leaving = new Map<HTMLElement, HTMLElement>();
    const entering = new Map<HTMLElement, HTMLElement>();

    const getContainer = () =>
      glyphs.value?.closest<HTMLElement>('[data-input-otp-container]') ??
      null;

    const placeRing = (
      box: Box,
      radii: string[],
      glide: boolean,
      delay = 0,
    ) => {
      const el = ring.value;
      const state = ringState;
      if (!el) return;
      state.glide?.stop();
      state.box = box;
      state.radii = radii;
      state.glide = animate(
        el,
        {
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          ...Object.fromEntries(RADII.map((corner, i) => [corner, radii[i]])),
        },
        glide ? { ...ringTransition.value, delay } : { duration: 0 },
      );
    };

    const followRing = () => {
      const value = valueOf();
      const before = ringValue;
      ringValue = value;
      const container = getContainer();
      const el = ring.value;
      if (!container || !el) return;
      const state = ringState;
      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(SLOT_SELECTOR),
      );
      const activeIndex = elements.findIndex(
        (slot) => slot.getAttribute('data-active') === 'true',
      );
      const typed =
        activeIndex > 0 &&
        state.slot === elements[activeIndex - 1] &&
        Boolean(value[activeIndex - 1]);
      const cleared =
        before.length - value.length > 1 && before.startsWith(value);
      const ringDelay = reduce.value
        ? 0
        : cleared
          ? (before.length - value.length) * CLEAR_STAGGER * tempo()
          : typed
            ? LANDING * tempo()
            : 0;
      const active = container.querySelector<HTMLElement>(
        `${SLOT_SELECTOR}[data-active="true"]`,
      );
      const moved = active !== state.slot;
      if (moved) {
        state.slot?.style.removeProperty('box-shadow');
        state.slot = active;
      }

      const fadeTo = (opacity: number) => {
        state.fade?.cancel();
        const from = getComputedStyle(el).opacity;
        el.style.opacity = String(opacity);
        const { duration, easing } = toCssTiming(ringFade.value);
        state.fade = el.animate([{ opacity: from }, { opacity }], {
          duration,
          easing,
        });
      };

      const worn = active ? takeRing(active) : null;
      if (!active || !worn || worn.boxShadow === 'none') {
        if (state.shown) fadeTo(0);
        state.shown = false;
        return;
      }
      el.style.boxShadow = worn.boxShadow;
      const box = boxIn(container, active);
      if (
        !moved &&
        state.shown &&
        sameBox(state.box, box) &&
        worn.radii.join() === state.radii.join()
      )
        return;
      placeRing(box, worn.radii, state.shown && !reduce.value, ringDelay);
      if (moved) {
        cancelWaves(el);
        rideWave(active, el);
      }
      if (!state.shown) fadeTo(1);
      state.shown = true;
    };

    const animateGlyphs = () => {
      const value = valueOf();
      const prev = prevValue;
      prevValue = value;
      if (prev === value) return;

      const container = getContainer();
      const layer = glyphs.value;
      if (!container || typeof Element.prototype.animate !== 'function') return;
      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(SLOT_SELECTOR),
      );

      const cascade = prev.length - value.length > 1 && prev.startsWith(value);
      if (
        (!reduce.value || cascade) &&
        layer &&
        prev.length > value.length &&
        prev.startsWith(value)
      ) {
        const { duration, easing } = toCssTiming(ghostTransition.value);
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
          if (from.opacity < 0.01) continue;
          const ghost = glyphCopy(container, slot, prev[index]!);
          ghost.dataset.glyph = 'leave';
          layer.append(ghost);
          leaving.set(slot, ghost);
          rideWave(slot, ghost);
          const shrink = cascade
            ? ghost.animate(
                [
                  {
                    opacity: from.opacity,
                    scale: from.scale,
                    translate: '0px 0px',
                    filter: 'blur(0px)',
                  },
                  {
                    opacity: 0,
                    scale: from.scale,
                    translate: `0px ${reduce.value ? 0 : CLEAR_DROP}px`,
                    filter: motionTokens.blur.surface,
                  },
                ],
                {
                  duration,
                  easing,
                  delay:
                    (prev.length - 1 - index) * CLEAR_STAGGER * tempo() * 1000,
                  fill: 'both',
                },
              )
            : ghost.animate(
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

      for (const [slot, copy] of entering) {
        const index = elements.indexOf(slot);
        if (index !== -1 && copy.textContent === value[index]) continue;
        copy.remove();
        entering.delete(slot);
        running.get(slot)?.cancel();
      }

      const { start, end } = getEntry(prev, value);
      if (end <= start) return;
      for (let index = start; index < end; index++) {
        const slot = elements[index];
        if (!slot) continue;
        leaving.get(slot)?.remove();
        leaving.delete(slot);
      }

      const { duration, easing } = springTiming(transition.value);
      const stagger = !reduce.value && end - start > 1 ? STAGGER * tempo() : 0;

      for (let index = start; index < end; index++) {
        const el = elements[index];
        if (!el) continue;
        running.get(el)?.cancel();
        entering.get(el)?.remove();
        entering.delete(el);
        const delay = (index - start) * stagger * 1000;
        if (reduce.value || !layer) {
          const animation = el.animate([{ offset: 0, color: 'transparent' }], {
            duration,
            delay,
            easing,
            fill: 'backwards',
          });
          running.set(el, animation);
          continue;
        }
        const copy = glyphCopy(container, el, value[index]!);
        copy.dataset.glyph = 'enter';
        copy.style.transformOrigin = LANDING_ORIGIN;
        layer.append(copy);
        rideWave(el, copy);
        const opacity = Number(getComputedStyle(el).opacity);
        const landing = end - start === 1 ? LANDING * tempo() * 1000 : 0;
        if (landing)
          copy.animate(
            [
              { opacity: 0, scale: LANDING_SCALE * 0.8 },
              { opacity: opacity * LANDING_OPACITY, scale: LANDING_SCALE },
            ],
            { duration: landing / 2, easing: 'ease-out', fill: 'forwards' },
          );
        copy.animate(
          [
            landing
              ? { opacity: opacity * LANDING_OPACITY, scale: LANDING_SCALE }
              : { opacity: 0, scale: 0 },
            { opacity, scale: 1 },
          ],
          {
            duration,
            delay: delay + landing,
            easing,
            fill: landing ? 'forwards' : 'both',
          },
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
          { duration: duration + landing, delay, fill: 'backwards' },
        );
        running.set(el, hidden);
        entering.set(el, copy);
        const done = () => {
          copy.remove();
          if (entering.get(el) === copy) entering.delete(el);
        };
        hidden.finished.then(done, done);
      }

      if (
        reduce.value ||
        value.length < elements.length ||
        prev.length >= value.length
      )
        return;
      const up = WAVE_UP * tempo() * 1000;
      const down = springTiming(waveDown.value);
      const waveStart =
        ((end - start - 1) * stagger + WAVE_AFTER * tempo()) * 1000;
      const keyframes: Keyframe[] = [
        { translate: '0px 0px', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        {
          translate: `0px ${-WAVE_RISE}px`,
          offset: up / (up + down.duration),
          easing: down.easing,
        },
        { translate: '0px 0px' },
      ];
      const ringEl = ring.value;
      const ringSlot = ringState.slot;
      if (ringEl) cancelWaves(ringEl);
      elements.forEach((slot, index) => {
        cancelWaves(slot);
        const timing: KeyframeAnimationOptions = {
          id: WAVE_ID,
          duration: up + down.duration,
          delay: waveStart + index * WAVE_STAGGER * tempo() * 1000,
          composite: 'add',
        };
        slot.animate(keyframes, timing);
        for (const rider of [
          slot === ringSlot ? ringEl : null,
          entering.get(slot),
          leaving.get(slot),
        ]) {
          if (!rider) continue;
          cancelWaves(rider);
          rider.animate(keyframes, timing);
        }
      });
    };

    let observer: ResizeObserver | null = null;
    onMounted(() => {
      injectStyle();
      followRing();
      const container = getContainer();
      if (!container || typeof ResizeObserver === 'undefined') return;
      observer = new ResizeObserver(() => {
        const state = ringState;
        if (!state.shown || !state.slot) return;
        const box = boxIn(container, state.slot);
        if (!sameBox(state.box, box)) placeRing(box, state.radii, false);
      });
      observer.observe(container);
    });
    onUpdated(() => {
      followRing();
      animateGlyphs();
    });

    watch(
      [reduce, setting, glyphs],
      () => {
        const container = getContainer();
        container?.toggleAttribute('data-reduced-motion', reduce.value);
        container?.toggleAttribute(
          'data-full-motion',
          setting.value === 'never',
        );
      },
      { immediate: true, flush: 'post' },
    );

    onBeforeUnmount(() => {
      observer?.disconnect();
      ringState.slot?.style.removeProperty('box-shadow');
      ringState.slot = null;
      ringState.shown = false;
      ringState.box = null;
      leaving.forEach((ghost) => ghost.remove());
      leaving.clear();
      entering.forEach((copy, slot) => {
        copy.remove();
        running.get(slot)?.cancel();
      });
      entering.clear();
    });

    return () => [
      children.default?.(),
      h('span', {
        ref: glyphs,
        'aria-hidden': 'true',
        'data-slot': 'input-otp-ghosts',
        style: OVERLAY_STYLE,
      }),
      h('span', {
        ref: ring,
        'aria-hidden': 'true',
        'data-slot': 'input-otp-ring',
        style: RING_STYLE,
      }),
    ];
  },
});

/**
 * vue-input-otp's OTPInput, animated: typed characters spring in, deleted
 * ones shrink away and the focus ring glides from slot to slot.
 */
const OTPInput = defineComponent({
  name: 'OTPInput',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(BaseOTPInput as Component, attrs, {
          default: (renderProps: { slots: SlotProps[] }) =>
            h(SlotsMotion, { slots: renderProps.slots }, () =>
              slots.default?.(renderProps),
            ),
        }),
      );
  },
});

export { OTPInput };
export {
  PublicVueOTPContextKey,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  useVueOTPContext,
  type OTPInputEmits,
  type OTPInputProps,
  type RenderProps,
  type SlotProps,
} from 'vue-input-otp';
