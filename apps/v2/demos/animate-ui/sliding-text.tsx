"use client"

import {
  SlidingText,
  type SlidingTextDirection,
  type SlidingTextTrigger,
} from "@animate-ui/react/primitives/texts/sliding"
import { Button } from "@/components/ui/button"

export const controls = {
  SlidingText: {
    direction: {
      value: "down",
      options: { down: "down", up: "up" },
    },
    trigger: {
      value: "hover",
      options: { hover: "hover", click: "click" },
    },
  },
}

export default function SlidingTextDemo({
  direction = "down",
  trigger = "hover",
}: {
  direction?: SlidingTextDirection
  trigger?: SlidingTextTrigger
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <SlidingText
        key={`${direction}-${trigger}`}
        direction={direction}
        trigger={trigger}
        className="cursor-pointer text-4xl font-semibold"
        text="Sliding Text"
      />
      <Button asChild size="lg">
        <a href="#" onClick={(event) => event.preventDefault()}>
          <SlidingText
            key={`link-${direction}-${trigger}`}
            direction={direction}
            trigger={trigger}
            text="Get started"
          />
        </a>
      </Button>
    </div>
  )
}
