'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

// The checks of list and menu items (a select's or a combobox's chosen item,
// a menu's checkbox and radio items), shared by the libraries: a single
// selection's check glides to the chosen item, a multiple selection's pops in
// when the item is checked and out when it's unchecked.
//
// Choosing an item can close the list or the menu: when a check is there to
// glide (or pops in or out), it holds still for PICK_HOLD first, so the check
// is seen landing on the item before it fades out. Each shown single
// selection's check registers with its list (CheckRegistryContext) so the list
// knows.

/** A multiple selection's check, hidden: half its size, in a light blur. */
const CHECK_HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
} as const;
/** Under reduced motion it only fades. */
const CHECK_HIDDEN_REDUCED = { opacity: 0 } as const;
const CHECK_SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' } as const;

/**
 * A multiple selection's check popping in: a lively spring with a little
 * overshoot (~13%, peak at ~170ms), out of its blur.
 */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 500, damping: 24 },
  opacity: motionTokens.transition.swap,
  filter: motionTokens.transition.swap,
} as const satisfies Transition;

/** Unchecked, it shrinks back into its blur and fades, quicker. */
const UNCHECK_TRANSITION = {
  duration: 0.15,
  ease: motionTokens.ease.out,
} as const satisfies Transition;

/**
 * A ref for a check's element: transforms (its pop, its glide) don't apply to
 * an inline box, and an indicator is often a plain `<span>` inside the
 * positioned one. Alone in it, it becomes a block, which lays out the same (an
 * inline-level box would sit 2-4px off, on the line's baseline); beside text,
 * an inline block, which keeps its line.
 */
function asTransformable(node: HTMLElement | null) {
  if (!node || getComputedStyle(node).display !== 'inline') return;
  const alone = node.parentElement?.childNodes.length === 1;
  node.style.setProperty('display', alone ? 'block' : 'inline-block');
}

/**
 * The animation of a multiple selection's check: spread it on a motion
 * element kept mounted while unchecked, or use `initial`/`exit` with
 * AnimatePresence. `transition` replaces both directions'.
 */
function useCheckMotion(checked: boolean, transition?: Transition) {
  const reduce = useShouldReduceMotion();
  const check = useTempoTransition(transition ?? CHECK_TRANSITION);
  const uncheck = useTempoTransition(transition ?? UNCHECK_TRANSITION);
  const hidden = reduce ? CHECK_HIDDEN_REDUCED : CHECK_HIDDEN;
  const shown = reduce ? { opacity: 1 } : CHECK_SHOWN;
  const leave = { ...hidden, transition: uncheck };
  return {
    initial: hidden,
    animate: checked ? { ...shown, transition: check } : leave,
    exit: leave,
  };
}

/**
 * A single selection's check gliding to the chosen item: the highlight's
 * spring, so it lands with the highlight, in ~150ms without overshoot.
 */
const GLIDE_TRANSITION = motionTokens.spring.highlight;

/**
 * How long (seconds) a list holds still after an item was chosen, before it
 * closes: the check's glide, in sight.
 */
const PICK_HOLD = 0.15;

type RegisterCheck = () => () => void;

/** The list's registry of shown single-selection checks. */
const CheckRegistryContext = React.createContext<RegisterCheck | null>(null);

/** A list's registry: `hasCheck()` is read when an item is chosen. */
function useCheckRegistry() {
  const countRef = React.useRef(0);
  const registerCheck = React.useCallback<RegisterCheck>(() => {
    countRef.current += 1;
    return () => {
      countRef.current -= 1;
    };
  }, []);
  const hasCheck = React.useCallback(() => countRef.current > 0, []);
  return { registerCheck, hasCheck };
}

/** Registers a shown single-selection check with its list, while `shown`. */
function useRegisterCheck(shown: boolean) {
  const register = React.use(CheckRegistryContext);
  React.useLayoutEffect(
    () => (shown && register ? register() : undefined),
    [shown, register],
  );
}

type Picks = {
  /**
   * An item is being chosen and its check will move (glide, or pop in or
   * out): call it right before the library closes the menu.
   */
  markPick: () => void;
  /** Whether a single selection's check is shown, to glide from. */
  hasCheck: () => boolean;
};

/** The picks of the menu or list an item is in. */
const PickContext = React.createContext<Picks | null>(null);

/**
 * A menu's picks. `wasPicked()`, read when it closes, tells whether an item
 * was just chosen (the close follows the pick, in the same event or in the
 * render it schedules).
 */
function usePicks() {
  const { registerCheck, hasCheck } = useCheckRegistry();
  const pickingRef = React.useRef(false);
  const markPick = React.useCallback(() => {
    pickingRef.current = true;
    // A pick that doesn't close it (a key that keeps it open) is forgotten
    // with its event, after React has rendered what it scheduled.
    setTimeout(() => {
      pickingRef.current = false;
    });
  }, []);
  const wasPicked = React.useCallback(() => pickingRef.current, []);
  const picks = React.useMemo(
    () => ({ markPick, hasCheck }),
    [markPick, hasCheck],
  );
  return { picks, registerCheck, wasPicked };
}

export {
  CHECK_TRANSITION,
  UNCHECK_TRANSITION,
  GLIDE_TRANSITION,
  PICK_HOLD,
  CheckRegistryContext,
  PickContext,
  asTransformable,
  useCheckMotion,
  useCheckRegistry,
  usePicks,
  useRegisterCheck,
};
