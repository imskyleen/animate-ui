"use client"

import { MorphingText } from "@animate-ui/react/primitives/texts/morphing"

const texts = [
  "MorphingText Primitive",
  "Animate your text 🚀",
  "Handles emojis 🚀✨",
  "Built with Motion ✨",
]

export const controls = {
  MorphingText: {
    loop: { value: true },
    holdDelay: { value: 2500, min: 0, max: 3000, step: 100 },
  },
}

export default function MorphingTextDemo({
  loop = true,
  holdDelay = 2500,
}: {
  loop?: boolean
  holdDelay?: number
}) {
  return (
    <MorphingText
      key={`${loop}-${holdDelay}`}
      className="max-w-2xl text-4xl font-semibold"
      text={texts}
      loop={loop}
      holdDelay={holdDelay}
    />
  )
}
