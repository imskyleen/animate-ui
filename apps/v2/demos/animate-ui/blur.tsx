"use client"

import * as React from "react"
import { Blurs } from "@animate-ui/react/primitives/effects/blur"
import { RepeatIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ITEMS = ["Design", "Build", "Ship"]

export const controls = {
  Blur: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    initialBlur: { value: 10, min: 0, max: 50, step: 1 },
    blur: { value: 0, min: 0, max: 50, step: 1 },
  },
}

export default function BlurDemo({
  delay = 0,
  initialBlur = 10,
  blur = 0,
}: {
  delay?: number
  initialBlur?: number
  blur?: number
}) {
  const [key, setKey] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div key={`${key}-${delay}-${initialBlur}-${blur}`} className="flex gap-3">
        <Blurs holdDelay={100} delay={delay} initialBlur={initialBlur} blur={blur}>
          {ITEMS.map((item) => (
            <div
              key={item}
              className="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </Blurs>
      </div>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
        Replay
      </Button>
    </div>
  )
}
