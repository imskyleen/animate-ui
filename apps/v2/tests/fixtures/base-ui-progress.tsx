'use client';

import * as React from 'react';
import { Progress } from '@animate-ui/react/primitives/base-ui/progress';

const track = {
  width: 200,
  height: 8,
  overflow: 'hidden',
  background: '#ddd',
} as const;

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

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseProgressFixture() {
  const [value, setValue] = React.useState(30);
  const upload = useUpload();

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

      <section>
        <button type="button" disabled={upload.running} onClick={upload.start}>
          Upload again
        </button>
        <Progress.Root value={upload.value} aria-label="Upload">
          <Progress.Track style={track}>
            <Progress.Indicator
              data-testid="upload-indicator"
              style={{ height: '100%', background: 'black' }}
            />
          </Progress.Track>
        </Progress.Root>
      </section>
    </div>
  );
}
