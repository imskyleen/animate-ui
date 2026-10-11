'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import type { Transition } from 'motion/react';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
  type CssTiming,
} from '../utils/motion';
import { curveFrom, velocityOf, INSTANT, type Run } from './momentum';

// Shared by the Radix UI, Base UI and React Aria tabs, and by Animate UI's own
// Tabs. They move like Motion's Radix tabs example
// (motion.dev/examples/react-radix-tabs):
// - One indicator slides from tab to tab on `spring.selection`. Started over
//   on the way (quick clicks, arrow keys), it goes on from where it is, with
//   the speed it had. It runs on Web Animations (its `translate` on the
//   compositor), never on the panels' layout: nothing they do holds it up.
// - The tabs' text color changes on `transition.color` (200ms, `ease`).
// - The panels change one after the other, like AnimatePresence's
//   mode="wait": the outgoing panel fades out into a 5px blur on
//   `transition.panelOut` (150ms, ease-out), staying in the page; once it's
//   gone, the incoming one fades in from the blur on `transition.panelIn`
//   (300ms) while its height glides from the outgoing panel's to its own on
//   `transition.panelHeight` (Motion's layout curve, 450ms, no overshoot).
// - Nothing moves on page load. Under reduced motion the indicator and the
//   height jump; the panels still go one after the other, fading only (no
//   blur), the incoming one on `transition.fade`.
// Keyboard changes animate like clicks.

/* Indicator --------------------------------------------------------------- */

// shadcn/ui styles the active tab itself (its background, border, shadow and,
// for the line variant, an ::after underline). To make that surface slide
// without touching the component, the list renders an indicator that copies
// the active tab's classes and data attributes (so it looks exactly like the
// active tab, in every style and theme) and sits behind the tabs, while a
// small stylesheet hides the active tab's own surface, unless the caller
// gives the indicator its own look (`surface`). Animate UI's own Tabs don't
// use this file: they keep v1's motion.

/** Set on every animated tab, so the stylesheet only touches ours. */
const TAB_ATTRIBUTE = 'data-animate-ui-tab';
/** Set on the list once its indicator is on screen. */
const READY_ATTRIBUTE = 'data-animate-ui-indicator';
/** The tabs' text color transition, on the list (paced by the tempo). */
const COLOR_DURATION_VAR = '--animate-ui-tab-color-duration';
const COLOR_EASING_VAR = '--animate-ui-tab-color-easing';

// Unlayered, so it wins over Tailwind's layered utilities. The focus ring of
// a keyboard-focused tab (border and box-shadow) stays on the tab.
const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{background-color:transparent;background-image:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]::after{opacity:0}`,
  // The tabs change their colors on `transition.color`, whatever their own
  // transition (shadcn's `transition-all`, 150ms).
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}]{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke;transition-duration:var(${COLOR_DURATION_VAR},.2s);transition-timing-function:var(${COLOR_EASING_VAR},ease)}`,
].join('');

// Data attributes the indicator copies from the active tab, minus identity and
// interaction states (hover, press, focus) that belong to the real tab.
const SKIPPED_ATTRIBUTE =
  /^data-(slot|animate-ui-.*|hovered|pressed|focused|focus-visible|highlighted|rac|key|radix-.*|composite-.*)$/;

const INDICATOR_SLOT = 'tabs-indicator';

/** The selection spring (stiffness 300, damping 30). */
const INDICATOR_TRANSITION: Transition = motionTokens.spring.selection;

/** A box in the list's own pixels (its padding box, scrolled). */
type Box = { x: number; y: number; width: number; height: number };

type IndicatorSnapshot = Box & {
  /** Bumped when another tab becomes active: only then does it slide. */
  version: number;
  tab: Element;
  className: string;
  attributes: Record<string, string>;
};

function findActiveTab(list: HTMLElement) {
  for (const tab of list.querySelectorAll(`[${TAB_ATTRIBUTE}]`)) {
    if (
      tab.getAttribute('aria-selected') === 'true' &&
      tab.closest('[role="tablist"]') === list
    )
      return tab as HTMLElement;
  }
  return null;
}

/**
 * Where `element` lies in the list, in the list's layout pixels, whatever
 * transform an ancestor has (a dialog scaling in, for example).
 */
function boxIn(list: HTMLElement, element: Element): Box {
  const listRect = list.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const scaleX = list.offsetWidth ? listRect.width / list.offsetWidth : 1;
  const scaleY = list.offsetHeight ? listRect.height / list.offsetHeight : 1;
  return {
    x: (rect.left - listRect.left) / scaleX - list.clientLeft + list.scrollLeft,
    y: (rect.top - listRect.top) / scaleY - list.clientTop + list.scrollTop,
    width: rect.width / scaleX,
    height: rect.height / scaleY,
  };
}

const sameBox = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) < 0.01 &&
  Math.abs(a.y - b.y) < 0.01 &&
  Math.abs(a.width - b.width) < 0.01 &&
  Math.abs(a.height - b.height) < 0.01;

function readSnapshot(
  list: HTMLElement,
  previous: IndicatorSnapshot | null,
  { copy, boxOf }: { copy: boolean; boxOf?: BoxOf },
): IndicatorSnapshot | null {
  const tab = findActiveTab(list);
  if (!tab) return null;

  const box = boxIn(list, boxOf?.(tab, list) ?? tab);
  const attributes: Record<string, string> = {};
  if (copy) {
    for (const { name, value } of tab.attributes) {
      if (name.startsWith('data-') && !SKIPPED_ATTRIBUTE.test(name))
        attributes[name] = value;
    }
  }
  const className = copy ? (tab.getAttribute('class') ?? '') : '';

  if (
    previous &&
    previous.tab === tab &&
    sameBox(previous, box) &&
    previous.className === className &&
    JSON.stringify(previous.attributes) === JSON.stringify(attributes)
  )
    return previous;

  return {
    version:
      previous && previous.tab !== tab
        ? previous.version + 1
        : (previous?.version ?? 0),
    tab,
    ...box,
    className,
    attributes,
  };
}

/** Changes inside the indicator (its own classes) don't move it. */
const isInIndicator = (node: Node, slot: string) =>
  node instanceof Element && node.closest(`[data-slot="${slot}"]`) !== null;

/** The element the indicator covers for the active tab. */
type BoxOf = (tab: HTMLElement, list: HTMLElement) => Element;

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

type TabsIndicatorOptions = {
  /** Off when the user renders the library's own indicator. */
  enabled?: boolean;
  /** Transition of the slide. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
  /**
   * The indicator's own look. Without it, it copies the
   * active tab's classes and data attributes, and the tab's own surface is
   * hidden.
   */
  surface?: {
    className?: string;
    style?: React.CSSProperties;
    /** Its `data-slot`. */
    slot?: string;
  };
  /** The element it covers for the active tab: the tab by default. */
  boxOf?: BoxOf;
};

/**
 * The sliding indicator of a tab list. Render `indicator` as a child of the
 * list element and spread `listProps` on it.
 *
 * A single surface: another tab becoming active slides it there on a spring
 * (Web Animations: `translate`, and its size when the tabs' differ: a scale
 * would distort the copied border, radius and shadow), on from where it is
 * and at the speed it had when started over on the way. Resized at rest (the
 * list's layout changing), it follows at once. Under reduced motion, and
 * until the page has been painted (a value restored on load), it jumps.
 */
function useTabsIndicator(
  list: HTMLElement | null,
  { enabled = true, transition, surface, boxOf }: TabsIndicatorOptions = {},
) {
  const [snapshot, setSnapshot] = React.useState<IndicatorSnapshot | null>(
    null,
  );
  const copy = !surface;
  const slot = surface?.slot ?? INDICATOR_SLOT;

  // Read by the effects below, which only run when the list changes.
  const boxOfRef = React.useRef(boxOf);
  React.useLayoutEffect(() => {
    boxOfRef.current = boxOf;
  });

  React.useLayoutEffect(() => {
    if (!list || !enabled) return;
    // The indicator is positioned inside the list, behind its tabs.
    if (getComputedStyle(list).position === 'static')
      list.style.position = 'relative';
    list.style.isolation = 'isolate';

    const update = () =>
      setSnapshot((previous) =>
        readSnapshot(list, previous, { copy, boxOf: boxOfRef.current }),
      );
    const resize = new ResizeObserver(update);
    const observeTabs = () => {
      resize.observe(list);
      for (const tab of list.querySelectorAll<HTMLElement>(
        `[${TAB_ATTRIBUTE}]`,
      )) {
        resize.observe(tab);
        const box = boxOfRef.current?.(tab, list);
        if (box && box !== tab) resize.observe(box);
      }
    };
    const mutations = new MutationObserver((records) => {
      if (records.every((r) => isInIndicator(r.target, slot))) return;
      observeTabs();
      update();
    });
    mutations.observe(list, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'aria-selected',
        'class',
        'data-state',
        'data-active',
        'data-selected',
        'data-orientation',
        'data-disabled',
      ],
    });
    observeTabs();
    update();

    return () => {
      mutations.disconnect();
      resize.disconnect();
    };
  }, [list, enabled, copy, slot]);

  // The tabs' text color, paced by the tempo.
  const color = toCssTiming(useTempoTransition(motionTokens.transition.color));
  React.useLayoutEffect(() => {
    if (!list || !enabled || !copy) return;
    list.style.setProperty(COLOR_DURATION_VAR, `${color.duration}ms`);
    list.style.setProperty(COLOR_EASING_VAR, color.easing);
  }, [list, enabled, copy, color.duration, color.easing]);

  // No indicator while disabled (the user renders the library's own).
  const visible = list && enabled ? snapshot : null;

  const slideTransition = useTempoTransition(
    transition ?? INDICATOR_TRANSITION,
  );
  const reduce = useShouldReduceMotion();
  const latestRef = React.useRef({ slideTransition, reduce });
  React.useLayoutEffect(() => {
    latestRef.current = { slideTransition, reduce };
  });

  const indicatorRef = React.useRef<HTMLSpanElement | null>(null);
  const slideRef = React.useRef<Slide | null>(null);
  const restRef = React.useRef<{ version: number; box: Box } | null>(null);
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
    };
    if (!element || !visible) {
      stop();
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
    restRef.current = { version: visible.version, box: to };
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

    const { slideTransition, reduce } = latestRef.current;
    const curve = reduce
      ? INSTANT
      : curveFrom(slideTransition, offset, velocity);
    if (curve.duration <= 0) return;
    const timing: KeyframeAnimationOptions = {
      duration: curve.duration,
      easing: curve.easing,
      fill: 'backwards',
    };
    const animations = [
      // Added to a translate of its own (from its classes).
      element.animate(
        [
          { translate: `${offset[0]}px ${offset[1]}px` },
          { translate: '0px 0px' },
        ],
        { ...timing, composite: 'add' },
      ),
    ];
    // Its size only when the tabs' sizes differ: the slide stays on the
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
    slideRef.current = { animations, run: { offset, curve }, to };
  }, [visible]);

  React.useEffect(
    () => () => {
      slideRef.current?.animations.forEach((animation) => animation.cancel());
    },
    [],
  );

  const indicator = visible ? (
    <>
      {copy && (
        <style href="animate-ui-tabs-indicator" precedence="animate-ui">
          {SURFACE_CSS}
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
          position: 'absolute',
          left: visible.x,
          top: visible.y,
          right: 'auto',
          bottom: 'auto',
          width: visible.width,
          height: visible.height,
          margin: 0,
          zIndex: -1,
          pointerEvents: 'none',
          // The copied classes may carry a CSS transition (transition-all):
          // the Web Animations own the movement.
          transition: 'none',
        }}
      />
    </>
  ) : null;

  return {
    indicator,
    listProps: {
      [READY_ATTRIBUTE]: visible && copy ? '' : undefined,
    } as Record<string, string | undefined>,
  };
}

/* Panels ------------------------------------------------------------------ */

// The panels of one tabs share a stage (by the element holding them: the tabs
// root, usually), where one panel shows at a time. The outgoing panel keeps
// it while it leaves; the incoming one waits, hidden, until it's free, then
// comes in. Each library keeps a leaving panel mounted its own way (see the
// adapters): Radix through `forceMount`, Base UI and React Aria waiting for
// its running animations (one held on the panel from the commit it leaves
// in, before they look).
//
// Frames: shadcn's panels each hold a bordered Card. Fading whole panels
// would fade one Card's border out and the next one's in (it blinks), and
// gliding the panel's height would clip the Card's bottom edge. As in
// Motion's example, where the bordered box stays and only what's inside it
// changes, a panel's frame (the panel itself if it paints a box, or else the
// first element down a chain of single children that does: the Card) stays
// on screen: only its content fades out, the next panel's frame takes over at
// the same height in the same frame, then glides to its own height while its
// content fades in, clipping its content and never its own border or
// corners. Panels without a frame, with frames that don't look alike, or
// with text right inside the frame, fade whole.

/** Held on a leaving panel (no visual effect): what libraries wait for. */
const HOLD_PROPERTY = '--animate-ui-tab-leaving';

type PanelStage = {
  /** The panel on screen: shown, coming in, or leaving. */
  current: object | null;
  /** A panel has been shown: the next ones come in (not the first). */
  shown: boolean;
  /** Where the next panel's height starts: the last one's, as it went. */
  height: number | undefined;
  /**
   * The last panel's frame as it went, when only its content faded out: the
   * next panel's frame takes over from it, at its height.
   */
  frame: { look: string; height: number } | null;
  /** The panel shown last: where the next one comes from. */
  last: HTMLElement | null;
  /** The panels, and which is selected: the one coming in. */
  panels: Map<object, { element: HTMLElement; selected: boolean }>;
  /** Panels waiting for the stage to be free. */
  waiting: Set<() => void>;
  /** The page has been painted: before, changes are instant. */
  painted: boolean;
};

const stages = new WeakMap<Element, PanelStage>();

function stageOf(holder: Element) {
  let stage = stages.get(holder);
  if (!stage) {
    const created: PanelStage = {
      current: null,
      shown: false,
      height: undefined,
      frame: null,
      last: null,
      panels: new Map(),
      waiting: new Set(),
      painted: false,
    };
    onNextFrame(() => (created.painted = true));
    stages.set(holder, created);
    stage = created;
  }
  return stage;
}

/** The stage is free: the panel waiting comes in. */
function release(stage: PanelStage, token: object) {
  if (stage.current !== token) return;
  stage.current = null;
  for (const go of [...stage.waiting]) go();
}

/* Frames */

const TRANSPARENT = /^transparent$|[,/]\s*0(?:\.0*)?\s*\)$/;
const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;

/** It draws a box: a border, a background or a shadow. */
function paintsBox(style: CSSStyleDeclaration) {
  return (
    SIDES.some(
      (side) =>
        parseFloat(style[`border${side}Width`]) > 0 &&
        style[`border${side}Style`] !== 'none' &&
        !TRANSPARENT.test(style[`border${side}Color`]),
    ) ||
    !TRANSPARENT.test(style.backgroundColor) ||
    style.backgroundImage !== 'none' ||
    style.boxShadow !== 'none'
  );
}

const hasText = (element: Element) =>
  Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );

/**
 * The panel's frame: the panel if it paints a box, or else the first element
 * down a chain of single children that does (shadcn's Card). None when the
 * chain branches first, or when the frame holds text of its own (only
 * elements can fade inside it).
 */
function frameOf(panel: HTMLElement): HTMLElement | null {
  let element: Element = panel;
  for (;;) {
    if (!(element instanceof HTMLElement)) return null;
    if (paintsBox(getComputedStyle(element)))
      return hasText(element) ? null : element;
    const [child] = element.children;
    if (element.children.length !== 1 || !child || hasText(element))
      return null;
    element = child;
  }
}

const LOOK = [
  ...SIDES.flatMap((side) => [
    `border-${side.toLowerCase()}-width`,
    `border-${side.toLowerCase()}-style`,
    `border-${side.toLowerCase()}-color`,
  ]),
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background-color',
  'background-image',
  'box-shadow',
];

/** How a frame looks: one can take over from another that looks the same. */
function lookOf(frame: HTMLElement) {
  const style = getComputedStyle(frame);
  return LOOK.map((property) => style.getPropertyValue(property)).join('|');
}

/* Animations */

/** A panel's running animations. */
type PanelAnimations = {
  /** Its fades, by element: the panel, or its frame's content. */
  fades: Map<Element, Animation>;
  /** What its last fade moved: the panel, or its frame's content. */
  targets: Element[];
  /** The frame whose content its last fade moved, if any. */
  frame: HTMLElement | null;
  /** Fading out: picked again, it comes back from where it is. */
  leaving: boolean;
  /** Held while it leaves: what Base UI and React Aria wait for. */
  hold?: Animation;
  /** Its height gliding: the panel's, or its frame's. */
  height?: Animation;
};

const panelAnimations = new WeakMap<Element, PanelAnimations>();

function animationsOf(panel: Element) {
  let animations = panelAnimations.get(panel);
  if (!animations) {
    animations = { fades: new Map(), targets: [], frame: null, leaving: false };
    panelAnimations.set(panel, animations);
  }
  return animations;
}

function cancelAll(panel: Element) {
  const animations = panelAnimations.get(panel);
  if (!animations) return;
  for (const fade of animations.fades.values()) fade.cancel();
  animations.hold?.cancel();
  animations.height?.cancel();
  panelAnimations.delete(panel);
}

/** A direction on screen: x and y, each -1, 0 or 1. */
type Way = [number, number];

/**
 * Which way the content travels going from the panel `from` to `to`: toward
 * the end for a later tab (in the panels' order), along the tabs' axis
 * (vertical tabs: down), mirrored right to left. None without both.
 */
function wayOf(holder: Element, from: Element | null, to: Element | null) {
  if (!from?.isConnected || !to?.isConnected || from === to) return null;
  const later =
    from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING
      ? 1
      : -1;
  // The tabs' list: in the element holding the panels, or around it
  // (Animate UI's panels are in TabsContents).
  let list: Element | null = null;
  for (let around: Element | null = holder; around && !list;)
    [list, around] = [
      around.querySelector('[role="tablist"]'),
      around.parentElement,
    ];
  const vertical =
    list?.getAttribute('aria-orientation') === 'vertical' ||
    list?.getAttribute('data-orientation') === 'vertical';
  if (vertical) return [0, later] as Way;
  const rtl = getComputedStyle(list ?? holder).direction === 'rtl';
  return [rtl ? -later : later, 0] as Way;
}

/** Its opacity, filter and translate on screen now (a fade running included). */
function shownNow(element: Element, blur: boolean, move: boolean): Keyframe {
  const style = getComputedStyle(element);
  const shown: Keyframe = { opacity: style.opacity };
  if (blur) shown.filter = style.filter === 'none' ? 'blur(0px)' : style.filter;
  if (move)
    shown.translate = style.translate === 'none' ? '0px 0px' : style.translate;
  return shown;
}

/** Faded out: blurred, and `shift.tabs` that way. */
function gone(blur: boolean, way: Way | null): Keyframe {
  const hidden: Keyframe = { opacity: 0 };
  if (blur) hidden.filter = motionTokens.blur.panel;
  if (way) {
    const [x, y] = way.map((side) => side * motionTokens.shift.tabs);
    hidden.translate = `${x}px ${y}px`;
  }
  return hidden;
}

const POSITIONED = ['absolute', 'fixed'];

/**
 * A blur (`filter`) would make `target` the containing block of what's
 * positioned inside it against an element outside it (Fumadocs' step badge,
 * on its steps' rail): it would move. Such content fades without the blur.
 * Content positioned against something inside it stays where it is (the
 * search stops at positioned elements).
 */
function anchorsOutside(target: Element) {
  if (getComputedStyle(target).position !== 'static') return false;
  const stack = [target];
  while (stack.length) {
    const element = stack.pop()!;
    for (const pseudo of ['::before', '::after'])
      if (POSITIONED.includes(getComputedStyle(element, pseudo).position))
        return true;
    for (const child of element.children) {
      const position = getComputedStyle(child).position;
      if (POSITIONED.includes(position)) return true;
      if (position === 'static') stack.push(child);
    }
  }
  return false;
}

/**
 * How it fades: with the blur and the slide, but not under reduced motion,
 * nor when `anchorsOutside` (a `translate` would move that content too).
 */
function effectsOf(target: Element, timings: PanelTimings) {
  const plain = anchorsOutside(target);
  return { blur: timings.blur && !plain, move: timings.shift && !plain };
}

type PanelTimings = {
  in: CssTiming;
  out: CssTiming;
  height: CssTiming;
  /** Off under reduced motion: fades only. */
  blur: boolean;
  /** Off under reduced motion. */
  glide: boolean;
  /** Off under reduced motion: the content doesn't slide. */
  shift: boolean;
};

/** What fades: the frame's content, or the whole panel. */
const targetsOf = (panel: HTMLElement, frame: HTMLElement | null) =>
  frame ? Array.from(frame.children) : [panel];

/**
 * Fades `targets` (a panel, or its frame's content) on the keyframes
 * `keyframes` gives each (all read before any fade is stopped), with
 * `options`.
 */
function fade(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  keyframes: (target: Element) => Keyframe[],
  options: KeyframeAnimationOptions,
  leaving: boolean,
) {
  const animations = animationsOf(panel);
  const frames = targets.map(keyframes);
  targets.forEach((target, i) => {
    animations.fades.get(target)?.cancel();
    animations.fades.set(target, startNow(target.animate(frames[i]!, options)));
  });
  animations.targets = targets;
  animations.frame = frame;
  animations.leaving = leaving;
}

/**
 * Fades a panel (or its frame's content) in: from hidden, or from where its
 * fade has it. To its own opacity and filter (none): the blur is gone at
 * rest, where `filter` would make it the containing block of its fixed
 * descendants.
 */
function fadeIn(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  timings: PanelTimings,
  /** Comes in from hidden, `shift.tabs` that way; else from where it is. */
  from: { way: Way | null } | null,
) {
  const animations = animationsOf(panel);
  animations.hold?.cancel();
  animations.hold = undefined;
  fade(
    panel,
    targets,
    frame,
    (target) => {
      const { blur, move } = effectsOf(target, timings);
      const start = from
        ? gone(blur, move ? from.way : null)
        : shownNow(target, blur, move);
      return [{ ...start, offset: 0 }];
    },
    {
      duration: timings.in.duration,
      easing: timings.in.easing,
      fill: 'backwards',
    },
    false,
  );
}

/** Fades a panel (or its frame's content) out, from where it is, and stays out. */
function fadeOut(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  timings: PanelTimings,
  /** Where the content goes: away from the next one's side. */
  way: Way | null,
) {
  fade(
    panel,
    targets,
    frame,
    (target) => {
      const { blur, move } = effectsOf(target, timings);
      const away = move && way ? ([-way[0], -way[1]] as Way) : null;
      return [shownNow(target, blur, move), gone(blur, away)];
    },
    {
      duration: timings.out.duration,
      easing: timings.out.easing,
      fill: 'both',
    },
    true,
  );
}

/**
 * Glides `target`'s height (the panel's, or its frame's) from `from` (the
 * previous one's) to its own, holding it between min-height and max-height
 * (`height` alone loses to a flex basis: shadcn's panels are `flex-1`), and
 * clipping what's inside it on the way, vertically only (a frame's own border
 * and corners stay drawn, and what overflows it sideways, a step's badge on
 * its rail, a focus ring, stays seen). One that clips already is left so.
 */
function glideHeight(
  panel: HTMLElement,
  target: HTMLElement,
  from: number,
  timing: CssTiming,
) {
  const animations = animationsOf(panel);
  animations.height?.cancel();
  animations.height = undefined;
  const to = target.offsetHeight;
  if (!(to > 0) || Math.abs(from - to) <= 0.5) return;
  const style = getComputedStyle(target);
  const inset =
    style.boxSizing === 'border-box'
      ? 0
      : parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);
  const start = `${from - inset}px`;
  const end = `${to - inset}px`;
  const clip =
    style.overflowY === 'visible' ? { overflowY: ['clip', 'clip'] } : {};
  animations.height = startNow(
    target.animate(
      { minHeight: [start, end], maxHeight: [start, end], ...clip },
      { ...timing, fill: 'backwards' },
    ),
  );
}

/** The panel coming in (selected), other than `token`'s. */
const nextOf = (stage: PanelStage, token: object) =>
  [...stage.panels].find(
    ([other, entry]) => other !== token && entry.selected,
  )?.[1].element ?? null;

/**
 * The frame whose content fades as `panel` leaves, or null to fade it whole:
 * the panel coming in must have a frame that looks the same, and a panel
 * still fading in whole leaves whole.
 */
function leavingFrame(panel: HTMLElement, next: HTMLElement | null) {
  const animations = panelAnimations.get(panel);
  if (
    animations &&
    !animations.frame &&
    [...animations.fades.values()].some(isRunning)
  )
    return null;
  const frame = frameOf(panel);
  if (!frame) return null;
  const nextFrame = next ? frameOf(next) : null;
  return nextFrame && lookOf(nextFrame) === lookOf(frame) ? frame : null;
}

/** Displayed: not `hidden`, not `display: none` (a user's CSS). */
const isDisplayed = (element: HTMLElement) =>
  element.getClientRects().length > 0;

type PanelMotionOptions = {
  /**
   * The incoming panel's transition: its fade, and in `height` its height
   * (else `heightTransition`, else the whole transition).
   */
  transition?: Transition;
  /** The outgoing panel's fade. */
  exitTransition?: Transition;
  /** The height's transition when `transition` has no `height`. */
  heightTransition?: Transition;
};

/**
 * A tab panel's motion. Pass `ref` to the panel's element, and:
 *
 * - keep it mounted and visible while `leaving` (its content fades out in the
 *   page);
 * - hide it while `waiting` (selected, the previous panel still leaving);
 * - hide it otherwise when it isn't `selected`, as its library does.
 *
 * The first panel shown (page load) doesn't animate, nor does anything before
 * the page is painted (a value restored on load).
 */
function usePanelMotion(
  selected: boolean,
  { transition, exitTransition, heightTransition }: PanelMotionOptions = {},
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [token] = React.useState(() => ({}));
  const [exit, setExit] = React.useState<'open' | 'leaving' | 'closed'>(
    selected ? 'open' : 'closed',
  );
  const [waiting, setWaiting] = React.useState(false);

  // While rendering, so a library that unmounts an unselected panel at once
  // (Radix) keeps it mounted from the very commit it leaves in.
  if (selected && exit !== 'open') setExit('open');
  // A panel that never showed (it was waiting) has nothing to fade out.
  if (!selected && exit === 'open') setExit(waiting ? 'closed' : 'leaving');
  if (!selected && waiting) setWaiting(false);

  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(
    transition ?? motionTokens.transition.panelIn,
  );
  const leave = useTempoTransition(
    exitTransition ?? motionTokens.transition.panelOut,
  );
  const height = useTempoTransition(
    (transition as { height?: Transition } | undefined)?.height ??
      heightTransition ??
      transition ??
      motionTokens.transition.panelHeight,
  );
  const quickFade = useTempoTransition(motionTokens.transition.fade);
  const timings: PanelTimings = {
    in: toCssTiming(reduce ? quickFade : enter),
    out: toCssTiming(leave),
    height: toCssTiming(height),
    blur: !reduce,
    glide: !reduce,
    shift: !reduce,
  };
  // Read by the effects below, which only run when the panel changes.
  const timingsRef = React.useRef(timings);
  React.useLayoutEffect(() => {
    timingsRef.current = timings;
  });
  const stageRef = React.useRef<PanelStage | null>(null);

  // Tells the stage which panel is selected: a panel leaving fades its
  // frame's content only if the one coming in has a frame like it.
  React.useLayoutEffect(() => {
    const element = ref.current;
    const holder = element?.parentElement;
    if (!element || !holder) return;
    const stage = stageOf(holder);
    stage.panels.set(token, { element, selected });
    return () => {
      stage.panels.delete(token);
    };
  });

  // Selected: takes the stage, or waits for it.
  React.useLayoutEffect(() => {
    const element = ref.current;
    const holder = element?.parentElement;
    if (!selected || !element || !holder) return;
    const stage = stageOf(holder);
    stageRef.current = stage;

    if (waiting) {
      const go = () => setWaiting(false);
      // Freed in the meantime.
      if (!stage.current) go();
      else stage.waiting.add(go);
      return () => {
        stage.waiting.delete(go);
      };
    }

    if (stage.current && stage.current !== token) {
      // The previous panel is still on screen: wait for it to go.
      setWaiting(true);
      return;
    }

    const timings = timingsRef.current;
    if (stage.current === token) {
      // Picked again while leaving: back from where its fade has it.
      const own = panelAnimations.get(element);
      if (own?.leaving) fadeIn(element, own.targets, own.frame, timings, null);
      return;
    }

    stage.current = token;
    // From the side of the panel shown before it.
    const way = wayOf(holder, stage.last, element);
    stage.last = element;
    const comesIn = stage.shown && stage.painted;
    stage.shown = true;
    const left = stage.frame;
    stage.frame = null;
    if (!comesIn || typeof element.animate !== 'function') return;
    // Its frame takes over from the previous one, at its height, when they
    // look the same: only its content fades in. Else it comes in whole.
    const candidate = left ? frameOf(element) : null;
    const frame =
      left && candidate && lookOf(candidate) === left.look ? candidate : null;
    fadeIn(element, targetsOf(element, frame), frame, timings, { way });
    if (!timings.glide) return;
    if (frame && left) glideHeight(element, frame, left.height, timings.height);
    else if (stage.height !== undefined)
      glideHeight(element, element, stage.height, timings.height);
  }, [selected, waiting, token]);

  // Leaving: fades out in the page, then frees the stage.
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (exit !== 'leaving') return;
    const stage = stageRef.current;
    let cancelled = false;
    const goes = () => {
      setExit('closed');
      if (stage) release(stage, token);
    };
    if (
      !element ||
      !stage ||
      stage.current !== token ||
      !stage.painted ||
      !isDisplayed(element) ||
      typeof element.animate !== 'function'
    ) {
      // Nothing to see leave: it goes at once.
      if (element) cancelAll(element);
      if (stage?.current === token) {
        stage.height = undefined;
        stage.frame = null;
      }
      goes();
      return;
    }

    // Held on the panel for as long as it leaves, from this commit: Base UI
    // and React Aria wait for it before removing the panel.
    const timings = timingsRef.current;
    const animations = animationsOf(element);
    animations.hold?.cancel();
    const hold = startNow(
      element.animate(
        { [HOLD_PROPERTY]: ['1', '1'] },
        { duration: timings.out.duration },
      ),
    );
    animations.hold = hold;
    // What fades depends on the panel coming in (its frame): known once
    // every panel of this commit has told the stage whether it's selected.
    queueMicrotask(() => {
      if (cancelled) return;
      const next = nextOf(stage, token);
      const frame = leavingFrame(element, next);
      const way = element.parentElement
        ? wayOf(element.parentElement, element, next)
        : null;
      fadeOut(element, targetsOf(element, frame), frame, timings, way);
    });
    hold.finished.then(
      () => {
        if (cancelled) return;
        // Its height as it goes (gliding still, maybe): the next one's starts
        // there, and its frame's, when only its content faded.
        const frame = panelAnimations.get(element)?.frame ?? null;
        stage.height = element.offsetHeight;
        stage.frame = frame
          ? { look: lookOf(frame), height: frame.offsetHeight }
          : null;
        // Hidden (or unmounted) in the same commit as the next one shows,
        // before the frame is painted.
        // eslint-disable-next-line @eslint-react/dom-no-flush-sync
        flushSync(goes);
        cancelAll(element);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [exit, token]);

  // Unmounted while on screen: the stage is free.
  React.useLayoutEffect(
    () => () => {
      const stage = stageRef.current;
      if (stage) release(stage, token);
      if (ref.current) cancelAll(ref.current);
    },
    [token],
  );

  return {
    ref,
    /** Selected, waiting for the previous panel to leave: hide it. */
    waiting: selected && waiting,
    /** No longer selected, fading out: keep it mounted and visible. */
    leaving: exit === 'leaving',
  };
}

export {
  TAB_ATTRIBUTE,
  useTabsIndicator,
  usePanelMotion,
  type TabsIndicatorOptions,
  type PanelMotionOptions,
};
