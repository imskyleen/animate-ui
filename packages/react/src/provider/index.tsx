'use client';

import * as React from 'react';

import {
  CheckAnimationContext,
  createMotionTokens,
  MotionTokensContext,
  type CheckAnimation,
} from '../utils/motion';

type AnimateUIProviderProps = {
  tempo?: number;
  checkAnimation?: CheckAnimation;
  children?: React.ReactNode;
};

function AnimateUIProvider({
  tempo,
  checkAnimation,
  children,
}: AnimateUIProviderProps) {
  const outer = React.use(MotionTokensContext);
  const outerCheck = React.use(CheckAnimationContext);
  const pace = tempo ?? outer.tempo;
  const tokens = React.useMemo(
    () => (pace === outer.tempo ? outer : createMotionTokens(pace)),
    [pace, outer],
  );

  return (
    <MotionTokensContext value={tokens}>
      <CheckAnimationContext value={checkAnimation ?? outerCheck}>
        {children}
      </CheckAnimationContext>
    </MotionTokensContext>
  );
}

export { AnimateUIProvider, type AnimateUIProviderProps, type CheckAnimation };
