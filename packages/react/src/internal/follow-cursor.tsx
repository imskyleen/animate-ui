'use client';

import * as React from 'react';
import {
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { useShouldReduceMotion, useTempoTransition } from '../utils/motion';

type FollowCursor = boolean | 'x' | 'y';

type FollowCursorProps = {
  followCursor?: FollowCursor;
  followCursorSpringOptions?: SpringOptions;
};

const FOLLOW_SPRING: SpringOptions = { stiffness: 200, damping: 17 };

type FollowCursorState = {
  followCursor: FollowCursor;
  spring: SpringOptions;
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const FollowCursorContext = React.createContext<FollowCursorState | null>(null);

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
