"use client"

import * as React from "react"
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export default function SlidingNumberDemo() {
  const [value, setValue] = React.useState(1250)

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        aria-label="Decrease"
        onClick={() => setValue((n) => n - 25)}
      >
        <HugeiconsIcon icon={MinusSignIcon} />
      </Button>
      <SlidingNumber
        number={value}
        thousandSeparator=","
        className="min-w-36 justify-center text-4xl font-semibold"
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="Increase"
        onClick={() => setValue((n) => n + 25)}
      >
        <HugeiconsIcon icon={PlusSignIcon} />
      </Button>
    </div>
  )
}
