"use client"

import {
  RippleButton,
  RippleButtonRipples,
} from "@animate-ui/react/primitives/buttons/ripple"

export const controls = {
  RippleButton: {
    hoverScale: { value: 1.05, min: 0, max: 2, step: 0.05 },
    tapScale: { value: 0.95, min: 0, max: 2, step: 0.05 },
  },
}

export default function RippleButtonDemo({
  hoverScale = 1.05,
  tapScale = 0.95,
}: {
  hoverScale?: number
  tapScale?: number
}) {
  return (
    <RippleButton
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium [--ripple-button-ripple-color:var(--primary-foreground)]"
    >
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  )
}
