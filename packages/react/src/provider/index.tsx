'use client';

import * as React from 'react';

import { createMotionTokens, MotionTokensContext } from '../utils/motion';

type AnimateUIProviderProps = {
  /**
   * Pace of every Animate UI animation inside: multiplies all durations and
   * springs. 0.8 feels crisper, 1.2 more relaxed.
   * @default 1
   */
  tempo?: number;
  children?: React.ReactNode;
};

/**
 * Optional. Without it, Animate UI uses its default timing. Providers can be
 * nested: the closest one wins.
 */
function AnimateUIProvider({ tempo = 1, children }: AnimateUIProviderProps) {
  const tokens = React.useMemo(() => createMotionTokens(tempo), [tempo]);

  return <MotionTokensContext value={tokens}>{children}</MotionTokensContext>;
}

export { AnimateUIProvider, type AnimateUIProviderProps };
