import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Alert Dialog on Base UI times its tw-animate keyframes with
// `duration-100`: Motion owns the animation now, and a bare duration would make
// every property change transition (`transition-property` defaults to `all`).
export default {
  library: 'base-ui',
  name: 'alert-dialog',
  strip: [/^duration-100$/],
} satisfies Primitive;
