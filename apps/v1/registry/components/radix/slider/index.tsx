'use client';

import * as React from 'react';

import {
  Slider as SliderPrimitive,
  SliderTrack as SliderTrackPrimitive,
  SliderRange as SliderRangePrimitive,
  SliderThumb as SliderThumbPrimitive,
  type SliderProps as SliderPrimitiveProps,
} from '@/registry/primitives/radix/slider';
import { cn } from '@workspace/ui/lib/utils';

type SliderProps = SliderPrimitiveProps & {
  /** Returns the accessible name of the thumb at `index`. */
  getAriaLabel?: (index: number) => string | undefined;
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
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderTrackPrimitive
        className={cn(
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderRangePrimitive
          className={cn(
            'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
          )}
        />
      </SliderTrackPrimitive>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderThumbPrimitive
          key={index}
          aria-label={getAriaLabel?.(index)}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] pointer-fine:hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive>
  );
}

export { Slider, type SliderProps };
