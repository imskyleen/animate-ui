"use client"

import {
  TypingText,
  TypingTextCursor,
} from "@animate-ui/react/primitives/texts/typing"

export const controls = {
  TypingText: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    holdDelay: { value: 1000, min: 0, max: 3000, step: 100 },
    loop: { value: true },
    cursor: { value: true },
  },
}

export default function TypingTextDemo({
  delay = 0,
  holdDelay = 1000,
  loop = true,
  cursor = true,
}: {
  delay?: number
  holdDelay?: number
  loop?: boolean
  cursor?: boolean
}) {
  return (
    <TypingText
      key={`${delay}-${holdDelay}-${loop}`}
      className="text-4xl font-semibold"
      text={["Typing Text", "Made with Motion", "Easy to customize"]}
      delay={delay}
      holdDelay={holdDelay}
      loop={loop}
    >
      {cursor && <TypingTextCursor className="ml-1 h-8! w-1! rounded-full" />}
    </TypingText>
  )
}
