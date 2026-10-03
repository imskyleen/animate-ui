import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'popover',
  // The CSS keyframes' duration: Motion owns the timing now.
  strip: [/^duration-100$/],
} satisfies Primitive;
