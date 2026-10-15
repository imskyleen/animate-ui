'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

const SWAP_TRANSITION: Transition = motionTokens.transition.swap;

const HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
};
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };

type IconSwapProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  swapKey: string;
  children: React.ReactNode;
  instant?: boolean;
  rotate?: number;
  transition?: Transition;
};

function IconSwap({
  swapKey,
  children,
  instant = false,
  rotate,
  transition,
  style,
  ...props
}: IconSwapProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(
    rotate ? motionTokens.transition.spin : SWAP_TRANSITION,
  );
  const turn = reduce || !rotate ? undefined : rotate;
  const entering = reduce
    ? { opacity: 0, filter: HIDDEN.filter }
    : turn
      ? { ...HIDDEN, rotate: -turn }
      : HIDDEN;
  const leaving = reduce
    ? { opacity: 0, filter: HIDDEN.filter }
    : turn
      ? { ...HIDDEN, rotate: turn }
      : HIDDEN;
  const shown = reduce
    ? { opacity: 1, filter: SHOWN.filter }
    : turn
      ? { ...SHOWN, rotate: 0 }
      : SHOWN;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={swapKey}
          data-icon={swapKey}
          aria-hidden="true"
          initial={instant ? false : entering}
          animate={shown}
          exit={instant ? undefined : leaving}
          transition={transition ?? defaultTransition}
          style={{ display: 'inline-flex' }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export { IconSwap, type IconSwapProps };
