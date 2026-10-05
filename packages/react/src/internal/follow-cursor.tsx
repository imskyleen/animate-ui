'use client';

import * as React from 'react';
import {
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { useShouldReduceMotion, useTempoTransition } from '../utils/motion';

// Animate UI v1's `followCursor`, on the Radix UI Tooltip and HoverCard and
// the Base UI Tooltip and PreviewCard: while the pointer moves over the
// trigger, the popup leans towards it by half the pointer's offset from the
// trigger's center, on a spring (stiffness 200, damping 17 by default),
// along both axes or only `x` or `y`. An Animate UI addition to the
// libraries' API, like `transition`. Under reduced motion it follows without
// the spring.

type FollowCursor = boolean | 'x' | 'y';

/** Animate UI's additions to the Root of a tooltip or hover card. */
type FollowCursorProps = {
  /**
   * Make the popup follow the pointer over the trigger: on both axes, or
   * only `'x'` or `'y'` (Animate UI v1).
   * @default false
   */
  followCursor?: FollowCursor;
  /**
   * The spring the popup follows the pointer on.
   * @default { stiffness: 200, damping: 17 }
   */
  followCursorSpringOptions?: SpringOptions;
};

/** v1's default follow spring. */
const FOLLOW_SPRING: SpringOptions = { stiffness: 200, damping: 17 };

type FollowCursorState = {
  followCursor: FollowCursor;
  spring: SpringOptions;
  /** The popup's offset from its place, in px, before the spring. */
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const FollowCursorContext = React.createContext<FollowCursorState | null>(null);

/** Set by the Root: holds the offset its trigger and popup share. */
function FollowCursorProvider({
  followCursor = false,
  followCursorSpringOptions,
  children,
}: FollowCursorProps & { children?: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const value = React.useMemo(
    () => ({
      followCursor,
      spring: followCursorSpringOptions ?? FOLLOW_SPRING,
      x,
      y,
    }),
    [followCursor, followCursorSpringOptions, x, y],
  );

  return <FollowCursorContext value={value}>{children}</FollowCursorContext>;
}

const followsX = (follow: FollowCursor) => follow === true || follow === 'x';
const followsY = (follow: FollowCursor) => follow === true || follow === 'y';

/**
 * The trigger's `onMouseMove`, with the pointer's offset handed to the popup
 * when it follows the cursor.
 */
function useFollowCursorHandler<E extends Element>(
  onMouseMove: React.MouseEventHandler<E> | undefined,
): React.MouseEventHandler<E> | undefined {
  const state = React.use(FollowCursorContext);
  if (!state?.followCursor) return onMouseMove;
  const { followCursor, x, y } = state;

  return (event) => {
    onMouseMove?.(event);
    const rect = event.currentTarget.getBoundingClientRect();
    if (followsX(followCursor))
      x.set((event.clientX - rect.left - rect.width / 2) / 2);
    if (followsY(followCursor))
      y.set((event.clientY - rect.top - rect.height / 2) / 2);
  };
}

/** The popup's `x` and `y` style when it follows the cursor, else none. */
function useFollowCursorStyle(): {
  x?: MotionValue<number>;
  y?: MotionValue<number>;
} {
  const state = React.use(FollowCursorContext);
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(
    (state?.spring ?? FOLLOW_SPRING) as Parameters<
      typeof useTempoTransition
    >[0],
  ) as SpringOptions;
  // Hooks run on every render: without a Root, they follow a still value.
  const still = useMotionValue(0);
  const springX = useSpring(state?.x ?? still, spring);
  const springY = useSpring(state?.y ?? still, spring);
  if (!state?.followCursor) return {};

  return {
    ...(followsX(state.followCursor) && { x: reduce ? state.x : springX }),
    ...(followsY(state.followCursor) && { y: reduce ? state.y : springY }),
  };
}

export {
  FollowCursorProvider,
  useFollowCursorHandler,
  useFollowCursorStyle,
  type FollowCursor,
  type FollowCursorProps,
};
