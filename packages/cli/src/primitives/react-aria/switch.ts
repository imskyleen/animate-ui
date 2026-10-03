import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'switch',
  // The thumb's `transition-transform` would tween its `translate` class;
  // Motion glides the thumb with a spring now. The track's colour transition
  // (`transition-all`) stays.
  strip: [/^transition-transform$/],
  exports: ['Switch'],
} satisfies Primitive;
