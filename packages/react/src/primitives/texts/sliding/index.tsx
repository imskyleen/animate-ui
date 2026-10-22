'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

type SlidingTextDirection = 'up' | 'down';

type SlidingTextTrigger = 'hover' | 'click';

const BLEED = '0.25em';

const GAP = '0.6em';

// Inside a link or a button, the whole control slides it, not just its text.
const HOST = 'a, button, [role="button"], [role="link"]';

const DEFAULT_TRANSITION: Transition = {
  duration: 0.25,
  ease: motionTokens.ease.fill,
};

type SlidingTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
  direction?: SlidingTextDirection;
  trigger?: SlidingTextTrigger;
  transition?: Transition;
};

function SlidingText(props: SlidingTextProps) {
  return (
    <ReducedMotionConfig>
      <SlidingTextContent {...props} />
    </ReducedMotionConfig>
  );
}

function SlidingTextContent({
  text,
  direction = 'down',
  trigger = 'hover',
  transition: transitionProp,
  style,
  onHoverStart,
  onHoverEnd,
  onClick,
  ref,
  ...props
}: SlidingTextProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const transition = transitionProp ?? defaultTransition;
  const sign = direction === 'down' ? 1 : -1;

  const progress = useMotionValue(0);
  const y = useTransform(progress, (value) => {
    const lap = sign * (value - Math.floor(value));
    return lap === 0 ? '0%' : `calc(${lap * 100}% + ${lap} * ${GAP})`;
  });
  const targetRef = React.useRef(0);
  const controlsRef = React.useRef<AnimationPlaybackControls | null>(null);

  React.useEffect(() => () => controlsRef.current?.stop(), []);

  const slideTo = (target: number) => {
    targetRef.current = target;
    controlsRef.current?.stop();
    if (reduce) {
      progress.jump(target);
      return;
    }
    controlsRef.current = animate(progress, target, transition);
  };
  const slideToRef = React.useRef(slideTo);
  React.useLayoutEffect(() => {
    slideToRef.current = slideTo;
  });

  const elementRef = React.useRef<HTMLSpanElement | null>(null);
  const [host, setHost] = React.useState<Element | null>(null);
  React.useLayoutEffect(() => {
    setHost(elementRef.current?.parentElement?.closest(HOST) ?? null);
  }, []);
  React.useEffect(() => {
    if (!host) return;
    const enter = (event: Event) => {
      if (
        trigger === 'hover' &&
        (event as PointerEvent).pointerType !== 'touch'
      )
        slideToRef.current(1);
    };
    const leave = (event: Event) => {
      if (
        trigger === 'hover' &&
        (event as PointerEvent).pointerType !== 'touch'
      )
        slideToRef.current(0);
    };
    const click = () => {
      if (trigger === 'click')
        slideToRef.current(Math.round(targetRef.current) + 1);
    };
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('click', click);
    return () => {
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('click', click);
    };
  }, [host, trigger]);

  return (
    <motion.span
      ref={(node: HTMLSpanElement | null) => {
        elementRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="sliding-text"
      data-direction={direction}
      data-trigger={trigger}
      {...props}
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'clip',
        paddingBlock: BLEED,
        marginBlock: `calc(-1 * ${BLEED})`,
        ...style,
      }}
      onHoverStart={(event, info) => {
        if (trigger === 'hover' && !host) slideTo(1);
        onHoverStart?.(event, info);
      }}
      onHoverEnd={(event, info) => {
        if (trigger === 'hover' && !host) slideTo(0);
        onHoverEnd?.(event, info);
      }}
      onClick={(event) => {
        if (trigger === 'click' && !host)
          slideTo(Math.round(targetRef.current) + 1);
        onClick?.(event);
      }}
    >
      <motion.span
        data-slot="sliding-text-track"
        style={{ position: 'relative', display: 'inline-block', y }}
      >
        {text}
        <span
          data-slot="sliding-text-copy"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: `calc(${-sign * 100}% - ${sign} * ${GAP})`,
            width: '100%',
          }}
        >
          {text}
        </span>
      </motion.span>
    </motion.span>
  );
}

export {
  SlidingText,
  type SlidingTextProps,
  type SlidingTextDirection,
  type SlidingTextTrigger,
};
