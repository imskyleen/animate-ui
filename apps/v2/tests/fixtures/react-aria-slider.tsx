'use client';

import * as React from 'react';
import {
  Label,
  Slider,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from '@animate-ui/react/primitives/react-aria';

import { Slider as DemoSlider } from '@/demos/react-aria/slider';

const track = {
  position: 'relative',
  width: 240,
  height: 20,
} as const;
const thumb = {
  top: '50%',
  width: 16,
  height: 16,
  borderRadius: 8,
  background: 'black',
} as const;

// API compatibility: the components must behave exactly like React Aria's.
export default function ReactAriaSliderFixture() {
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
        <Slider value={value} onChange={setValue} onChangeEnd={setCommitted}>
          <Label>Controlled</Label>
          <SliderOutput data-testid="output" />
          <SliderTrack style={track}>
            <SliderFill style={{ background: 'black', height: 4, top: 8 }} />
            <SliderThumb
              style={thumb}
              className={({ isDragging }) =>
                isDragging ? 'thumb dragging' : 'thumb'
              }
            />
          </SliderTrack>
        </Slider>
      </section>

      <section data-testid="uncontrolled">
        <Slider defaultValue={[10, 60]} aria-label="Range">
          <SliderTrack style={track}>
            {({ state }) =>
              state.values.map((_, i) => (
                <SliderThumb key={i} index={i} style={thumb} />
              ))
            }
          </SliderTrack>
        </Slider>
      </section>

      <section data-testid="range">
        {/* shadcn's slider-range example, on the docs demo's Slider. */}
        <DemoSlider
          aria-label="Range"
          defaultValue={[25, 50]}
          maxValue={100}
          step={5}
          className="mx-auto w-full max-w-xs"
        />
      </section>
    </div>
  );
}
