'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens } from '../utils/motion';

// The checks of list items (a select's or a combobox's chosen item), shared
// by the libraries: a single selection's check glides to the chosen item, a
// multiple selection's pops in like v1's checkbox check.
//
// Choosing another item closes the list: when a check is there to glide, the
// list holds still for PICK_HOLD first, so the check is seen landing on the
// item before the list fades out. Each shown check registers with its list
// (CheckRegistryContext) so the list knows.

/** Motion's defaults, which v1's checkbox check used: written out for the tempo. */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;

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

export {
  CHECK_TRANSITION,
  GLIDE_TRANSITION,
  PICK_HOLD,
  CheckRegistryContext,
  useCheckRegistry,
  useRegisterCheck,
};
