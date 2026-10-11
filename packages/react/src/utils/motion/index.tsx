'use client';

import * as React from 'react';
import {
  createGeneratorEasing,
  generateLinearEasing,
  MotionConfig,
  MotionConfigContext,
  spring as springGenerator,
  type Transition,
} from 'motion/react';

/**
 * Animate UI motion tokens: one value per motion role, shared by every
 * primitive, so two components that do the same thing move the same way.
 *
 * Springs first: nearly everything moves on a spring (stiffness / damping),
 * which carries its velocity when interrupted and overshoots a little where
 * that makes motion feel alive. Tweens are for fades, menus, disclosure
 * heights and swaps, and pick their curve by what the element does: ease-out
 * to enter or leave, a softer ease-out for large surfaces (a panel unfolding,
 * an overlay dimming the page, a sheet sliding in), ease-in-out to move on
 * screen, a hint of bounce for a drawer sliding in, a steady push for a
 * dialog or a sheet dismissed, and ease-in only for a drawer closed,
 * speeding off its edge, and for content fading in behind content leaving (a
 * menubar's menus). Pressables scale on press only; anchored popups grow from
 * their trigger, from farther when they are small; two states swapping in
 * place are bridged with a light blur, and unfolding content clears from one;
 * a menubar's content stays on screen while its popover moves to the next
 * menu, sliding a little out and in, and the popover moves and resizes on a
 * spring that eases in, keeping its speed from menu to menu.
 *
 * The tokens are the values at tempo 1. Components pass them through
 * `useTempoTransition` (or read them from `useMotionTokens()`), so an optional
 * `<AnimateUIProvider tempo={…}>` paces the whole app.
 */

/** Curves of the tweens, picked by what the element does. */
const ease = {
  /** Entering or leaving: starts fast, so the interface answers at once. */
  out: [0.23, 1, 0.32, 1],
  /**
   * Surfaces the eye watches change: a panel unfolding and pushing the page
   * (accordion, collapsible), an overlay dimming it, a menu opening, a sheet
   * sliding in, a dialog fading in. A softer start than `out`, so the change is seen rather than
   * snapped.
   */
  soft: [0.215, 0.61, 0.355, 1],
  /**
   * A mark drawing itself in a control (a checkbox's check): Motion's own
   * easeOut, v1's, gentle enough for the stroke to be seen being drawn.
   */
  draw: [0, 0, 0.58, 1],
  /** Moving or morphing something already on screen. */
  inOut: [0.77, 0, 0.175, 1],
  /**
   * A dialog or a sheet dismissed, speeding away: a steady push, from half
   * its average speed to one and a half. It leaves at once (an ease-in
   * would wait), and its last pixels don't crawl out (an ease-out would).
   */
  away: [0.33, 0.17, 0.67, 0.5],
  /**
   * A drawer closed: CSS's ease-in, a little sharper, so it's seen
   * speeding off its edge. Short (0.16s), so its slow start doesn't wait.
   */
  in: [0.4, 0, 1, 1],
  /**
   * A drawer sliding in: it answers at once, goes a hair past its rest (~1%,
   * which its bleed covers), then settles back: a hint of bounce, the same
   * in Motion and in CSS.
   */
  drawer: [0.34, 1.2, 0.64, 1],
  /**
   * Content arriving behind content leaving (a menubar's menus handing their
   * popover over): a slow start, so what leaves has mostly cleared before it
   * shows, like Motion's mega menu.
   */
  arrive: [0.11, 0, 0.5, 0],
  /**
   * A color changing, a background showing up or going (a highlight lit by a
   * hover): CSS's own `ease`, gentle at both ends, so the change is seen
   * rather than cut.
   */
  color: [0.25, 0.1, 0.25, 1],
  /**
   * Content fading out to make way for the next (a tab panel): Motion's own
   * easeOut, gentle enough for its fade and blur to be seen, like Motion's
   * tabs example.
   */
  leave: [0, 0, 0.58, 1],
  /**
   * Content fading in where other content just left (a tab panel): CSS's
   * `ease` with a longer landing, like Motion's tabs example.
   */
  enter: [0.25, 0.1, 0.35, 1],
  /**
   * A box resizing to new content (a tab panel's height): Motion's own
   * layout curve, a gentle start then a long deceleration, never past its
   * size.
   */
  resize: [0.4, 0, 0.1, 1],
  /**
   * A fill growing into a control or shrinking out of it (a toggle group's
   * selected surface; the radio's and checkbox's fill in the demos, in CSS):
   * Tailwind's default curve, a quick start and a long landing.
   */
  fill: [0.4, 0, 0.2, 1],
} as const;

/** Springs, one per role (stiffness / damping, mass 1). */
const spring = {
  /** Press feedback: Motion's own spring for `scale`. */
  press: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  /**
   * Tooltips, popovers and hover cards growing from their trigger: there in
   * ~175ms, a little overshoot, settled by ~440ms.
   */
  pop: { type: 'spring', stiffness: 400, damping: 29 },
  /**
   * Animate UI's own Tooltip, growing from its trigger and gliding between
   * triggers: as quick as `pop`, a touch calmer (about 2% past, not 4%).
   */
  tooltip: { type: 'spring', stiffness: 400, damping: 31 },
  /** Dialogs tipping forward: calm, no overshoot. */
  dialog: { type: 'spring', stiffness: 150, damping: 25 },
  /**
   * Toasts rising from an edge, and their stack moving: there in ~165ms, a
   * slight overshoot (~4%, at ~270ms) so it lands, settled by ~525ms.
   */
  toast: { type: 'spring', stiffness: 280, damping: 24 },
  /**
   * A selection sliding between items (tabs, toggle groups): a smooth slide,
   * a little quicker than v1's (stiffness 200, damping 25).
   */
  selection: { type: 'spring', stiffness: 300, damping: 30 },
  /**
   * A surface following the pointer (menu items' highlight), and a list's
   * check gliding to the chosen item: there in ~150ms without overshoot, so
   * it never trails behind. Quicker than v1's (stiffness 350, damping 35).
   */
  highlight: { type: 'spring', stiffness: 500, damping: 40 },
  /**
   * Items making room for one added, or closing the gap of one removed (a
   * combobox's chips and its input): quick, without overshoot.
   */
  reflow: { type: 'spring', stiffness: 500, damping: 40 },
  /**
   * Content sliding in as a popover is handed from one menu to the next (a
   * menubar's), or as a navigation menu changes items: from rest, there in
   * ~230ms without overshoot, like Motion's mega menu (a little quicker).
   */
  handoff: { type: 'spring', stiffness: 450, damping: 43 },
  /**
   * A popover moving and resizing from one content to the next (a menubar's
   * handed from menu to menu, a navigation menu's changing items): it starts
   * gently, half the way in ~65ms, most of it in ~155ms, and eases in
   * without going past its place or size, settled by ~300ms. Started over on
   * the way, it keeps the speed it had (internal/momentum).
   */
  morph: { type: 'spring', stiffness: 660, damping: 52 },
  /** A height following its content, without overshoot. */
  height: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  /** A switch thumb gliding and stretching. */
  thumb: { type: 'spring', stiffness: 300, damping: 25 },
  /**
   * A slider's thumb and range gliding to a pressed value, and its thumb
   * stretching: as quick as the switch's thumb (90% of the way in ~150ms),
   * calmer (~1.5% past its value, at ~260ms), settled by ~480ms.
   */
  slider: { type: 'spring', stiffness: 400, damping: 32 },
  /** Small marks popping inside a control (radio dot). */
  bounce: { type: 'spring', stiffness: 200, damping: 16 },
  /**
   * A character growing into a field (an OTP slot's), by a transform: most
   * of the way in ~175ms, settled by ~450ms, never past its size.
   */
  glyph: { type: 'spring', stiffness: 500, damping: 45 },
  /**
   * A check popping in (`checkAnimation="pop"`), from half its size out of a
   * light blur: lively, a little overshoot (~13%, peak at ~170ms).
   */
  checkPop: { type: 'spring', stiffness: 500, damping: 24 },
  /** Effects bringing content in (Fade, Slide, Zoom, Blur): playful. */
  entrance: { type: 'spring', stiffness: 200, damping: 20 },
  /**
   * A progress bar and its value, like Motion UI's progress bar (critically
   * damped): most of the way in ~230ms, settled by ~550ms, never past its
   * value. It rests within a hundredth of a percent: Motion's default (half
   * a unit) cut its last crawl short with a jump.
   */
  progress: {
    type: 'spring',
    stiffness: 300,
    damping: 35,
    restDelta: 0.01,
    restSpeed: 0.1,
  },
  /** Numbers rolling to their value without overshooting. */
  number: { type: 'spring', stiffness: 90, damping: 50 },
} as const satisfies Record<string, Transition>;

/** Tweens, one per role. */
const transition = {
  /**
   * Menus, selects, comboboxes and navigation menus: short, opened all day
   * long, on the soft ease-out so they're seen opening rather than snapped
   * open.
   */
  menu: { duration: 0.22, ease: ease.soft },
  /**
   * An overlay or backdrop (a dialog's, a sheet's, a drawer's) fading in, the
   * page behind blurring from 0, and out: the page dims smoothly while the
   * content arrives.
   */
  overlay: { duration: 0.4, ease: ease.soft },
  /**
   * A dialog's content fading in, ahead of its tilt: it answers at once, so
   * it's there first, then it settles.
   */
  dialogFade: { duration: 0.4, ease: ease.soft },
  /** Content fading in place, out of the way (a toast behind the front one). */
  fade: { duration: 0.2, ease: ease.out },
  /**
   * A highlight showing up from nothing or going (a hover lighting an item, a
   * trigger), and its color changing (a trigger open, then hovered).
   */
  color: { duration: 0.2, ease: ease.color },
  /**
   * A label showing up where the eye already is, once what moved has landed
   * (a combobox input's placeholder): a little longer, so it's seen coming.
   */
  reveal: { duration: 0.3, ease: ease.out },
  /** Accordion and collapsible panels unfolding, and folding back. */
  disclosure: { duration: 0.35, ease: ease.soft },
  /**
   * A tab panel leaving, into `blur.panel`, staying in the page: quick, so
   * the next one isn't kept waiting (Motion's tabs example).
   */
  panelOut: { duration: 0.15, ease: ease.leave },
  /**
   * The next tab panel fading in from `blur.panel`, once the previous one
   * has gone (Motion's tabs example).
   */
  panelIn: { duration: 0.3, ease: ease.enter },
  /**
   * The tab panels' height gliding from the previous panel's to the next
   * one's as it comes in: Motion's own layout animation (Motion's tabs
   * example), no overshoot.
   */
  panelHeight: { duration: 0.45, ease: ease.resize },
  /**
   * A check drawing itself, once the box has answered the press: v1's delay
   * and curve, drawn a little slower than v1's 0.2s so it's seen.
   */
  check: { duration: 0.3, delay: 0.2, ease: ease.draw },
  /** A check erasing itself, as slowly as it draws. */
  uncheck: { duration: 0.3, ease: ease.draw },
  /**
   * A fill growing in from `scale.fill` as it fades in, and shrinking back
   * out as it fades (a toggle group's selected surface, like the radio's and
   * checkbox's fill); neighbouring fills joining into one surface, or
   * splitting, on the same curve.
   */
  fill: { duration: 0.3, ease: ease.fill },
  /**
   * Something that popped in shrinking back out and fading, quicker than it
   * came: a popped check (`checkAnimation="pop"`), a removed chip or tag.
   */
  popOut: { duration: 0.15, ease: ease.out },
  /**
   * Two icons or labels swapping in place: short, so the swap reads as the
   * press's answer.
   */
  swap: { duration: 0.15, ease: ease.out },
  /**
   * A menu's content leaving the popover it hands over to the next menu (a
   * menubar's), sliding away from where the popover goes: soft, mostly gone
   * in ~90ms.
   */
  handoffOut: { duration: 0.22, ease: ease.soft },
  /**
   * The next menu's content fading in, once the previous one has mostly
   * cleared.
   */
  handoffIn: { duration: 0.26, ease: ease.arrive },
  /**
   * A dialog, a sheet or a toast leaving once dismissed: at once, quicker
   * than it came, speeding away (a sheet off its edge, so its last pixels
   * don't crawl out). Its overlay clears behind it.
   */
  dismiss: { duration: 0.2, ease: ease.away },
  /**
   * A mark shaking "no" (a toast's error cross, once drawn): a few quick
   * swings of `shift.shake`, dying out.
   */
  shake: { duration: 0.4, ease: ease.inOut },
  /**
   * A drawer closed (a button, Escape, a click outside): quick, and seen
   * speeding off its edge, so it never reads as a constant slide.
   */
  drawerOut: { duration: 0.16, ease: ease.in },
  /**
   * A drawer sliding in from its edge, snapping, or easing back after a
   * drag: it answers at once, with a hint of bounce.
   */
  drawer: { duration: 0.4, ease: ease.drawer },
  /**
   * A sheet sliding in from its edge: it answers at once and slows down all
   * the way in. No bounce: it's held against the screen's edge, and going
   * past its rest would open a gap there.
   */
  sheet: { duration: 0.4, ease: ease.soft },
  /**
   * A sidebar collapsing or expanding, and everything that resizes with it
   * (the page beside it, its buttons, its group labels): one curve and one
   * duration, so the sidebar's edge and the page's stay together. Toggled
   * all day (Cmd/Ctrl+B): quicker than v1's 400ms.
   */
  collapse: { duration: 0.28, ease: ease.inOut },
  /**
   * A collapsing sidebar's labels fading out into a light blur in its first
   * half, and back in its last half as it expands (a `delay` of
   * `collapse.duration - collapseLabel.duration`): they're gone before the
   * buttons are narrow, and only show once they're nearly wide again.
   */
  collapseLabel: { duration: 0.14, ease: ease.out },
  /** Deliberately no animation. */
  instant: { duration: 0 },
} as const satisfies Record<string, Transition>;

/** Scales, by role. */
const scale = {
  /** Anything pressed. Nothing scales on hover. */
  press: 0.97,
  /** Where anchored popups grow from: the smaller, the farther. */
  tooltip: 0.7,
  popover: 0.8,
  menu: 0.9,
  /** Dialog content, with `perspective(500px) rotateX(-20deg)`. */
  dialog: 0.8,
  /** An icon swapping for another. */
  icon: 0.5,
  /** Where a toast rising from its edge grows from (with `blur.surface`). */
  toast: 0.96,
  /** Where a fill grows from, from its center (`transition.fill`). */
  fill: 0.7,
} as const;

/** Blurs bridging two states. */
const blur = {
  /** Icons and short labels swapping in place. */
  icon: 'blur(2px)',
  /** Animate UI's Tooltip's content changing for the next trigger's. */
  tooltip: 'blur(6px)',
  /** The content of an accordion or collapsible panel, as it unfolds. */
  disclosure: 'blur(2px)',
  /** Surfaces coming in: dialogs, toasts. */
  surface: 'blur(4px)',
  /**
   * Tab panels leaving into it and coming in from it, one after the other
   * (Motion's tabs example).
   */
  panel: 'blur(5px)',
} as const;

/** Distances, in px, by role. */
const shift = {
  /**
   * How far a menu's content slides on screen as the popover is handed to the
   * next menu (a menubar's): the leaving one away from where it goes, the
   * next one in from there.
   */
  handoff: 6,
  /**
   * How far a navigation menu's content slides as it changes for another
   * item's: four times a menubar's, its content being wider (6px barely shows
   * across 400-600px, the leaving content fading out within ~90ms and the
   * next one fading in once its spring is mostly done).
   */
  navigation: 24,
  /**
   * How far tab panels' content slides as it changes, by the tabs' order:
   * going to a later tab, the leaving content slides toward the start as it
   * fades out and the next one comes in from the end (vertically for
   * vertical tabs, mirrored right to left).
   */
  tabs: 12,
  /**
   * How far Animate UI's Tooltip's content slides as it changes for the next
   * trigger's while the popup glides there: the leaving label away from where
   * the popup goes, the next one in from there, through `blur.tooltip`, on
   * the tab panels' timings. Far enough for the way it comes from to read
   * next to the popup's own glide (16px wasn't marked enough); clipped by
   * the popup.
   */
  tooltip: 24,
  /** How far a mark swings as it shakes (`transition.shake`). */
  shake: 3,
} as const;

/**
 * Delays between items moving one after another, in seconds: paced by
 * `tempo` like durations.
 */
const stagger: { readonly stack: number } = {
  /**
   * A toast stack unfolding on hover, and folding back: each toast starts
   * this long after the one in front of it.
   */
  stack: 0.03,
};

/**
 * The tokens at a pace: `tempo` multiplies the tweens' durations and delays
 * (and the staggers), and time-scales the springs (see `scaleTransition`). 1 is the default, 0.8
 * feels crisper, 1.2 more relaxed. Curves, scales, blurs and shifts don't
 * change.
 */
function createMotionTokens(tempo = 1) {
  const pace = <T extends Record<string, Transition>>(set: T): T =>
    tempo === 1
      ? set
      : (Object.fromEntries(
          Object.entries(set).map(([role, value]) => [
            role,
            scaleTransition(value, tempo),
          ]),
        ) as T);

  return {
    tempo,
    ease,
    scale,
    blur,
    shift,
    stagger:
      tempo === 1
        ? stagger
        : (Object.fromEntries(
            Object.entries(stagger).map(([role, delay]) => [
              role,
              delay * tempo,
            ]),
          ) as typeof stagger),
    spring: pace(spring),
    transition: pace(transition),
  } as const;
}

type MotionTokens = ReturnType<typeof createMotionTokens>;

/** The default tokens (tempo 1). */
const motionTokens: MotionTokens = createMotionTokens();

const MotionTokensContext = React.createContext<MotionTokens>(motionTokens);

const TIME_KEYS = ['duration', 'delay', 'repeatDelay', 'delayChildren'];

/**
 * Time-scales a transition by `tempo` (1 = as written): durations and delays
 * are multiplied, and a stiffness/damping spring keeps its exact shape
 * (stiffness / tempo², damping / tempo). Per-value transitions
 * (`{ opacity: {…}, default: {…} }`) are scaled too.
 *
 * Primitives write their transitions literally (the production values) and
 * pass them through this, so `AnimateUIProvider`'s tempo reaches springs too.
 */
function scaleTransition<T extends Transition | undefined>(
  transition: T,
  tempo: number,
): T {
  if (!transition || tempo === 1 || typeof transition !== 'object')
    return transition;
  const scaled: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(transition)) {
    if (typeof value === 'number' && TIME_KEYS.includes(key))
      scaled[key] = value * tempo;
    else if (typeof value === 'number' && key === 'stiffness')
      scaled[key] = value / (tempo * tempo);
    else if (typeof value === 'number' && key === 'damping')
      scaled[key] = value / tempo;
    else if (value && typeof value === 'object' && !Array.isArray(value))
      scaled[key] = scaleTransition(value as Transition, tempo);
    else scaled[key] = value;
  }
  return scaled as T;
}

/** `scaleTransition` with the tempo of the closest `AnimateUIProvider`. */
function useTempoTransition<T extends Transition | undefined>(
  transition: T,
): T {
  const { tempo } = React.use(MotionTokensContext);
  return scaleTransition(transition, tempo);
}

/** The tokens of the closest `AnimateUIProvider`, or the defaults. */
function useMotionTokens(): MotionTokens {
  return React.use(MotionTokensContext);
}

/* Checks ------------------------------------------------------------------ */

/**
 * How checks show and hide: a checkbox's, and the checks of menus, selects,
 * comboboxes and lists.
 *
 * - `draw`: the check draws itself (its stroke) and erases itself.
 * - `pop`: it pops in from half its size out of a light blur, and shrinks
 *   back out; a single selection's check glides from the item it leaves to
 *   the chosen one.
 */
type CheckAnimation = 'draw' | 'pop';

/** The closest `AnimateUIProvider`'s `checkAnimation`. */
const CheckAnimationContext = React.createContext<CheckAnimation>('draw');

/**
 * A check's animation: its own (`animation`), or else the closest
 * `AnimateUIProvider`'s `checkAnimation`, or else `draw`.
 */
function useCheckAnimation(own?: CheckAnimation): CheckAnimation {
  const inherited = React.use(CheckAnimationContext);
  return own ?? inherited;
}

/* CSS timing -------------------------------------------------------------- */

/** A CSS transition timing: duration in milliseconds and timing function. */
type CssTiming = { duration: number; easing: string };

const CSS_EASINGS: Record<string, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  circIn: 'cubic-bezier(0, 0.65, 0.55, 1)',
  circOut: 'cubic-bezier(0.55, 0, 1, 0.45)',
  backIn: 'cubic-bezier(0.31, 0.01, 0.66, -0.59)',
  backOut: 'cubic-bezier(0.33, 1.53, 0.69, 0.99)',
};

const SPRING_KEYS = [
  'stiffness',
  'damping',
  'mass',
  'bounce',
  'visualDuration',
];

function toCssEase(curve: unknown): string {
  if (
    Array.isArray(curve) &&
    curve.length === 4 &&
    curve.every(Number.isFinite)
  )
    return `cubic-bezier(${curve.join(', ')})`;
  if (typeof curve === 'string') return CSS_EASINGS[curve] ?? 'ease';
  return CSS_EASINGS.easeInOut!;
}

/**
 * A Motion transition (tempo already applied) as a CSS duration and timing
 * function, for the parts a library drives with CSS transitions (Base UI's
 * Drawer and Toast follow the finger through CSS variables). A spring becomes
 * the `linear()` curve Motion itself hands the browser (same duration, same
 * 10ms resolution), so it moves exactly like Motion's; a tween keeps its
 * `duration` (Motion's default 0.3s) and cubic-bezier or named `ease`
 * (Motion's default easeInOut).
 */
function toCssTiming(motionTransition: Transition): CssTiming {
  const options = motionTransition as Record<string, unknown>;
  const isSpring =
    options.type === 'spring' || SPRING_KEYS.some((key) => key in options);

  if (isSpring) {
    // Motion's spring takes a time-defined `duration` in ms.
    const springOptions =
      typeof options.duration === 'number'
        ? { ...options, duration: options.duration * 1000 }
        : options;
    const { duration, ease: curve } = createGeneratorEasing(
      springOptions,
      100,
      springGenerator,
    );
    const ms = Math.round(duration * 1000);
    return { duration: ms, easing: generateLinearEasing(curve, ms) };
  }

  const seconds = typeof options.duration === 'number' ? options.duration : 0.3;
  return {
    duration: Math.round(seconds * 1000),
    easing: toCssEase(options.ease),
  };
}

type ReducedMotionConfigProps = {
  children: React.ReactNode;
  /**
   * Remount the children when the reduced-motion preference changes. Use it
   * for animations that play on mount (text entrances, counters): the server
   * render can't know the preference, so without it an entrance started during
   * hydration would keep playing after the preference resolves to "reduce".
   */
  remount?: boolean;
};

/**
 * Makes every `motion` element inside respect the OS "reduce motion" setting:
 * transform, size, position and layout animations jump to their end state,
 * while opacity, color and filter still animate.
 *
 * Wrap each component's motion tree with it so this works without any app
 * setup. An app-level `<MotionConfig reducedMotion="always">` is preserved.
 */
function ReducedMotionConfig({ children, remount }: ReducedMotionConfigProps) {
  const { reducedMotion } = React.use(MotionConfigContext);

  return (
    <MotionConfig
      reducedMotion={reducedMotion === 'always' ? 'always' : 'user'}
    >
      {remount ? <RemountOnReduce>{children}</RemountOnReduce> : children}
    </MotionConfig>
  );
}

function RemountOnReduce({ children }: { children: React.ReactNode }) {
  const reduce = useShouldReduceMotion();
  return (
    <React.Fragment key={reduce ? 'reduce' : 'full'}>{children}</React.Fragment>
  );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * True when motion should be reduced: an app-level
 * `<MotionConfig reducedMotion="always">`, or else the OS setting. Works with
 * or without `ReducedMotionConfig` around it. Motion's own default
 * (`"never"`) doesn't count, as in `ReducedMotionConfig`: without this,
 * calling it outside one would always return false.
 *
 * Motion's reduced-motion setting only skips individual transform props
 * (`x`, `scale`…), not a `transform` string. Components that animate a
 * `transform` string (hardware accelerated) neutralize it with this:
 * `const pressed = reduce ? 1 : scale.press`.
 *
 * Unlike Motion's `useReducedMotion`, it follows OS setting changes while the
 * component stays mounted.
 */
function useShouldReduceMotion() {
  const { reducedMotion } = React.use(MotionConfigContext);
  const prefersReduced = React.useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  return reducedMotion === 'always' || prefersReduced;
}

export {
  createMotionTokens,
  motionTokens,
  MotionTokensContext,
  useMotionTokens,
  CheckAnimationContext,
  useCheckAnimation,
  ease,
  spring,
  transition,
  scale,
  blur,
  shift,
  stagger,
  ReducedMotionConfig,
  useShouldReduceMotion,
  scaleTransition,
  useTempoTransition,
  toCssTiming,
  type CssTiming,
  type ReducedMotionConfigProps,
  type MotionTokens,
  type CheckAnimation,
};
