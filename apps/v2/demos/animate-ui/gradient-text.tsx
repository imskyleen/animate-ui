"use client"

import { GradientText } from "@animate-ui/react/primitives/texts/gradient"

export const controls = {
  GradientText: {
    neon: { value: false },
  },
}

export default function GradientTextDemo({ neon = false }: { neon?: boolean }) {
  return (
    <GradientText
      className="text-4xl font-semibold"
      text="Gradient Text"
      neon={neon}
    />
  )
}
