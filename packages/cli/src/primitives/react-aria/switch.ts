import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'switch',
  // The thumb's `transition-transform` would tween its `translate` class:
  // Motion glides the thumb with a spring now. The track's `transition-all`
  // would fade its colour, which Animate UI changes at once (as v1 did).
  strip: [/^transition-transform$/, /^transition-all$/],
  exports: ['Switch'],
} satisfies Primitive;
