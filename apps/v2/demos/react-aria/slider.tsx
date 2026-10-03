"use client"

import * as React from "react"
import { cn } from "cn"
import {
  SliderFill,
  Slider as SliderPrimitive,
  SliderThumb,
  SliderTrack,
  type SliderProps as SliderPrimitiveProps,
} from "@animate-ui/react/primitives/react-aria"

type SliderValue = number | number[]
type SliderProps<T extends SliderValue = SliderValue> = Omit<
  SliderPrimitiveProps<T>,
  "className"
> & {
  className?: string
}

function Slider<T extends SliderValue = SliderValue>({
  className,
  ...props
}: SliderProps<T>) {
  return (
    <SliderPrimitive
      className={cn(
        "data-vertical:min-h-40 group relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      data-slot="slider"
      {...props}
    >
      {({ state }) => {
        return (
          <>
            <SliderTrack
              data-slot="slider-track"
              className="bg-muted rounded-full data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1 relative grow overflow-hidden select-none"
            >
              <SliderFill
                data-slot="slider-range"
                className="bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full"
              />
            </SliderTrack>
            {state.values.map((_, index) => (
              <SliderThumb
                data-slot="slider-thumb"
                key={index}
                index={index}
                className="border-ring ring-ring/50 relative size-3 rounded-full border bg-white transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 block shrink-0 select-none group-data-horizontal:top-[50%] group-data-vertical:left-[50%] disabled:pointer-events-none disabled:opacity-50"
              />
            ))}
          </>
        )
      }}
    </SliderPrimitive>
  )
}

export { Slider }

export default function SliderDemo() {
  const [volume, setVolume] = React.useState(64)
  const [price, setPrice] = React.useState([250, 750])

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Volume</span>
          <span className="text-muted-foreground tabular-nums">{volume}%</span>
        </div>
        <Slider value={volume} onChange={setVolume} aria-label="Volume" />
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
          onChange={setPrice}
          maxValue={1000}
          step={10}
          aria-label="Price"
        />
      </div>
    </div>
  )
}
