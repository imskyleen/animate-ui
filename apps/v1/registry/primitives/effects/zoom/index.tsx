'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

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

function Zoom(props: ZoomProps) {
  return (
    <ReducedMotionConfig>
      <ZoomInner {...props} />
    </ReducedMotionConfig>
  );
}

function ZoomInner({
  ref,
  transition = motionTransition.modal,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  initialScale = 0.96,
  scale = 1,
  asChild = false,
  ...props
}: ZoomProps) {
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
          ? // Reduced motion: no scale, a fade instead.
            { hidden: { opacity: 0 }, visible: { opacity: 1 } }
          : {
              hidden: { transform: `scale(${initialScale})` },
              visible: { transform: `scale(${scale})` },
            }
      }
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
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
