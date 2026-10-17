'use client';

import * as React from 'react';
import {
  motion,
  useAnimation,
  useInView,
  type SVGMotionProps,
  type UseInViewOptions,
  type LegacyAnimationControls,
  type Variants,
  type HTMLMotionProps,
} from 'motion/react';

import { Slot, type WithAsChild } from '../primitives/slot';
import { useIsInView } from '../utils/use-is-in-view';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../utils/motion';

const settleVelocity = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

function cn(...classNames: unknown[]) {
  return classNames.filter(Boolean).join(' ');
}

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
  speed?: number;
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
  speed?: number;
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
      speed: undefined,
    };
  return context;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = Record<string, any>;

function AnimateIcon(props: AnimateIconProps) {
  return (
    <ReducedMotionConfig>
      <AnimateIconRoot {...props} />
    </ReducedMotionConfig>
  );
}

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
  speed,
  children,
  ref,
  onMouseEnter,
  onMouseLeave,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: AnimateIconProps) {
  const controls = useAnimation();
  const reduceMotion = useShouldReduceMotion();

  const [localAnimate, setLocalAnimate] = React.useState<boolean>(() => {
    if (animate === undefined || animate === false) return false;
    return delay <= 0;
  });
  const [currentAnimation, setCurrentAnimation] = React.useState<
    string | StaticAnimations
  >(typeof animate === 'string' ? animate : animation);
  const [status, setStatus] = React.useState<'initial' | 'animate'>('initial');

  const playing = localAnimate && !reduceMotion;

  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopDelayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimateInProgressRef = React.useRef<boolean>(false);
  const animateEndPromiseRef = React.useRef<Promise<void> | null>(null);
  const resolveAnimateEndRef = React.useRef<(() => void) | null>(null);
  const activeRef = React.useRef<boolean>(playing);

  const runGenRef = React.useRef(0);
  const cancelledRef = React.useRef(false);

  const bumpGeneration = React.useCallback(() => {
    runGenRef.current++;
  }, []);

  const startAnimation = React.useCallback(
    (trigger: TriggerProp) => {
      const next = typeof trigger === 'string' ? trigger : animation;
      bumpGeneration();
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      setCurrentAnimation(next);
      if (delay > 0) {
        setLocalAnimate(false);
        delayRef.current = setTimeout(() => {
          setLocalAnimate(true);
        }, delay);
      } else {
        setLocalAnimate(true);
      }
    },
    [animation, delay, bumpGeneration],
  );

  const stopAnimation = React.useCallback(() => {
    bumpGeneration();
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (loopDelayRef.current) {
      clearTimeout(loopDelayRef.current);
      loopDelayRef.current = null;
    }
    setLocalAnimate(false);
  }, [bumpGeneration]);

  React.useEffect(() => {
    activeRef.current = playing;
  }, [playing]);

  React.useEffect(() => {
    if (animate === undefined) return;
    setCurrentAnimation(typeof animate === 'string' ? animate : animation);
    if (animate) startAnimation(animate as TriggerProp);
    else stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, [animate]);

  React.useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
      if (loopDelayRef.current) clearTimeout(loopDelayRef.current);
    };
  }, []);

  const { ref: inViewRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView: !!animateOnView,
      inViewOnce: animateOnViewOnce,
      inViewMargin: animateOnViewMargin,
    },
  );

  const onScreen = useInView(inViewRef);
  const onScreenRef = React.useRef(onScreen);
  const resumeRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    onScreenRef.current = onScreen;
    if (onScreen) {
      resumeRef.current?.();
      resumeRef.current = null;
    }
  }, [onScreen]);

  const startAnim = React.useCallback(
    async (anim: 'initial' | 'animate', method: 'start' | 'set' = 'start') => {
      try {
        await controls[method](anim);
        setStatus(anim);
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
    const gen = ++runGenRef.current;
    cancelledRef.current = false;

    async function run() {
      if (cancelledRef.current || gen !== runGenRef.current) {
        await startAnim('initial');
        return;
      }

      if (!playing) {
        if (reduceMotion) {
          await startAnim('initial', 'set');
          return;
        }
        if (
          completeOnStop &&
          isAnimateInProgressRef.current &&
          animateEndPromiseRef.current
        ) {
          try {
            await animateEndPromiseRef.current;
          } catch {}
        }
        if (!persistOnAnimateEnd) {
          if (cancelledRef.current || gen !== runGenRef.current) {
            await startAnim('initial');
            return;
          }
          await startAnim('initial');
        }
        return;
      }

      if (loop) {
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim('initial');
          return;
        }
        await startAnim('initial', 'set');
        await settleVelocity();
      }

      isAnimateInProgressRef.current = true;
      animateEndPromiseRef.current = new Promise<void>((resolve) => {
        resolveAnimateEndRef.current = resolve;
      });

      if (cancelledRef.current || gen !== runGenRef.current) {
        isAnimateInProgressRef.current = false;
        resolveAnimateEndRef.current?.();
        resolveAnimateEndRef.current = null;
        animateEndPromiseRef.current = null;
        await startAnim('initial');
        return;
      }

      await startAnim('animate');

      if (cancelledRef.current || gen !== runGenRef.current) {
        isAnimateInProgressRef.current = false;
        resolveAnimateEndRef.current?.();
        resolveAnimateEndRef.current = null;
        animateEndPromiseRef.current = null;
        await startAnim('initial');
        return;
      }

      isAnimateInProgressRef.current = false;
      resolveAnimateEndRef.current?.();
      resolveAnimateEndRef.current = null;
      animateEndPromiseRef.current = null;

      if (initialOnAnimateEnd) {
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim('initial');
          return;
        }
        await startAnim('initial', 'set');
      }

      if (loop) {
        if (loopDelay > 0) {
          await new Promise<void>((resolve) => {
            loopDelayRef.current = setTimeout(() => {
              loopDelayRef.current = null;
              resolve();
            }, loopDelay);
          });

          if (cancelledRef.current || gen !== runGenRef.current) {
            await startAnim('initial');
            return;
          }
          if (!activeRef.current) {
            if (status !== 'initial' && !persistOnAnimateEnd)
              await startAnim('initial');
            return;
          }
        } else {
          if (!activeRef.current) {
            if (status !== 'initial' && !persistOnAnimateEnd)
              await startAnim('initial');
            return;
          }
        }
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim('initial');
          return;
        }
        const target = inViewRef.current;
        if (
          target &&
          target.getClientRects().length > 0 &&
          !onScreenRef.current
        ) {
          await new Promise<void>((resolve) => {
            resumeRef.current = resolve;
          });
          if (cancelledRef.current || gen !== runGenRef.current) return;
        }
        await run();
      }
    }

    void run();

    return () => {
      cancelledRef.current = true;
      resumeRef.current?.();
      resumeRef.current = null;
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      if (loopDelayRef.current) {
        clearTimeout(loopDelayRef.current);
        loopDelayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, [playing, controls]);

  const childProps = (
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement).props
      : {}
  ) as AnyProps;

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onMouseEnter?.(event);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onMouseLeave?.(event);
    onMouseLeave?.(event);
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerEnter?.(event);
    onPointerEnter?.(event);
    if (animateOnHover && event.pointerType !== 'touch')
      startAnimation(animateOnHover);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerLeave?.(event);
    onPointerLeave?.(event);
    if (animateOnHover || animateOnTap) stopAnimation();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerDown?.(event);
    onPointerDown?.(event);
    if (animateOnTap) startAnimation(animateOnTap);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerUp?.(event);
    onPointerUp?.(event);
    if (animateOnTap) stopAnimation();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    childProps.onPointerCancel?.(event);
    onPointerCancel?.(event);
    if (animateOnTap) stopAnimation();
  };

  const handlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
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
        speed,
      }}
    >
      {content}
    </AnimateIconContext>
  );
}

const pathClassName = 'animate-ui-icon-path';

const PATH_STYLE = `.${pathClassName} [stroke-dasharray='1 1'],.${pathClassName} [stroke-dasharray='1px 1px']{stroke-dasharray:1px 0px!important}`;

function IconPathStyle() {
  return (
    <style href="animate-ui-icon-path" precedence="animate-ui">
      {PATH_STYLE}
    </style>
  );
}

function IconWrapper<T extends string>(props: IconWrapperProps<T>) {
  const context = React.use(AnimateIconContext);
  const animation = props.animation ?? context?.animation;
  const drawsPaths = animation === 'path' || animation === 'path-loop';

  return (
    <>
      {drawsPaths && <IconPathStyle />}
      <IconWrapperContent {...props} />
    </>
  );
}

function IconWrapperContent<T extends string>({
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
  speed,
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
      speed: parentSpeed,
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
      speed !== undefined ||
      completeOnStop !== undefined;

    if (hasOverrides) {
      const inheritedAnimate: Trigger = parentActive
        ? (animationProp ?? parentAnimation ?? 'default')
        : false;

      const finalAnimate: Trigger = (animate ?? inheritedAnimate) as Trigger;

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
          delay={delay}
          speed={speed ?? parentSpeed}
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
          persistOnAnimateEnd: parentPersistOnAnimateEnd,
          delay: parentDelay,
          speed: parentSpeed,
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
        speed={speed}
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

const TIME_KEYS = new Set([
  'duration',
  'delay',
  'repeatDelay',
  'delayChildren',
  'staggerChildren',
]);

function isPlainObject(value: unknown): value is AnyProps {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function scaleTiming(transition: AnyProps, factor: number) {
  const result: AnyProps = {};
  for (const key in transition) {
    const value = transition[key];
    if (typeof value === 'number' && TIME_KEYS.has(key))
      result[key] = value * factor;
    else if (typeof value === 'number' && key === 'stiffness')
      result[key] = value / (factor * factor);
    else if (typeof value === 'number' && key === 'damping')
      result[key] = value / factor;
    else if (isPlainObject(value)) result[key] = scaleTiming(value, factor);
    else result[key] = value;
  }
  return result;
}

function scaleTarget(target: unknown, factor: number): unknown {
  if (typeof target === 'function')
    return (...args: unknown[]) =>
      scaleTarget((target as (...a: unknown[]) => unknown)(...args), factor);
  if (!isPlainObject(target) || !isPlainObject(target.transition))
    return target;
  return { ...target, transition: scaleTiming(target.transition, factor) };
}

function scaleVariants<T extends Record<string, Variants>>(
  variants: T,
  factor: number,
): T {
  const result = {} as AnyProps;
  for (const element in variants) {
    const elementVariants = variants[element] as AnyProps;
    const scaled: AnyProps = {};
    for (const name in elementVariants)
      scaled[name] = scaleTarget(elementVariants[name], factor);
    result[element] = scaled;
  }
  return result as T;
}

function useIconVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V): T {
  const { animation, speed = 1 } = useAnimateIconContext();
  const { tempo } = useMotionTokens();
  const factor = tempo / speed;
  return React.useMemo(() => {
    const variants = resolveVariants<V, T>(animations, animation);
    return factor === 1 ? variants : scaleVariants(variants, factor);
  }, [animations, animation, factor]);
}

const getVariants = useIconVariants;

export {
  pathClassName,
  IconPathStyle,
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
