'use client';

import * as React from 'react';

import {
  CheckAnimationContext,
  createMotionTokens,
  MotionTokensContext,
  ReducedMotionContext,
  type CheckAnimation,
  type ReducedMotion,
} from '../utils/motion';

type AnimateUIProviderProps = {
  tempo?: number;
  checkAnimation?: CheckAnimation;
  reducedMotion?: ReducedMotion;
  children?: React.ReactNode;
};

function AnimateUIProvider({
  tempo,
  checkAnimation,
  reducedMotion,
  children,
}: AnimateUIProviderProps) {
  const outer = React.use(MotionTokensContext);
  const outerCheck = React.use(CheckAnimationContext);
  const outerReduced = React.use(ReducedMotionContext);
  const pace = tempo ?? outer.tempo;
  const tokens = React.useMemo(
    () => (pace === outer.tempo ? outer : createMotionTokens(pace)),
    [pace, outer],
  );

  return (
    <MotionTokensContext value={tokens}>
      <CheckAnimationContext value={checkAnimation ?? outerCheck}>
        <ReducedMotionContext value={reducedMotion ?? outerReduced}>
          {children}
        </ReducedMotionContext>
      </CheckAnimationContext>
    </MotionTokensContext>
  );
}

export {
  AnimateUIProvider,
  type AnimateUIProviderProps,
  type CheckAnimation,
  type ReducedMotion,
};
