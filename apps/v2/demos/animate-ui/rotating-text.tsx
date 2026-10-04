"use client"

import {
  RotatingText,
  RotatingTextContainer,
} from "@animate-ui/react/primitives/texts/rotating"

export const controls = {
  RotatingTextContainer: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    y: { value: -50, min: -100, max: 100, step: 10 },
    duration: { value: 2000, min: 1000, max: 5000, step: 100 },
  },
}

export default function RotatingTextDemo({
  delay = 0,
  y = -50,
  duration = 2000,
}: {
  delay?: number
  y?: number
  duration?: number
}) {
  return (
    <RotatingTextContainer
      className="text-4xl font-semibold"
      text={["Rotating", "Text", "Demo"]}
      delay={delay}
      y={y}
      duration={duration}
    >
      <RotatingText />
    </RotatingTextContainer>
  )
}
