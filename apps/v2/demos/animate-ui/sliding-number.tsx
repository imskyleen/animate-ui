"use client"

import * as React from "react"
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const controls = {
  SlidingNumber: {
    number: { value: 2025 },
    fromNumber: { value: true },
    padStart: { value: true },
    decimalSeparator: { value: "," },
    decimalPlaces: { value: 0 },
    thousandSeparator: { value: "." },
    delay: { value: 0, min: 0, max: 3000, step: 100 },
  },
}

export default function SlidingNumberDemo({
  number = 2025,
  fromNumber = true,
  padStart = true,
  decimalSeparator = ",",
  decimalPlaces = 0,
  thousandSeparator = ".",
  delay = 0,
}: {
  number?: number
  fromNumber?: boolean
  padStart?: boolean
  decimalSeparator?: string
  decimalPlaces?: number
  thousandSeparator?: string
  delay?: number
}) {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <SlidingNumber
        key={`${run}-${delay}-${fromNumber}`}
        number={number}
        fromNumber={fromNumber ? 0 : undefined}
        padStart={padStart}
        decimalSeparator={decimalSeparator}
        decimalPlaces={decimalPlaces}
        thousandSeparator={thousandSeparator}
        delay={delay}
        className="text-4xl font-semibold"
      />
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
