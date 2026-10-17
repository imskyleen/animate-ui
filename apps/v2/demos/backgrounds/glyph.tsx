"use client"

import { GlyphBackground } from "@/registry/backgrounds/glyph"

const COLORS = {
  text: "",
  white: "#ffffff",
  blue: "#3b9eff",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
}

export const controls = {
  GlyphBackground: {
    glowColor: { value: "", options: COLORS },
    shapeColor: { value: "", options: COLORS },
    fontSize: { value: 10, min: 6, max: 16, step: 1 },
    interactive: { value: true },
  },
}

export default function GlyphBackgroundDemo({
  glowColor = "",
  shapeColor = "",
  fontSize = 10,
  interactive = true,
}: {
  glowColor?: string
  shapeColor?: string
  fontSize?: number
  interactive?: boolean | string
}) {
  return (
    <GlyphBackground
      className="absolute inset-0 bg-white text-neutral-900 dark:bg-[#121212] dark:text-white"
      glowColor={glowColor || undefined}
      shapeColor={shapeColor || undefined}
      fontSize={Number(fontSize)}
      interactive={interactive === true || interactive === "true"}
    />
  )
}
