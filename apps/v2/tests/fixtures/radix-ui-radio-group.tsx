'use client';

import * as React from 'react';
import { RadioGroup } from '@animate-ui/react/primitives/radix-ui/radio-group';
import * as RadioGroupStar from '@animate-ui/react/primitives/radix-ui/radio-group';

const item = 'grid size-5 place-content-center rounded-full border';

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixRadioGroupFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <RadioGroup.Root
          aria-label="Controlled"
          value={value}
          onValueChange={setValue}
        >
          {['a', 'b'].map((v) => (
            <RadioGroup.Item
              key={v}
              value={v}
              aria-label={`Controlled ${v}`}
              className={item}
            >
              <RadioGroup.Indicator data-testid={`controlled-indicator-${v}`}>
                <span>•</span>
              </RadioGroup.Indicator>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-radio-group. */}
        <RadioGroupStar.Root aria-label="Star" defaultValue="y">
          {['x', 'y'].map((v) => (
            <RadioGroupStar.Item
              key={v}
              value={v}
              aria-label={`Star ${v}`}
              className={item}
            >
              <RadioGroupStar.Indicator data-testid={`star-indicator-${v}`}>
                <span>•</span>
              </RadioGroupStar.Indicator>
            </RadioGroupStar.Item>
          ))}
        </RadioGroupStar.Root>
      </section>

      <section data-testid="force-mount">
        <RadioGroup.Root aria-label="Force mounted" defaultValue="1">
          {['1', '2'].map((v) => (
            <RadioGroup.Item
              key={v}
              value={v}
              aria-label={`Forced ${v}`}
              className={item}
            >
              <RadioGroup.Indicator
                forceMount
                data-testid={`forced-indicator-${v}`}
              >
                <span data-testid={`forced-dot-${v}`}>•</span>
              </RadioGroup.Indicator>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </section>
    </div>
  );
}
