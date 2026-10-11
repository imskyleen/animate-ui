'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

// Shared by the buttons whose icon swaps for another in place (Copy, Theme
// Toggler). Not a public entry point (no index.tsx).

/** Two icons swapping in place: 0.2s, ease-out. */
const SWAP_TRANSITION: Transition = motionTokens.transition.swap;

/** An icon on its way in or out: half its size, faded, in a light blur. */
const HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
};
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };

type IconSwapProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Identifies the icon shown: changing it swaps the icons. */
  swapKey: string;
  /** The icon shown. */
  children: React.ReactNode;
  /**
   * Swap at once: the icon shown appears at rest and the old one is removed
   * (e.g. while the state settles after hydrating). Read when the old icon
   * was last rendered, so it must already be set on the render before.
   */
  instant?: boolean;
  /** Transition of the swap. */
  transition?: Transition;
};

/**
 * The icon `swapKey` names. When it changes, the old icon shrinks to half
 * its size into a light blur as it fades, while the new one grows out of it,
 * so their overlap reads as one shape changing. Nothing animates on mount.
 * Under reduced motion, the icons crossfade.
 */
function IconSwap({
  swapKey,
  children,
  instant = false,
  transition,
  style,
  ...props
}: IconSwapProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(SWAP_TRANSITION);
  const hidden = reduce ? { opacity: 0 } : HIDDEN;
  const shown = reduce ? { opacity: 1 } : SHOWN;

  return (
    // `relative`: a leaving icon is placed against this wrapper, so it stays
    // put even while the button around it is scaled by its press.
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
          initial={instant ? false : hidden}
          animate={shown}
          exit={instant ? undefined : hidden}
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
