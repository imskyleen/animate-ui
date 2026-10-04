"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Click,
  type ClickVariant,
} from "@animate-ui/react/primitives/effects/click"

const VARIANTS: ClickVariant[] = [
  "ring",
  "ripple",
  "crosshair",
  "burst",
  "particles",
]

export const controls = {
  Click: {
    global: { value: false },
    duration: { value: 400, min: 0, max: 3000, step: 100 },
    size: { value: 100, min: 0, max: 300, step: 10 },
  },
}

export default function ClickDemo({
  global = false,
  duration = 400,
  size = 100,
}: {
  /** Listen to clicks on the whole page, not only this area. */
  global?: boolean
  duration?: number
  size?: number
}) {
  const scopeRef = React.useRef<HTMLDivElement>(null)
  const [variant, setVariant] = React.useState<ClickVariant>("ring")
  const scope = global ? undefined : scopeRef

  const area = (
    <p className="text-lg font-medium text-muted-foreground select-none">
      Click anywhere in this area
    </p>
  )

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div
        ref={scopeRef}
        className="flex h-56 items-center justify-center rounded-xl border border-dashed text-foreground"
      >
        {variant === "ripple" ? (
          <Click
            variant="ripple"
            scope={scope}
            color="var(--color-primary)"
            size={size}
            duration={duration}
          >
            {area}
          </Click>
        ) : (
          <Click
            variant={variant}
            scope={scope}
            color="currentColor"
            size={size}
            duration={duration}
          >
            {area}
          </Click>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label="Variant"
        className="flex flex-wrap justify-center gap-1"
      >
        {VARIANTS.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={variant === item}
            onClick={() => setVariant(item)}
            className={cn(
              "h-7 rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
              variant === item
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
