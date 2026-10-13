import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'disclosure',
  exports: ['DisclosurePanel'],
  strip: [/^h-\(--disclosure-panel-height\)$/, /^transition-\[height\]$/],
} satisfies Primitive;
