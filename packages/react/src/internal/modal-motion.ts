import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import { motionTokens, useTempoTransition } from '../utils/motion';

// Motion shared by the modal primitives (Radix UI and Base UI Dialog / Alert
// Dialog, React Aria Modal), as Animate UI v1 shipped it:
//
// - The overlay fades in and un-blurs (opacity 0 → 1, blur(4px) → blur(0px))
//   in 200ms on a strong ease-out, and leaves the same way.
// - The content, v1's default entrance (`from="top"`): it fades in, un-blurs
//   and tips forward from `perspective(500px) rotateX(-20deg) scale(0.8)` on a
//   spring (stiffness 150, damping 25), and leaves the same way.
// - Content with `data-side` (shadcn/ui's Sheet), v1's Sheet: it slides in
//   from that edge by its own size and fades in, on a livelier spring
//   (stiffness 150, damping 22), and leaves the same way.
//
// v1 used one transition both ways: `exitTransition` defaults to `transition`.

/** The overlay's fade: 200ms, strong ease-out (it enters and leaves). */
export const OVERLAY_TRANSITION = motionTokens.transition.overlay;

/** v1's dialog spring. */
export const DIALOG_TRANSITION = motionTokens.spring.dialog;

/**
 * Sheets, drawers and the toasts that enter from an edge: v1's sheet spring,
 * a little livelier than the dialog's (they travel farther).
 */
export const SHEET_TRANSITION = motionTokens.spring.sheet;

/** Animate UI's additions to an overlay or a modal's content. */
export type ModalAnimationProps = {
  /** Transition of the opening. */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

/**
 * The opening and closing transitions, with `AnimateUIProvider`'s tempo
 * applied. The closing one follows `transition` unless `exitTransition` is
 * given, as v1's single `transition` did.
 */
export function useModalTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  fallback: Transition,
) {
  const enter = useTempoTransition(transition ?? fallback);
  const exit = useTempoTransition(exitTransition ?? transition ?? fallback);
  return { enter, exit };
}

export type ModalSide = 'top' | 'right' | 'bottom' | 'left';

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

// v1's `from="top"`. The same functions on both ends, so they interpolate.
const TIPPED = `perspective(500px) rotateX(-20deg) scale(${motionTokens.scale.dialog})`;
const UPRIGHT = 'perspective(500px) rotateX(0deg) scale(1)';

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
 * The content: v1's dialog entrance, or v1's sheet slide from `side`.
 * Reduced motion keeps the fade (and the blur) and drops the movement.
 */
export function getContentTargets({
  side,
  reduce,
  enter,
  exit,
}: TargetOptions & {
  side: ModalSide | undefined;
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

  const hidden = {
    opacity: 0,
    filter: motionTokens.blur.surface,
    transform: reduce ? UPRIGHT : TIPPED,
  };
  return {
    initial: hidden,
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transform: UPRIGHT,
      transition: enter,
    },
    exit: { ...hidden, transition: exit },
  };
}

/** The overlay: v1's fade and blur. */
export function getOverlayTargets({
  enter,
  exit,
}: TargetOptions): ModalTargets {
  const hidden = { opacity: 0, filter: motionTokens.blur.surface };
  return {
    initial: hidden,
    animate: { opacity: 1, filter: 'blur(0px)', transition: enter },
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
