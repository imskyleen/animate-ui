'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';
import { Slot, type WithAsChild } from '../../slot';

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
  hoverScale = 1.02,
  tapScale,
  asChild = false,
  ...props
}: LiquidButtonProps) {
  const tokens = useMotionTokens();
  const press = tokens.transition.press;
  const reduce = useShouldReduceMotion();
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{
        scale: reduce ? 1 : (tapScale ?? tokens.scale.press),
        transition: press,
      }}
      whileHover={{
        scale: reduce ? 1 : hoverScale,
        '--liquid-button-fill-width': '100%',
        '--liquid-button-fill-height': '100%',
        '--liquid-button-delay': delay,
        transition: {
          scale: press,
          '--liquid-button-fill-width': { duration: 0 },
          '--liquid-button-fill-height': { duration: 0 },
          '--liquid-button-delay': { duration: 0 },
        },
      }}
      transition={press}
      style={
        {
          '--liquid-button-fill-width': '-1%',
          '--liquid-button-fill-height': fillHeight,
          '--liquid-button-delay': '0s',
          background:
            'linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
          backgroundColor: 'var(--liquid-button-background-color)',
          transition: `background ${delay} var(--liquid-button-delay, 0s), color ${delay} ${delay}, background-position ${delay} calc(${delay} - var(--liquid-button-delay, 0s))`,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { LiquidButton, type LiquidButtonProps };
