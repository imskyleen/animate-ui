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

type BlurProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    initialBlur?: number;
    blur?: number;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

const DEFAULT_TRANSITION: Transition = motionTokens.spring.entrance;

function Blur(props: BlurProps) {
  return (
    <ReducedMotionConfig>
      <BlurInner {...props} />
    </ReducedMotionConfig>
  );
}

function BlurInner({
  ref,
  transition,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  initialBlur = 10,
  blur = 0,
  asChild = false,
  ...props
}: BlurProps) {
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
              hidden: { filter: `blur(${initialBlur}px)` },
              visible: { filter: `blur(${blur}px)` },
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

type BlurListProps = Omit<BlurProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Blurs({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: BlurListProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Blur
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Blur>
      ))}
    </>
  );
}

export { Blur, Blurs, type BlurProps, type BlurListProps };
