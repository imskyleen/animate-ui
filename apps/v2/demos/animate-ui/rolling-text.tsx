"use client"

import * as React from "react"
import { RollingText } from "@animate-ui/react/primitives/texts/rolling"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const controls = {
  RollingText: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
  },
}

export default function RollingTextDemo({ delay = 0 }: { delay?: number }) {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <RollingText
        key={`${run}-${delay}`}
        delay={delay}
        className="text-4xl font-semibold"
        text="Rolling Text"
      />
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
