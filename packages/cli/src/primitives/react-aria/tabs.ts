import type { Primitive } from '../../lib/primitives';

// Nothing to strip: shadcn's tabs only transition colors. The indicator that
// glides is drawn by the primitive from the selected tab's own classes.
export default {
  library: 'react-aria',
  name: 'tabs',
  exports: ['TabList', 'Tab', 'TabPanel'],
} satisfies Primitive;
