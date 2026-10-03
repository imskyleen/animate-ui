"use client"

import {
  Spring,
  SpringElement,
  SpringProvider,
} from "@animate-ui/react/primitives/spring"

export default function SpringDemo() {
  return (
    <SpringProvider>
      <Spring className="z-10 text-muted-foreground" />
      <SpringElement className="relative z-20">
        <div
          aria-label="Drag me"
          className="flex size-14 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-md select-none"
        >
          Drag
        </div>
      </SpringElement>
    </SpringProvider>
  )
}
