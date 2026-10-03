import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'disclosure',
  // The panel is what animates; Disclosure and DisclosureGroup are unchanged.
  exports: ['DisclosurePanel'],
  strip: [
    // shadcn's CSS height transition on React Aria's measured variable;
    // Motion animates the panel's height now.
    /^h-\(--disclosure-panel-height\)$/,
    /^transition-\[height\]$/,
  ],
} satisfies Primitive;
