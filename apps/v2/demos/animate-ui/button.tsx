"use client"

import { Button } from "@animate-ui/react/primitives/buttons/button"

export const controls = {
  Button: {
    hoverScale: { value: 1.05, min: 0, max: 2, step: 0.05 },
    tapScale: { value: 0.95, min: 0, max: 2, step: 0.05 },
  },
}

export default function ButtonDemo({
  hoverScale = 1.05,
  tapScale = 0.95,
}: {
  hoverScale?: number
  tapScale?: number
}) {
  return (
    <Button
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium"
    >
      Button
    </Button>
  )
}
