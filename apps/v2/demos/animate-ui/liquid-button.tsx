"use client"

import { LiquidButton } from "@/registry/buttons/liquid"

export const controls = {
  LiquidButton: {
    delay: { value: 0.3, min: 0.1, max: 0.5, step: 0.05 },
    fillHeight: { value: 3, min: 0, max: 10, step: 1 },
    tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
  },
}

export default function LiquidButtonDemo({
  delay = 0.3,
  fillHeight = 3,
  tapScale = 0.97,
}: {
  delay?: number
  fillHeight?: number
  tapScale?: number
}) {
  return (
    <LiquidButton
      delay={`${delay}s`}
      fillHeight={`${fillHeight}px`}
      tapScale={tapScale}
    >
      Liquid Button
    </LiquidButton>
  )
}
