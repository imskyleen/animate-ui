import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Drawer on Base UI. The primitive now owns the popup's transform
// (it still reads shadcn's `--translate-x/y`, `--stack-scale` and
// `--closed-transform`), the backdrop's opacity, and every duration and curve
// of both, including 0ms while swiping and the release scaled by
// `--drawer-swipe-strength`. The classes doing that in CSS go; the variables
// they feed, the swipe handle's and the content's own fades stay.
export default {
  library: 'base-ui',
  name: 'drawer',
  strip: [
    /^transform-\[translate3d\(var\(--translate-x/,
    /^transition-\[transform,height,opacity,filter\]$/,
    /^duration-450$/,
    /^ease-\[cubic-bezier\((0\.22,1,0\.36,1|0\.32,0\.72,0,1)\)\]$/,
    /^data-(starting|ending)-style:transform-\(--closed-transform\)$/,
    /^(data-ending-style:)?data-(swiping|nested-drawer-swiping):duration-/,
    /^data-ending-style:duration-\[calc\(var\(--drawer-swipe-strength\)/,
    /^opacity-\[max\(var\(--drawer-overlay-min-opacity/,
    /^data-(starting|ending)-style:opacity-0$/,
  ],
} satisfies Primitive;
