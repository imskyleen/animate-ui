import type { Primitive } from '../../lib/primitives';

export default {
  library: 'radix-ui',
  name: 'dialog',
  strip: [/^duration-(100|200)$/, /^transition$/, /^ease-in-out$/],
} satisfies Primitive;
