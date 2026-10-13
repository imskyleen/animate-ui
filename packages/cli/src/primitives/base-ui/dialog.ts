import type { Primitive } from '../../lib/primitives';

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
