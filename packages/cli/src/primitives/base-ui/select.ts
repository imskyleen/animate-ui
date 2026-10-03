import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'select',
  strip: [
    // The popup's tw-animate duration: with the keyframes gone it would only
    // put a 100ms `transition` (on every property) under Motion's animation.
    /^duration-100$/,
  ],
} satisfies Primitive;
