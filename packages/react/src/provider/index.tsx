'use client';

import * as React from 'react';

import {
  CheckAnimationContext,
  createMotionTokens,
  MotionTokensContext,
  type CheckAnimation,
} from '../utils/motion';

type AnimateUIProviderProps = {
  /**
   * Pace of every Animate UI animation inside: multiplies all durations and
   * springs. 0.8 feels crisper, 1.2 more relaxed.
   * @default 1
   */
  tempo?: number;
  /**
   * How checks show and hide inside: checkboxes', and the checks of menus,
   * selects, comboboxes and lists. `draw`: the check draws itself and erases
   * itself. `pop`: it pops in from half its size and shrinks back out, and a
   * single selection's check glides from the item it leaves to the chosen
   * one. A check's own `animation` prop wins.
   * @default 'draw'
   */
  checkAnimation?: CheckAnimation;
  children?: React.ReactNode;
};

/**
 * Optional. Without it, Animate UI uses its default timing and draws its
 * checks. Providers can be nested: the closest one sets what it's given, the
 * rest comes from the one around it.
 */
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
