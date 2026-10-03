import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'accordion',
  strip: [
    // shadcn animates the panel content's height with Base UI's measured
    // variable; Motion animates the panel's height now.
    /^h-\(--accordion-panel-height\)$/,
    /^data-(starting|ending)-style:h-0$/,
  ],
} satisfies Primitive;
