import type { Primitive } from '../../lib/primitives';

// shadcn's Collapsible has no animation classes of its own; the generic
// tw-animate pass already removes animate-collapsible-up/down.
export default {
  library: 'radix-ui',
  name: 'collapsible',
} satisfies Primitive;
