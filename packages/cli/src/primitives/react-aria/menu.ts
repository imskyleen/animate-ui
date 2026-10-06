import type { Primitive } from '../../lib/primitives';

// The menus of shadcn/ui's React Aria dropdown and context menus: their items
// take part in the menus' highlight, into submenus too, and their checks (a
// SelectionIndicator, the list-box primitive's) draw and erase themselves, or
// pop and glide between the items of a Menu or a MenuSection
// (`checkAnimation`). Their popovers are the Popover primitive's.
export default {
  library: 'react-aria',
  name: 'menu',
  exports: ['Menu', 'MenuItem', 'MenuSection'],
} satisfies Primitive;
