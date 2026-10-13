'use client';

import * as React from 'react';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';
import { motionTokens } from '../utils/motion';

const PROGRESS_TRANSITION: Transition = motionTokens.spring.progress;

const VALUE_TRANSITION: Transition = PROGRESS_TRANSITION;

function useCountingNumber(target: number, transition: Transition, from = 0) {
  const [shown, setShown] = React.useState(from);
  const [value] = React.useState(() => motionValue(from));
  const transitionRef = React.useRef(transition);
  React.useLayoutEffect(() => {
    transitionRef.current = transition;
  });

  React.useEffect(() => value.on('change', setShown), [value]);

  React.useEffect(() => {
    let controls: AnimationPlaybackControls | undefined;
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
