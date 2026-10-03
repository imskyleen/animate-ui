import type { Primitive } from '../../lib/primitives';

// Nothing to strip: shadcn's thumbs only transition colors and rings.
export default {
  library: 'base-ui',
  name: 'slider',
} satisfies Primitive;
