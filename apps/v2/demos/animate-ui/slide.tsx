"use client"

import * as React from "react"
import {
  Slides,
  type SlideDirection,
} from "@animate-ui/react/primitives/effects/slide"
import { RepeatIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ITEMS = ["Design", "Build", "Ship"]

export const controls = {
  Slide: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    direction: {
      value: "up",
      options: { up: "up", down: "down", left: "left", right: "right" },
    },
    offset: { value: 16, min: 0, max: 400, step: 4 },
  },
}

export default function SlideDemo({
  delay = 0,
  direction = "up",
  offset = 16,
}: {
  delay?: number
  direction?: SlideDirection
  offset?: number
}) {
  const [key, setKey] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div key={`${key}-${delay}-${direction}-${offset}`} className="flex gap-3">
        <Slides holdDelay={100} delay={delay} direction={direction} offset={offset}>
          {ITEMS.map((item) => (
            <div
              key={item}
              className="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </Slides>
      </div>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
        Replay
      </Button>
    </div>
  )
}
