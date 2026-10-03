"use client"

import { Shine } from "@animate-ui/react/primitives/effects/shine"

import { Button } from "@/components/ui/button"

export default function ShineDemo() {
  return (
    <Shine asChild loop loopDelay={1500} color="white" opacity={0.4}>
      <Button size="lg">Get started</Button>
    </Shine>
  )
}
