'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

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

function Blur({
  ref,
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  initialBlur = 10,
  blur = 0,
  asChild = false,
  ...props
}: BlurProps) {
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
        hidden: { filter: `blur(${initialBlur}px)` },
        visible: { filter: `blur(${blur}px)` },
      }}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
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
