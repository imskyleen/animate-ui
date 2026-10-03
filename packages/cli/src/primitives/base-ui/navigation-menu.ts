import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'navigation-menu',
  strip: [
    // The popup's and the content's CSS enter/exit: Motion animates their
    // opacity and transform now (the popup size stays a CSS transition, set
    // by the primitive).
    /^transition-\[opacity,transform,translate\]$/,
    /^transition-\[opacity,transform,width,height,scale,translate\]$/,
    /^data-(starting|ending)-style:/,
    /^data-\[(starting|ending)-style\]:/,
    // tw-animate's duration on the content (inline mode). The positioner's
    // `duration-[0.35s]` and the trigger icon's `duration-300` stay.
    /^group-data-\[viewport=false\]\/navigation-menu:duration-300$/,
  ],
} satisfies Primitive;
