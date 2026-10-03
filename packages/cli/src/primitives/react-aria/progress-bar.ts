import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'progress-bar',
  exports: ['ProgressBar'],
  strip: [
    // The indicator's CSS width transition would run on top of Motion, which
    // animates its transform now.
    /^transition-all$/,
  ],
} satisfies Primitive;
