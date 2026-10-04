"use client"

import { Shine } from "@animate-ui/react/primitives/effects/shine"

import { Button } from "@/components/ui/button"

export const controls = {
  Shine: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    duration: { value: 1200, min: 0, max: 3000, step: 100 },
    loop: { value: true },
    loopDelay: { value: 1500, min: 0, max: 3000, step: 100 },
    deg: { value: -15, min: -50, max: 50, step: 5 },
    enable: { value: true },
    enableOnHover: { value: false },
    enableOnTap: { value: false },
  },
}

export default function ShineDemo({
  delay = 0,
  duration = 1200,
  loop = true,
  loopDelay = 1500,
  deg = -15,
  enable = true,
  enableOnHover = false,
  enableOnTap = false,
}: {
  delay?: number
  duration?: number
  loop?: boolean
  loopDelay?: number
  deg?: number
  enable?: boolean
  enableOnHover?: boolean
  enableOnTap?: boolean
}) {
  return (
    <Shine
      asChild
      color="white"
      opacity={0.4}
      delay={delay}
      duration={duration}
      loop={loop}
      loopDelay={loopDelay}
      deg={deg}
      enable={enable}
      enableOnHover={enableOnHover}
      enableOnTap={enableOnTap}
    >
      <Button size="lg">Get started</Button>
    </Shine>
  )
}
