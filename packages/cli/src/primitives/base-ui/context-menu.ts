import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'context-menu',
  strip: [
    // tw-animate's duration on the popup: Motion times the animation now,
    // and a bare duration would make every style change transition.
    /^duration-100$/,
  ],
} satisfies Primitive;
