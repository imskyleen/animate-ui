'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';
import { SCALE_SPRING, TAP_SCALE } from '../_button';

const HOVER_TRANSITION: Transition = {
  scale: { duration: 0.3, ease: 'easeOut' },
  '--liquid-button-fill-width': { duration: 0 },
  '--liquid-button-fill-height': { duration: 0 },
  '--liquid-button-delay': { duration: 0 },
};

const DEFAULT_TRANSITION: Transition = {
  scale: SCALE_SPRING,
  default: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
};

type LiquidButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    delay?: string;
    fillHeight?: string;
    hoverScale?: number;
    tapScale?: number;
  }
>;

function LiquidButton(props: LiquidButtonProps) {
  return (
    <ReducedMotionConfig>
      <LiquidButtonContent {...props} />
    </ReducedMotionConfig>
  );
}

function LiquidButtonContent({
  delay = '0.3s',
  fillHeight = '3px',
  hoverScale = 1,
  tapScale = TAP_SCALE,
  asChild = false,
  transition,
  style,
  ...props
}: LiquidButtonProps) {
  const reduce = useShouldReduceMotion();
  const hoverTransition = useTempoTransition(HOVER_TRANSITION);
  const defaultTransition = useTempoTransition(DEFAULT_TRANSITION);
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{ scale: reduce ? 1 : tapScale }}
      whileHover={{
        ...(reduce || hoverScale === 1 ? null : { scale: hoverScale }),
        '--liquid-button-fill-width': '100%',
        '--liquid-button-fill-height': '100%',
        '--liquid-button-delay': delay,
        transition: hoverTransition,
      }}
      transition={transition ?? defaultTransition}
      style={
        {
          '--liquid-button-fill-width': '-1%',
          '--liquid-button-fill-height': fillHeight,
          '--liquid-button-delay': '0s',
          background:
            'linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
          backgroundColor: 'var(--liquid-button-background-color)',
          transition: `background ${delay} var(--liquid-button-delay, 0s), color ${delay} ${delay}, background-position ${delay} calc(${delay} - var(--liquid-button-delay, 0s))`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { LiquidButton, type LiquidButtonProps };
