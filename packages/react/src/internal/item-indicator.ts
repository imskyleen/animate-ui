import type { Transition } from 'motion/react';

// The checks of list items (a select's or a combobox's chosen item), shared
// by the libraries: a single selection's check glides to the chosen item like
// v1's radio indicator, a multiple selection's pops in like v1's checkbox
// check.

/** Motion's defaults, which v1's checkbox check used: written out for the tempo. */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;

/** Motion's default layout transition, which v1's radio indicator used. */
const GLIDE_TRANSITION = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1],
} as const satisfies Transition;

export { CHECK_TRANSITION, GLIDE_TRANSITION };
