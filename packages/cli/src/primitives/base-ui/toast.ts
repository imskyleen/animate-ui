import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'toast',
  strip: [
    /^\[(transform|transition):/,
    /^\[--(offset-y|scale|shrink|peek):/,
    /^transition-opacity$/,
    /^duration-250$/,
    /^ease-\[cubic-bezier\(0\.22,1,0\.36,1\)\]$/,
  ],
} satisfies Primitive;
