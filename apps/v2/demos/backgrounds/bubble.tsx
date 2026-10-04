"use client"

import { BubbleBackground } from "@/registry/backgrounds/bubble"

export const controls = {
  BubbleBackground: {
    interactive: { value: true },
  },
}

export default function BubbleBackgroundDemo({
  interactive = true,
}: {
  interactive?: boolean
}) {
  return (
    <BubbleBackground interactive={interactive} className="absolute inset-0" />
  )
}
