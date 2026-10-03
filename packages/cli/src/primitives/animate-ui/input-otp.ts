import type { Primitive } from '../../lib/primitives';

// shadcn/ui's InputOTP, built on input-otp (`import { OTPInput,
// OTPInputContext } from "input-otp"`, mapped here by transform.ts) in every
// base. Animate UI's input-otp has the same API and animates the slots shadcn
// renders. The caret's CSS blink stays (it doesn't fight Motion; the
// replacement stops it under reduced motion).
export default {
  library: 'animate-ui',
  name: 'input-otp',
} satisfies Primitive;
