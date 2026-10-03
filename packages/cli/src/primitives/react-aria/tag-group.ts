import type { Primitive } from '../../lib/primitives';

// shadcn/ui's React Aria combobox chips (TagGroup > TagList > Tag). Its
// popover is the Popover primitive's.
export default {
  library: 'react-aria',
  name: 'tag-group',
  exports: ['Tag', 'TagList'],
} satisfies Primitive;
