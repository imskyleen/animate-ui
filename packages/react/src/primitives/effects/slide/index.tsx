'use client';

import * as React from 'react';
import {
  motion,
  type HTMLMotionProps,
  type Transition,
  type Variant,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '../../../utils/use-is-in-view';
import { Slot, type WithAsChild } from '../../slot';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

type SlideProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    direction?: SlideDirection;
    offset?: number;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

function Slide(props: SlideProps) {
  return (
    <ReducedMotionConfig>
      <SlideInner {...props} />
    </ReducedMotionConfig>
  );
}

function SlideInner({
  ref,
  transition,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  direction = 'up',
  offset = 100,
  asChild = false,
  ...props
}: SlideProps) {
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

  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  // Reduced motion: no travel, a fade instead.
  const hidden: Variant = reduce
    ? { opacity: 0 }
    : {
        [axis]:
          direction === 'right' || direction === 'down' ? -offset : offset,
      };
  const visible: Variant = reduce ? { opacity: 1 } : { [axis]: 0 };

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={{ hidden, visible }}
      transition={{
        ...baseTransition,
        delay: (baseTransition.delay ?? 0) + delay / 1000,
      }}
      {...props}
    />
  );
}

type SlideListProps = Omit<SlideProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Slides({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: SlideListProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Slide
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Slide>
      ))}
    </>
  );
}

export {
  Slide,
  Slides,
  type SlideProps,
  type SlideListProps,
  type SlideDirection,
};
