'use client';

import { AnimateUIProvider } from '@animate-ui/react/provider';
import { RadioGroup } from '@animate-ui/react/primitives/radix-ui/radio-group';

function Group({ label }: { label: string }) {
  return (
    <RadioGroup.Root aria-label={label} defaultValue="a" className="flex gap-4">
      {['a', 'b'].map((value) => (
        <RadioGroup.Item
          key={value}
          value={value}
          aria-label={`${label} ${value}`}
          className="relative size-5 rounded-full border"
        >
          <RadioGroup.Indicator>
            <span
              data-testid={`${label}-dot-${value}`}
              className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-black"
            />
          </RadioGroup.Indicator>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

// The same radio group at the default pace and at tempo 2: a dot leaves on
// the spring it came in on, paced once.
export default function ProviderRadioTempoFixture() {
  return (
    <div className="flex flex-col gap-10">
      <Group label="Default" />
      <AnimateUIProvider tempo={2}>
        <Group label="Slow" />
      </AnimateUIProvider>
    </div>
  );
}
