import {
  InputOTP,
  InputOTPCaret,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/registry/primitives/animate/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

const SLOT_CLASS_NAME =
  'relative flex size-10 items-center justify-center rounded-md border text-base data-[active=true]:border-foreground';

function Slot({ index }: { index: number }) {
  return (
    <InputOTPSlot index={index} className={SLOT_CLASS_NAME}>
      <InputOTPCaret className="pointer-events-none absolute inset-0 m-auto h-5 w-px bg-foreground" />
    </InputOTPSlot>
  );
}

export const AnimateInputOTPDemo = () => {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      aria-label="One-time password"
      containerClassName="flex items-center gap-3"
    >
      <InputOTPGroup className="flex gap-2">
        <Slot index={0} />
        <Slot index={1} />
        <Slot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator className="h-px w-3 bg-border" />
      <InputOTPGroup className="flex gap-2">
        <Slot index={3} />
        <Slot index={4} />
        <Slot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};
