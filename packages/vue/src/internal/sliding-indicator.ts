import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type VNode,
} from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';
import { curveFrom, velocityOf, INSTANT, type Run } from './momentum';

type Box = { x: number; y: number; width: number; height: number };

type IndicatorSnapshot = Box & {
  version: number;
  item: Element;
  className: string;
  attributes: Record<string, string>;
};

const SKIPPED_ATTRIBUTE =
  /^data-(slot|testid|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|react-aria-.*|key|radix-.*|reka-.*|composite-.*)$/;

const NONE = (value: string) => !value || value === 'none';

function layoutSizeOf(element: HTMLElement) {
  const style = getComputedStyle(element);
  let width = parseFloat(style.width);
  let height = parseFloat(style.height);
  if (!Number.isFinite(width) || !Number.isFinite(height))
    return { width: element.offsetWidth, height: element.offsetHeight };
  if (style.boxSizing !== 'border-box') {
    const px = (value: string) => parseFloat(value) || 0;
    width +=
      px(style.paddingLeft) +
      px(style.paddingRight) +
      px(style.borderLeftWidth) +
      px(style.borderRightWidth);
    height +=
      px(style.paddingTop) +
      px(style.paddingBottom) +
      px(style.borderTopWidth) +
      px(style.borderBottomWidth);
  }
  return { width, height };
}

function containerScale(container: HTMLElement, rect: DOMRect) {
  const { width, height } = layoutSizeOf(container);
  return {
    x: width && Math.abs(rect.width - width) > 0.01 ? rect.width / width : 1,
    y:
      height && Math.abs(rect.height - height) > 0.01
        ? rect.height / height
        : 1,
  };
}

function lengthOf(value: string, size: number) {
  if (value.endsWith('%')) return (parseFloat(value) / 100) * size;
  if (value.endsWith('px') || /^-?[\d.]+$/.test(value))
    return parseFloat(value);
  return null;
}

function untransform(element: Element, box: Box): Box {
  const style = getComputedStyle(element);
  if (NONE(style.translate) && NONE(style.scale) && NONE(style.transform))
    return box;
  if (!NONE(style.rotate)) return box;
  let [a, d, e, f] = [1, 1, 0, 0];
  if (!NONE(style.transform)) {
    const matrix = style.transform.match(/^matrix\(([^)]+)\)$/);
    if (!matrix) return box;
    const [ma = 1, mb = 0, mc = 0, md = 1, me = 0, mf = 0] = matrix[1]!
      .split(',')
      .map(Number);
    if (Math.abs(mb) > 1e-6 || Math.abs(mc) > 1e-6) return box;
    [a, d, e, f] = [ma, md, me, mf];
  }
  const scale = NONE(style.scale) ? [] : style.scale.split(/\s+/).map(Number);
  const sx = scale[0] ?? 1;
  const sy = scale[1] ?? sx;
  const [kx, ky] = [sx * a, sy * d];
  if (!kx || !ky || ![kx, ky].every(Number.isFinite)) return box;
  const width = box.width / kx;
  const height = box.height / ky;
  const [tX = '0px', tY = '0px'] = NONE(style.translate)
    ? []
    : style.translate.split(/\s+(?![^(]*\))/);
  const tx = lengthOf(tX, width);
  const ty = lengthOf(tY, height);
  const [oX = '0px', oY = '0px'] = style.transformOrigin.split(/\s+/);
  const ox = lengthOf(oX, width);
  const oy = lengthOf(oY, height);
  if (tx === null || ty === null || ox === null || oy === null) return box;
  return {
    x: box.x - ox - tx - sx * (e - a * ox),
    y: box.y - oy - ty - sy * (f - d * oy),
    width,
    height,
  };
}

function boxIn(
  container: HTMLElement,
  element: Element,
  untransformed = false,
): Box {
  const containerRect = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const scale = containerScale(container, containerRect);
  const box = {
    x:
      (rect.left - containerRect.left) / scale.x -
      container.clientLeft +
      container.scrollLeft,
    y:
      (rect.top - containerRect.top) / scale.y -
      container.clientTop +
      container.scrollTop,
    width: rect.width / scale.x,
    height: rect.height / scale.y,
  };
  return untransformed ? untransform(element, box) : box;
}

function isTransformed(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const { width, height } = layoutSizeOf(container);
  return (
    Math.abs(rect.width - width) > 0.01 || Math.abs(rect.height - height) > 0.01
  );
}

const sameBox = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) < 0.01 &&
  Math.abs(a.y - b.y) < 0.01 &&
  Math.abs(a.width - b.width) < 0.01 &&
  Math.abs(a.height - b.height) < 0.01;

type BoxOf = (item: HTMLElement, container: HTMLElement) => Element;

type SlidingIndicatorConfig = {
  findActive: (container: HTMLElement) => HTMLElement | null;
  items: string;
  attributes: string[];
  style: { href: string; css: string };
  slot: string;
  reducedMotion?: 'jump' | 'fade';
  untransformed?: boolean;
  zIndex?: number;
  fadeBackground?: boolean;
};

function readSnapshot(
  container: HTMLElement,
  previous: IndicatorSnapshot | null,
  {
    copy,
    boxOf,
    config,
  }: { copy: boolean; boxOf?: BoxOf; config: SlidingIndicatorConfig },
): IndicatorSnapshot | null {
  const item = config.findActive(container);
  if (!item) return null;

  const box = boxIn(
    container,
    boxOf?.(item, container) ?? item,
    config.untransformed,
  );
  const attributes: Record<string, string> = {};
  if (copy) {
    for (const { name, value } of item.attributes) {
      if (name.startsWith('data-') && !SKIPPED_ATTRIBUTE.test(name))
        attributes[name] = value;
    }
  }
  const className = copy ? (item.getAttribute('class') ?? '') : '';

  if (
    previous &&
    previous.item === item &&
    sameBox(previous, box) &&
    previous.className === className &&
    JSON.stringify(previous.attributes) === JSON.stringify(attributes)
  )
    return previous;

  return {
    version:
      previous && previous.item !== item
        ? previous.version + 1
        : (previous?.version ?? 0),
    item,
    ...box,
    className,
    attributes,
  };
}

const isInIndicator = (node: Node, slot: string) =>
  node instanceof Element && node.closest(`[data-slot="${slot}"]`) !== null;

type Slide = {
  animations: Animation[];
  run: Run;
  to: Box;
};

const isRunning = (animation: Animation | undefined) =>
  animation !== undefined &&
  animation.playState !== 'finished' &&
  animation.playState !== 'idle';

const timeOf = (animation: Animation | undefined) =>
  Number(animation?.currentTime) || 0;

function startNow(animation: Animation) {
  animation.startTime = performance.now();
  return animation;
}

function boxOfSlide({ animations, run, to }: Slide): Box {
  const left = 1 - run.curve.at(timeOf(animations[0]));
  const [x = 0, y = 0, width = 0, height = 0] = run.offset;
  return {
    x: to.x + x * left,
    y: to.y + y * left,
    width: to.width + width * left,
    height: to.height + height * left,
  };
}

function onNextFrame(callback: () => void) {
  const frame = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frame);
}

const SLIDING_ATTRIBUTE = 'data-animate-ui-sliding';
const LEAVING_ATTRIBUTE = 'data-animate-ui-leaving';

const placement = (
  box: Box,
  zIndex: number,
  transition = 'none',
): Record<string, string | number> => ({
  position: 'absolute',
  left: `${box.x}px`,
  top: `${box.y}px`,
  right: 'auto',
  bottom: 'auto',
  width: `${box.width}px`,
  height: `${box.height}px`,
  margin: 0,
  boxSizing: 'border-box',
  zIndex,
  pointerEvents: 'none',
  transition,
});

type Crossfades = {
  copies: Map<HTMLElement, Animation>;
  fadeIn: Animation | null;
};

type SlidingIndicatorOptions = {
  enabled?: boolean;
  transition?: Transition;
  surface?: {
    className?: string;
    style?: Record<string, string | number>;
    slot?: string;
  };
  boxOf?: BoxOf;
};

function stopCrossfades(crossfades: Crossfades) {
  for (const [copy, animation] of crossfades.copies) {
    animation.cancel();
    copy.remove();
  }
  crossfades.copies.clear();
  crossfades.fadeIn?.cancel();
  crossfades.fadeIn = null;
}

const INDICATOR_TRANSITION: Transition = motionTokens.spring.selection;

function addStyle({ href, css }: { href: string; css: string }) {
  if (typeof document === 'undefined' || document.getElementById(href)) return;
  const style = document.createElement('style');
  style.id = href;
  style.textContent = css;
  document.head.append(style);
}

/**
 * One indicator behind a container's active item (a tab, a toggle…): a copy
 * of the item's look that slides to the next active item, keeping its speed.
 */
function useSlidingIndicator(
  container: Ref<HTMLElement | null>,
  config: SlidingIndicatorConfig,
  options: () => SlidingIndicatorOptions = () => ({}),
): {
  render: () => VNode | null;
  ready: ComputedRef<boolean>;
  settling: ComputedRef<boolean>;
} {
  const snapshot = shallowRef<IndicatorSnapshot | null>(null);
  const copy = () => !options().surface;
  const slot = () => options().surface?.slot ?? config.slot;
  const enabled = () => options().enabled ?? true;

  watch(
    () => [container.value, enabled(), copy(), slot()] as const,
    ([el, on, copied, ownSlot], _, onCleanup) => {
      if (!el || !on) return;
      if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
      el.style.isolation = 'isolate';
      if (copied) addStyle(config.style);
      let reread = 0;
      let rereads = 0;
      const update = () => {
        snapshot.value = readSnapshot(el, snapshot.value, {
          copy: copied,
          boxOf: options().boxOf,
          config,
        });
        if (!isTransformed(el)) {
          rereads = 0;
          return;
        }
        if (reread || ++rereads > 90) return;
        reread = requestAnimationFrame(() => {
          reread = 0;
          update();
        });
      };
      const resize = new ResizeObserver(update);
      const observeItems = () => {
        resize.observe(el);
        for (const item of el.querySelectorAll<HTMLElement>(config.items)) {
          resize.observe(item);
          const box = options().boxOf?.(item, el);
          if (box && box !== item) resize.observe(box);
        }
      };
      const mutations = new MutationObserver((records) => {
        if (records.every((r) => isInIndicator(r.target, ownSlot))) return;
        observeItems();
        update();
      });
      mutations.observe(el, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: config.attributes,
      });
      el.addEventListener('scroll', update, { capture: true, passive: true });
      observeItems();
      update();
      onCleanup(() => {
        mutations.disconnect();
        resize.disconnect();
        el.removeEventListener('scroll', update, { capture: true });
        cancelAnimationFrame(reread);
        snapshot.value = null;
      });
    },
    { immediate: true, flush: 'post' },
  );

  const visible = computed(() =>
    container.value && enabled() ? snapshot.value : null,
  );

  const slideTransition = useTempoTransition(
    () => options().transition ?? INDICATOR_TRANSITION,
  );
  const fade = useTempoTransition(() => motionTokens.transition.fade);
  const color = useTempoTransition(() => motionTokens.transition.color);
  const reduce = useShouldReduceMotion();

  const indicator = ref<HTMLSpanElement | null>(null);
  let slide: Slide | null = null;
  const crossfades: Crossfades = { copies: new Map(), fadeIn: null };
  let rest: {
    version: number;
    box: Box;
    className: string;
    attributes: Record<string, string>;
  } | null = null;
  let painted = false;
  onMounted(() => onNextFrame(() => (painted = true)));

  // Also when the indicator element appears: it renders after the first snapshot.
  watch(
    () => [visible.value, indicator.value] as const,
    ([shown, element]) => {
      const current = slide;
      const stop = () => {
        current?.animations.forEach((animation) => animation.cancel());
        slide = null;
        element?.removeAttribute(SLIDING_ATTRIBUTE);
      };
      if (!element || !shown) {
        stop();
        stopCrossfades(crossfades);
        rest = null;
        return;
      }
      const to: Box = {
        x: shown.x,
        y: shown.y,
        width: shown.width,
        height: shown.height,
      };
      const last = rest;
      rest = {
        version: shown.version,
        box: to,
        className: shown.className,
        attributes: shown.attributes,
      };
      const moving = current !== null && isRunning(current.animations[0]);
      if (!last || !painted || (shown.version === last.version && !moving)) {
        stop();
        return;
      }
      const from = moving ? boxOfSlide(current) : last.box;
      const velocity = moving
        ? velocityOf(current.run, timeOf(current.animations[0]))
        : [0, 0, 0, 0];
      const startTime = moving
        ? Math.max(
            Number(document.timeline.currentTime),
            Number(current.animations[0]!.startTime),
          ) || performance.now()
        : performance.now();
      stop();
      const offset = [
        from.x - to.x,
        from.y - to.y,
        from.width - to.width,
        from.height - to.height,
      ];
      if (offset.every((value) => Math.abs(value) < 0.5)) return;
      if (typeof element.animate !== 'function') return;
      const surface = options().surface;

      if (reduce.value && config.reducedMotion === 'fade') {
        const fading = toCssTiming(fade.value);
        if (fading.duration <= 0) {
          stopCrossfades(crossfades);
          return;
        }
        const opacity = isRunning(crossfades.fadeIn ?? undefined)
          ? Number(getComputedStyle(element).opacity)
          : 1;
        crossfades.fadeIn?.cancel();
        const copied = document.createElement('span');
        copied.setAttribute('aria-hidden', 'true');
        for (const [name, value] of Object.entries(last.attributes))
          copied.setAttribute(name, value);
        copied.setAttribute('data-slot', slot());
        copied.setAttribute(LEAVING_ATTRIBUTE, '');
        if (copy()) copied.className = last.className;
        else if (surface?.className) copied.className = surface.className;
        Object.assign(copied.style, surface?.style);
        copied.style.cssText += `;position:absolute;left:${from.x}px;top:${from.y}px;right:auto;bottom:auto;width:${from.width}px;height:${from.height}px;margin:0;box-sizing:border-box;z-index:${config.zIndex ?? -1};pointer-events:none;transition:none`;
        element.before(copied);
        const out = startNow(
          copied.animate([{ opacity }, { opacity: 0 }], {
            duration: fading.duration * opacity,
            easing: fading.easing,
            fill: 'both',
          }),
        );
        crossfades.copies.set(copied, out);
        out.onfinish = () => {
          copied.remove();
          crossfades.copies.delete(copied);
        };
        crossfades.fadeIn = startNow(
          element.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: fading.duration,
            easing: fading.easing,
            fill: 'backwards',
          }),
        );
        return;
      }

      const curve = reduce.value
        ? INSTANT
        : curveFrom(slideTransition.value, offset, velocity);
      if (curve.duration <= 0) return;
      const timing: KeyframeAnimationOptions = {
        duration: curve.duration,
        easing: curve.easing,
        fill: 'backwards',
      };
      const own = getComputedStyle(element).translate;
      const [ownX = 0, ownY = 0] = NONE(own)
        ? []
        : own
            .split(/\s+/)
            .map((part) => (part.endsWith('px') ? parseFloat(part) : NaN));
      const replace = Number.isFinite(ownX) && Number.isFinite(ownY);
      const animations = [
        element.animate(
          replace
            ? [
                { translate: `${offset[0]! + ownX}px ${offset[1]! + ownY}px` },
                { translate: `${ownX}px ${ownY}px` },
              ]
            : [
                { translate: `${offset[0]}px ${offset[1]}px` },
                { translate: '0px 0px' },
              ],
          { ...timing, composite: replace ? 'replace' : 'add' },
        ),
      ];
      if (Math.abs(offset[2]!) >= 0.5 || Math.abs(offset[3]!) >= 0.5)
        animations.push(
          element.animate(
            [
              { width: `${from.width}px`, height: `${from.height}px` },
              { width: `${to.width}px`, height: `${to.height}px` },
            ],
            timing,
          ),
        );
      for (const animation of animations) animation.startTime = startTime;
      const started: Slide = { animations, run: { offset, curve }, to };
      slide = started;
      element.setAttribute(SLIDING_ATTRIBUTE, '');
      void animations[0]!.finished.then(
        () => {
          if (slide === started) element.removeAttribute(SLIDING_ATTRIBUTE);
        },
        () => {},
      );
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    slide?.animations.forEach((animation) => animation.cancel());
    stopCrossfades(crossfades);
  });

  const ready = computed(() => Boolean(visible.value && copy()));
  const settled = ref(false);
  watch(
    ready,
    (now, _, onCleanup) => {
      if (!now) {
        settled.value = false;
        return;
      }
      if (settled.value) return;
      onCleanup(onNextFrame(() => (settled.value = true)));
    },
    { immediate: true, flush: 'post' },
  );

  const render = () => {
    const shown = visible.value;
    if (!shown) return null;
    const surface = options().surface;
    const colorTiming = toCssTiming(color.value);
    return h('span', {
      ref: indicator,
      'aria-hidden': 'true',
      ...shown.attributes,
      'data-slot': slot(),
      class: copy() ? shown.className : surface?.className,
      style: {
        ...surface?.style,
        ...placement(
          shown,
          config.zIndex ?? -1,
          config.fadeBackground
            ? `background-color ${colorTiming.duration}ms ${colorTiming.easing}`
            : 'none',
        ),
      },
    });
  };

  return {
    render,
    ready,
    settling: computed(() => ready.value && !settled.value),
  };
}

export {
  useSlidingIndicator,
  layoutSizeOf,
  SLIDING_ATTRIBUTE,
  LEAVING_ATTRIBUTE,
  onNextFrame,
  startNow,
  isRunning,
  type SlidingIndicatorConfig,
  type SlidingIndicatorOptions,
};
