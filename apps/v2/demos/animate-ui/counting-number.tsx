"use client"

import * as React from "react"
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const controls = {
  CountingNumber: {
    number: { value: 2025 },
    fromNumber: { value: 0 },
    padStart: { value: false },
    decimalSeparator: { value: "." },
    decimalPlaces: { value: 0 },
    delay: { value: 0, min: 0, max: 3000, step: 100 },
  },
}

export default function CountingNumberDemo({
  number = 2025,
  fromNumber = 0,
  padStart = false,
  decimalSeparator = ".",
  decimalPlaces = 0,
  delay = 0,
}: {
  number?: number
  fromNumber?: number
  padStart?: boolean
  decimalSeparator?: string
  decimalPlaces?: number
  delay?: number
}) {
  const [run, setRun] = React.useState(0)
  const key = [run, number, fromNumber, padStart, decimalSeparator, decimalPlaces, delay].join()

  return (
    <div className="flex flex-col items-center gap-6">
      <CountingNumber
        key={key}
        number={number}
        fromNumber={fromNumber}
        padStart={padStart}
        decimalSeparator={decimalSeparator}
        decimalPlaces={decimalPlaces}
        delay={delay}
        className="text-4xl font-semibold tabular-nums"
      />
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
