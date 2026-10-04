"use client"

import * as React from "react"
import { Zooms } from "@animate-ui/react/primitives/effects/zoom"
import { RepeatIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ITEMS = ["Design", "Build", "Ship"]

export const controls = {
  Zoom: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    initialScale: { value: 0.5, min: 0, max: 1, step: 0.1 },
    scale: { value: 1, min: 0, max: 1, step: 0.1 },
  },
}

export default function ZoomDemo({
  delay = 0,
  initialScale = 0.5,
  scale = 1,
}: {
  delay?: number
  initialScale?: number
  scale?: number
}) {
  const [key, setKey] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div key={`${key}-${delay}-${initialScale}-${scale}`} className="flex gap-3">
        <Zooms holdDelay={100} delay={delay} initialScale={initialScale} scale={scale}>
          {ITEMS.map((item) => (
            <div
              key={item}
              className="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </Zooms>
      </div>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
        Replay
      </Button>
    </div>
  )
}
