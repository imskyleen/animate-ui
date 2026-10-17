"use client"

import {
  SwappingText,
  type SwappingTextDirection,
} from "@animate-ui/react/primitives/texts/swapping"

const WORDS = ["Design", "Develop", "Deploy"]

export const controls = {
  SwappingText: {
    direction: {
      value: "up",
      options: { up: "up", down: "down" },
    },
    stagger: { value: 0.07, min: 0, max: 0.15, step: 0.01 },
    duration: { value: 2000, min: 500, max: 5000, step: 100 },
  },
}

export default function SwappingTextDemo({
  direction = "up",
  stagger = 0.07,
  duration = 2000,
}: {
  direction?: SwappingTextDirection
  stagger?: number
  duration?: number
}) {
  return (
    <span className="inline-grid justify-items-start text-4xl font-semibold">
      {WORDS.map((word) => (
        <span
          key={word}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1"
        >
          {word}
        </span>
      ))}
      <span className="col-start-1 row-start-1 w-0 whitespace-nowrap">
        <SwappingText
          text={WORDS}
          direction={direction}
          stagger={Number(stagger)}
          duration={Number(duration)}
        />
      </span>
    </span>
  )
}
