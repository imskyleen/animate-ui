"use client"

import {
  ScrollProgress,
  ScrollProgressContainer,
  ScrollProgressProvider,
} from "@animate-ui/react/primitives/scroll-progress"

export default function ScrollProgressDemo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl border">
      <ScrollProgressProvider>
        <div className="absolute inset-x-3 top-3 z-10">
          <ScrollProgress className="h-1.5 rounded-full bg-foreground" />
        </div>
        <ScrollProgressContainer className="h-full overflow-y-auto px-4 pt-8 pb-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Scroll this panel: the bar follows its progress.
            </p>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-28 shrink-0 rounded-lg bg-accent" />
            ))}
          </div>
        </ScrollProgressContainer>
      </ScrollProgressProvider>
    </div>
  )
}
