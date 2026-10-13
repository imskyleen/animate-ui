import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'navigation-menu',
  strip: [
    /^transition-\[opacity,transform,translate\]$/,
    /^transition-\[opacity,transform,width,height,scale,translate\]$/,
    /^data-(starting|ending)-style:/,
    /^data-\[(starting|ending)-style\]:/,
    /^group-data-\[viewport=false\]\/navigation-menu:duration-300$/,
  ],
} satisfies Primitive;
