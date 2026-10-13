import type { Primitive } from '../../lib/primitives';

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
