'use client';

import * as React from 'react';
import {
  motion,
  useAnimation,
  type SVGMotionProps,
  type UseInViewOptions,
  type LegacyAnimationControls,
  type Variants,
  type HTMLMotionProps,
} from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';
import { useIsInView } from '@/registry/hooks/use-is-in-view';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

const staticAnimations = {
  path: {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [0.05, 1],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
  } as Variants,
  'path-loop': {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [1, 0.05, 1],
      transition: {
        duration: 1.6,
        ease: 'easeInOut',
      },
    },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type TriggerProp<T = string> = boolean | StaticAnimations | T;
type Trigger = TriggerProp<string>;

type AnimateIconContextValue = {
  controls: LegacyAnimationControls | undefined;
  animation: StaticAnimations | string;
  loop: boolean;
  loopDelay: number;
  active: boolean;
  animate?: Trigger;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
};

type DefaultIconProps<T = string> = {
  animate?: TriggerProp<T>;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animateOnView?: TriggerProp<T>;
  animateOnViewMargin?: UseInViewOptions['margin'];
  animateOnViewOnce?: boolean;
  animation?: T | StaticAnimations;
  loop?: boolean;
  loopDelay?: number;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
};

type AnimateIconProps<T = string> = WithAsChild<
  HTMLMotionProps<'span'> &
    DefaultIconProps<T> & {
      children: React.ReactNode;
      asChild?: boolean;
    }
>;

type IconProps<T> = DefaultIconProps<T> &
  Omit<SVGMotionProps<SVGSVGElement>, 'animate'> & {
    size?: number;
  };

type IconWrapperProps<T> = IconProps<T> & {
  icon: React.ComponentType<IconProps<T>>;
};

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(
  null,
);

function useAnimateIconContext() {
  const context = React.use(AnimateIconContext);
  if (!context)
    return {
      controls: undefined,
      animation: 'default',
      loop: undefined,
      loopDelay: undefined,
      active: undefined,
      animate: undefined,
      initialOnAnimateEnd: undefined,
      completeOnStop: undefined,
      persistOnAnimateEnd: undefined,
      delay: undefined,
    };
  return context;
}

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function subscribeToHover(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * True when the primary pointer can hover (mouse, trackpad). Touch browsers
 * fire `mouseenter` on tap and never fire `mouseleave`, so hover animations
 * are gated on this to avoid starting (and sticking) on tap.
 */
function useCanHover() {
  return React.useSyncExternalStore(
    subscribeToHover,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = Record<string, any>;

type StartOptions = {
  /** Play one full iteration, then return to rest (taps). */
  once?: boolean;
};

/**
 * Wraps the icon tree in `ReducedMotionConfig` so reduced motion works
 * without any app setup. Under reduced motion icons never animate, whatever
 * the trigger: they stay in their `initial` state.
 */
function AnimateIcon(props: AnimateIconProps) {
  return (
    <ReducedMotionConfig>
      <AnimateIconRoot {...props} />
    </ReducedMotionConfig>
  );
}

/**
 * Triggers:
 * - `animateOnHover`: plays while a hover-capable fine pointer is over the
 *   icon. Ignored on touch (and for touch input on hybrid devices).
 * - `animateOnTap`: a tap plays the whole animation once, then returns to
 *   rest (one iteration when `loop` is set). Mouse plays on press for
 *   immediate feedback; touch and pen play on release, so a scroll gesture
 *   (`pointercancel`) never starts it. Tapping again replays it. Pressing
 *   while a hover animation runs replays it and keeps it running until the
 *   pointer leaves. There is no press-and-hold mode.
 * - `animateOnView`, `animate`: unchanged.
 */
function AnimateIconRoot({
  asChild = false,
  animate = false,
  animateOnHover = false,
  animateOnTap = false,
  animateOnView = false,
  animateOnViewMargin = '0px',
  animateOnViewOnce = true,
  animation = 'default',
  loop = false,
  loopDelay = 0,
  initialOnAnimateEnd = false,
  completeOnStop = false,
  persistOnAnimateEnd = false,
  delay = 0,
  children,
  onMouseEnter,
  onMouseLeave,
  onPointerEnter,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: AnimateIconProps) {
  const controls = useAnimation();
  const reduceMotion = useShouldReduceMotion();
  const canHover = useCanHover();

  const [localAnimate, setLocalAnimate] = React.useState<boolean>(() => {
    if (animate === undefined || animate === false) return false;
    return delay <= 0;
  });
  // Bumped on every start so that re-triggering while active replays.
  const [runId, setRunId] = React.useState(0);
  const [currentAnimation, setCurrentAnimation] = React.useState<
    string | StaticAnimations
  >(typeof animate === 'string' ? animate : animation);

  const playing = localAnimate && !reduceMotion;

  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopDelayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimateInProgressRef = React.useRef<boolean>(false);
  const animateEndPromiseRef = React.useRef<Promise<void> | null>(null);
  const lastTargetRef = React.useRef<'initial' | 'animate'>('initial');
  const onceRef = React.useRef(false);
  const hoverActiveRef = React.useRef(false);
  const pointerTypeRef = React.useRef<string>('mouse');
  const pendingTapRef = React.useRef<number | null>(null);

  const startAnimation = React.useCallback(
    (trigger: TriggerProp, options: StartOptions = {}) => {
      const next = typeof trigger === 'string' ? trigger : animation;
      onceRef.current = !!options.once;
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      setCurrentAnimation(next);
      setRunId((id) => id + 1);
      if (delay > 0) {
        setLocalAnimate(false);
        delayRef.current = setTimeout(() => {
          delayRef.current = null;
          setLocalAnimate(true);
        }, delay);
      } else {
        setLocalAnimate(true);
      }
    },
    [animation, delay],
  );

  const stopAnimation = React.useCallback(() => {
    onceRef.current = false;
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (loopDelayRef.current) {
      clearTimeout(loopDelayRef.current);
      loopDelayRef.current = null;
    }
    setLocalAnimate(false);
  }, []);

  React.useEffect(() => {
    if (animate === undefined) return;
    setCurrentAnimation(typeof animate === 'string' ? animate : animation);
    if (animate) startAnimation(animate as TriggerProp);
    else stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  React.useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
      if (loopDelayRef.current) clearTimeout(loopDelayRef.current);
    };
  }, []);

  const viewOuterRef = React.useRef<HTMLElement>(null);
  const { ref: inViewRef, isInView } = useIsInView(viewOuterRef, {
    inView: !!animateOnView,
    inViewOnce: animateOnViewOnce,
    inViewMargin: animateOnViewMargin,
  });

  const startAnim = React.useCallback(
    async (anim: 'initial' | 'animate', method: 'start' | 'set' = 'start') => {
      lastTargetRef.current = anim;
      try {
        await controls[method](anim);
      } catch {
        return;
      }
    },
    [controls],
  );

  React.useEffect(() => {
    if (!animateOnView) return;
    if (isInView) startAnimation(animateOnView);
    else stopAnimation();
  }, [isInView, animateOnView, startAnimation, stopAnimation]);

  React.useEffect(() => {
    // Each run owns `controls` until a newer run starts (or unmount): a stale
    // run returns without touching them, so it never fights the newer one.
    let stale = false;
    const isStale = () => stale;

    async function rest() {
      if (reduceMotion) {
        await startAnim('initial', 'set');
        return;
      }
      if (
        completeOnStop &&
        isAnimateInProgressRef.current &&
        animateEndPromiseRef.current
      ) {
        await animateEndPromiseRef.current;
        if (isStale()) return;
      }
      if (!persistOnAnimateEnd) await startAnim('initial');
    }

    async function play() {
      for (let iteration = 0; ; iteration++) {
        // Loops restart from rest. The first iteration skips this when the
        // icon is at rest or returning to it, so re-hovering mid-return
        // retargets from the current values instead of snapping.
        if (loop && (iteration > 0 || lastTargetRef.current === 'animate')) {
          await startAnim('initial', 'set');
          if (isStale()) return;
        }

        let resolveEnd!: () => void;
        const endPromise = new Promise<void>((resolve) => {
          resolveEnd = resolve;
        });
        isAnimateInProgressRef.current = true;
        animateEndPromiseRef.current = endPromise;

        await startAnim('animate');

        resolveEnd();
        if (animateEndPromiseRef.current === endPromise) {
          isAnimateInProgressRef.current = false;
          animateEndPromiseRef.current = null;
        }
        if (isStale()) return;

        if (initialOnAnimateEnd) {
          await startAnim('initial', 'set');
          if (isStale()) return;
        }

        if (onceRef.current) {
          onceRef.current = false;
          setLocalAnimate(false);
          return;
        }

        if (!loop) return;

        if (loopDelay > 0) {
          await new Promise<void>((resolve) => {
            loopDelayRef.current = setTimeout(() => {
              loopDelayRef.current = null;
              resolve();
            }, loopDelay);
          });
          if (isStale()) return;
        }
      }
    }

    void (playing ? play() : rest());

    return () => {
      stale = true;
      if (loopDelayRef.current) {
        clearTimeout(loopDelayRef.current);
        loopDelayRef.current = null;
      }
    };
  }, [
    playing,
    runId,
    reduceMotion,
    startAnim,
    loop,
    loopDelay,
    completeOnStop,
    persistOnAnimateEnd,
    initialOnAnimateEnd,
  ]);

  // With `asChild`, the Slot's handlers replace the child's: call them here.
  const childProps = (
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement).props
      : {}
  ) as AnyProps;

  const playTap = () => {
    if (!animateOnTap) return;
    startAnimation(animateOnTap, { once: !hoverActiveRef.current });
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerEnter?.(event);
    onPointerEnter?.(event);
    pointerTypeRef.current = event.pointerType;
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onMouseEnter?.(event);
    onMouseEnter?.(event);
    if (!animateOnHover || !canHover || pointerTypeRef.current === 'touch')
      return;
    hoverActiveRef.current = true;
    startAnimation(animateOnHover);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onMouseLeave?.(event);
    onMouseLeave?.(event);
    if (!hoverActiveRef.current) return;
    hoverActiveRef.current = false;
    stopAnimation();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerDown?.(event);
    onPointerDown?.(event);
    pointerTypeRef.current = event.pointerType;
    if (!animateOnTap || reduceMotion || event.button !== 0) return;
    if (event.pointerType === 'mouse') playTap();
    else pendingTapRef.current = event.pointerId;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerUp?.(event);
    onPointerUp?.(event);
    if (pendingTapRef.current !== event.pointerId) return;
    pendingTapRef.current = null;
    playTap();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerCancel?.(event);
    onPointerCancel?.(event);
    if (pendingTapRef.current === event.pointerId) pendingTapRef.current = null;
  };

  const handlers = {
    onPointerEnter: handlePointerEnter,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };

  const content = asChild ? (
    <Slot ref={inViewRef} {...props} {...handlers}>
      {children}
    </Slot>
  ) : (
    <motion.span ref={inViewRef} {...props} {...handlers}>
      {children}
    </motion.span>
  );

  return (
    <AnimateIconContext
      value={{
        controls,
        animation: currentAnimation,
        loop,
        loopDelay,
        active: playing,
        animate,
        initialOnAnimateEnd,
        completeOnStop,
        persistOnAnimateEnd,
        delay,
      }}
    >
      {content}
    </AnimateIconContext>
  );
}

const pathClassName =
  "[&_[stroke-dasharray='1px_1px']]:![stroke-dasharray:1px_0px]";

function IconWrapper<T extends string>({
  size = 28,
  animation: animationProp,
  animate,
  animateOnHover,
  animateOnTap,
  animateOnView,
  animateOnViewMargin,
  animateOnViewOnce,
  icon: IconComponent,
  loop,
  loopDelay,
  persistOnAnimateEnd,
  initialOnAnimateEnd,
  delay,
  completeOnStop,
  className,
  ...props
}: IconWrapperProps<T>) {
  const context = React.use(AnimateIconContext);

  if (context) {
    const {
      controls,
      animation: parentAnimation,
      loop: parentLoop,
      loopDelay: parentLoopDelay,
      active: parentActive,
      animate: parentAnimate,
      persistOnAnimateEnd: parentPersistOnAnimateEnd,
      initialOnAnimateEnd: parentInitialOnAnimateEnd,
      delay: parentDelay,
      completeOnStop: parentCompleteOnStop,
    } = context;

    const hasOverrides =
      animate !== undefined ||
      animateOnHover !== undefined ||
      animateOnTap !== undefined ||
      animateOnView !== undefined ||
      loop !== undefined ||
      loopDelay !== undefined ||
      initialOnAnimateEnd !== undefined ||
      persistOnAnimateEnd !== undefined ||
      delay !== undefined ||
      completeOnStop !== undefined;

    if (hasOverrides) {
      const inheritedAnimate: Trigger = parentActive
        ? (animationProp ?? parentAnimation ?? 'default')
        : false;

      const finalAnimate: Trigger = (animate ??
        parentAnimate ??
        inheritedAnimate) as Trigger;

      return (
        <AnimateIcon
          animate={finalAnimate}
          animateOnHover={animateOnHover}
          animateOnTap={animateOnTap}
          animateOnView={animateOnView}
          animateOnViewMargin={animateOnViewMargin}
          animateOnViewOnce={animateOnViewOnce}
          animation={animationProp ?? parentAnimation}
          loop={loop ?? parentLoop}
          loopDelay={loopDelay ?? parentLoopDelay}
          persistOnAnimateEnd={persistOnAnimateEnd ?? parentPersistOnAnimateEnd}
          initialOnAnimateEnd={initialOnAnimateEnd ?? parentInitialOnAnimateEnd}
          delay={delay ?? parentDelay}
          completeOnStop={completeOnStop ?? parentCompleteOnStop}
          asChild
        >
          <IconComponent
            size={size}
            className={cn(
              className,
              ((animationProp ?? parentAnimation) === 'path' ||
                (animationProp ?? parentAnimation) === 'path-loop') &&
                pathClassName,
            )}
            {...props}
          />
        </AnimateIcon>
      );
    }

    const animationToUse = animationProp ?? parentAnimation;
    const loopToUse = parentLoop;
    const loopDelayToUse = parentLoopDelay;

    return (
      <AnimateIconContext
        value={{
          controls,
          animation: animationToUse,
          loop: loopToUse,
          loopDelay: loopDelayToUse,
          active: parentActive,
          animate: parentAnimate,
          initialOnAnimateEnd: parentInitialOnAnimateEnd,
          delay: parentDelay,
          completeOnStop: parentCompleteOnStop,
        }}
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationToUse === 'path' || animationToUse === 'path-loop') &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIconContext>
    );
  }

  if (
    animate !== undefined ||
    animateOnHover !== undefined ||
    animateOnTap !== undefined ||
    animateOnView !== undefined ||
    animationProp !== undefined
  ) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animateOnView={animateOnView}
        animateOnViewMargin={animateOnViewMargin}
        animateOnViewOnce={animateOnViewOnce}
        animation={animationProp}
        loop={loop}
        loopDelay={loopDelay}
        delay={delay}
        completeOnStop={completeOnStop}
        persistOnAnimateEnd={persistOnAnimateEnd}
        initialOnAnimateEnd={initialOnAnimateEnd}
        asChild
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationProp === 'path' || animationProp === 'path-loop') &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIcon>
    );
  }

  return (
    <IconComponent
      size={size}
      className={cn(
        className,
        (animationProp === 'path' || animationProp === 'path-loop') &&
          pathClassName,
      )}
      {...props}
    />
  );
}

function resolveVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V, animationType: string): T {
  if (!(animationType in staticAnimations))
    return (animations[animationType as keyof V] as T) ?? animations.default;

  const variant = staticAnimations[animationType as StaticAnimations];
  const result = {} as T;
  for (const key in animations.default) {
    if (
      (animationType === 'path' || animationType === 'path-loop') &&
      key.includes('group')
    )
      continue;
    result[key] = variant as T[Extract<keyof T, string>];
  }
  return result;
}

/** Returns the variants of the animation selected by the closest `AnimateIcon`. */
function useIconVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V): T {
  const { animation } = useAnimateIconContext();
  return resolveVariants<V, T>(animations, animation);
}

/**
 * @deprecated Use `useIconVariants`. It is a hook: call it unconditionally at
 * the top level of the icon component.
 */
const getVariants = useIconVariants;

export {
  pathClassName,
  staticAnimations,
  AnimateIcon,
  IconWrapper,
  useAnimateIconContext,
  useIconVariants,
  getVariants,
  type IconProps,
  type IconWrapperProps,
  type AnimateIconProps,
  type AnimateIconContextValue,
};
