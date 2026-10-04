"use client"

import { cn } from "cn"
import {
  ScrollProgress,
  ScrollProgressContainer,
  ScrollProgressProvider,
} from "@animate-ui/react/primitives/scroll-progress"

export const controls = {
  ScrollProgressProvider: {
    global: { value: false },
    direction: {
      value: "vertical",
      options: { horizontal: "horizontal", vertical: "vertical" },
    },
  },
}

export default function ScrollProgressDemo({
  global = false,
  direction = "vertical",
}: {
  /** Follow the page's scroll instead of the panel's. */
  global?: boolean
  direction?: "horizontal" | "vertical"
}) {
  const horizontal = direction === "horizontal"

  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl border">
      <ScrollProgressProvider
        key={`${global}-${direction}`}
        global={global}
        direction={direction}
      >
        <div
          className={cn(
            global ? "z-50" : "z-10",
            global ? "fixed inset-x-0 top-0" : "absolute inset-x-3 top-3"
          )}
        >
          <ScrollProgress
            className={cn("h-1.5 bg-foreground", !global && "rounded-full")}
          />
        </div>
        <ScrollProgressContainer
          className={cn(
            "h-full px-4 pt-8 pb-4",
            horizontal ? "overflow-x-auto" : "overflow-y-auto"
          )}
        >
          <div className={cn("flex gap-3", !horizontal && "flex-col")}>
            <p
              className={cn(
                "text-sm text-muted-foreground",
                horizontal && "w-40 shrink-0"
              )}
            >
              {global
                ? "Scroll the page: the bar follows its progress."
                : "Scroll this panel: the bar follows its progress."}
            </p>
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "shrink-0 rounded-lg bg-accent",
                  horizontal ? "h-56 w-40" : "h-28"
                )}
              />
            ))}
          </div>
        </ScrollProgressContainer>
      </ScrollProgressProvider>
    </div>
  )
}
