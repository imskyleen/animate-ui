'use client';

import * as React from 'react';

import {
  Slider as SliderPrimitive,
  SliderControl as SliderControlPrimitive,
  SliderTrack as SliderTrackPrimitive,
  SliderIndicator as SliderIndicatorPrimitive,
  SliderThumb as SliderThumbPrimitive,
  type SliderProps as SliderPrimitiveProps,
} from '@/registry/primitives/base/slider';
import { cn } from '@workspace/ui/lib/utils';

type SliderProps = SliderPrimitiveProps & {
  /** Returns the accessible name of the thumb at `index`. */
  getAriaLabel?: (index: number) => string;
};

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  getAriaLabel,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : typeof value === 'number'
          ? [value]
          : Array.isArray(defaultValue)
            ? defaultValue
            : typeof defaultValue === 'number'
              ? [defaultValue]
              : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive
      className={cn(
        'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full',
        className,
      )}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderControlPrimitive className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderTrackPrimitive className="bg-muted relative grow overflow-hidden rounded-full select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <SliderIndicatorPrimitive className="bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
        </SliderTrackPrimitive>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderThumbPrimitive
            key={index}
            index={index}
            getAriaLabel={getAriaLabel}
            className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] select-none pointer-fine:hover:ring-4 has-[:focus-visible]:ring-4 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          />
        ))}
      </SliderControlPrimitive>
    </SliderPrimitive>
  );
}

export { Slider, type SliderProps };
