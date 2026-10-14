'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

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
  /^data-(slot|testid|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|react-aria-.*|key|radix-.*|composite-.*)$/;

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
): React.CSSProperties => ({
  position: 'absolute',
  left: box.x,
  top: box.y,
  right: 'auto',
  bottom: 'auto',
  width: box.width,
  height: box.height,
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
    style?: React.CSSProperties;
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

function useSlidingIndicator(
  container: HTMLElement | null,
  config: SlidingIndicatorConfig,
  { enabled = true, transition, surface, boxOf }: SlidingIndicatorOptions = {},
) {
  const [snapshot, setSnapshot] = React.useState<IndicatorSnapshot | null>(
    null,
  );
  const copy = !surface;
  const slot = surface?.slot ?? config.slot;

  const boxOfRef = React.useRef(boxOf);
  const configRef = React.useRef(config);
  React.useLayoutEffect(() => {
    boxOfRef.current = boxOf;
    configRef.current = config;
  });

  React.useLayoutEffect(() => {
    if (!container || !enabled) return;
    if (getComputedStyle(container).position === 'static')
      container.style.position = 'relative';
    container.style.isolation = 'isolate';

    let reread = 0;
    let rereads = 0;
    const update = () => {
      setSnapshot((previous) =>
        readSnapshot(container, previous, {
          copy,
          boxOf: boxOfRef.current,
          config: configRef.current,
        }),
      );
      if (!isTransformed(container)) {
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
      resize.observe(container);
      for (const item of container.querySelectorAll<HTMLElement>(
        configRef.current.items,
      )) {
        resize.observe(item);
        const box = boxOfRef.current?.(item, container);
        if (box && box !== item) resize.observe(box);
      }
    };
    const mutations = new MutationObserver((records) => {
      if (records.every((r) => isInIndicator(r.target, slot))) return;
      observeItems();
      update();
    });
    mutations.observe(container, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: configRef.current.attributes,
    });
    container.addEventListener('scroll', update, {
      capture: true,
      passive: true,
    });
    observeItems();
    update();

    return () => {
      mutations.disconnect();
      resize.disconnect();
      container.removeEventListener('scroll', update, { capture: true });
      cancelAnimationFrame(reread);
    };
  }, [container, enabled, copy, slot]);

  const visible = container && enabled ? snapshot : null;

  const slideTransition = useTempoTransition(
    transition ?? INDICATOR_TRANSITION,
  );
  const fade = toCssTiming(useTempoTransition(motionTokens.transition.fade));
  const color = toCssTiming(useTempoTransition(motionTokens.transition.color));
  const reduce = useShouldReduceMotion();
  const latestRef = React.useRef({
    slideTransition,
    fade,
    reduce,
    copy,
    slot,
    surface,
  });
  React.useLayoutEffect(() => {
    latestRef.current = { slideTransition, fade, reduce, copy, slot, surface };
  });

  const indicatorRef = React.useRef<HTMLSpanElement | null>(null);
  const slideRef = React.useRef<Slide | null>(null);
  const crossfadesRef = React.useRef<Crossfades>({
    copies: new Map(),
    fadeIn: null,
  });
  const restRef = React.useRef<{
    version: number;
    box: Box;
    className: string;
    attributes: Record<string, string>;
  } | null>(null);
  const paintedRef = React.useRef(false);
  React.useLayoutEffect(
    () => onNextFrame(() => (paintedRef.current = true)),
    [],
  );

  React.useLayoutEffect(() => {
    const element = indicatorRef.current;
    const slide = slideRef.current;
    const stop = () => {
      slide?.animations.forEach((animation) => animation.cancel());
      slideRef.current = null;
      element?.removeAttribute(SLIDING_ATTRIBUTE);
    };
    if (!element || !visible) {
      stop();
      stopCrossfades(crossfadesRef.current);
      restRef.current = null;
      return;
    }

    const to: Box = {
      x: visible.x,
      y: visible.y,
      width: visible.width,
      height: visible.height,
    };
    const rest = restRef.current;
    restRef.current = {
      version: visible.version,
      box: to,
      className: visible.className,
      attributes: visible.attributes,
    };
    const moving = slide !== null && isRunning(slide.animations[0]);
    if (
      !rest ||
      !paintedRef.current ||
      (visible.version === rest.version && !moving)
    ) {
      stop();
      return;
    }

    const from = moving ? boxOfSlide(slide) : rest.box;
    const velocity = moving
      ? velocityOf(slide.run, timeOf(slide.animations[0]))
      : [0, 0, 0, 0];
    const startTime = moving
      ? Math.max(
          Number(document.timeline.currentTime),
          Number(slide.animations[0]!.startTime),
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

    const { slideTransition, fade, reduce, copy, slot, surface } =
      latestRef.current;

    if (reduce && configRef.current.reducedMotion === 'fade') {
      const crossfades = crossfadesRef.current;
      if (fade.duration <= 0) {
        stopCrossfades(crossfades);
        return;
      }
      const opacity = isRunning(crossfades.fadeIn ?? undefined)
        ? Number(getComputedStyle(element).opacity)
        : 1;
      crossfades.fadeIn?.cancel();
      const copied = document.createElement('span');
      copied.setAttribute('aria-hidden', 'true');
      for (const [name, value] of Object.entries(rest.attributes))
        copied.setAttribute(name, value);
      copied.setAttribute('data-slot', slot);
      copied.setAttribute(LEAVING_ATTRIBUTE, '');
      if (copy) copied.className = rest.className;
      else if (surface?.className) copied.className = surface.className;
      Object.assign(copied.style, surface?.style);
      copied.style.cssText += `;position:absolute;left:${from.x}px;top:${from.y}px;right:auto;bottom:auto;width:${from.width}px;height:${from.height}px;margin:0;box-sizing:border-box;z-index:${configRef.current.zIndex ?? -1};pointer-events:none;transition:none`;
      element.before(copied);
      const out = startNow(
        copied.animate([{ opacity }, { opacity: 0 }], {
          duration: fade.duration * opacity,
          easing: fade.easing,
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
          duration: fade.duration,
          easing: fade.easing,
          fill: 'backwards',
        }),
      );
      return;
    }

    const curve = reduce
      ? INSTANT
      : curveFrom(slideTransition, offset, velocity);
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
    slideRef.current = started;
    element.setAttribute(SLIDING_ATTRIBUTE, '');
    void animations[0]!.finished.then(
      () => {
        if (slideRef.current === started)
          element.removeAttribute(SLIDING_ATTRIBUTE);
      },
      () => {},
    );
  }, [visible]);

  React.useEffect(
    () => () => {
      slideRef.current?.animations.forEach((animation) => animation.cancel());
      stopCrossfades(crossfadesRef.current);
    },
    [],
  );

  const ready = Boolean(visible && copy);
  const [settled, setSettled] = React.useState(false);
  const [wasReady, setWasReady] = React.useState(ready);
  if (ready !== wasReady) {
    setWasReady(ready);
    if (!ready) setSettled(false);
  }
  React.useLayoutEffect(() => {
    if (!ready || settled) return;
    return onNextFrame(() => setSettled(true));
  }, [ready, settled]);

  const indicator = visible ? (
    <>
      {copy && (
        <style href={config.style.href} precedence="animate-ui">
          {config.style.css}
        </style>
      )}
      <span
        ref={indicatorRef}
        aria-hidden
        {...visible.attributes}
        data-slot={slot}
        className={copy ? visible.className : surface?.className}
        style={{
          ...surface?.style,
          ...placement(
            visible,
            config.zIndex ?? -1,
            config.fadeBackground
              ? `background-color ${color.duration}ms ${color.easing}`
              : 'none',
          ),
        }}
      />
    </>
  ) : null;

  return {
    indicator,
    ready,
    settling: ready && !settled,
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
