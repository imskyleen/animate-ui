import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

// Motion shared by the modal primitives (Radix UI and Base UI Dialog / Alert
// Dialog, React Aria Modal), as Animate UI v1 shipped it:
//
// - The overlay comes in from nothing to what its classes set: its background
//   color deepens and its backdrop filter grows (the page behind blurs from
//   0), in 400ms on CSS's `ease`, which starts and lands gently: the whole
//   page never changes at once, on the first frame or on the last. It clears
//   the same way once its content is dismissed, in 250ms. Its blur grows as
//   it's seen: the eye sees most of a blur in its first pixel, so the radius
//   rises slowly at first, and what's seen of the blur keeps pace with the
//   tint. Fading its opacity, as v1 did, would cross-fade the sharp page with
//   an already blurred one under shadcn/ui's `backdrop-blur-xs`.
// - The content, v1's entrance: it un-blurs and tips forward from
//   `perspective(500px) rotateX(-20deg) scale(0.8)` on a spring (stiffness
//   150, damping 25), fading in ahead of it (400ms on a soft ease-out): it's
//   there first, then it settles. Dismissed, it goes back the way it came,
//   at once, quicker and speeding away (0.2s, a steady push), gone just
//   before its overlay has cleared. `from` picks the edge it tips from, as
//   in v1: `top` (the default) and `right` turn it by -20deg, `bottom` and
//   `left` by 20deg, around the X axis for top and bottom, the Y axis for
//   left and right.
// - Content with `data-side` (shadcn/ui's Sheet), v1's Sheet: it slides in
//   from that edge by its own size and fades in (0.4s on a soft ease-out: it
//   answers at once and slows down all the way in, without a drawer's
//   bounce, since it's held against the screen's edge), and leaves like a
//   dismissed dialog, speeding off its edge (0.2s, a steady push).
//
// Each part leaves on its own unless `exitTransition` is given: the overlay
// clears in 250ms, a dialog's or a sheet's content speeds away in 0.2s.

/**
 * An overlay coming in (a dialog's, a sheet's, a drawer's): 400ms on CSS's
 * `ease`, gentle at first and at last.
 */
export const OVERLAY_TRANSITION = motionTokens.transition.overlay;

/** The overlay clearing once its content is dismissed: 250ms, same curve. */
export const OVERLAY_EXIT_TRANSITION = motionTokens.transition.overlayOut;

/** v1's dialog spring. */
export const DIALOG_TRANSITION = motionTokens.spring.dialog;

/**
 * A dialog, a drawer or a sheet dismissed: 0.2s, a steady push from half its
 * average speed to one and a half.
 */
export const DISMISS_TRANSITION = motionTokens.transition.dismiss;

/**
 * A dialog's opacity as it comes in: 400ms on a soft ease-out, ahead of its
 * tilt, so it's there first, then settles.
 */
const CONTENT_FADE = motionTokens.transition.dialogFade;

/**
 * The toasts that enter from an edge: v1's sheet spring, a little livelier
 * than the dialog's (they travel farther).
 */
export const TOAST_TRANSITION = motionTokens.spring.toast;

/**
 * A drawer sliding in, snapping or easing back: 0.4s that answers at once
 * with a hint of bounce. Closed, it leaves like a dialog
 * (`DISMISS_TRANSITION`).
 */
export const DRAWER_TRANSITION = motionTokens.transition.drawer;

/**
 * A sheet sliding in: 0.4s on a soft ease-out, no bounce (it's held against
 * the screen's edge). Closed, it leaves like a dialog.
 */
export const SHEET_TRANSITION = motionTokens.transition.sheet;

/** Animate UI's addition to a dialog's content: v1's `from`. */
export type ContentFlipProps = {
  /**
   * The edge the content tips from as it comes in (and goes back to): its
   * top edge first by default. Ignored by a sheet (`data-side`), which
   * slides from its side.
   * @default 'top'
   */
  from?: FlipDirection;
};

/** Animate UI's additions to an overlay or a modal's content. */
export type ModalAnimationProps = {
  /** Transition of the opening. */
  transition?: Transition;
  /**
   * Transition of the closing. Defaults to 0.2s speeding away for a dialog's
   * or a sheet's content, to 250ms on CSS's `ease` for the overlay.
   */
  exitTransition?: Transition;
};

/**
 * The opening and closing transitions, with `AnimateUIProvider`'s tempo
 * applied. The closing one is `exitTransition`, or its own default
 * (`exitFallback`, a dialog's content), or follows `transition` as v1's
 * single `transition` did.
 */
export function useModalTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  fallback: Transition,
  exitFallback?: Transition,
) {
  const enter = useTempoTransition(transition ?? fallback);
  const exit = useTempoTransition(
    exitTransition ?? exitFallback ?? transition ?? fallback,
  );
  return { enter, exit };
}

/**
 * An overlay's transitions, tempo applied: in over 400ms, cleared over
 * 250ms, both on CSS's `ease`, unless given.
 */
export function useOverlayTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
) {
  return useModalTransitions(
    transition,
    exitTransition,
    OVERLAY_TRANSITION,
    OVERLAY_EXIT_TRANSITION,
  );
}

export type ModalSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * A modal content's transitions, tempo applied. A dialog tips in on its
 * spring, fading in ahead of it with its overlay; a sheet (`side`) slides in
 * from its edge. Both speed away once dismissed. A `transition` given drives
 * the whole opening.
 */
export function useContentTransitions(
  side: ModalSide | undefined,
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
) {
  const { enter, exit } = useModalTransitions(
    transition,
    exitTransition,
    side ? SHEET_TRANSITION : DIALOG_TRANSITION,
    // Dismissed, a dialog tips back speeding away; a sheet speeds off its
    // edge.
    DISMISS_TRANSITION,
  );
  const fade = useTempoTransition(CONTENT_FADE);
  return {
    enter: side || transition ? enter : { ...enter, opacity: fade },
    exit,
  };
}

const SIDES: readonly string[] = ['top', 'right', 'bottom', 'left'];

/** The edge a sheet comes from: the `data-side` shadcn/ui passes, if any. */
export function getModalSide(value: unknown): ModalSide | undefined {
  return typeof value === 'string' && SIDES.includes(value)
    ? (value as ModalSide)
    : undefined;
}

// Percentages of the content's own size: right whatever its width.
const OFFSCREEN: Record<ModalSide, string> = {
  top: 'translateY(-100%)',
  right: 'translateX(100%)',
  bottom: 'translateY(100%)',
  left: 'translateX(-100%)',
};

/** The edge a dialog tips from (v1's `from`). */
export type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

/**
 * v1's tipped and upright transforms for `from`, with the same functions on
 * both ends so they interpolate.
 */
function getFlip(from: FlipDirection) {
  const axis = from === 'top' || from === 'bottom' ? 'rotateX' : 'rotateY';
  const angle = from === 'bottom' || from === 'left' ? '20deg' : '-20deg';
  return {
    tipped: `perspective(500px) ${axis}(${angle}) scale(${motionTokens.scale.dialog})`,
    upright: `perspective(500px) ${axis}(0deg) scale(1)`,
  };
}

export type ModalTargets = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

type TargetOptions = {
  /** Opening transition, tempo applied. */
  enter: Transition;
  /** Closing transition, tempo applied. */
  exit: Transition;
};

/**
 * The content: v1's dialog entrance (tipped from `from`), or v1's sheet slide
 * from `side` (in like a drawer, out speeding off its edge). Reduced motion
 * keeps the fade (and the blur) and drops the movement.
 */
export function getContentTargets({
  side,
  from = 'top',
  reduce,
  enter,
  exit,
}: TargetOptions & {
  side: ModalSide | undefined;
  from?: FlipDirection;
  reduce: boolean;
}): ModalTargets {
  if (side) {
    const shown =
      side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
    const hidden = {
      opacity: 0,
      transform: reduce ? shown : OFFSCREEN[side],
    };
    return {
      initial: hidden,
      animate: { opacity: 1, transform: shown, transition: enter },
      exit: { ...hidden, transition: exit },
    };
  }

  const { tipped, upright } = getFlip(from);
  const hidden = {
    opacity: 0,
    filter: motionTokens.blur.surface,
    transform: reduce ? upright : tipped,
  };
  return {
    initial: hidden,
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transform: upright,
      transition: enter,
    },
    exit: { ...hidden, transition: exit },
  };
}

/**
 * Where the element animates to. A closed element the user keeps mounted
 * (`forceMount`, `keepMounted`) plays the exit instead of unmounting.
 */
export function getAnimateTarget(
  targets: ModalTargets,
  open: boolean,
  keepMounted: boolean,
): TargetAndTransition {
  return keepMounted && !open ? targets.exit : targets.animate;
}

/**
 * For an element kept mounted while closed: `hidden` turns true once its exit
 * has played, so it can leave the page visually (`visibility: hidden`).
 */
export function useHiddenWhenClosed(open: boolean, keepMounted: boolean) {
  const [settled, setSettled] = React.useState(!open);
  // Reset during render when it opens again, so a controlled `open` works.
  if (open && settled) setSettled(false);

  return {
    hidden: keepMounted && !open && settled,
    onAnimationComplete: () => {
      if (!open) setSettled(true);
    },
  };
}

/* Overlay ----------------------------------------------------------------- */

type BackdropValues = Record<
  'backgroundColor' | 'backdropFilter' | 'opacity',
  string
>;

/** An overlay with nothing to show: no tint, nothing blurred behind it. */
const CLEAR: BackdropValues = {
  backgroundColor: 'transparent',
  backdropFilter: 'none',
  opacity: '0',
};

type Backdrop = BackdropValues & {
  /**
   * Its backdrop filter's radius (px) when it's a lone blur, 0 without a
   * filter, null for another filter.
   */
  blur: number | null;
  /**
   * A background image (a gradient) has no color to fade through: the
   * overlay's opacity fades too then.
   */
  hasImage: boolean;
};

/** What an overlay fades, from its computed style. */
function readBackdrop(element: HTMLElement): Backdrop {
  const style = getComputedStyle(element);
  const filter = style.backdropFilter;
  const radius =
    filter === 'none' ? '0' : /^blur\(([\d.]+)px\)$/.exec(filter)?.[1];
  return {
    backgroundColor: style.backgroundColor,
    backdropFilter: filter,
    opacity: style.opacity,
    blur: radius === undefined ? null : Number(radius),
    hasImage: style.backgroundImage !== 'none',
  };
}

// How much of a backdrop blur the eye sees: the page behind (Chrome's
// rendering of a docs page, at 1x and 2x) loses half its sharpness by
// ~0.9px of blur and 80% by 2px, so most of a blur shows in its first pixel:
// grown straight to 4px on an ease-out, 60% of it showed in an overlay's
// first two frames. A Hill curve fits it, and the overlays grow their blur
// through it, so what's seen of the blur keeps pace with the tint.
/** px: the radius at which half of a blur is seen. */
export const BLUR_HALF = 0.9;
/** How steeply a blur shows around `BLUR_HALF`. */
export const BLUR_STEEPNESS = 2.3;

/** The share (0 to 1) of a blur of `radius` px that's seen. */
export function seenBlur(radius: number) {
  return radius <= 0 ? 0 : 1 / (1 + (BLUR_HALF / radius) ** BLUR_STEEPNESS);
}

/**
 * The radius (px) of a blur of `radius` px at `level` (0 to 1), as seen: a
 * share `level` of what's seen of it. Slow at first, all of it at 1.
 */
export function blurAtLevel(radius: number, level: number) {
  const seen = Math.min(1, Math.max(0, level)) * seenBlur(radius);
  if (seen <= 0) return 0;
  return BLUR_HALF * (seen / (1 - seen)) ** (1 / BLUR_STEEPNESS);
}

/** Keyframes of a fade: enough for the blur's curve to read smooth. */
const LEVEL_STEPS = 16;

/**
 * An overlay's keyframes from level `from` to `to` (0: nothing, 1: its
 * classes' values): its tint (or its opacity, over an image) straight between
 * the two, its blur as seen. `start` holds its values at `from` when it's
 * interrupted mid-fade.
 */
function backdropKeyframes(
  rest: Backdrop,
  from: number,
  to: number,
  start?: BackdropValues,
): Keyframe[] {
  const at = (level: number) => (level === 0 ? CLEAR : rest);
  const tint = (values: BackdropValues) => ({
    backgroundColor: values.backgroundColor,
    ...(rest.hasImage ? { opacity: values.opacity } : {}),
  });
  const first = start ?? at(from);
  const last = at(to);
  // A filter that isn't a lone blur goes straight from one to the other.
  if (rest.blur === null)
    return [
      { ...tint(first), backdropFilter: first.backdropFilter },
      { ...tint(last), backdropFilter: last.backdropFilter },
    ];
  if (rest.blur === 0) return [tint(first), tint(last)];
  const frames: Keyframe[] = [];
  for (let step = 0; step <= LEVEL_STEPS; step++) {
    const blur = blurAtLevel(
      rest.blur,
      from + ((to - from) * step) / LEVEL_STEPS,
    );
    frames.push({
      offset: step / LEVEL_STEPS,
      backdropFilter: blur > 0 ? `blur(${blur.toFixed(3)}px)` : 'none',
    });
  }
  Object.assign(frames[0]!, tint(first));
  Object.assign(frames[LEVEL_STEPS]!, tint(last));
  return frames;
}

export type Scrub = {
  /** Holds it at `level`, from 0 (nothing) to 1 (its classes' values). */
  set: (level: number) => void;
  /** Lets its classes take over again. */
  stop: () => void;
};

const NO_SCRUB: Scrub = { set: () => {}, stop: () => {} };

/** A paused Web Animation of `keyframes`, held at a level. */
function scrub(element: HTMLElement, keyframes: Keyframe[]): Scrub {
  const animation = element.animate(keyframes, {
    duration: 1000,
    fill: 'both',
  });
  animation.pause();
  return {
    set: (level: number) => {
      animation.currentTime = Math.min(1, Math.max(0, level)) * 1000;
    },
    stop: () => animation.cancel(),
  };
}

/**
 * Holds an overlay at `level` of what its classes set, from nothing (0: no
 * tint, nothing blurred behind it) to its classes' values (1), its blur as
 * seen, for an overlay that follows a drag: a paused Web Animation between
 * the two, scrubbed, so any color syntax interpolates. Its values are read
 * now: nothing may animate them yet.
 */
export function scrubBackdrop(element: HTMLElement): Scrub {
  if (typeof element.animate !== 'function') return NO_SCRUB;
  return scrub(element, backdropKeyframes(readBackdrop(element), 0, 1));
}

/**
 * Holds a surface's shadow at `level` of what its classes set, from none (0)
 * to all of it (1): its color, offsets and blur grow together, the surface
 * lifting off the page. A paused Web Animation, scrubbed, so any shadow
 * interpolates; nothing to hold without one. Its shadow is read now:
 * nothing may animate it yet.
 */
export function scrubShadow(element: HTMLElement): Scrub {
  if (typeof element.animate !== 'function') return NO_SCRUB;
  const shadow = getComputedStyle(element).boxShadow;
  if (!shadow || shadow === 'none') return NO_SCRUB;
  return scrub(element, [{ boxShadow: 'none' }, { boxShadow: shadow }]);
}

type Fade = { animation: Animation; from: number; to: number };

/** Where a fade is (0: nothing, 1: its classes' values), from its progress. */
const levelOf = ({ animation, from, to }: Fade) =>
  from + (to - from) * (animation.effect?.getComputedTiming().progress ?? 1);

/**
 * Fades an overlay in from nothing to what its classes set, and back out: its
 * background color deepens while its backdrop filter grows, so the page
 * behind blurs progressively from 0, its blur as seen. A Web Animation, so
 * any color syntax interpolates, and the classes take over again once it has
 * played.
 *
 * `visible` drives it; `onFadedOut` runs once a fade out has played (to
 * unmount the overlay, or hide one kept mounted). Returns the ref to put on
 * the overlay's element.
 */
export function useBackdropFade(options: {
  visible: boolean;
  /** Fade in, tempo applied. */
  enter: Transition;
  /** Fade out, tempo applied. */
  exit: Transition;
  onFadedOut?: () => void;
  /** False for an overlay that shows nothing. */
  animated?: boolean;
}): React.RefCallback<HTMLElement> {
  const { visible } = options;
  const elementRef = React.useRef<HTMLElement | null>(null);
  const latestRef = React.useRef(options);
  React.useLayoutEffect(() => {
    latestRef.current = options;
  });
  const runningRef = React.useRef<Fade | null>(null);
  const mountedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const { animated = true, enter, exit, onFadedOut } = latestRef.current;
    const element = elementRef.current;
    const mounting = !mountedRef.current;
    mountedRef.current = true;
    // Mounted closed (kept mounted): hidden already, nothing to fade out.
    if (mounting && !visible) return;
    if (!element || !animated || typeof element.animate !== 'function') {
      if (!visible) onFadedOut?.();
      return;
    }
    // From where it is: mid-fade when interrupted.
    const running = runningRef.current;
    const midway = running
      ? { level: levelOf(running), values: readBackdrop(element) }
      : null;
    running?.animation.cancel();
    // Its classes' values, now that nothing animates them.
    const rest = readBackdrop(element);
    const from = midway?.level ?? (visible ? 0 : 1);
    const to = visible ? 1 : 0;
    const { duration, easing } = toCssTiming(visible ? enter : exit);
    const animation = element.animate(
      backdropKeyframes(rest, from, to, midway?.values),
      {
        duration,
        easing,
        // Faded out, it stays clear until it unmounts or opens again.
        fill: visible ? 'backwards' : 'forwards',
      },
    );
    const fade = { animation, from, to };
    runningRef.current = fade;
    animation.finished
      .then(() => {
        if (runningRef.current !== fade) return;
        if (visible) runningRef.current = null;
        else latestRef.current.onFadedOut?.();
      })
      // Cancelled: a newer fade took over.
      .catch(() => {});
  }, [visible]);

  return React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);
}

/* CSS timing -------------------------------------------------------------- */

// The primitives driven by CSS transitions (Base UI's Drawer and Toast) read
// their timing from the tokens through `toCssTiming` (utils/motion).
export { toCssTiming, type CssTiming } from '../utils/motion';

/* Rendering --------------------------------------------------------------- */

/* eslint-disable @typescript-eslint/no-explicit-any -- elements of any type
   can be made animatable. */
type AnyComponent = React.ComponentType<any>;
type ElementProps = Record<string, any> & {
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
};
type RenderFunction = (props: any, state: any) => React.ReactElement;
/* eslint-enable @typescript-eslint/no-explicit-any */

const motionComponents = new WeakMap<object, AnyComponent>();

function motionFor(type: string | AnyComponent): AnyComponent {
  if (typeof type === 'string')
    return (motion as unknown as Record<string, AnyComponent>)[type]!;
  let component = motionComponents.get(type);
  if (!component) {
    component = motion.create(type) as AnyComponent;
    motionComponents.set(type, component);
  }
  return component;
}

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

/** The user's own element, made animatable with `motionProps`. */
function asMotion(element: React.ReactElement, motionProps: ElementProps) {
  const own = element.props as ElementProps;
  return React.createElement(motionFor(element.type as AnyComponent), {
    ...own,
    ...motionProps,
    ref: mergeRefs(own.ref, motionProps.ref),
    style: { ...own.style, ...motionProps.style },
  });
}

/**
 * A `render` prop (Base UI's element or function, React Aria's function)
 * that renders the animated element: a `motion.div` with the library's props,
 * or the user's own `render` made animatable rather than replaced.
 */
export function motionRender(
  render: React.ReactElement | RenderFunction | undefined,
  motionProps: ElementProps,
) {
  if (typeof render === 'function')
    return ((props, state) =>
      asMotion(render(props, state), motionProps)) as RenderFunction;
  if (render) return asMotion(render, motionProps);
  return React.createElement(motionFor('div'), motionProps);
}

/** React Aria's `render`: its DOM props on a motion element. */
export function ariaMotionRender(
  render: RenderFunction | undefined,
  motionProps: ElementProps,
): RenderFunction {
  return (domProps, values) =>
    render
      ? asMotion(render(domProps, values), motionProps)
      : React.createElement(motionFor('div'), {
          ...domProps,
          ...motionProps,
          style: { ...domProps.style, ...motionProps.style },
        });
}
