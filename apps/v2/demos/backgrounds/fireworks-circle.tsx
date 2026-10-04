"use client"

import { useTheme } from "next-themes"

import { FireworksBackground } from "@/registry/backgrounds/fireworks"

export default function FireworksCircleBackgroundDemo() {
  const { resolvedTheme } = useTheme()

  return (
    <FireworksBackground
      className="absolute inset-0"
      color={resolvedTheme === "dark" ? "white" : "black"}
      population={1}
      fireworkSize={7}
      fireworkSpeed={7}
      particleSize={7}
      particleSpeed={7}
    />
  )
}
