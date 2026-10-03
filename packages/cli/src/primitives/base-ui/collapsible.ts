import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'collapsible',
  strip: [
    // Base UI's documented CSS height animation (shadcn's Collapsible has
    // none, but projects often add it); Motion animates the height now.
    /^h-\(--collapsible-panel-height\)$/,
    /^data-(starting|ending)-style:h-0$/,
  ],
} satisfies Primitive;
