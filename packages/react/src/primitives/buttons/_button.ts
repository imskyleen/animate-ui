import type { Transition } from 'motion/react';

import { motionTokens } from '../../utils/motion';

// Helpers shared by the button primitives. Not a public entry point (no
// index.tsx): the package's subpaths only map folders with an index.

/**
 * The press spring (the one Motion gives `scale` when no transition is set,
 * which is how the buttons' tap scale moved in production). Passed through
 * `useTempoTransition` so `<AnimateUIProvider tempo>` paces it.
 */
const SCALE_SPRING: Transition = motionTokens.spring.press;

/** The buttons' default `tapScale`. */
const TAP_SCALE = motionTokens.scale.press;

export { SCALE_SPRING, TAP_SCALE };
