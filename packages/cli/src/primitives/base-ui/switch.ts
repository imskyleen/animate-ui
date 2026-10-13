import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'switch',
  strip: [/^transition-transform$/, /^transition-all$/],
} satisfies Primitive;
