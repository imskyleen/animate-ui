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
import { curveFrom } from './momentum';
import {
  isRunning,
  onNextFrame,
  startNow,
  useSlidingIndicator,
  type SlidingIndicatorConfig,
  type SlidingIndicatorOptions,
} from './sliding-indicator';

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
// for the line variant, an ::after underline). The list renders a sliding
// indicator that copies the active tab (internal/sliding-indicator) while a
// small stylesheet hides the active tab's own surface, unless the caller
// gives the indicator its own look (`surface`). Animate UI's own Tabs don't
// use this file: they keep v1's motion.

/** Set on every animated tab, so the stylesheet only touches ours. */
const TAB_ATTRIBUTE = 'data-animate-ui-tab';
/** Set on the list once its indicator is on screen. */
const READY_ATTRIBUTE = 'data-animate-ui-indicator';
/** Set on the list in the frame its indicator shows in. */
const SETTLING_ATTRIBUTE = 'data-animate-ui-indicator-settling';
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
  // In the frame the indicator shows in, the active tab's own surface goes
  // without a transition (it would fade out over the indicator).
  `[${SETTLING_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{transition:none}`,
].join('');

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

const TABS_INDICATOR: SlidingIndicatorConfig = {
  findActive: findActiveTab,
  items: `[${TAB_ATTRIBUTE}]`,
  attributes: [
    'aria-selected',
    'class',
    'data-state',
    'data-active',
    'data-selected',
    'data-orientation',
    'data-disabled',
  ],
  style: { href: 'animate-ui-tabs-indicator', css: SURFACE_CSS },
  slot: 'tabs-indicator',
};

type TabsIndicatorOptions = SlidingIndicatorOptions;

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
  options: TabsIndicatorOptions = {},
) {
  const { enabled = true, surface } = options;
  const copy = !surface;
  const { indicator, ready, settling } = useSlidingIndicator(
    list,
    TABS_INDICATOR,
    options,
  );

  // The tabs' text color, paced by the tempo.
  const color = toCssTiming(useTempoTransition(motionTokens.transition.color));
  React.useLayoutEffect(() => {
    if (!list || !enabled || !copy) return;
    list.style.setProperty(COLOR_DURATION_VAR, `${color.duration}ms`);
    list.style.setProperty(COLOR_EASING_VAR, color.easing);
  }, [list, enabled, copy, color.duration, color.easing]);

  return {
    indicator,
    listProps: {
      [READY_ATTRIBUTE]: ready ? '' : undefined,
      [SETTLING_ATTRIBUTE]: settling ? '' : undefined,
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
  /**
   * Where the next panel's height starts: the last one's, as it went, and
   * the margin it left below it.
   */
  height: Extent | undefined;
  /**
   * The last panel's frame as it went, when only its content faded out: the
   * next panel's frame takes over from it, at its height.
   */
  frame: { look: string; extent: Extent } | null;
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
  /** Watches the gliding element's content, to follow it. */
  follow?: { disconnect(): void };
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
  animations.follow?.disconnect();
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
  /** The height following its content when it changes on the way. */
  follow: Transition;
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

/** Two vertical margins, collapsed into one (CSS). */
const collapse = (a: number, b: number) =>
  Math.max(a, b, 0) + Math.min(a, b, 0);

/**
 * The margin `element` leaves below it: its own, collapsed with a last
 * child's that escapes through its bottom (no bottom padding or border).
 * Gliding, min/max-height keep that child's margin inside it (CSS collapses
 * through a box's bottom only while its height is its content's), where it
 * would be clipped and everything below would jump by it as the glide starts
 * and again as it ends: the glide carries it as the element's own margin.
 * Measured by blocking the collapse (1px of bottom padding, never painted).
 */
function marginBelow(element: HTMLElement) {
  const style = getComputedStyle(element);
  const own = parseFloat(style.marginBottom) || 0;
  if (
    parseFloat(style.paddingBottom) > 0 ||
    parseFloat(style.borderBottomWidth) > 0
  )
    return own;
  // The probe goes in and out without a trace: the element's own inline
  // style is put back as it was (custom properties, priorities), and no
  // transition sees the padding change (it'd fire, and hold the old padding).
  const inline = element.getAttribute('style');
  const height = element.getBoundingClientRect().height;
  element.style.setProperty('transition', 'none', 'important');
  element.style.setProperty('padding-bottom', '1px', 'important');
  const one = element.getBoundingClientRect().height;
  element.style.setProperty('padding-bottom', '2px', 'important');
  const two = element.getBoundingClientRect().height;
  // Back, still without transitions, settled before they come back.
  element.style.removeProperty('padding-bottom');
  void getComputedStyle(element).paddingBottom;
  if (inline === null) element.removeAttribute('style');
  else element.setAttribute('style', inline);
  // A box whose height doesn't follow its content (set, or held) lets
  // nothing escape through its bottom.
  if (Math.abs(two - one - 1) > 0.25) return own;
  return collapse(own, one - 1 - height);
}

/** A box's height, and the margin it leaves below it (`marginBelow`). */
type Extent = { height: number; margin: number };

/** `element`'s extent now (a glide running included). */
const extentOf = (element: HTMLElement): Extent => ({
  height: element.offsetHeight,
  margin: marginBelow(element),
});

/**
 * Glides `target`'s height (the panel's, or its frame's) from `from` (the
 * previous one's) to its own, holding it between min-height and max-height
 * (`height` alone loses to a flex basis: shadcn's panels are `flex-1`), and
 * clipping what's inside it on the way, vertically only (a frame's own border
 * and corners stay drawn, and what overflows it sideways, a step's badge on
 * its rail, a focus ring, stays seen). One that clips already is left so. The
 * margin it leaves below glides along (`marginBelow`).
 *
 * Its own height is read as it starts, but its content can still change on
 * the way (a nested animation settling, content loaded late or added): while
 * it settles (its glide, then one follow), it follows, from where it is and
 * at the speed it has, to the new height on `follow` (`spring.morph`: never
 * past it), rather than ending on a stale height and jumping to the real one.
 * Content that keeps resizing past that isn't chased: the glide ends and the
 * panel takes its content's height again.
 */
function glideHeight(
  panel: HTMLElement,
  target: HTMLElement,
  from: Extent,
  timing: CssTiming,
  follow: Transition,
) {
  const animations = animationsOf(panel);
  animations.height?.cancel();
  animations.height = undefined;
  animations.follow?.disconnect();
  animations.follow = undefined;
  const to = extentOf(target);
  if (!(to.height > 0)) return;
  const style = getComputedStyle(target);
  const own = parseFloat(style.marginBottom) || 0;
  const inset =
    style.boxSizing === 'border-box'
      ? 0
      : parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);
  const clip =
    style.overflowY === 'visible' ? { overflowY: ['clip', 'clip'] } : {};
  const run = (start: Extent, end: Extent, options: CssTiming) => {
    const sizes = [`${start.height - inset}px`, `${end.height - inset}px`];
    // Only when a margin escapes it (shadcn's flex panels and Cards: none).
    const margin =
      Math.abs(start.margin - own) > 0.5 || Math.abs(end.margin - own) > 0.5
        ? { marginBottom: [`${start.margin}px`, `${end.margin}px`] }
        : {};
    const animation = startNow(
      target.animate(
        { minHeight: sizes, maxHeight: sizes, ...margin, ...clip },
        { ...options, fill: 'backwards' },
      ),
    );
    animations.height = animation;
    return animation;
  };
  const same = (a: Extent, b: Extent) =>
    Math.abs(a.height - b.height) <= 0.5 &&
    Math.abs(a.margin - b.margin) <= 0.5;
  // Where it's headed (or rests, once there).
  let end = to;
  // Already its height: nothing to glide, but still followed.
  let glide: Animation | null = same(from, to) ? null : run(from, to, timing);
  // When a follow last started at rest (the panel at its content's height).
  let rested = -Infinity;

  // Its content changed while the switch settles: from where the glide is
  // and at the speed it goes (or from its last height, at rest), to its
  // extent now (the glide cancelled and started again in the same task:
  // never painted).
  const check = () => {
    if (animations.height !== (glide ?? undefined)) return watch.disconnect();
    let now = end;
    let velocity = 0;
    let elapsed = 0;
    const running = !!glide && glide.playState !== 'finished';
    if (glide && running) {
      elapsed = Number(glide.currentTime ?? 0);
      now = {
        height: target.offsetHeight,
        margin: parseFloat(getComputedStyle(target).marginBottom) || 0,
      };
      const step = Math.min(elapsed, 8);
      glide.currentTime = elapsed - step;
      velocity = step > 0 ? (now.height - target.offsetHeight) / step : 0;
      glide.cancel();
    }
    const natural = extentOf(target);
    if (same(natural, end)) {
      // The same after all: the same glide, from where it was.
      if (glide && running) {
        glide.play();
        glide.currentTime = elapsed;
      }
      return;
    }
    // At rest, content resizing again within a few frames animates its own
    // height (an accordion opening, a CSS transition, a list entering):
    // chased, the panel would lag behind it and clip it. It's let go (its
    // glide cancelled above): the panel takes its content's height, as once
    // the switch has settled. Content arriving in one go still glides.
    const time = performance.now();
    if (time - rested < 50) {
      animations.height = undefined;
      return watch.disconnect();
    }
    if (!running) rested = time;
    end = natural;
    const curve = curveFrom(follow, [now.height - natural.height], [velocity]);
    glide = run(now, natural, {
      duration: curve.duration,
      easing: curve.easing,
    });
  };
  // A ResizeObserver sees the children it watches resize; content added as
  // a new child, as text, or inside an inline child (always 0 by 0 to it)
  // shows up as a mutation.
  // Its first report is checked too: content its own ResizeObserver sizes in
  // the frame the panel shows (a chart, a canvas) is only reported here, and
  // `check` measures the content itself: nothing happens when nothing
  // changed.
  const resize = new ResizeObserver(check);
  const mutation = new MutationObserver((records) => {
    for (const record of records)
      if (record.target === target)
        for (const node of record.addedNodes)
          if (node instanceof Element) resize.observe(node);
    check();
  });
  for (const child of target.children) resize.observe(child);
  mutation.observe(target, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  // Followed while the switch settles (its glide, then one follow): content
  // that keeps resizing isn't chased, clipped, for as long as it shows.
  const timer = setTimeout(
    () => watch.disconnect(),
    timing.duration + toCssTiming(follow).duration,
  );
  const watch = {
    disconnect() {
      clearTimeout(timer);
      resize.disconnect();
      mutation.disconnect();
    },
  };
  animations.follow = watch;
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
  const follow = useTempoTransition(motionTokens.spring.morph);
  const timings: PanelTimings = {
    in: toCssTiming(reduce ? quickFade : enter),
    out: toCssTiming(leave),
    height: toCssTiming(height),
    follow,
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
    if (frame && left)
      glideHeight(element, frame, left.extent, timings.height, timings.follow);
    else if (stage.height !== undefined)
      glideHeight(
        element,
        element,
        stage.height,
        timings.height,
        timings.follow,
      );
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
        stage.height = extentOf(element);
        stage.frame = frame
          ? { look: lookOf(frame), extent: extentOf(frame) }
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
