'use client';

import * as React from 'react';
import { Radio } from '@animate-ui/react/primitives/base-ui/radio';
import { RadioGroup } from '@animate-ui/react/primitives/base-ui/radio-group';

const item = 'grid size-5 place-content-center rounded-full border';

// API compatibility: the primitives must behave exactly like Base UI's.
export default function BaseRadioGroupFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <RadioGroup
          aria-label="Controlled"
          value={value}
          onValueChange={(next) => setValue(next as string)}
        >
          {['a', 'b'].map((v) => (
            <Radio.Root
              key={v}
              value={v}
              aria-label={`Controlled ${v}`}
              className={item}
            >
              <Radio.Indicator data-testid={`controlled-indicator-${v}`}>
                <span>•</span>
              </Radio.Indicator>
            </Radio.Root>
          ))}
        </RadioGroup>
      </section>

      <section data-testid="keep-mounted">
        <RadioGroup aria-label="Kept mounted" defaultValue="1">
          {['1', '2'].map((v) => (
            <Radio.Root
              key={v}
              value={v}
              aria-label={`Kept ${v}`}
              className={item}
            >
              <Radio.Indicator keepMounted data-testid={`kept-indicator-${v}`}>
                <span data-testid={`kept-dot-${v}`}>•</span>
              </Radio.Indicator>
            </Radio.Root>
          ))}
        </RadioGroup>
      </section>
    </div>
  );
}
