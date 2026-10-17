"use client"

import { StringsBackground } from "@/registry/backgrounds/strings"

export default function StringsBackgroundDemo() {
  return (
    <StringsBackground className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#fafafa_0%,#f0f0f0_100%)] text-neutral-600 dark:bg-[radial-gradient(ellipse_at_center,#171717_0%,#000_100%)] dark:text-neutral-300" />
  )
}
