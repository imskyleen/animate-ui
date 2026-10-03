import type { Primitive } from '../../lib/primitives';

// Nothing to strip: shadcn's tabs only transition colors. The indicator that
// glides is drawn by the primitive from the active tab's own classes.
export default {
  library: 'radix-ui',
  name: 'tabs',
} satisfies Primitive;
