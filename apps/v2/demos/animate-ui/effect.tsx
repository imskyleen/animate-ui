"use client"

import * as React from "react"
import { Effects } from "@animate-ui/react/primitives/effects/effect"
import { RepeatIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ITEMS = ["Design", "Build", "Ship"]

export const controls = {
  Effect: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    blur: { value: true },
    slide: { value: true },
    fade: { value: true },
    zoom: { value: true },
  },
}

export default function EffectDemo({
  delay = 0,
  blur = true,
  slide = true,
  fade = true,
  zoom = true,
}: {
  delay?: number
  blur?: boolean
  slide?: boolean
  fade?: boolean
  zoom?: boolean
}) {
  const [key, setKey] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        key={`${key}-${delay}-${blur}-${slide}-${fade}-${zoom}`}
        className="flex gap-3"
      >
        <Effects
          holdDelay={100}
          delay={delay}
          blur={blur}
          slide={slide}
          fade={fade}
          zoom={zoom}
        >
          {ITEMS.map((item) => (
            <div
              key={item}
              className="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </Effects>
      </div>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
        Replay
      </Button>
    </div>
  )
}
