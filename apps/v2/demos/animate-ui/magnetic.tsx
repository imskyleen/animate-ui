"use client"

import { Magnetic } from "@animate-ui/react/primitives/effects/magnetic"

import { Button } from "@/components/ui/button"

export const controls = {
  Magnetic: {
    onlyOnHover: { value: false },
    strength: { value: 0.5, min: 0, max: 1, step: 0.05 },
    range: { value: 120 },
  },
}

export default function MagneticDemo({
  onlyOnHover = false,
  strength = 0.5,
  range = 120,
}: {
  onlyOnHover?: boolean
  strength?: number
  range?: number
}) {
  return (
    <Magnetic strength={strength} range={range} onlyOnHover={onlyOnHover}>
      <Button size="lg">Come closer</Button>
    </Magnetic>
  )
}
