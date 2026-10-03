import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import type { MotionTokens } from '../utils/motion';

// Motion targets shared by every modal primitive (Radix UI and Base UI
// Dialog / Alert Dialog, React Aria Modal): the overlay fades, the content
// scales from `scale.enter` around its center, or slides in from its edge when
// it carries `data-side` (shadcn/ui's Sheet).

/** Animate UI's additions to an overlay or a modal's content. */
export type ModalAnimationProps = {
  /** Transition of the opening. */
  transition?: Transition;
  /** Transition of the closing. */
  exitTransition?: Transition;
};

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

export type ModalTargets = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

type TargetOptions = ModalAnimationProps & {
  tokens: MotionTokens;
  reduce: boolean;
};

/**
 * The content: a centered scale from `scale.enter` with a fade (modal
 * tokens), or a slide from `side` without a fade (drawer tokens). Reduced
 * motion keeps the fade and drops the movement.
 */
export function getContentTargets({
  side,
  tokens,
  reduce,
  transition,
  exitTransition,
}: TargetOptions & { side: ModalSide | undefined }): ModalTargets {
  if (side) {
    // Same transform function on both ends so it interpolates.
    const shown =
      side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
    const hidden = reduce
      ? { opacity: 0, transform: shown }
      : { opacity: 1, transform: OFFSCREEN[side] };
    return {
      initial: hidden,
      animate: {
        opacity: 1,
        transform: shown,
        transition: transition ?? tokens.transition.drawer,
      },
      exit: {
        ...hidden,
        transition: exitTransition ?? tokens.transition.drawerExit,
      },
    };
  }

  const hidden = {
    opacity: 0,
    transform: `scale(${reduce ? 1 : tokens.scale.enter})`,
  };
  return {
    initial: hidden,
    animate: {
      opacity: 1,
      transform: 'scale(1)',
      transition: transition ?? tokens.transition.modal,
    },
    exit: {
      ...hidden,
      transition: exitTransition ?? tokens.transition.modalExit,
    },
  };
}

/** The overlay only fades (no blur: it costs paint for nothing visible). */
export function getOverlayTargets({
  tokens,
  transition,
  exitTransition,
}: Omit<TargetOptions, 'reduce'>): ModalTargets {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transition ?? tokens.transition.modal },
    exit: {
      opacity: 0,
      transition: exitTransition ?? tokens.transition.modalExit,
    },
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
