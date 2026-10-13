import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'progress-bar',
  exports: ['ProgressBar'],
  strip: [/^transition-all$/],
} satisfies Primitive;
