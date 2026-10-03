import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'dropdown-menu',
  strip: [
    // tw-animate's duration on the content and sub content: Motion times the
    // animation now, and a bare duration would make every style change transition.
    /^duration-100$/,
  ],
} satisfies Primitive;
