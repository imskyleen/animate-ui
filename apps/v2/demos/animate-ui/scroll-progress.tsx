"use client"

import { cn } from "cn"
import { ArrowDown02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
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
            "z-50",
            global ? "fixed inset-x-0 top-0" : "absolute inset-x-3 bottom-3"
          )}
        >
          <ScrollProgress
            className={cn("h-1.5 bg-foreground", !global && "rounded-full")}
          />
        </div>
        {global ? (
          <div className="flex size-full items-center justify-center">
            <p className="text-sm font-medium">
              Scroll the page to see the progress bar
            </p>
          </div>
        ) : (
          <ScrollProgressContainer
            className={cn(
              "size-full",
              horizontal ? "overflow-x-auto" : "overflow-y-auto"
            )}
          >
            <div className={cn("flex", !horizontal && "flex-col")}>
              <div className="flex h-72 w-full shrink-0 items-center justify-center">
                <p className="flex items-center gap-2 text-sm font-medium">
                  Scroll to see the progress bar
                  <motion.span
                    className={horizontal ? "-rotate-90" : undefined}
                    animate={{ y: [3, -3, 3] }}
                    transition={{
                      duration: 1.25,
                      repeat: Infinity,
                      ease: "easeInOut",
                      type: "keyframes",
                    }}
                  >
                    <HugeiconsIcon
                      icon={ArrowDown02Icon}
                      strokeWidth={2}
                      className="size-5"
                    />
                  </motion.span>
                </p>
              </div>
              <div className="h-72 w-full shrink-0 p-3">
                <div className="size-full rounded-xl bg-accent" />
              </div>
              <div className="h-72 w-full shrink-0" />
              <div className="h-72 w-full shrink-0 p-3">
                <div className="size-full rounded-xl bg-accent" />
              </div>
              <div className="h-72 w-full shrink-0" />
            </div>
          </ScrollProgressContainer>
        )}
      </ScrollProgressProvider>
    </div>
  )
}
