import type { ComputedRef, Ref } from 'vue';
import type { Transition } from 'motion-v';

import { motionTokens, toCssTiming, useTempoTransition } from '../utils/motion';

export const OVERLAY_TRANSITION = motionTokens.transition.overlay;
export const DIALOG_TRANSITION = motionTokens.spring.dialog;
export const DISMISS_TRANSITION = motionTokens.transition.dismiss;
export const SHEET_TRANSITION = motionTokens.transition.sheet;
export const TOAST_TRANSITION = motionTokens.spring.toast;
export const DRAWER_TRANSITION = motionTokens.transition.drawer;
export const DRAWER_EXIT_TRANSITION = motionTokens.transition.drawerOut;
const CONTENT_FADE = motionTokens.transition.dialogFade;

export type ModalAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

export type ModalSide = 'top' | 'right' | 'bottom' | 'left';
export type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

export function useOverlayTransitions(props: () => ModalAnimationProps): {
  enter: ComputedRef<Transition>;
  exit: ComputedRef<Transition>;
} {
  const enter = useTempoTransition(
    () => props().transition ?? OVERLAY_TRANSITION,
  );
  const exit = useTempoTransition(
    () => props().exitTransition ?? props().transition ?? OVERLAY_TRANSITION,
  );
  return { enter, exit };
}

export function useContentTransitions(
  side: () => ModalSide | undefined,
  props: () => ModalAnimationProps,
): { enter: () => Transition; exit: () => Transition } {
  const enter = useTempoTransition(
    () => props().transition ?? (side() ? SHEET_TRANSITION : DIALOG_TRANSITION),
  );
  const exit = useTempoTransition(
    () => props().exitTransition ?? DISMISS_TRANSITION,
  );
  const fade = useTempoTransition(() => CONTENT_FADE);
  return {
    enter: () =>
      side() || props().transition
        ? enter.value
        : { ...enter.value, opacity: fade.value },
    exit: () => exit.value,
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

function getFlip(from: FlipDirection) {
  const axis = from === 'top' || from === 'bottom' ? 'rotateX' : 'rotateY';
  const angle = from === 'bottom' || from === 'left' ? '20deg' : '-20deg';
  return {
    tipped: `perspective(500px) ${axis}(${angle}) scale(${motionTokens.scale.dialog})`,
    upright: `perspective(500px) ${axis}(0deg) scale(1)`,
  };
}

type Target = Record<string, unknown>;

export type ModalTargets = { initial: Target; animate: Target; exit: Target };

export function getContentTargets({
  side,
  from = 'top',
  reduce,
  enter,
  exit,
}: {
  side: ModalSide | undefined;
  from?: FlipDirection;
  reduce: boolean;
  enter: Transition;
  exit: Transition;
}): ModalTargets {
  if (side) {
    const shown =
      side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
    const hidden = { opacity: 0, transform: reduce ? shown : OFFSCREEN[side] };
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

type BackdropValues = Record<
  'backgroundColor' | 'backdropFilter' | 'opacity',
  string
>;

const CLEAR: BackdropValues = {
  backgroundColor: 'transparent',
  backdropFilter: 'none',
  opacity: '0',
};

type Backdrop = BackdropValues & { hasImage: boolean };

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

/**
 * Fades a backdrop's own color and blur in and out (read from its CSS), so
 * any overlay style animates. `fadeOut` resolves once it has faded.
 */
export function useBackdropFade(
  element: Ref<HTMLElement | null>,
  transitions: { enter: Ref<Transition>; exit: Ref<Transition> },
): { fadeIn: () => Promise<void>; fadeOut: () => Promise<void> } {
  let running: Animation | null = null;
  let mounted = false;

  const run = (show: boolean) => {
    const el = element.value;
    const mounting = !mounted;
    mounted = true;
    if (mounting && !show) return Promise.resolve();
    if (!el || typeof el.animate !== 'function') return Promise.resolve();
    const midway = running ? readBackdrop(el) : null;
    running?.cancel();
    const rest = readBackdrop(el);
    const { duration, easing } = toCssTiming(
      show ? transitions.enter.value : transitions.exit.value,
    );
    const animation = el.animate(
      backdropKeyframes(
        rest,
        midway ?? (show ? CLEAR : rest),
        show ? rest : CLEAR,
      ),
      { duration, easing, fill: show ? 'backwards' : 'forwards' },
    );
    running = animation;
    return animation.finished
      .then(() => {
        if (running === animation && show) running = null;
      })
      .catch(() => {});
  };

  return {
    fadeIn: () => run(true),
    fadeOut: () => run(false),
  };
}
