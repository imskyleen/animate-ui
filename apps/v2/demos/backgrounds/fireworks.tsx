"use client"

import { useTheme } from "next-themes"

import { FireworksBackground } from "@/registry/backgrounds/fireworks"

export const controls = {
  FireworksBackground: {
    population: { value: 1, min: 0.1, max: 10, step: 0.1 },
  },
}

export default function FireworksBackgroundDemo({
  population = 1,
}: {
  population?: number
}) {
  const { resolvedTheme } = useTheme()

  return (
    <FireworksBackground
      className="absolute inset-0"
      color={resolvedTheme === "dark" ? "white" : "black"}
      population={population}
    />
  )
}
