import { describe, expect, it } from 'vitest';

import * as react from '../../react/src/utils/motion';
import * as vue from '../src/utils/motion';

// Vue moves like React only while both packages share the same values.
describe('motion tokens', () => {
  it('are the same as @animate-ui/react', () => {
    for (const set of [
      'ease',
      'spring',
      'transition',
      'scale',
      'blur',
      'rotate',
      'shift',
      'stagger',
    ] as const)
      expect(vue[set], set).toEqual(react[set]);
  });

  it('scale with the tempo the same way', () => {
    for (const tempo of [0.5, 1.5, 2])
      expect(vue.createMotionTokens(tempo)).toEqual(
        react.createMotionTokens(tempo),
      );
  });
});
