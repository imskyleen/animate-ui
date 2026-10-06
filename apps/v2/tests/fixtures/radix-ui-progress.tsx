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

const STEPS = [12, 27, 41, 58, 64, 83, 100];

/** From 64% to 0, then up to 100% in steps faster than the spring settles. */
function useUpload() {
  const [value, setValue] = React.useState(64);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    let step = 0;
    const id = setInterval(() => {
      setValue(STEPS[step]!);
      step += 1;
      if (step === STEPS.length) {
        clearInterval(id);
        setRunning(false);
      }
    }, 450);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    setValue(0);
    setRunning(true);
  };

  return { value, running, start };
}

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixProgressFixture() {
  const [value, setValue] = React.useState(25);
  const upload = useUpload();

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

      <section>
        <button type="button" disabled={upload.running} onClick={upload.start}>
          Upload again
        </button>
        <Progress.Root value={upload.value} aria-label="Upload" style={track}>
          <Progress.Indicator
            data-testid="upload-indicator"
            style={{
              ...bar,
              transform: `translateX(-${100 - upload.value}%)`,
            }}
          />
        </Progress.Root>
      </section>
    </div>
  );
}
