import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'navigation-menu',
  strip: [
    /^duration-100$/,
    /^group-data-\[viewport=false\]\/navigation-menu:duration-300$/,
    /^ease-\[cubic-bezier\(0\.22,1,0\.36,1\)\]$/,
  ],
} satisfies Primitive;
