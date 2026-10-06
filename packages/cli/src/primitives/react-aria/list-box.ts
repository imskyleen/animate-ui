import type { Primitive } from '../../lib/primitives';

// The list under shadcn/ui's React Aria select and combobox: its items take
// part in the menus' highlight, and a SelectionIndicator inside an item draws
// and erases itself, or pops and glides (`checkAnimation`). Its popover is the
// Popover primitive's.
export default {
  library: 'react-aria',
  name: 'list-box',
  exports: ['ListBox', 'ListBoxItem', 'SelectionIndicator'],
} satisfies Primitive;
