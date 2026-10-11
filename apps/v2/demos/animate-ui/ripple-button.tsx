"use client"

import {
  RippleButton,
  RippleButtonRipples,
} from "@animate-ui/react/primitives/buttons/ripple"

export const controls = {
  RippleButton: {
    tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
  },
}

export default function RippleButtonDemo({
  tapScale = 0.97,
}: {
  tapScale?: number
}) {
  return (
    <RippleButton
      tapScale={tapScale}
      className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium [--ripple-button-ripple-color:var(--primary-foreground)]"
    >
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  )
}
