import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'navigation-menu',
  strip: [
    // tw-animate's timing on the viewport and the content (inline mode):
    // Motion times them now, and a bare duration would make every style
    // change transition. The trigger icon's own `duration-300` stays.
    /^duration-100$/,
    /^group-data-\[viewport=false\]\/navigation-menu:duration-300$/,
    /^ease-\[cubic-bezier\(0\.22,1,0\.36,1\)\]$/,
  ],
} satisfies Primitive;
