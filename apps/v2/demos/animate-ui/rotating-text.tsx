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
    align: {
      value: "none",
      options: { none: "none", start: "start", center: "center", end: "end" },
    },
  },
}

export default function RotatingTextDemo({
  delay = 0,
  y = -50,
  duration = 2000,
  align = "none",
}: {
  delay?: number
  y?: number
  duration?: number
  align?: "none" | "start" | "center" | "end"
}) {
  return (
    <RotatingTextContainer
      className="text-4xl font-semibold"
      text={["Rotating", "Text", "Demo"]}
      delay={delay}
      y={y}
      duration={duration}
      align={align === "none" ? undefined : align}
    >
      <RotatingText />
    </RotatingTextContainer>
  )
}
