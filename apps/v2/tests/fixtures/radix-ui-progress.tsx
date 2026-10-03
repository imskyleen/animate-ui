'use client';

import * as React from 'react';
import { Progress } from '@animate-ui/react/primitives/radix-ui/progress';
import * as ProgressStar from '@animate-ui/react/primitives/radix-ui/progress';

const track = {
  width: 200,
  height: 8,
  overflow: 'hidden',
  background: '#ddd',
} as const;
const bar = { height: '100%', background: 'black' } as const;

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixProgressFixture() {
  const [value, setValue] = React.useState(25);

  return (
    <div className="flex flex-col gap-10">
      <button type="button" onClick={() => setValue(50)}>
        Complete
      </button>

      <Progress.Root value={value} max={50} aria-label="Main" style={track}>
        <Progress.Indicator
          data-testid="main-indicator"
          style={{ ...bar, transform: `translateX(-${100 - value * 2}%)` }}
        />
      </Progress.Root>

      <ProgressStar.Root value={null} aria-label="Loading" style={track}>
        <ProgressStar.Indicator style={bar} />
      </ProgressStar.Root>

      <Progress.Root value={value} max={50} aria-label="Slow" style={track}>
        <Progress.Indicator
          data-testid="slow-indicator"
          transition={{ duration: 1.5, ease: 'linear' }}
          style={{ ...bar, transform: `translateX(-${100 - value * 2}%)` }}
        />
      </Progress.Root>
    </div>
  );
}
