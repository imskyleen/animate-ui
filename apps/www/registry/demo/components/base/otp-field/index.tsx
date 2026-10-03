import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
} from '@/registry/components/base/otp-field';

export const BaseOTPFieldDemo = () => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp-field-demo" className="text-sm font-medium">
        Verification code
      </label>
      <OTPField id="otp-field-demo" length={6}>
        <OTPFieldGroup>
          <OTPFieldInput />
          <OTPFieldInput aria-label="Character 2 of 6" />
          <OTPFieldInput aria-label="Character 3 of 6" />
        </OTPFieldGroup>
        <OTPFieldSeparator />
        <OTPFieldGroup>
          <OTPFieldInput aria-label="Character 4 of 6" />
          <OTPFieldInput aria-label="Character 5 of 6" />
          <OTPFieldInput aria-label="Character 6 of 6" />
        </OTPFieldGroup>
      </OTPField>
    </div>
  );
};
