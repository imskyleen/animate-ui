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

const STEPS = [12, 27, 41, 58, 64, 83, 100];

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

export default function ReactAriaProgressFixture() {
  const [value, setValue] = React.useState(30);
  const upload = useUpload();

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

      <section>
        <button type="button" disabled={upload.running} onClick={upload.start}>
          Upload again
        </button>
        <ProgressBar value={upload.value} aria-label="Upload">
          {({ percentage }) => (
            <span style={track}>
              <span
                data-testid="upload-indicator"
                style={{
                  display: 'block',
                  height: '100%',
                  background: 'black',
                  width: `${percentage}%`,
                }}
              />
            </span>
          )}
        </ProgressBar>
      </section>
    </div>
  );
}
