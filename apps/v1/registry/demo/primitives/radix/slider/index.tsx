'use client';

import * as React from 'react';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '@/registry/primitives/radix/slider';

const thumbClassName =
  'block size-5 rounded-full border-2 border-primary bg-background shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/50';

export const RadixSliderDemo = () => {
  const [volume, setVolume] = React.useState([40]);
  const [price, setPrice] = React.useState([20, 80]);

  return (
    <div className="flex w-[300px] flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Volume</span>
          <span className="text-muted-foreground tabular-nums">
            {volume[0]}%
          </span>
        </div>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="relative flex h-5 w-full touch-none items-center select-none"
        >
          <SliderTrack className="relative h-2 grow overflow-hidden rounded-full bg-muted">
            <SliderRange className="absolute h-full bg-primary" />
          </SliderTrack>
          <SliderThumb aria-label="Volume" className={thumbClassName} />
        </Slider>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Price</span>
          <span className="text-muted-foreground tabular-nums">
            {`$${price[0]} – $${price[1]}`}
          </span>
        </div>
        <Slider
          value={price}
          onValueChange={setPrice}
          max={100}
          step={1}
          minStepsBetweenThumbs={1}
          className="relative flex h-5 w-full touch-none items-center select-none"
        >
          <SliderTrack className="relative h-2 grow overflow-hidden rounded-full bg-muted">
            <SliderRange className="absolute h-full bg-primary" />
          </SliderTrack>
          <SliderThumb aria-label="Minimum price" className={thumbClassName} />
          <SliderThumb aria-label="Maximum price" className={thumbClassName} />
        </Slider>
      </div>
    </div>
  );
};
