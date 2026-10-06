import type { Primitive } from '../../lib/primitives';

// shadcn/ui's React Aria combobox chips (TagGroup > TagList > Tag): an added
// tag pops in, a removed one shrinks out, and the others glide to make room
// or close the gap. Its popover is the Popover primitive's.
export default {
  library: 'react-aria',
  name: 'tag-group',
  exports: ['Tag', 'TagGroup', 'TagList'],
} satisfies Primitive;
