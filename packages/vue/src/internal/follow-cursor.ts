import { inject, provide, type InjectionKey, type PropType } from 'vue';
import {
  motionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from 'motion-v';

import { useShouldReduceMotion, useTempoTransition } from '../utils/motion';

export type FollowCursor = boolean | 'x' | 'y';

export type FollowCursorProps = {
  followCursor?: FollowCursor;
  followCursorSpringOptions?: SpringOptions;
};

export const followCursorProps = {
  followCursor: {
    type: [Boolean, String] as PropType<FollowCursor>,
    default: false,
  },
  followCursorSpringOptions: Object as PropType<SpringOptions>,
};

const FOLLOW_SPRING: SpringOptions = { stiffness: 200, damping: 17 };

type FollowCursorState = {
  followCursor: () => FollowCursor;
  spring: () => SpringOptions;
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const FollowCursorKey: InjectionKey<FollowCursorState> = Symbol(
  'AnimateUIFollowCursor',
);

const followsX = (follow: FollowCursor) => follow === true || follow === 'x';
const followsY = (follow: FollowCursor) => follow === true || follow === 'y';

export function provideFollowCursor(props: () => FollowCursorProps) {
  provide(FollowCursorKey, {
    followCursor: () => props().followCursor ?? false,
    spring: () => props().followCursorSpringOptions ?? FOLLOW_SPRING,
    x: motionValue(0),
    y: motionValue(0),
  });
}

/** The trigger's mousemove: half the pointer's offset from its center. */
export function useFollowCursorHandler() {
  const state = inject(FollowCursorKey, null);
  return (event: MouseEvent) => {
    const follow = state?.followCursor();
    if (!state || !follow) return;
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    if (followsX(follow))
      state.x.set((event.clientX - rect.left - rect.width / 2) / 2);
    if (followsY(follow))
      state.y.set((event.clientY - rect.top - rect.height / 2) / 2);
  };
}

/** The content's x and y while following the cursor, on a spring. */
export function useFollowCursorStyle(): () => {
  x?: MotionValue<number>;
  y?: MotionValue<number>;
} {
  const state = inject(FollowCursorKey, null);
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(
    () => (state?.spring() ?? FOLLOW_SPRING) as never,
  );
  const still = motionValue(0);
  const springX = useSpring(state?.x ?? still, spring.value as SpringOptions);
  const springY = useSpring(state?.y ?? still, spring.value as SpringOptions);
  return () => {
    const follow = state?.followCursor();
    if (!state || !follow) return {};
    return {
      ...(followsX(follow) && { x: reduce.value ? state.x : springX }),
      ...(followsY(follow) && { y: reduce.value ? state.y : springY }),
    };
  };
}
