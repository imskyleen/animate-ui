'use client';

import * as React from 'react';
import { Progress } from '@animate-ui/react/primitives/base-ui/progress';

const track = {
  width: 200,
  height: 8,
  overflow: 'hidden',
  background: '#ddd',
} as const;

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseProgressFixture() {
  const [value, setValue] = React.useState(30);

  return (
    <div className="flex flex-col gap-10">
      <button type="button" onClick={() => setValue(50)}>
        Complete
      </button>

      <Progress.Root value={value} min={10} max={50} aria-label="Export">
        <Progress.Value data-testid="value" />
        <Progress.Track style={track}>
          <Progress.Indicator
            data-testid="main-indicator"
            className={(state) => `status-${state.status}`}
            style={() => ({ height: '100%', background: 'black' })}
          />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={null} aria-label="Loading">
        <Progress.Track style={track}>
          <Progress.Indicator
            data-testid="indeterminate-indicator"
            style={{ height: '100%', width: '30%', background: 'black' }}
          />
        </Progress.Track>
      </Progress.Root>
    </div>
  );
}
