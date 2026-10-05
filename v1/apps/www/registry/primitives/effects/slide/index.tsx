'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Variant } from 'motion/react';

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

function Slide({
  ref,
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  direction = 'up',
  offset = 100,
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

  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const hidden: Variant = {
    [axis]: direction === 'right' || direction === 'down' ? -offset : offset,
  };
  const visible: Variant = { [axis]: 0 };

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
