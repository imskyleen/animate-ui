import type { Primitive } from '../../lib/primitives';

// The menus of shadcn/ui's React Aria dropdown and context menus: their items
// take part in the menus' highlight, into submenus too. Their popovers are
// the Popover primitive's.
export default {
  library: 'react-aria',
  name: 'menu',
  exports: ['Menu', 'MenuItem'],
} satisfies Primitive;
