'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  scale as motionScale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type RippleButtonContextType = {
  ripples: Ripple[];
  setRipples: (ripples: Ripple[]) => void;
};

const [RippleButtonProvider, useRippleButton] =
  getStrictContext<RippleButtonContextType>('RippleButtonContext');

type RippleButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function RippleButton({
  ref,
  onClick,
  hoverScale = 1.02,
  tapScale = motionScale.press,
  asChild = false,
  style,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const reduce = useShouldReduceMotion();
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    },
    [],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      if (onClick) {
        onClick(event);
      }
    },
    [createRipple, onClick],
  );

  const Component = asChild ? Slot : motion.button;

  return (
    <RippleButtonProvider value={{ ripples, setRipples }}>
      <Component
        ref={buttonRef}
        data-slot="ripple-button"
        onClick={handleClick}
        whileTap={{
          scale: reduce ? 1 : tapScale,
          transition: motionTransition.press,
        }}
        whileHover={{
          scale: reduce ? 1 : hoverScale,
          transition: motionTransition.press,
        }}
        transition={motionTransition.press}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
        {...props}
      />
    </RippleButtonProvider>
  );
}

type RippleButtonRipplesProps = WithAsChild<
  HTMLMotionProps<'span'> & {
    color?: string;
    scale?: number;
  }
>;

function RippleButtonRipples({
  color = 'var(--ripple-button-ripple-color)',
  scale = 10,
  transition = { duration: 0.6, ease: 'easeOut' },
  asChild = false,
  style,
  ...props
}: RippleButtonRipplesProps) {
  const { ripples } = useRippleButton();
  // Under reduced motion the ripple fades in place instead of growing.
  const reduce = useShouldReduceMotion();

  const Component = asChild ? Slot : motion.span;

  return ripples.map((ripple) => (
    <Component
      key={ripple.id}
      initial={{ scale: reduce ? scale : 0, opacity: 0.5 }}
      animate={{ scale, opacity: 0 }}
      transition={transition}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        width: '20px',
        height: '20px',
        backgroundColor: color,
        top: ripple.y - 10,
        left: ripple.x - 10,
        ...style,
      }}
      {...props}
    />
  ));
}

export {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
  type RippleButtonRipplesProps,
};
