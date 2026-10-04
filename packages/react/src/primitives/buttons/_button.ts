import type { Transition } from 'motion/react';

// Helpers shared by the button primitives. Not a public entry point (no
// index.tsx): the package's subpaths only map folders with an index.

/**
 * The spring Motion gives `scale` when no transition is set, which is how the
 * buttons' hover and tap scales were animated in production. Written out so
 * `<AnimateUIProvider tempo>` can pace it.
 */
const SCALE_SPRING: Transition = {
  type: 'spring',
  stiffness: 550,
  damping: 30,
  restSpeed: 10,
};

export { SCALE_SPRING };
