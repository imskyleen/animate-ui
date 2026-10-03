import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'progress',
  strip: [
    // The indicator's CSS transition (transform or width) would run on top of
    // Motion, which animates its transform now.
    /^transition-all$/,
  ],
} satisfies Primitive;
