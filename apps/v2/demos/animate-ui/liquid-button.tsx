"use client"

import { LiquidButton } from "@animate-ui/react/primitives/buttons/liquid"

export const controls = {
  LiquidButton: {
    delay: { value: 0.3, min: 0.1, max: 0.5, step: 0.05 },
    fillHeight: { value: 3, min: 0, max: 10, step: 1 },
    hoverScale: { value: 1.02, min: 0, max: 2, step: 0.01 },
    tapScale: { value: 0.96, min: 0, max: 2, step: 0.01 },
  },
}

export default function LiquidButtonDemo({
  delay = 0.3,
  fillHeight = 3,
  hoverScale = 1.02,
  tapScale = 0.96,
}: {
  /** In seconds. */
  delay?: number
  /** In pixels. */
  fillHeight?: number
  hoverScale?: number
  tapScale?: number
}) {
  return (
    <LiquidButton
      delay={`${delay}s`}
      fillHeight={`${fillHeight}px`}
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="text-primary hover:text-primary-foreground h-10 overflow-hidden rounded-lg px-4 text-sm font-medium [--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)]"
    >
      Liquid Button
    </LiquidButton>
  )
}
