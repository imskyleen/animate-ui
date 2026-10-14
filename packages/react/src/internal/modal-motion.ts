import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

export const OVERLAY_TRANSITION = motionTokens.transition.overlay;

export const DIALOG_TRANSITION = motionTokens.spring.dialog;

export const DISMISS_TRANSITION = motionTokens.transition.dismiss;

export const DRAWER_EXIT_TRANSITION = motionTokens.transition.drawerOut;

const CONTENT_FADE = motionTokens.transition.dialogFade;

export const TOAST_TRANSITION = motionTokens.spring.toast;

export const DRAWER_TRANSITION = motionTokens.transition.drawer;

export const SHEET_TRANSITION = motionTokens.transition.sheet;

export type ContentFlipProps = {
  from?: FlipDirection;
};

export type ModalAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

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

export function useOverlayTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
) {
  return useModalTransitions(transition, exitTransition, OVERLAY_TRANSITION);
}

export type ModalSide = 'top' | 'right' | 'bottom' | 'left';

export function useContentTransitions(
  side: ModalSide | undefined,
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
) {
  const { enter, exit } = useModalTransitions(
    transition,
    exitTransition,
    side ? SHEET_TRANSITION : DIALOG_TRANSITION,
    DISMISS_TRANSITION,
  );
  const fade = useTempoTransition(CONTENT_FADE);
  return {
    enter: side || transition ? enter : { ...enter, opacity: fade },
    exit,
  };
}

const SIDES: readonly string[] = ['top', 'right', 'bottom', 'left'];

export function getModalSide(value: unknown): ModalSide | undefined {
  return typeof value === 'string' && SIDES.includes(value)
    ? (value as ModalSide)
    : undefined;
}

const OFFSCREEN: Record<ModalSide, string> = {
  top: 'translateY(-100%)',
  right: 'translateX(100%)',
  bottom: 'translateY(100%)',
  left: 'translateX(-100%)',
};

export type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

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
  enter: Transition;
  exit: Transition;
};

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

export function getAnimateTarget(
  targets: ModalTargets,
  open: boolean,
  keepMounted: boolean,
): TargetAndTransition {
  return keepMounted && !open ? targets.exit : targets.animate;
}

export function useHiddenWhenClosed(open: boolean, keepMounted: boolean) {
  const [settled, setSettled] = React.useState(!open);
  if (open && settled) setSettled(false);

  return {
    hidden: keepMounted && !open && settled,
    onAnimationComplete: () => {
      if (!open) setSettled(true);
    },
  };
}

type BackdropValues = Record<
  'backgroundColor' | 'backdropFilter' | 'opacity',
  string
>;

const CLEAR: BackdropValues = {
  backgroundColor: 'transparent',
  backdropFilter: 'none',
  opacity: '0',
};

type Backdrop = BackdropValues & {
  hasImage: boolean;
};

function readBackdrop(element: HTMLElement): Backdrop {
  const style = getComputedStyle(element);
  return {
    backgroundColor: style.backgroundColor,
    backdropFilter: style.backdropFilter,
    opacity: style.opacity,
    hasImage: style.backgroundImage !== 'none',
  };
}

function backdropKeyframes(
  rest: Backdrop,
  start: BackdropValues,
  end: BackdropValues,
): Keyframe[] {
  const frame = (values: BackdropValues) => ({
    backgroundColor: values.backgroundColor,
    backdropFilter: values.backdropFilter,
    ...(rest.hasImage ? { opacity: values.opacity } : {}),
  });
  return [frame(start), frame(end)];
}

export type Scrub = {
  set: (level: number) => void;
  stop: () => void;
};

const NO_SCRUB: Scrub = { set: () => {}, stop: () => {} };

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

export function scrubBackdrop(element: HTMLElement): Scrub {
  if (typeof element.animate !== 'function') return NO_SCRUB;
  const rest = readBackdrop(element);
  return scrub(element, backdropKeyframes(rest, CLEAR, rest));
}

export function scrubShadow(element: HTMLElement): Scrub {
  if (typeof element.animate !== 'function') return NO_SCRUB;
  const shadow = getComputedStyle(element).boxShadow;
  if (!shadow || shadow === 'none') return NO_SCRUB;
  return scrub(element, [{ boxShadow: 'none' }, { boxShadow: shadow }]);
}

export function useBackdropFade(options: {
  visible: boolean;
  enter: Transition;
  exit: Transition;
  onFadedOut?: () => void;
  animated?: boolean;
}): React.RefCallback<HTMLElement> {
  const { visible } = options;
  const elementRef = React.useRef<HTMLElement | null>(null);
  const latestRef = React.useRef(options);
  React.useLayoutEffect(() => {
    latestRef.current = options;
  });
  const runningRef = React.useRef<Animation | null>(null);
  const mountedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const { animated = true, enter, exit, onFadedOut } = latestRef.current;
    const element = elementRef.current;
    const mounting = !mountedRef.current;
    mountedRef.current = true;
    if (mounting && !visible) return;
    if (!element || !animated || typeof element.animate !== 'function') {
      if (!visible) onFadedOut?.();
      return;
    }
    const current = runningRef.current;
    const midway = current ? readBackdrop(element) : null;
    current?.cancel();
    const rest = readBackdrop(element);
    const { duration, easing } = toCssTiming(visible ? enter : exit);
    const animation = element.animate(
      backdropKeyframes(
        rest,
        midway ?? (visible ? CLEAR : rest),
        visible ? rest : CLEAR,
      ),
      {
        duration,
        easing,
        fill: visible ? 'backwards' : 'forwards',
      },
    );
    runningRef.current = animation;
    animation.finished
      .then(() => {
        if (runningRef.current !== animation) return;
        if (visible) runningRef.current = null;
        else latestRef.current.onFadedOut?.();
      })
      .catch(() => {});
  }, [visible]);

  return React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);
}

export { toCssTiming, type CssTiming } from '../utils/motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyComponent = React.ComponentType<any>;
type ElementProps = Record<string, any> & {
  ref?: React.Ref<unknown>;
  style?: object;
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

function asMotion(element: React.ReactElement, motionProps: ElementProps) {
  const own = element.props as ElementProps;
  return React.createElement(motionFor(element.type as AnyComponent), {
    ...own,
    ...motionProps,
    ref: mergeRefs(own.ref, motionProps.ref),
    style: { ...own.style, ...motionProps.style },
  });
}

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

export function slotChild(
  asChild: boolean | undefined,
  children: React.ReactNode,
) {
  const element =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? children
      : null;
  return { element, inner: element ? element.props.children : children };
}

export function MotionSlot({
  element,
  as = 'div',
  children,
  ...motionProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Record<string, any> & {
  element: React.ReactElement | null;
  as?: 'div' | 'span' | 'nav';
  children?: unknown;
}) {
  if (element)
    return asMotion(
      React.cloneElement(element, undefined, children as React.ReactNode),
      motionProps,
    );
  return React.createElement(
    motionFor(as),
    motionProps,
    children as React.ReactNode,
  );
}

export function renderedElement(
  render: React.ReactElement | RenderFunction | undefined,
  props: ElementProps,
  state?: unknown,
) {
  if (typeof render === 'function') return render(props, state);
  return render ?? null;
}
