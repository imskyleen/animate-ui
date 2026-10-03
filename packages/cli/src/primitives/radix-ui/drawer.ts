import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Radix Drawer, built on Vaul (`import { Drawer } from "vaul"`,
// mapped here by transform.ts). Its only CSS animation is the overlay's
// tw-animate fade, which the generic utilities already remove: the drawer
// itself was animated by Vaul's own stylesheet, which Motion replaces.
export default {
  library: 'radix-ui',
  name: 'drawer',
} satisfies Primitive;
