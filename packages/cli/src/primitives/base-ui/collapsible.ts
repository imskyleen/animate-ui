import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'collapsible',
  strip: [
    /^h-\(--collapsible-panel-height\)$/,
    /^data-(starting|ending)-style:h-0$/,
  ],
} satisfies Primitive;
