'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Variant } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

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

function FlipButton({
  from = 'top',
  tapScale = 0.95,
  asChild = false,
  style,
  ...props
}: FlipButtonProps) {
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';

  const Component = asChild ? Slot : motion.button;

  return (
    <FlipButtonProvider value={{ from, isVertical, rotateAxis }}>
      <Component
        data-slot="flip-button"
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: tapScale }}
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
  transition = { type: 'spring', stiffness: 280, damping: 20 },
  asChild = false,
  style,
  ...props
}: FlipButtonFaceProps) {
  const { from, isVertical, rotateAxis } = useFlipButton();

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
      rotation: 90,
      offset: frontOffset,
      isVertical,
      rotateAxis,
    }),
  };

  const Component = asChild ? Slot : motion.span;

  return (
    <Component
      data-slot="flip-button-front"
      variants={frontVariants}
      transition={transition}
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
  transition = { type: 'spring', stiffness: 280, damping: 20 },
  asChild = false,
  style,
  ...props
}: FlipButtonFaceProps) {
  const { from, isVertical, rotateAxis } = useFlipButton();

  const backOffset = from === 'top' || from === 'left' ? '-50%' : '50%';

  const backVariants = {
    initial: buildVariant({
      opacity: 0,
      rotation: 90,
      offset: backOffset,
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
      variants={backVariants}
      transition={transition}
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
