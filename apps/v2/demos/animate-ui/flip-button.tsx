"use client"

import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
  type FlipDirection,
} from "@/registry/buttons/flip"

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
    <FlipButton from={from} tapScale={tapScale}>
      <FlipButtonFront>
        Front
      </FlipButtonFront>
      <FlipButtonBack>
        Back Button
      </FlipButtonBack>
    </FlipButton>
  )
}
