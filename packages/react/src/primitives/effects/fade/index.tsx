'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { useMotionTokens } from '../../../utils/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { Slot, type WithAsChild } from '../../slot';

type FadeProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    initialOpacity?: number;
    opacity?: number;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

function Fade({
  ref,
  transition,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  initialOpacity = 0,
  opacity = 1,
  asChild = false,
  ...props
}: FadeProps) {
  const tokens = useMotionTokens();
  const baseTransition: Transition = transition ?? tokens.transition.modal;
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={{
        hidden: { opacity: initialOpacity },
        visible: { opacity },
      }}
      transition={{
        ...baseTransition,
        delay: (baseTransition.delay ?? 0) + delay / 1000,
      }}
      {...props}
    />
  );
}

type FadeListProps = Omit<FadeProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Fades({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: FadeListProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Fade
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Fade>
      ))}
    </>
  );
}

export { Fade, Fades, type FadeProps, type FadeListProps };
