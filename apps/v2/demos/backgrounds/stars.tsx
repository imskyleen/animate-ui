"use client"

import { useTheme } from "next-themes"

import { StarsBackground } from "@/registry/backgrounds/stars"

export default function StarsBackgroundDemo() {
  const { resolvedTheme } = useTheme()

  return (
    <StarsBackground
      starColor={resolvedTheme === "dark" ? "#fff" : "#000"}
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#f5f5f5_0%,#fff_100%)] dark:bg-[radial-gradient(ellipse_at_bottom,#262626_0%,#000_100%)]"
    />
  )
}
