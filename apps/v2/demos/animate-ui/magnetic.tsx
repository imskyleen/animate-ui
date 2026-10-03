"use client"

import { Magnetic } from "@animate-ui/react/primitives/effects/magnetic"

import { Button } from "@/components/ui/button"

export default function MagneticDemo() {
  return (
    <Magnetic strength={0.4} range={160}>
      <Button size="lg">Come closer</Button>
    </Magnetic>
  )
}
