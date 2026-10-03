import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Dialog and Sheet on Base UI. The Dialog times tw-animate
// keyframes with `duration-100`; the Sheet animates with CSS transitions on
// Base UI's `data-starting-style` / `data-ending-style` (opacity, a 2.5rem
// slide per side, `transition duration-200 ease-in-out` on the popup,
// `transition-opacity duration-150` on the backdrop). Motion owns all of it.
export default {
  library: 'base-ui',
  name: 'dialog',
  strip: [
    /^duration-(100|150|200)$/,
    /^transition(-opacity)?$/,
    /^ease-in-out$/,
    /^data-(starting|ending)-style:opacity-0$/,
    /^data-\[side=(top|right|bottom|left)\]:data-(starting|ending)-style:-?translate-[xy]-/,
  ],
} satisfies Primitive;
