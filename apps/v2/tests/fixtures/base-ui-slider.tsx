'use client';

import * as React from 'react';
import { Slider } from '@animate-ui/react/primitives/base-ui/slider';

import { Slider as DemoSlider } from '@/demos/base-ui/slider';

const control = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: 240,
  height: 20,
  touchAction: 'none',
} as const;
const track = {
  position: 'relative',
  flexGrow: 1,
  height: 4,
  background: '#ddd',
} as const;
const thumb = {
  width: 16,
  height: 16,
  borderRadius: 8,
  background: 'black',
} as const;

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseSliderFixture() {
  const [value, setValue] = React.useState(20);
  const [committed, setCommitted] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="value">{value}</p>
        <p data-testid="committed">{committed}</p>
        <button type="button" onClick={() => setValue(80)}>
          Set 80
        </button>
        <Slider.Root
          value={value}
          onValueChange={(next) => setValue(next as number)}
          onValueCommitted={(next) => setCommitted(next as number)}
        >
          <Slider.Label>Controlled</Slider.Label>
          <Slider.Value data-testid="output" />
          <Slider.Control style={control}>
            <Slider.Track style={track}>
              <Slider.Indicator
                className={(state) => `indicator-${state.orientation}`}
                style={{ background: 'black' }}
              />
              <Slider.Thumb aria-label="Controlled" style={thumb} />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </section>

      <section data-testid="uncontrolled">
        <Slider.Root defaultValue={[10, 60]}>
          <Slider.Control style={control}>
            <Slider.Track style={track}>
              <Slider.Indicator style={{ background: 'black' }} />
              <Slider.Thumb aria-label="Start" style={thumb} />
              <Slider.Thumb aria-label="End" style={thumb} />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </section>

      <section data-testid="range">
        {/* shadcn's slider-range example, on the docs demo's Slider. */}
        <DemoSlider
          defaultValue={[25, 50]}
          max={100}
          step={5}
          className="mx-auto w-full max-w-xs"
        />
      </section>

      <section data-testid="formatted">
        {/* Formatted in the browser's locale: 0.5 in English, 0,5 in French. */}
        <Slider.Root
          defaultValue={0.5}
          min={0}
          max={1}
          step={0.05}
          format={{ maximumFractionDigits: 2 }}
        >
          <Slider.Value data-testid="formatted-output" />
          <Slider.Control style={control}>
            <Slider.Track style={track}>
              <Slider.Indicator style={{ background: 'black' }} />
              <Slider.Thumb aria-label="Opacity" style={thumb} />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </section>
    </div>
  );
}
