"use client"

import * as React from "react"
import {
  Particles,
  ParticlesEffect,
} from "@animate-ui/react/primitives/effects/particles"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export default function ParticlesDemo() {
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
          icon={FavouriteIcon}
          className={liked ? "fill-red-500 text-red-500" : undefined}
        />
        {liked ? "Liked" : "Like"}
      </Button>
      <ParticlesEffect
        className="size-1 rounded-full bg-red-500"
      />
    </Particles>
  )
}
