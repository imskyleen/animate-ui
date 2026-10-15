'use client';

import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';

export default function CountingNumberSeparatorsFixture() {
  return (
    <div className="flex flex-col gap-2">
      <CountingNumber
        data-testid="thousands"
        number={12480}
        thousandSeparator=","
        initiallyStable
      />
      <CountingNumber
        data-testid="million"
        number={-1234567.5}
        decimalPlaces={2}
        decimalSeparator=","
        thousandSeparator=" "
        initiallyStable
      />
      <CountingNumber
        data-testid="padded"
        number={1200}
        padStart
        thousandSeparator=","
        initiallyStable
      />
      <CountingNumber
        data-testid="small"
        number={999}
        thousandSeparator=","
        initiallyStable
      />
      <CountingNumber
        data-testid="counting"
        number={48000}
        thousandSeparator=","
      />
    </div>
  );
}
