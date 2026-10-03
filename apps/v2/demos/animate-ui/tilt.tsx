"use client"

import Image from "next/image"
import { Tilt, TiltContent } from "@animate-ui/react/primitives/effects/tilt"

const COLORS = ["bg-neutral-800", "bg-red-950", "bg-blue-950"]

export default function TiltDemo() {
  return (
    <Tilt maxTilt={10} perspective={800} className="w-full max-w-60">
      <TiltContent className="flex flex-col gap-3 rounded-2xl border bg-card p-2 pb-5 shadow-sm">
        <Image
          src="/demos/mug.webp"
          alt="Black porcelain mug with a square handle and natural clay accents"
          width={240}
          height={240}
          className="aspect-square w-full rounded-xl bg-white object-cover"
          draggable={false}
        />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Dark Grey</p>
          <h3 className="font-medium">Matt Mug</h3>
          <p className="text-sm">$20</p>
        </div>
        <ul className="flex items-center justify-center gap-2">
          {COLORS.map((color) => (
            <li key={color} className={`size-4 rounded-full border ${color}`} />
          ))}
        </ul>
      </TiltContent>
    </Tilt>
  )
}
