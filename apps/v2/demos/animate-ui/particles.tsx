"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
} from "@animate-ui/react/primitives/effects/particles"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

export const controls = {
  ParticlesEffect: {
    side: {
      value: "top",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 0, min: 0, max: 50, step: 1 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0, min: -50, max: 50, step: 1 },
    count: { value: 6, min: 1, max: 30, step: 1 },
    radius: { value: 30, min: 10, max: 100, step: 1 },
    spread: { value: 360, min: 0, max: 1000, step: 1 },
    duration: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
    holdDelay: { value: 0.05, min: 0, max: 0.2, step: 0.01 },
    delay: { value: 0, min: 0, max: 3, step: 0.1 },
  },
}

type ParticlesDemoProps = Pick<
  ParticlesEffectProps,
  | "side"
  | "sideOffset"
  | "align"
  | "alignOffset"
  | "count"
  | "radius"
  | "spread"
  | "duration"
  | "holdDelay"
  | "delay"
>

/** Strong ease-out: the resize and the label swap answer the click at once. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * The button's label: the old word slides up and out into a light blur as
 * the new one comes in from below, while the label's width glides to the new
 * word's, so the button resizes instead of jumping.
 */
function Label({ children }: { children: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const [width, setWidth] = React.useState<number | "auto">("auto")

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry!.borderBoxSize[0]!.inlineSize)
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.span
      aria-hidden="true"
      className="relative inline-flex"
      initial={false}
      animate={{ width }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT }}
    >
      <span ref={ref} className="inline-flex">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={children}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(2px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -8, filter: "blur(2px)" }
            }
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

export default function ParticlesDemo(props: ParticlesDemoProps) {
  const [liked, setLiked] = React.useState(false)
  // Each like replays the burst.
  const [burst, setBurst] = React.useState(0)
  const reduce = useReducedMotion()

  return (
    <Particles animate={liked}>
      <Button
        variant="outline"
        aria-pressed={liked}
        aria-label={liked ? "Liked" : "Like"}
        onClick={() => {
          setLiked((value) => !value)
          setBurst((value) => value + 1)
        }}
      >
        {/* The heart pops as it fills, and gives a little as it empties. */}
        <motion.span
          className="inline-flex"
          initial={false}
          animate={{
            scale: reduce ? 1 : liked ? [1, 1.3, 1] : [1, 0.85, 1],
          }}
          transition={{
            duration: 0.4,
            times: [0, 0.4, 1],
            ease: ["easeOut", [0.34, 1.56, 0.64, 1]],
          }}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            strokeWidth={2}
            className={cn(
              "fill-transparent transition-[fill,color] duration-200 ease-out",
              liked && "fill-red-500 text-red-500"
            )}
          />
        </motion.span>
        <Label>{liked ? "Liked" : "Like"}</Label>
      </Button>
      <ParticlesEffect
        key={burst}
        {...props}
        className="size-1 rounded-full bg-red-500"
      />
    </Particles>
  )
}
