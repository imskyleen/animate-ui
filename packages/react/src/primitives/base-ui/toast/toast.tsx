'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import type { Transition } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  DISMISS_TRANSITION,
  TOAST_TRANSITION,
  toCssTiming,
  type CssTiming,
} from '../../../internal/modal-motion';
import { HIDDEN_SCALE, POPOVER_TRANSITION } from '../../../internal/anchored';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  iconOf,
  moveDrag,
  showIcon,
  startDrag,
  swapContent,
  swipeStyle,
  takeSnapshot,
  throwTiming,
  UpdateSnapshot,
  PROGRESS,
  PROGRESS_BAR,
  PROGRESS_CSS,
  type Direction,
  type Drag,
  type Snapshot,
} from '../../../internal/toast-motion';

// Same API as Base UI's Toast. Animate UI v1 had no toast: it rises from its
// edge like v1's Sheet, by its own size, and lands. A toast anchored to an
// element is a small bubble, like a tooltip: it grows from 0.7 and fades in
// from its anchor, on the tooltips' spring (stiffness 400, damping 29). The
// content behind the front toast fades in 200ms, ease-out.
//
// Base UI drives the stack, swipe-to-dismiss and enter/exit itself, through
// CSS variables (`--toast-index`, `--toast-offset-y`, `--toast-height`,
// `--toast-swipe-movement-*`, the viewport's `--toast-frontmost-height`) and
// its transition status, and waits for CSS transitions before removing a
// toast. So the Root animates with CSS transitions too (a JS animation would
// fight the swipe), springs written as the `linear()` curve Motion itself
// would use, and sets them itself from its state (`tempo` applies):
//
// - It rises from its edge (a full toast height away), from 0.96 and a 4px
//   blur, fading in, on a spring that goes a little past its rest and
//   settles (stiffness 280, damping 24): it lands.
// - Collapsed, each toast behind the front one scales down by 0.05 per step
//   (never below 0.9) and peeks out by 0.75rem; hovering or focusing the
//   viewport expands the stack with a 0.75rem gap, front to back, each toast
//   30ms after the one in front of it, and it folds back the same way. The
//   stack moves on the same spring, its height too (a toast updated with
//   longer content glides to its new height).
// - While swiped it follows the finger, rubber-banded the wrong way, fading
//   as it goes; let go, it springs back, or it's thrown the way it was
//   swiped at the finger's speed (linear).
// - Dismissed, it leaves through its edge the way it came, quicker than it
//   came, speeding away (0.2s, like a dialog dismissed).
// - Its icon shows by type, and an update swaps its icon and text in place
//   (internal/toast-motion).
// - A bar of the time it has left, in its type's color, paused whenever
//   Base UI pauses its timer (`progressBar={false}` on the Root or the
//   Provider leaves it out).
// - Under reduced motion it fades in place, the stack changes at once, the
//   icon and text only fade.

/** Animate UI's additions to `Toast.Root`. */
type RootAnimationProps = {
  /**
   * Transition of the entrance and the stack (a CSS transition: a spring
   * becomes a `linear()` curve, a tween keeps its `duration` and cubic-bezier
   * or named `ease`). `{ type: 'spring', stiffness: 280, damping: 24 }` by
   * default, or `{ type: 'spring', stiffness: 400, damping: 29 }` for a toast
   * anchored to an element.
   */
  transition?: Transition;
  /**
   * Transition of the exit (a CSS transition). `{ duration: 0.2, ease:
   * [0.33, 0.17, 0.67, 0.5] }` by default; an anchored toast leaves on its
   * `transition`. A swiped toast is thrown at the finger's speed instead.
   */
  exitTransition?: Transition;
  /**
   * Shows a bar of the time the toast has left along its bottom edge,
   * paused while Base UI pauses its timer (the stack hovered or focused, the
   * window in the background). Defaults to the Provider's `progressBar`.
   */
  progressBar?: boolean;
};

/** Animate UI's additions to `Toast.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the content fading behind the front toast (a CSS
   * transition).
   * @default { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: Transition;
};

/** Animate UI's additions to `Toast.Provider`. */
type ProviderAnimationProps = {
  /**
   * Shows a bar of the time each toast has left (see `Toast.Root`'s
   * `progressBar`). Pass `false` to leave it out.
   * @default true
   */
  progressBar?: boolean;
};

const GAP = '0.75rem';
const PEEK = '0.75rem';
/** An anchored toast grows from 0.7, like a tooltip. */
const ANCHORED_SCALE = HIDDEN_SCALE.tooltip;
/** A toast from an edge rises from 0.96, out of a 4px blur. */
const RISE_SCALE = motionTokens.scale.toast;
const RISE_BLUR = motionTokens.blur.surface;
/** The content behind the front toast: a short fade, 200ms ease-out. */
const FADE_TRANSITION = motionTokens.transition.fade;
/** Base UI's default `timeout`. */
const DEFAULT_TIMEOUT = 5000;
/**
 * ms: how long after the stack expands (or collapses) a change still
 * cascades, front to back.
 */
const CASCADE_WINDOW = 150;

const STYLE_HREF = 'animate-ui-base-ui-toast';

type ToastSettings = { timeout: number; progressBar: boolean };

const ToastSettingsContext = React.createContext<ToastSettings>({
  timeout: DEFAULT_TIMEOUT,
  progressBar: true,
});

function transitionStyle(
  properties: string[],
  timing: CssTiming,
  delay?: string,
): React.CSSProperties {
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${timing.duration}ms`,
    transitionTimingFunction: timing.easing,
    transitionDelay: delay ?? '0ms',
  };
}

function getDirections(swipeDirection: Root.Props['swipeDirection']) {
  return (
    Array.isArray(swipeDirection)
      ? swipeDirection
      : swipeDirection
        ? [swipeDirection]
        : ['down', 'right']
  ) as Direction[];
}

// Toasts swiped down (Base UI's default) live at the bottom edge.
function getSide(directions: Direction[]) {
  return directions.includes('up') && !directions.includes('down')
    ? 'top'
    : 'bottom';
}

/**
 * Whether the stack has just expanded or collapsed: its changes then
 * cascade, front to back. Read while Base UI renders (its `style` callback).
 */
function useCascade() {
  const ref = React.useRef<{ expanded?: boolean; at: number }>({
    at: -Infinity,
  });
  return (expanded: boolean) => {
    const last = ref.current;
    if (last.expanded !== undefined && last.expanded !== expanded)
      last.at = performance.now();
    last.expanded = expanded;
    return performance.now() - last.at < CASCADE_WINDOW;
  };
}

type StackOptions = {
  side: 'top' | 'bottom';
  reduce: boolean;
  anchored: boolean;
  enter: CssTiming;
  exit: CssTiming;
  /** The cascade's delay, while the stack expands or collapses. */
  cascade: string | undefined;
  /** The toast following the finger. */
  swipe: React.CSSProperties | null;
  /** Thrown away by a swipe. */
  thrown: CssTiming | null;
};

function stackStyle(
  state: ToastPrimitive.Root.State,
  { side, reduce, anchored, enter, exit, cascade, swipe, thrown }: StackOptions,
): React.CSSProperties {
  const ending = state.transitionStatus === 'ending';
  const starting = state.transitionStatus === 'starting';
  const hidden = starting || ending || state.limited;

  // While swiped, Base UI sets no transition: the toast follows the finger.
  if (state.swiping) return swipe ?? { opacity: hidden ? 0 : 1 };

  // A toast anchored to an element (Toast.Positioner) isn't stacked: it
  // grows from its anchor, like a tooltip.
  if (anchored) {
    return {
      opacity: hidden ? 0 : 1,
      ...transitionStyle(
        reduce ? ['opacity'] : ['transform', 'opacity', 'height'],
        ending ? exit : enter,
      ),
      transform: `scale(${hidden && !reduce ? ANCHORED_SCALE : 1})`,
      transformOrigin: 'var(--transform-origin)',
    };
  }

  const swiped = ending
    ? (state.swipeDirection as Direction | undefined)
    : undefined;
  // Thrown by a swipe: it keeps the finger's speed, and doesn't blur.
  const timing = swiped && thrown ? thrown : ending ? exit : enter;
  // Under reduced motion only the fade transitions, but a swipe still
  // throws the toast along the swipe.
  const properties = !reduce
    ? ['transform', 'opacity', 'height', 'filter']
    : swiped
      ? ['transform', 'opacity']
      : ['opacity'];
  const style: React.CSSProperties = {
    opacity: hidden ? 0 : 1,
    ...transitionStyle(properties, timing, ending ? undefined : cascade),
  };

  const dir = side === 'top' ? -1 : 1;
  // Scale of a toast behind the front one, never below 0.9.
  const behindScale = 'max(0.9, calc(1 - var(--toast-index) * 0.05))';
  const restScale = state.expanded ? '1' : behindScale;
  // Collapsed toasts take the front toast's height (shadcn/ui sizes them
  // so); scaled down, they are pulled back by what they lost.
  const clamp = 'var(--toast-frontmost-height, var(--toast-height, 0px))';
  const restY = state.expanded
    ? `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-offset-y, 0px) + var(--toast-index, 0) * ${GAP}))`
    : `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-index, 0) * ${PEEK} + (1 - ${behindScale}) * ${clamp}))`;

  // Off-screen offset: from and back to its edge, or onward in the swipe
  // direction. None under reduced motion: it fades in place (a swipe still
  // throws it along the swipe).
  let exitX = '0px';
  let exitY = '0px';
  let scale = restScale;
  if ((starting || ending) && !swiped && !reduce) {
    exitY = `${dir * 100}%`;
    // It rises from 0.96, out of a 4px blur, and leaves the same way.
    scale = `calc(${restScale} * ${RISE_SCALE})`;
    style.filter = RISE_BLUR;
  }
  if (swiped === 'down') exitY = '100%';
  if (swiped === 'up') exitY = '-100%';
  if (swiped === 'right') exitX = '100%';
  if (swiped === 'left') exitX = '-100%';

  style.transform = `translateX(calc(var(--toast-swipe-movement-x, 0px) + ${exitX})) translateY(calc(${restY} + ${exitY})) scale(${scale})`;
  style.transformOrigin = side === 'top' ? 'top' : 'bottom';
  return style;
}

function resolveStyle<State>(
  style:
    | React.CSSProperties
    | ((state: State) => React.CSSProperties | undefined)
    | undefined,
  state: State,
) {
  return typeof style === 'function' ? style(state) : style;
}

function Provider({ progressBar = true, ...props }: Provider.Props) {
  const timeout = props.timeout ?? DEFAULT_TIMEOUT;
  const settings = React.useMemo(
    () => ({ timeout, progressBar }),
    [timeout, progressBar],
  );
  return (
    <ToastSettingsContext value={settings}>
      <ToastPrimitive.Provider {...props} />
    </ToastSettingsContext>
  );
}

namespace Provider {
  /** Base UI's props, plus Animate UI's `progressBar`. */
  export type Props = ToastPrimitive.Provider.Props & ProviderAnimationProps;
  export type State = ToastPrimitive.Provider.State;
}

const Viewport = ToastPrimitive.Viewport;

namespace Viewport {
  export type Props = ToastPrimitive.Viewport.Props;
  export type State = ToastPrimitive.Viewport.State;
}

function Root(props: Root.Props) {
  return (
    <ReducedMotionConfig>
      <RootMotion {...props} />
    </ReducedMotionConfig>
  );
}

function RootMotion({
  ref,
  style,
  transition,
  exitTransition,
  progressBar: progressBarProp,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: Root.Props) {
  const { toast } = props;
  const reduce = useShouldReduceMotion();
  const tokens = useMotionTokens();
  const settings = React.use(ToastSettingsContext);
  const anchored = toast.positionerProps != null;
  const enter = toCssTiming(
    useTempoTransition(
      transition ?? (anchored ? POPOVER_TRANSITION : TOAST_TRANSITION),
    ),
  );
  const exit = toCssTiming(
    useTempoTransition(
      exitTransition ??
        (anchored ? (transition ?? POPOVER_TRANSITION) : DISMISS_TRANSITION),
    ),
  );
  const fade = toCssTiming(useTempoTransition(FADE_TRANSITION));
  const directions = getDirections(props.swipeDirection);
  const side = getSide(directions);
  const cascading = useCascade();
  const stagger = tokens.stagger.stack * 1000;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);

  // The icon shows once the toast has landed.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const icon = root && iconOf(root);
    if (icon)
      showIcon(icon, toast.type, tokens.transition.check.delay, tokens, reduce);
    // On mount only: updates go through `UpdateSnapshot`.
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, []);

  const lastTypeRef = React.useRef(toast.type);
  const onUpdate = (snapshot: Snapshot) => {
    const typeChanged = lastTypeRef.current !== toast.type;
    lastTypeRef.current = toast.type;
    swapContent(
      rootRef.current,
      snapshot,
      typeChanged,
      toast.type,
      tokens,
      enter,
      reduce,
    );
  };

  const progressBar = progressBarProp ?? settings.progressBar;
  const duration = toast.timeout ?? settings.timeout;

  return (
    <UpdateSnapshot
      watch={[toast.type, toast.title, toast.description]}
      take={() => takeSnapshot(rootRef.current)}
      onUpdate={onUpdate}
    >
      <ToastPrimitive.Root
        {...props}
        ref={mergeRefs(ref, rootRef)}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.button === 0) dragRef.current = startDrag(event);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (dragRef.current) moveDrag(dragRef.current, event, directions);
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          const drag = dragRef.current;
          if (drag?.pointerId === event.pointerId)
            drag.releasedAt = event.timeStamp;
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          dragRef.current = null;
        }}
        // Base UI calls it with the toast's state on every change; the user's
        // style still applies on top.
        style={(state) => {
          const cascade =
            cascading(state.expanded) && !reduce
              ? `calc(var(--toast-index, 0) * ${stagger}ms)`
              : undefined;
          const drag = dragRef.current;
          return {
            ...stackStyle(state, {
              side,
              reduce,
              anchored,
              enter,
              exit,
              cascade,
              swipe:
                state.swiping && drag ? swipeStyle(drag, directions) : null,
              thrown:
                state.transitionStatus === 'ending' &&
                state.swipeDirection &&
                drag
                  ? throwTiming(drag, state.swipeDirection as Direction)
                  : null,
            }),
            ...(progressBar && {
              '--animate-ui-toast-fade-duration': `${fade.duration}ms`,
              '--animate-ui-toast-fade-ease': fade.easing,
              '--animate-ui-toast-cascade': cascade ?? '0ms',
            }),
            ...resolveStyle(style, state),
          };
        }}
      >
        {children}
        {progressBar && !anchored && (
          <RemainingTime
            duration={duration}
            running={toast.type !== 'loading' && duration > 0}
            ending={toast.transitionStatus === 'ending'}
          />
        )}
      </ToastPrimitive.Root>
    </UpdateSnapshot>
  );
}

namespace Root {
  /**
   * Base UI's props, plus Animate UI's `transition`, `exitTransition` and
   * `progressBar`.
   */
  export type Props = ToastPrimitive.Root.Props &
    RootAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ToastPrimitive.Root.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ToastObject<Data extends object = any> =
    ToastPrimitive.Root.ToastObject<Data>;
}

/** Whether the window is in the foreground (Base UI pauses timers when not). */
function subscribeToWindowFocus(onChange: () => void) {
  window.addEventListener('focus', onChange, true);
  window.addEventListener('blur', onChange, true);
  return () => {
    window.removeEventListener('focus', onChange, true);
    window.removeEventListener('blur', onChange, true);
  };
}

/**
 * The time the toast has left: a bar shrinking linearly over its timeout
 * (real time: `tempo` doesn't pace it), paused while Base UI pauses its timer
 * (the stack expanded, the window in the background), from where it was.
 * It starts over when the timer does: a loading toast resolved, a new
 * timeout. A toast without a timer (loading, `timeout: 0`) has no bar.
 */
/** The bar's color when the toast's type has one (its icon's). */
const TINT_VAR = '--animate-ui-toast-progress-color';
const TINTED = 'data-tinted';

function RemainingTime({
  duration,
  running,
  ending,
}: {
  duration: number;
  running: boolean;
  ending: boolean;
}) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const windowFocused = React.useSyncExternalStore(
    subscribeToWindowFocus,
    () => document.hasFocus(),
    () => true,
  );
  // What pauses it besides the stack expanding, as of the last commit.
  const pausedRef = React.useRef({ ending, windowFocused });

  // The Root: the bar's holder's parent (its ref isn't set yet when the
  // bar's own effects first run).
  const rootOf = () => barRef.current?.parentElement?.parentElement ?? null;

  const sync = React.useCallback(() => {
    const animation = animationRef.current;
    const root = rootOf();
    if (!animation || !root) return;
    const paused =
      pausedRef.current.ending ||
      !pausedRef.current.windowFocused ||
      root.hasAttribute('data-expanded');
    if (paused && animation.playState === 'running') animation.pause();
    if (!paused && animation.playState === 'paused') animation.play();
  }, []);

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (!running || !bar) return undefined;
    const animation = bar.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration, easing: 'linear', fill: 'forwards' },
    );
    animationRef.current = animation;
    // In the color of the toast's type: its icon's (shadcn colors the
    // error's), else its text's.
    const root = rootOf();
    const icon = root?.querySelector('[data-slot="toast-icon"] > *');
    const tint = icon && root ? getComputedStyle(icon).color : null;
    if (tint && tint !== getComputedStyle(root!).color) {
      bar.style.setProperty(TINT_VAR, tint);
      bar.setAttribute(TINTED, '');
    } else {
      bar.style.removeProperty(TINT_VAR);
      bar.removeAttribute(TINTED);
    }
    sync();
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [running, duration, sync]);

  // Base UI marks the stack expanded on the Root (`data-expanded`).
  React.useLayoutEffect(() => {
    const root = rootOf();
    if (!running || !root) return undefined;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributeFilter: ['data-expanded'] });
    return () => observer.disconnect();
  }, [running, sync]);

  React.useLayoutEffect(() => {
    pausedRef.current = { ending, windowFocused };
    sync();
  }, [sync, ending, windowFocused]);

  if (!running) return null;
  return (
    <>
      <style href={STYLE_HREF} precedence="animate-ui">
        {PROGRESS_CSS}
      </style>
      <div {...{ [PROGRESS]: '' }} aria-hidden="true">
        <div ref={barRef} {...{ [PROGRESS_BAR]: '' }} />
      </div>
    </>
  );
}

function Content({ style, transition, ...props }: Content.Props) {
  const reduce = useShouldReduceMotion();
  const cascading = useCascade();
  const stagger = useMotionTokens().stagger.stack * 1000;
  // Fades behind the front toast while collapsed (shadcn/ui's
  // data-behind:opacity-0), back in when the stack expands, in cascade with
  // its toast: v1's fade.
  const timing = toCssTiming(useTempoTransition(transition ?? FADE_TRANSITION));

  return (
    <ToastPrimitive.Content
      {...props}
      style={(state) => ({
        ...transitionStyle(
          ['opacity'],
          timing,
          cascading(state.expanded) && !reduce
            ? `calc(var(--toast-index, 0) * ${stagger}ms)`
            : undefined,
        ),
        ...resolveStyle(style, state),
      })}
    />
  );
}

namespace Content {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = ToastPrimitive.Content.Props &
    ContentAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ToastPrimitive.Content.State;
}

const Description = ToastPrimitive.Description;

namespace Description {
  export type Props = ToastPrimitive.Description.Props;
  export type State = ToastPrimitive.Description.State;
}

const Title = ToastPrimitive.Title;

namespace Title {
  export type Props = ToastPrimitive.Title.Props;
  export type State = ToastPrimitive.Title.State;
}

const Close = ToastPrimitive.Close;

namespace Close {
  export type Props = ToastPrimitive.Close.Props;
  export type State = ToastPrimitive.Close.State;
}

const Action = ToastPrimitive.Action;

namespace Action {
  export type Props = ToastPrimitive.Action.Props;
  export type State = ToastPrimitive.Action.State;
}

const Portal = ToastPrimitive.Portal;

namespace Portal {
  export type Props = ToastPrimitive.Portal.Props;
  export type State = ToastPrimitive.Portal.State;
}

const Positioner = ToastPrimitive.Positioner;

namespace Positioner {
  export type Props = ToastPrimitive.Positioner.Props;
  export type State = ToastPrimitive.Positioner.State;
}

const Arrow = ToastPrimitive.Arrow;

namespace Arrow {
  export type Props = ToastPrimitive.Arrow.Props;
  export type State = ToastPrimitive.Arrow.State;
}

const useToastManager: typeof ToastPrimitive.useToastManager =
  ToastPrimitive.useToastManager;
const createToastManager: typeof ToastPrimitive.createToastManager =
  ToastPrimitive.createToastManager;

export {
  Provider,
  Viewport,
  Root,
  Content,
  Description,
  Title,
  Close,
  Action,
  Portal,
  Positioner,
  Arrow,
  useToastManager,
  createToastManager,
};
