import type { Primitive } from '../../lib/primitives';

// Nothing to animate on the group itself (the Radio animates), but shadcn/ui's
// Radio Group imports it next to Radio: swapping both keeps one source.
export default {
  library: 'base-ui',
  name: 'radio-group',
} satisfies Primitive;
