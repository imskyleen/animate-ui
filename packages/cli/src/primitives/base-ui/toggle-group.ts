import type { Primitive } from '../../lib/primitives';

// Nothing to animate on the group itself: its items are Toggles, which give
// the press feedback. shadcn/ui imports both.
export default {
  library: 'base-ui',
  name: 'toggle-group',
} satisfies Primitive;
