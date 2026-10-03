import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Dialog, Alert Dialog and Sheet on React Aria. They animate the
// Modal and ModalOverlay in CSS: tw-animate keyframes timed by `duration-100`,
// and for the Sheet transitions on `data-entering` / `data-exiting` (opacity,
// a 2.5rem slide per side, `transition duration-200 ease-in-out`,
// `transition-opacity duration-150`). Motion owns all of it.
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
