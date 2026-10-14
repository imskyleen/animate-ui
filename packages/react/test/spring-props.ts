import type { SpringProviderProps } from '../src/primitives/spring';

export const removed: SpringProviderProps = {
  children: null,
  // @ts-expect-error
  dragElastic: 0.4,
};
