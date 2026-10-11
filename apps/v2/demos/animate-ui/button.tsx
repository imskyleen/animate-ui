"use client"

import { Button } from "@animate-ui/react/primitives/buttons/button"

export const controls = {
  Button: {
    tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
  },
}

export default function ButtonDemo({
  tapScale = 0.97,
}: {
  tapScale?: number
}) {
  return (
    <Button
      tapScale={tapScale}
      className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium"
    >
      Button
    </Button>
  )
}
