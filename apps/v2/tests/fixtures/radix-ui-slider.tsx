'use client';

import * as React from 'react';
import { Slider } from '@animate-ui/react/primitives/radix-ui/slider';
import * as SliderStar from '@animate-ui/react/primitives/radix-ui/slider';

const root = {
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
const range = {
  position: 'absolute',
  height: '100%',
  background: 'black',
} as const;
const thumb = {
  display: 'block',
  width: 16,
  height: 16,
  borderRadius: 8,
  background: 'black',
} as const;

// API compatibility: the primitive must behave exactly like Radix's.
export default function RadixSliderFixture() {
  const [value, setValue] = React.useState([20]);
  const [committed, setCommitted] = React.useState<number[]>([]);

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="value">{value.join(',')}</p>
        <p data-testid="committed">{committed.join(',')}</p>
        <button type="button" onClick={() => setValue([80])}>
          Set 80
        </button>
        <Slider.Root
          value={value}
          onValueChange={setValue}
          onValueCommit={setCommitted}
          style={root}
        >
          <Slider.Track style={track}>
            <Slider.Range style={range} />
          </Slider.Track>
          <Slider.Thumb aria-label="Controlled" style={thumb} />
        </Slider.Root>
      </section>

      <section data-testid="star">
        {/* The `import * as` style of @radix-ui/react-slider. */}
        <SliderStar.Root defaultValue={[10, 60]} style={root}>
          <SliderStar.Track style={track}>
            <SliderStar.Range style={range} />
          </SliderStar.Track>
          <SliderStar.Thumb style={thumb} />
          <SliderStar.Thumb style={thumb} />
        </SliderStar.Root>
      </section>

      <section data-testid="disabled">
        <Slider.Root defaultValue={[50]} disabled style={root}>
          <Slider.Track style={track}>
            <Slider.Range style={range} />
          </Slider.Track>
          <Slider.Thumb aria-label="Disabled" style={thumb} />
        </Slider.Root>
      </section>
    </div>
  );
}
