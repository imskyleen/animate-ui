import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'switch',
  strip: [/^transition-transform$/, /^transition-all$/],
} satisfies Primitive;
