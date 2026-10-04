"use client"

import { useTheme } from "next-themes"

import { FireworksBackground } from "@/registry/backgrounds/fireworks"

export const controls = {
  FireworksBackground: {
    population: { value: 1, min: 0.1, max: 10, step: 0.1 },
    fireworkSize: { value: 7, min: 1, max: 20, step: 1 },
    fireworkSpeed: { value: 7, min: 1, max: 20, step: 1 },
    particleSize: { value: 7, min: 1, max: 20, step: 1 },
    particleSpeed: { value: 7, min: 1, max: 20, step: 1 },
  },
}

export default function FireworksCircleBackgroundDemo({
  population = 1,
  fireworkSize = 7,
  fireworkSpeed = 7,
  particleSize = 7,
  particleSpeed = 7,
}: {
  population?: number
  fireworkSize?: number
  fireworkSpeed?: number
  particleSize?: number
  particleSpeed?: number
}) {
  const { resolvedTheme } = useTheme()

  return (
    <FireworksBackground
      className="absolute inset-0"
      color={resolvedTheme === "dark" ? "white" : "black"}
      population={population}
      fireworkSize={fireworkSize}
      fireworkSpeed={fireworkSpeed}
      particleSize={particleSize}
      particleSpeed={particleSpeed}
    />
  )
}
