import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'popover',
  exports: ['Popover'],
  strip: [/^duration-100$/],
} satisfies Primitive;
