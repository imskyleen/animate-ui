"use client"

import * as React from "react"
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const controls = {
  SlidingNumber: {
    padStart: { value: false },
    decimalSeparator: { value: "." },
    decimalPlaces: { value: 0 },
    thousandSeparator: { value: "," },
    delay: { value: 0, min: 0, max: 3000, step: 100 },
  },
}

export default function SlidingNumberDemo({
  padStart = false,
  decimalSeparator = ".",
  decimalPlaces = 0,
  thousandSeparator = ",",
  delay = 0,
}: {
  padStart?: boolean
  decimalSeparator?: string
  decimalPlaces?: number
  thousandSeparator?: string
  delay?: number
}) {
  const [value, setValue] = React.useState(1250)

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        aria-label="Decrease"
        onClick={() => setValue((n) => n - 25)}
      >
        <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
      </Button>
      <SlidingNumber
        number={value}
        padStart={padStart}
        decimalSeparator={decimalSeparator}
        decimalPlaces={decimalPlaces}
        thousandSeparator={thousandSeparator}
        delay={delay}
        className="min-w-36 justify-center text-4xl font-semibold"
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="Increase"
        onClick={() => setValue((n) => n + 25)}
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
      </Button>
    </div>
  )
}
