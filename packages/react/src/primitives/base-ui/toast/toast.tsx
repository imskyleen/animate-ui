'use client';
/* eslint-disable @typescript-eslint/no-namespace */

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

type RootAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
  progressBar?: boolean;
};

type ContentAnimationProps = {
  transition?: Transition;
};

type ProviderAnimationProps = {
  progressBar?: boolean;
};

const GAP = '0.75rem';
const PEEK = '0.75rem';
const ANCHORED_SCALE = HIDDEN_SCALE.tooltip;
const RISE_SCALE = motionTokens.scale.toast;
const RISE_BLUR = motionTokens.blur.surface;
const FADE_TRANSITION = motionTokens.transition.fade;
const DEFAULT_TIMEOUT = 5000;
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

function getSide(directions: Direction[]) {
  return directions.includes('up') && !directions.includes('down')
    ? 'top'
    : 'bottom';
}

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
  cascade: string | undefined;
  swipe: React.CSSProperties | null;
  thrown: CssTiming | null;
};

function stackStyle(
  state: ToastPrimitive.Root.State,
  { side, reduce, anchored, enter, exit, cascade, swipe, thrown }: StackOptions,
): React.CSSProperties {
  const ending = state.transitionStatus === 'ending';
  const starting = state.transitionStatus === 'starting';
  const hidden = starting || ending || state.limited;

  if (state.swiping) return swipe ?? { opacity: hidden ? 0 : 1 };

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
  const timing = swiped && thrown ? thrown : ending ? exit : enter;
  const properties = !reduce
    ? ['transform', 'opacity', 'height', 'filter']
    : swiped
      ? ['transform', 'opacity']
      : ['opacity', 'filter'];
  const style: React.CSSProperties = {
    opacity: hidden ? 0 : 1,
    ...transitionStyle(properties, timing, ending ? undefined : cascade),
  };

  const dir = side === 'top' ? -1 : 1;
  const behindScale = 'max(0.9, calc(1 - var(--toast-index) * 0.05))';
  const restScale = state.expanded ? '1' : behindScale;
  const clamp = 'var(--toast-frontmost-height, var(--toast-height, 0px))';
  const restY = state.expanded
    ? `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-offset-y, 0px) + var(--toast-index, 0) * ${GAP}))`
    : `calc(var(--toast-swipe-movement-y, 0px) - ${dir} * (var(--toast-index, 0) * ${PEEK} + (1 - ${behindScale}) * ${clamp}))`;

  let exitX = '0px';
  let exitY = '0px';
  let scale = restScale;
  if ((starting || ending) && !swiped) {
    style.filter = RISE_BLUR;
    if (!reduce) {
      exitY = `${dir * 100}%`;
      scale = `calc(${restScale} * ${RISE_SCALE})`;
    }
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

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const icon = root && iconOf(root);
    if (icon)
      showIcon(icon, toast.type, tokens.transition.check.delay, tokens, reduce);
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
  export type Props = ToastPrimitive.Root.Props &
    RootAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = ToastPrimitive.Root.State;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ToastObject<Data extends object = any> =
    ToastPrimitive.Root.ToastObject<Data>;
}

function subscribeToWindowFocus(onChange: () => void) {
  window.addEventListener('focus', onChange, true);
  window.addEventListener('blur', onChange, true);
  return () => {
    window.removeEventListener('focus', onChange, true);
    window.removeEventListener('blur', onChange, true);
  };
}

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
  const pausedRef = React.useRef({ ending, windowFocused });

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
