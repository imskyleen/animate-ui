'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Variant } from 'motion/react';

import {
  ReducedMotionConfig,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

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

function Slide(props: SlideProps) {
  return (
    <ReducedMotionConfig>
      <SlideInner {...props} />
    </ReducedMotionConfig>
  );
}

function SlideInner({
  ref,
  transition = motionTransition.modal,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  direction = 'up',
  offset = 16,
  asChild = false,
  ...props
}: SlideProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const reduce = useShouldReduceMotion();

  const value =
    direction === 'right' || direction === 'down' ? -offset : offset;
  const vertical = direction === 'up' || direction === 'down';
  // Reduced motion: no travel, a fade instead.
  const hidden: Variant = reduce
    ? { opacity: 0 }
    : {
        transform: vertical
          ? `translate3d(0px, ${value}px, 0)`
          : `translate3d(${value}px, 0px, 0)`,
      };
  const visible: Variant = reduce
    ? { opacity: 1 }
    : { transform: 'translate3d(0px, 0px, 0)' };

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={{ hidden, visible }}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
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
