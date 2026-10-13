import type { Primitive } from '../../lib/primitives';

export default {
  library: 'react-aria',
  name: 'modal',
  exports: ['Modal', 'ModalOverlay'],
  strip: [
    /^duration-(100|150|200)$/,
    /^transition(-opacity)?$/,
    /^ease-in-out$/,
    /^data-(entering|exiting):opacity-0$/,
    /^data-\[side=(top|right|bottom|left)\]:data-(entering|exiting):-?translate-[xy]-/,
  ],
} satisfies Primitive;
