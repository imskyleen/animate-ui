"use client"

import { TopographyBackground } from "@/registry/backgrounds/topography"

const COLORS = {
  text: "",
  blue: "#3b9eff",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
}

export const controls = {
  TopographyBackground: {
    lineColor: { value: "", options: COLORS },
    levels: { value: 16, min: 4, max: 40, step: 1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    scale: { value: 1, min: 0.3, max: 3, step: 0.1 },
    peak: { value: 1, min: 0, max: 3, step: 0.1 },
    interactive: { value: true },
  },
}

export default function TopographyBackgroundDemo({
  lineColor = "",
  levels = 16,
  speed = 1,
  scale = 1,
  peak = 1,
  interactive = true,
}: {
  lineColor?: string
  levels?: number
  speed?: number
  scale?: number
  peak?: number
  interactive?: boolean | string
}) {
  return (
    <TopographyBackground
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#fafafa_0%,#f0f0f0_100%)] text-neutral-500 dark:bg-[radial-gradient(ellipse_at_center,#171717_0%,#000_100%)] dark:text-neutral-400"
      lineColor={lineColor || undefined}
      levels={Number(levels)}
      speed={Number(speed)}
      scale={Number(scale)}
      peak={Number(peak)}
      interactive={interactive === true || interactive === "true"}
    />
  )
}
