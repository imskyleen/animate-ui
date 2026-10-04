"use client"

import * as React from "react"
import {
  SplittingText,
  type SplittingTextProps,
} from "@animate-ui/react/primitives/texts/splitting"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

const ANIMATIONS = {
  default: {},
  vibe: {
    initial: { y: 50, scale: 0.5, opacity: 0, x: 50, rotate: 90 },
    animate: { y: 0, scale: 1, opacity: 1, x: 0, rotate: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  writing: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: "spring", bounce: 0, duration: 2 },
  },
} satisfies Record<
  string,
  Pick<SplittingTextProps, "initial" | "animate" | "transition">
>

export const controls = {
  SplittingText: {
    type: {
      value: "chars",
      options: { chars: "chars", words: "words", lines: "lines" },
    },
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    animation: {
      value: "default",
      options: { default: "default", vibe: "vibe", writing: "writing" },
    },
  },
}

export default function SplittingTextDemo({
  type = "chars",
  delay = 0,
  animation = "default",
}: {
  type?: "chars" | "words" | "lines"
  delay?: number
  animation?: keyof typeof ANIMATIONS
}) {
  const [run, setRun] = React.useState(0)
  const props = { delay, ...ANIMATIONS[animation] }

  return (
    <div className="flex flex-col items-center gap-6">
      {type === "lines" ? (
        <SplittingText
          key={`${run}-${type}-${delay}-${animation}`}
          className="text-xl font-semibold"
          type="lines"
          text={[
            "Introducing Splitting Text component",
            "Made with Motion. Highly customizable and easy to use.",
          ]}
          {...props}
        />
      ) : (
        <SplittingText
          key={`${run}-${type}-${delay}-${animation}`}
          className="text-4xl font-semibold"
          type={type}
          text="Splitting Text"
          {...props}
        />
      )}
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
