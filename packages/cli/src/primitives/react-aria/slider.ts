import type { Primitive } from '../../lib/primitives';

// Nothing to strip: shadcn's thumbs only transition colors and rings.
export default {
  library: 'react-aria',
  name: 'slider',
  exports: ['Slider', 'SliderFill', 'SliderThumb'],
} satisfies Primitive;
