"use client"

import * as React from "react"
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height"

import { Button } from "@/components/ui/button"

const SHORT =
  "Animate UI is a set of animated primitives for React, built with Motion."
const LONG = [
  "Animate UI is a set of animated primitives for React, built with Motion.",
  "Swap the import of your Radix UI, Base UI or React Aria primitives and your components animate, with exactly the same API.",
  "Its own primitives, like this one, cover the effects those libraries don't have.",
]

export default function AutoHeightDemo() {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <AutoHeight
        deps={[expanded]}
        className="w-full rounded-xl border bg-card p-4 text-sm"
      >
        {expanded ? (
          <div className="flex flex-col gap-2">
            {LONG.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p>{SHORT}</p>
        )}
      </AutoHeight>
      <Button
        variant="outline"
        size="sm"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Show less" : "Show more"}
      </Button>
    </div>
  )
}
