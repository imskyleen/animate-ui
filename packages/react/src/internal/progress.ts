'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

// Shared by the Radix UI, Base UI and React Aria progress bars, which move
// like Animate UI v1's: the indicator springs to a new value (stiffness 100,
// damping 30, no bounce), as v1's Radix `ProgressIndicator` (its `x`) and
// Base UI `ProgressIndicator` (its `width`) did. The Base UI `ProgressValue`
// counts to the new value like v1's (a `CountingNumber`), on the bar's own
// spring: the number moves with the bar it describes.

/** v1's `ProgressIndicator` transition. */
const PROGRESS_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 30,
};

/** The Base UI `ProgressValue` count: the bar's spring, so they move together. */
const VALUE_TRANSITION: Transition = PROGRESS_TRANSITION;

/**
 * A number that springs to `target`, re-rendering on each frame (v1's
 * `CountingNumber`, which started from 0 when it mounted).
 */
function useCountingNumber(target: number, transition: Transition, from = 0) {
  const [shown, setShown] = React.useState(from);
  const [value] = React.useState(() => motionValue(from));
  // Read when the target changes: a new transition object each render (a
  // tempo) mustn't restart the count.
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });

  React.useEffect(() => value.on('change', setShown), [value]);

  React.useEffect(() => {
    let controls: AnimationPlaybackControls | undefined;
    // v1's CountingNumber set its value in a `setTimeout` (its `delay`, 0):
    // the count starts with the bar's own animation, not ahead of it.
    const timeout = setTimeout(() => {
      controls = animate(value, target, transitionRef.current);
    }, 0);
    return () => {
      clearTimeout(timeout);
      controls?.stop();
    };
  }, [value, target]);

  return shown;
}

export { PROGRESS_TRANSITION, VALUE_TRANSITION, useCountingNumber };
