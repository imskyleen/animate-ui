"use client"

import { Button } from "@animate-ui/react/primitives/buttons/button"

export const controls = {
  Button: {
    hoverScale: { value: 1.02, min: 0, max: 2, step: 0.01 },
    tapScale: { value: 0.96, min: 0, max: 2, step: 0.01 },
  },
}

export default function ButtonDemo({
  hoverScale = 1.02,
  tapScale = 0.96,
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
