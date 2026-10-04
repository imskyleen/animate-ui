"use client"

import * as React from "react"
import {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
} from "@animate-ui/react/primitives/effects/particles"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const controls = {
  ParticlesEffect: {
    side: {
      value: "top",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 0, min: 0, max: 50, step: 1 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0, min: -50, max: 50, step: 1 },
    count: { value: 6, min: 1, max: 30, step: 1 },
    radius: { value: 30, min: 10, max: 100, step: 1 },
    spread: { value: 360, min: 0, max: 1000, step: 1 },
    duration: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
    holdDelay: { value: 0.05, min: 0, max: 0.2, step: 0.01 },
    delay: { value: 0, min: 0, max: 3, step: 0.1 },
  },
}

type ParticlesDemoProps = Pick<
  ParticlesEffectProps,
  | "side"
  | "sideOffset"
  | "align"
  | "alignOffset"
  | "count"
  | "radius"
  | "spread"
  | "duration"
  | "holdDelay"
  | "delay"
>

export default function ParticlesDemo(props: ParticlesDemoProps) {
  const [liked, setLiked] = React.useState(false)
  // Each like replays the burst.
  const [burst, setBurst] = React.useState(0)

  return (
    <Particles key={burst} animate={liked}>
      <Button
        variant="outline"
        aria-pressed={liked}
        onClick={() => {
          setLiked((value) => !value)
          setBurst((value) => value + 1)
        }}
      >
        <HugeiconsIcon
          icon={FavouriteIcon} strokeWidth={2}
          className={liked ? "fill-red-500 text-red-500" : undefined}
        />
        {liked ? "Liked" : "Like"}
      </Button>
      <ParticlesEffect {...props} className="size-1 rounded-full bg-red-500" />
    </Particles>
  )
}
