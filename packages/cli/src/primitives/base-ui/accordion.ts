import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'accordion',
  strip: [
    /^h-\(--accordion-panel-height\)$/,
    /^data-(starting|ending)-style:h-0$/,
  ],
} satisfies Primitive;
