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

// One surface sliding from item to item: the tabs' indicator (internal/tabs)
// and the pagination's active page (primitives/pagination).
//
// shadcn/ui styles the active item itself (its background, border, shadow
// and, for the tabs' line variant, an ::after underline). To make that
// surface slide without touching the component, the container renders an
// indicator that copies the active item's classes and data attributes (so it
// looks like the active item in every style and theme, as long as that look
// comes from those, not from an `aria-*` attribute, and is never hovered,
// pressed or focused) and sits behind the items, while a small stylesheet
// hides the active item's own surface, unless the caller gives the indicator
// its own look (`surface`).
//
// Another item becoming active slides it there on a spring (Web Animations:
// `translate`, on the compositor, and its size when the items' differ: a
// scale would distort the copied border, radius and shadow), from where it is
// and at the speed it had when started over on the way (internal/momentum).
// It slides from where it was drawn, not from the old item's new place: a
// pagination's page numbers may shift in the same commit. Resized at rest
// (the container's layout changing), it follows at once. Nothing moves on
// mount, nor until the page has been painted (a value restored as it loads).
// Under reduced motion it jumps (tabs), or crossfades: a copy of it fades out
// where it was while it fades in on the new item (pagination).

/** A box in the container's own pixels (its padding box, scrolled). */
type Box = { x: number; y: number; width: number; height: number };

type IndicatorSnapshot = Box & {
  /** Bumped when another item becomes active: only then does it slide. */
  version: number;
  item: Element;
  className: string;
  attributes: Record<string, string>;
};

// Data attributes the indicator copies from the active item, minus identity
// and interaction states (hover, press, focus) that belong to the real item.
const SKIPPED_ATTRIBUTE =
  /^data-(slot|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|react-aria-.*|key|radix-.*|composite-.*)$/;

const NONE = (value: string) => !value || value === 'none';

/**
 * An element's layout size: its border box before any transform, unrounded
 * (`offsetWidth` and `offsetHeight` are rounded to whole pixels).
 */
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

/**
 * The container's ancestors' scale: its rendered size over its layout size
 * (exact whatever the scale, 1 when there's none).
 */
function containerScale(container: HTMLElement, rect: DOMRect) {
  const { width, height } = layoutSizeOf(container);
  return {
    // Within 0.01px: the same size (getComputedStyle rounds to 6 digits).
    x: width && Math.abs(rect.width - width) > 0.01 ? rect.width / width : 1,
    y:
      height && Math.abs(rect.height - height) > 0.01
        ? rect.height / height
        : 1,
  };
}

/** A computed length (`12px`, `-50%`) in pixels; `null` when it can't tell. */
function lengthOf(value: string, size: number) {
  if (value.endsWith('%')) return (parseFloat(value) / 100) * size;
  if (value.endsWith('px') || /^-?[\d.]+$/.test(value))
    return parseFloat(value);
  return null;
}

/**
 * `box` (an element's rendered box, in its container's pixels) without the
 * element's own transforms: its `translate` (a press nudge, `-50%`), `scale`
 * and a `transform` that only scales and moves (a press scale, Motion's
 * `whileTap`). Left as it is when they rotate, skew or can't be read.
 */
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
  // Rendered: left = x + ox + tx + sx * (e - a * ox), and so on.
  return {
    x: box.x - ox - tx - sx * (e - a * ox),
    y: box.y - oy - ty - sy * (f - d * oy),
    width,
    height,
  };
}

/**
 * Where `element` lies in the container, in the container's layout pixels,
 * whatever transform an ancestor has (a dialog scaling in, for example).
 * `untransformed`: without the element's own transforms (a pressed button
 * easing back from its nudge or its scale would leave the indicator off).
 */
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

/**
 * Whether the container is drawn transformed (an ancestor scaling or tilting
 * it, like a dialog coming in): its items' boxes are read again on the next
 * frames, until it's drawn at its own size.
 */
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

/** The element the indicator covers for the active item. */
type BoxOf = (item: HTMLElement, container: HTMLElement) => Element;

/** What the indicator slides between, and how. */
type SlidingIndicatorConfig = {
  /** The item the indicator covers, if any. */
  findActive: (container: HTMLElement) => HTMLElement | null;
  /** Every item it may cover: watched for resizes. */
  items: string;
  /** Attributes whose changes may move it (besides children added or removed). */
  attributes: string[];
  /** The stylesheet hiding the active item's own surface (when copying). */
  style: { href: string; css: string };
  /** The indicator's `data-slot`, unless `surface` gives one. */
  slot: string;
  /** Under reduced motion: jumps (the default) or crossfades. */
  reducedMotion?: 'jump' | 'fade';
  /**
   * Measure the items without their own transforms (a press nudge or scale).
   */
  untransformed?: boolean;
  /**
   * The indicator's `z-index` in the container: -1 (the default) draws it
   * under everything in it; 1 draws it over what's in it, under elements
   * with a higher one (the caller raises its items).
   */
  zIndex?: number;
  /**
   * Its background changes on `transition.color` (when the stylesheet clears
   * it under a hovered item painting its own), instead of at once.
   */
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

/** Changes inside the indicator (its own classes) don't move it. */
const isInIndicator = (node: Node, slot: string) =>
  node instanceof Element && node.closest(`[data-slot="${slot}"]`) !== null;

/** The indicator's slide under way. */
type Slide = {
  animations: Animation[];
  run: Run;
  /** Where it goes. */
  to: Box;
};

const isRunning = (animation: Animation | undefined) =>
  animation !== undefined &&
  animation.playState !== 'finished' &&
  animation.playState !== 'idle';

const timeOf = (animation: Animation | undefined) =>
  Number(animation?.currentTime) || 0;

/**
 * Starts `animation` now, as it's made. Left pending, the browser would start
 * it at the frame's own time, which a long task (a heavy render) leaves
 * behind: it would skip its first frames. Its first keyframe holds until then
 * (`fill: 'backwards'`).
 */
function startNow(animation: Animation) {
  animation.startTime = performance.now();
  return animation;
}

/** Where a slide has the indicator now, on screen. */
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

/**
 * Calls `callback` on the next frame, right before it's painted: what changes
 * before (a value restored as the page loads, in an effect) is part of the
 * page as it loads, and anything later (a click, a key) comes after the paint.
 */
function onNextFrame(callback: () => void) {
  const frame = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frame);
}

/** Set on the indicator while it slides. */
const SLIDING_ATTRIBUTE = 'data-animate-ui-sliding';
/** Set on a copy of it fading out where it was (reduced motion). */
const LEAVING_ATTRIBUTE = 'data-animate-ui-leaving';

/** The positioning every indicator (and its fading copy) wears. */
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
  // The box measured is the item's border box.
  boxSizing: 'border-box',
  zIndex,
  pointerEvents: 'none',
  // The copied classes may carry a CSS transition (transition-all): the Web
  // Animations own the movement.
  transition,
});

/**
 * Crossfades under way (reduced motion): the copies fading out where the
 * indicator was, and its own fade in.
 */
type Crossfades = {
  copies: Map<HTMLElement, Animation>;
  fadeIn: Animation | null;
};

type SlidingIndicatorOptions = {
  /** Off when the user renders the library's own indicator. */
  enabled?: boolean;
  /** Transition of the slide. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
  /**
   * The indicator's own look. Without it, it copies the active item's classes
   * and data attributes, and the item's own surface is hidden.
   */
  surface?: {
    className?: string;
    style?: React.CSSProperties;
    /** Its `data-slot`. */
    slot?: string;
  };
  /** The element it covers for the active item: the item by default. */
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

/** The selection spring (stiffness 300, damping 30). */
const INDICATOR_TRANSITION: Transition = motionTokens.spring.selection;

/**
 * The sliding indicator of `container`. Render `indicator` as a child of the
 * container element, and mark the container ready (`ready`) so the
 * stylesheet hides the active item's own surface.
 */
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

  // Read by the effects below, which only run when the container changes.
  const boxOfRef = React.useRef(boxOf);
  const configRef = React.useRef(config);
  React.useLayoutEffect(() => {
    boxOfRef.current = boxOf;
    configRef.current = config;
  });

  React.useLayoutEffect(() => {
    if (!container || !enabled) return;
    // The indicator is positioned inside the container, behind its items.
    if (getComputedStyle(container).position === 'static')
      container.style.position = 'relative';
    container.style.isolation = 'isolate';

    // Drawn transformed (a dialog scaling or tilting in), the items' boxes
    // are read again on each frame until it's drawn at its own size: a
    // transform ending resizes nothing the observers see.
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
      // About 1.5s at most (a container kept transformed).
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
      // Text changing in place (a label beside the items) moves them too.
      characterData: true,
      attributes: true,
      attributeFilter: configRef.current.attributes,
    });
    // An element inside scrolling (a list overflowing) moves them too.
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

  // No indicator while disabled (the user renders the library's own).
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
  // Until the page has been painted, the indicator jumps (a value restored
  // as the page loads).
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
    // In place: on mount, until the page is painted, and resized at rest.
    if (
      !rest ||
      !paintedRef.current ||
      (visible.version === rest.version && !moving)
    ) {
      stop();
      return;
    }

    // From where it is on screen, at the speed it has. Picked up on the way,
    // it goes on from the time those were read at (on a frame's time, a
    // pending start would stall it there); from rest, it starts now.
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

    // Reduced motion, crossfading: a copy of the indicator as it was fades
    // out where it was, while the indicator fades in on the new item. Changed
    // again on the way, the indicator fading in leaves from the opacity it
    // has (copies already leaving go on), so nothing pops.
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
          // Started now, ahead of the frame's time: its first keyframe holds
          // until then, and its last until it's removed.
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
    // From its own translate (from its classes, if any) plus the offset, to
    // it: replacing it, so Chromium runs the slide on the compositor (an
    // additive animation runs on the main thread, held up by any work after
    // the commit). Added to it when it can't be read in pixels.
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
    // Its size only when the items' sizes differ: the slide stays on the
    // compositor otherwise.
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
      // Cancelled: the next slide (or none) took over.
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

  // The frame it shows in: the item's own surface is hidden without its
  // transition (shadcn's `transition-all` would fade it out over the
  // indicator, doubling its border for a moment).
  const ready = Boolean(visible && copy);
  const [settled, setSettled] = React.useState(false);
  // Hidden, then shown again: it settles again.
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
    /** The indicator is on screen, copying: the item's own surface is hidden. */
    ready,
    /** The frame it shows in: hide the item's own surface without a transition. */
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
