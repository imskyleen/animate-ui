"use client"

import { useTheme } from "next-themes"

import { FireworksBackground } from "@/registry/backgrounds/fireworks"

export default function FireworksBackgroundDemo() {
  const { resolvedTheme } = useTheme()

  return (
    <FireworksBackground
      className="absolute inset-0"
      color={resolvedTheme === "dark" ? "white" : "black"}
    />
  )
}
