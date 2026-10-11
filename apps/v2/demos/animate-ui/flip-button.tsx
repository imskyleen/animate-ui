"use client"

import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
  type FlipDirection,
} from "@animate-ui/react/primitives/buttons/flip"

export const controls = {
  FlipButton: {
    from: {
      value: "top",
      options: { top: "top", right: "right", bottom: "bottom", left: "left" },
    },
    tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
  },
}

export default function FlipButtonDemo({
  from = "top",
  tapScale = 0.97,
}: {
  from?: FlipDirection
  tapScale?: number
}) {
  return (
    <FlipButton from={from} tapScale={tapScale} className="text-sm font-medium">
      <FlipButtonFront className="bg-primary text-primary-foreground h-10 rounded-lg px-4">
        Front
      </FlipButtonFront>
      <FlipButtonBack className="bg-muted text-foreground h-10 rounded-lg px-4">
        Back Button
      </FlipButtonBack>
    </FlipButton>
  )
}
