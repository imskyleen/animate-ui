"use client"

import * as React from "react"
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export default function CountingNumberDemo() {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <CountingNumber
        key={run}
        number={2025}
        className="text-4xl font-semibold tabular-nums"
      />
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
