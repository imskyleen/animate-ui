"use client"

import * as React from "react"
import {
  ScrollingNumber,
  ScrollingNumberContainer,
  ScrollingNumberHighlight,
  ScrollingNumberItems,
} from "@animate-ui/react/primitives/texts/scrolling-number"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export default function ScrollingNumberDemo() {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <ScrollingNumberContainer
        key={run}
        number={1000}
        step={100}
        itemsSize={40}
        className="w-20 text-lg font-medium tabular-nums"
      >
        <ScrollingNumber delay={300}>
          <ScrollingNumberItems className="text-muted-foreground flex items-center justify-center" />
        </ScrollingNumber>
        <ScrollingNumberHighlight className="bg-muted size-full rounded-md" />
      </ScrollingNumberContainer>
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
