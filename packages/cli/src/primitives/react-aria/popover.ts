import type { Primitive } from '../../lib/primitives';

// Under popovers, hover cards, selects, comboboxes, dropdown and context
// menus (and their submenus). Their data-entering/data-exiting keyframes are
// tw-animate utilities, removed for every primitive.
export default {
  library: 'react-aria',
  name: 'popover',
  exports: ['Popover'],
  // The CSS keyframes' duration (only ever on the popover itself in
  // shadcn/ui): Motion owns the timing now.
  strip: [/^duration-100$/],
} satisfies Primitive;
