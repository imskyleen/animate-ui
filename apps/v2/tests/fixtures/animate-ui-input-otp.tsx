'use client';

import * as React from 'react';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/demos/animate-ui/input-otp';

const SLOTS = [0, 1, 2, 3, 4, 5];

// A code checked once complete (and refused: it turns invalid), with a
// button that resets it, like a "resend code". And one whose slots sit on
// fractional pixels.
export default function InputOTPFixture() {
  const [value, setValue] = React.useState('');
  const [invalid, setInvalid] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="checked" className="flex items-center gap-6">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(next) => {
            setValue(next);
            setInvalid(false);
          }}
          onComplete={() => setInvalid(true)}
          aria-label="Checked code"
        >
          <InputOTPGroup>
            {SLOTS.map((index) => (
              <InputOTPSlot key={index} index={index} aria-invalid={invalid} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <button
          type="button"
          onClick={() => {
            setValue('');
            setInvalid(false);
          }}
        >
          Reset
        </button>
      </section>

      <section data-testid="fractional" style={{ paddingLeft: 0.35 }}>
        <InputOTP maxLength={4} aria-label="Fractional code">
          <InputOTPGroup>
            {[0, 1, 2, 3].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                style={{ width: 33.3, height: 33.3 }}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </section>
    </div>
  );
}
