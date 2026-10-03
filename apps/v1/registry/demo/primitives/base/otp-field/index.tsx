import {
  OTPField,
  OTPFieldCaret,
  OTPFieldInput,
  OTPFieldSeparator,
} from '@/registry/primitives/base/otp-field';

function Input({ label }: { label?: string }) {
  return (
    <OTPFieldInput
      aria-label={label}
      containerClassName="size-10 rounded-md border text-base focus-within:border-foreground"
      className="size-full bg-transparent text-center outline-none selection:bg-transparent"
    >
      <OTPFieldCaret className="h-5 w-px bg-foreground" />
    </OTPFieldInput>
  );
}

export const BaseOTPFieldPrimitiveDemo = () => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp-field-primitive-demo" className="text-sm font-medium">
        Verification code
      </label>
      <OTPField
        id="otp-field-primitive-demo"
        length={6}
        className="flex items-center gap-2"
      >
        <Input />
        <Input label="Character 2 of 6" />
        <Input label="Character 3 of 6" />
        <OTPFieldSeparator className="h-px w-3 bg-border" />
        <Input label="Character 4 of 6" />
        <Input label="Character 5 of 6" />
        <Input label="Character 6 of 6" />
      </OTPField>
    </div>
  );
};
