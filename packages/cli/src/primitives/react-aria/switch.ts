import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'switch',
  strip: [/^transition-transform$/, /^transition-all$/],
  exports: ['Switch'],
} satisfies Primitive;
