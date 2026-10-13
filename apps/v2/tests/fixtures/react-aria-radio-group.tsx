'use client';

import * as React from 'react';
import {
  Label,
  Radio,
  RadioGroup,
} from '@animate-ui/react/primitives/react-aria';

export default function ReactAriaRadioGroupFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <RadioGroup
          value={value}
          onChange={setValue}
          className={({ isDisabled }) => (isDisabled ? 'off' : 'flex gap-2')}
        >
          <Label>Controlled</Label>
          {['a', 'b'].map((v) => (
            <Radio
              key={v}
              value={v}
              className={({ isSelected }) =>
                isSelected ? 'is-selected' : 'is-unselected'
              }
            >
              {({ isSelected }) => (
                <>
                  <span
                    data-slot="radio-group-indicator"
                    className="grid size-5 rounded-full border"
                  >
                    {isSelected && (
                      <span data-testid={`dot-${v}`} aria-hidden>
                        •
                      </span>
                    )}
                  </span>
                  Controlled {v}
                </>
              )}
            </Radio>
          ))}
        </RadioGroup>
      </section>

      <section data-testid="custom-render">
        <RadioGroup
          aria-label="Custom render"
          defaultValue="y"
          render={(props) => <div {...props} data-custom="" />}
        >
          {['x', 'y'].map((v) => (
            <Radio key={v} value={v} className="flex">
              Custom {v}
            </Radio>
          ))}
        </RadioGroup>
      </section>
    </div>
  );
}
