'use client';

import * as React from 'react';
import {
  motion,
  type HTMLMotionProps,
  type Transition,
  type Variant,
} from 'motion/react';

import { Slot, type WithAsChild } from '@animate-ui/react/primitives/slot';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
import { getStrictContext } from '@animate-ui/react/utils/strict-context';
import { cn } from 'cn';

const FACE_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 20,
};

const buildVariant = ({
  opacity,
  rotation,
  offset,
  isVertical,
  rotateAxis,
}: {
  opacity: number;
  rotation: number;
  offset: string | null;
  isVertical: boolean;
  rotateAxis: string;
}): Variant => ({
  opacity,
  [rotateAxis]: rotation,
  ...(isVertical && offset !== null ? { y: offset } : {}),
  ...(!isVertical && offset !== null ? { x: offset } : {}),
});

type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

type FlipButtonContextType = {
  from: FlipDirection;
  isVertical: boolean;
  rotateAxis: string;
};

const [FlipButtonProvider, useFlipButton] =
  getStrictContext<FlipButtonContextType>('FlipButtonContext');

type FlipButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    from?: FlipDirection;
    tapScale?: number;
  }
>;

function FlipButton(props: FlipButtonProps) {
  return (
    <ReducedMotionConfig>
      <FlipButtonContent {...props} />
    </ReducedMotionConfig>
  );
}

function FlipButtonContent({
  from = 'top',
  tapScale = motionTokens.scale.press,
  asChild = false,
  transition,
  style,
  className,
  ...props
}: FlipButtonProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(motionTokens.spring.press);
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';

  const Component = asChild ? Slot : motion.button;

  return (
    <FlipButtonProvider value={{ from, isVertical, rotateAxis }}>
      <Component
        data-slot="flip-button"
        className={cn(
          'text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg',
          className,
        )}
        variants={reduce ? undefined : { initial: { transform: 'scale(1)' } }}
        initial="initial"
        whileHover="hover"
        whileTap={reduce ? undefined : { transform: `scale(${tapScale})` }}
        transition={transition ?? defaultTransition}
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          perspective: '1000px',
          ...style,
        }}
        {...props}
      />
    </FlipButtonProvider>
  );
}

type FlipButtonFaceProps = WithAsChild<HTMLMotionProps<'span'>>;

function FlipButtonFront({
  transition,
  asChild = false,
  style,
  className,
  ...props
}: FlipButtonFaceProps) {
  const { from, isVertical, rotateAxis } = useFlipButton();
  const defaultTransition = useTempoTransition(FACE_TRANSITION);
  const reduce = useShouldReduceMotion();

  const frontOffset = from === 'top' || from === 'left' ? '50%' : '-50%';

  const frontVariants = {
    initial: buildVariant({
      opacity: 1,
      rotation: 0,
      offset: '0%',
      isVertical,
      rotateAxis,
    }),
    hover: buildVariant({
      opacity: 0,
      rotation: reduce ? 0 : 90,
      offset: reduce ? '0%' : frontOffset,
      isVertical,
      rotateAxis,
    }),
  };

  const Component = asChild ? Slot : motion.span;

  return (
    <Component
      data-slot="flip-button-front"
      className={cn(
        'h-10 rounded-lg bg-primary px-4 text-primary-foreground',
        className,
      )}
      variants={frontVariants}
      transition={transition ?? defaultTransition}
      style={{
        gridArea: '1 / 1',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    />
  );
}

function FlipButtonBack({
  transition,
  asChild = false,
  style,
  className,
  ...props
}: FlipButtonFaceProps) {
  const { from, isVertical, rotateAxis } = useFlipButton();
  const defaultTransition = useTempoTransition(FACE_TRANSITION);
  const reduce = useShouldReduceMotion();

  const backOffset = from === 'top' || from === 'left' ? '-50%' : '50%';

  const backVariants = {
    initial: buildVariant({
      opacity: 0,
      rotation: reduce ? 0 : 90,
      offset: reduce ? '0%' : backOffset,
      isVertical,
      rotateAxis,
    }),
    hover: buildVariant({
      opacity: 1,
      rotation: 0,
      offset: '0%',
      isVertical,
      rotateAxis,
    }),
  };

  const Component = asChild ? Slot : motion.span;

  return (
    <Component
      data-slot="flip-button-back"
      className={cn('h-10 rounded-lg bg-muted px-4 text-foreground', className)}
      aria-hidden
      variants={backVariants}
      transition={transition ?? defaultTransition}
      style={{
        gridArea: '1 / 1',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    />
  );
}

export {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
  useFlipButton,
  type FlipButtonProps,
  type FlipButtonFaceProps as FlipButtonFrontProps,
  type FlipButtonFaceProps as FlipButtonBackProps,
  type FlipDirection,
  type FlipButtonContextType,
};
