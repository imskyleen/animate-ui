'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';
import { motionTokens } from '../utils/motion';

// Shared by the Radix UI, Base UI and React Aria progress bars: the indicator
// springs to a new value like Motion UI's progress bar (stiffness 300,
// damping 35: most of the way in ~230ms, never past it, resting within a
// hundredth of a percent instead of jumping its last half percent), moving
// what v1's did: Radix's `ProgressIndicator` its `x`, Base UI's its `width`.
// The Base UI `ProgressValue` counts to the new value like v1's (a
// `CountingNumber`), on the bar's own spring: the number moves with the bar
// it describes.

/** The indicator's spring (Motion UI's progress bar's). */
const PROGRESS_TRANSITION: Transition = motionTokens.spring.progress;

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
