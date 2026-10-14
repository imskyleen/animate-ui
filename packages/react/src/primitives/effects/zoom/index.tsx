'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { Slot, type WithAsChild } from '../../slot';

type ZoomProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    initialScale?: number;
    scale?: number;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

const DEFAULT_TRANSITION: Transition = motionTokens.spring.entrance;

function Zoom(props: ZoomProps) {
  return (
    <ReducedMotionConfig remount>
      <ZoomInner {...props} />
    </ReducedMotionConfig>
  );
}

function ZoomInner({
  ref,
  transition,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  initialScale = 0.5,
  scale = 1,
  asChild = false,
  ...props
}: ZoomProps) {
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const baseTransition: Transition = transition ?? defaultTransition;
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );
  const reduce = useShouldReduceMotion();

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={
        reduce
          ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
          : {
              hidden: { scale: initialScale },
              visible: { scale },
            }
      }
      transition={{
        ...baseTransition,
        delay: (baseTransition.delay ?? 0) + delay / 1000,
      }}
      {...props}
    />
  );
}

type ZoomListProps = Omit<ZoomProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Zooms({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: ZoomListProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Zoom
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Zoom>
      ))}
    </>
  );
}

export { Zoom, Zooms, type ZoomProps, type ZoomListProps };
