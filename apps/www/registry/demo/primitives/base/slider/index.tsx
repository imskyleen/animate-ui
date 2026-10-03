'use client';

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from '@/registry/primitives/base/slider';

const thumbClassName =
  'size-5 rounded-full border-2 border-primary bg-background shadow-sm has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/50';

export const BaseSliderDemo = () => {
  return (
    <div className="flex w-[300px] flex-col gap-8">
      <Slider defaultValue={40} max={100} className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <SliderLabel className="font-medium">Volume</SliderLabel>
          <SliderValue className="text-muted-foreground tabular-nums" />
        </div>
        <SliderControl className="relative flex h-5 w-full touch-none items-center select-none">
          <SliderTrack className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <SliderIndicator className="bg-primary" />
          </SliderTrack>
          <SliderThumb className={thumbClassName} />
        </SliderControl>
      </Slider>

      <Slider
        defaultValue={[20, 80]}
        max={100}
        minStepsBetweenValues={1}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between text-sm">
          <SliderLabel className="font-medium">Price</SliderLabel>
          <SliderValue className="text-muted-foreground tabular-nums">
            {(_, values) => `$${values[0]} – $${values[1]}`}
          </SliderValue>
        </div>
        <SliderControl className="relative flex h-5 w-full touch-none items-center select-none">
          <SliderTrack className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <SliderIndicator className="bg-primary" />
          </SliderTrack>
          <SliderThumb index={0} className={thumbClassName} />
          <SliderThumb index={1} className={thumbClassName} />
        </SliderControl>
      </Slider>
    </div>
  );
};
