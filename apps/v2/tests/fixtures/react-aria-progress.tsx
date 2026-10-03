'use client';

import * as React from 'react';
import { Label, ProgressBar } from '@animate-ui/react/primitives/react-aria';

const track = {
  display: 'block',
  width: 200,
  height: 8,
  overflow: 'hidden',
  background: '#ddd',
} as const;

// API compatibility: the component must behave exactly like React Aria's.
export default function ReactAriaProgressFixture() {
  const [value, setValue] = React.useState(30);

  return (
    <div className="flex flex-col gap-10">
      <button type="button" onClick={() => setValue(50)}>
        Complete
      </button>

      <ProgressBar
        value={value}
        minValue={10}
        maxValue={50}
        className={({ isIndeterminate }) =>
          isIndeterminate ? 'indeterminate' : 'determinate'
        }
      >
        {({ percentage, valueText }) => (
          <>
            <Label>Sync</Label>
            <span data-testid="value-text">{valueText}</span>
            <span style={track}>
              <span
                data-testid="bar"
                style={{
                  display: 'block',
                  height: '100%',
                  background: 'black',
                  width: `${percentage}%`,
                }}
              />
            </span>
          </>
        )}
      </ProgressBar>

      <ProgressBar
        isIndeterminate
        aria-label="Waiting"
        className={({ isIndeterminate }) =>
          isIndeterminate ? 'indeterminate' : 'determinate'
        }
      />
    </div>
  );
}
