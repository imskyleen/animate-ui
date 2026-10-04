"use client"

import * as React from "react"
import { Fades } from "@animate-ui/react/primitives/effects/fade"
import { RepeatIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ITEMS = ["Design", "Build", "Ship"]

export const controls = {
  Fade: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    initialOpacity: { value: 0, min: 0, max: 1, step: 0.1 },
    opacity: { value: 1, min: 0, max: 1, step: 0.1 },
  },
}

export default function FadeDemo({
  delay = 0,
  initialOpacity = 0,
  opacity = 1,
}: {
  delay?: number
  initialOpacity?: number
  opacity?: number
}) {
  const [key, setKey] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div key={`${key}-${delay}-${initialOpacity}-${opacity}`} className="flex gap-3">
        <Fades holdDelay={100} delay={delay} initialOpacity={initialOpacity} opacity={opacity}>
          {ITEMS.map((item) => (
            <div
              key={item}
              className="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </Fades>
      </div>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
        Replay
      </Button>
    </div>
  )
}
