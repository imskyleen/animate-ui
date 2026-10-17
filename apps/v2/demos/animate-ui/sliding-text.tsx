"use client"

import {
  SlidingText,
  type SlidingTextDirection,
  type SlidingTextTrigger,
} from "@animate-ui/react/primitives/texts/sliding"

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
    <SlidingText
      key={`${direction}-${trigger}`}
      direction={direction}
      trigger={trigger}
      className="cursor-pointer text-4xl font-semibold"
      text="Sliding Text"
    />
  )
}
