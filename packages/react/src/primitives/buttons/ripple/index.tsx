'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';
import { SCALE_SPRING, TAP_SCALE } from '../_button';

const RIPPLE_TRANSITION: Transition = { duration: 0.6, ease: 'easeOut' };

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

function RippleButton(props: RippleButtonProps) {
  return (
    <ReducedMotionConfig>
      <RippleButtonContent {...props} />
    </ReducedMotionConfig>
  );
}

function RippleButtonContent({
  ref,
  onClick,
  hoverScale = 1,
  tapScale = TAP_SCALE,
  asChild = false,
  transition,
  style,
  ...props
}: RippleButtonProps) {
  const { tempo } = useMotionTokens();
  const defaultTransition = useTempoTransition(SCALE_SPRING);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const nextIdRef = React.useRef(0);
  const reduce = useShouldReduceMotion();
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (button.offsetWidth / rect.width);
      const y =
        (event.clientY - rect.top) * (button.offsetHeight / rect.height);

      const newRipple: Ripple = {
        id: nextIdRef.current++,
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600 * tempo);
    },
    [tempo],
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
        whileTap={{ scale: reduce ? 1 : tapScale }}
        whileHover={
          reduce || hoverScale === 1 ? undefined : { scale: hoverScale }
        }
        transition={transition ?? defaultTransition}
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
  transition,
  asChild = false,
  style,
  ...props
}: RippleButtonRipplesProps) {
  const { ripples } = useRippleButton();
  const defaultTransition = useTempoTransition(RIPPLE_TRANSITION);
  const reduce = useShouldReduceMotion();

  const Component = asChild ? Slot : motion.span;

  return ripples.map((ripple) => (
    <Component
      key={ripple.id}
      initial={{ scale: reduce ? scale : 0, opacity: 0.5 }}
      animate={{ scale, opacity: 0 }}
      transition={transition ?? defaultTransition}
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
