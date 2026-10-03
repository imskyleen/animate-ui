import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Dialog and Sheet. Beyond the tw-animate utilities, they time
// those keyframes with `duration-100`, and the Sheet slides with a CSS
// transition (`transition duration-200 ease-in-out`). Motion owns both now:
// left in place, a transition with no property list (`all`) would chase every
// frame Motion writes.
export default {
  library: 'radix-ui',
  name: 'dialog',
  strip: [/^duration-(100|200)$/, /^transition$/, /^ease-in-out$/],
} satisfies Primitive;
