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
    initial: {
      opacity: 0,
      transform: "translate(50px, 50px) scale(0.5) rotate(90deg)",
    },
    animate: {
      opacity: 1,
      transform: "translate(0px, 0px) scale(1) rotate(0deg)",
    },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  writing: {
    initial: { opacity: 0, transform: "translateY(10px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
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
            "Introducing Splitting Text",
            "Made with Motion, easy to customize.",
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
