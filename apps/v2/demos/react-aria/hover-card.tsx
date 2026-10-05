"use client"

import { cn } from "cn"
import {
  Popover as PopoverPrimitive,
  PreviewTrigger as PreviewTriggerPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PreviewTriggerProps,
} from "@animate-ui/react/primitives/react-aria"
import { Link } from "@animate-ui/react/primitives/react-aria"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function HoverCardTrigger({ children, ...props }: PreviewTriggerProps) {
  return (
    <PreviewTriggerPrimitive data-slot="hover-card-trigger" {...props}>
      {children}
    </PreviewTriggerPrimitive>
  )
}

function HoverCard({
  className,
  placement = "bottom",
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<PopoverPrimitiveProps, "className"> & {
  className?: string
}) {
  return (
    <PopoverPrimitive
      data-slot="hover-card-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        "ring-foreground/10 bg-popover text-popover-foreground w-64 rounded-lg p-2.5 text-sm shadow-md ring-1 z-50 origin-(--trigger-anchor-point) outline-hidden",
        className
      )}
      {...props}
    />
  )
}

export { HoverCard, HoverCardTrigger }

export const controls = {
  HoverCard: {
    side: {
      value: "bottom",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 4 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0 },
  },
}

/** Radix UI and Base UI's `side` and `align`, as React Aria's `placement`. */
function toPlacement(
  side: "top" | "right" | "bottom" | "left",
  align: "start" | "center" | "end"
) {
  if (align === "center") return side
  if (side === "top" || side === "bottom") return `${side} ${align}` as const
  return `${side} ${align === "start" ? "top" : "bottom"}` as const
}

export default function HoverCardDemo({
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
}: {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <HoverCardTrigger>
      <Link href="https://github.com/imskyleen/animate-ui" className="text-sm font-medium underline underline-offset-4">
        @animate-ui
      </Link>
      <HoverCard className="w-80" placement={toPlacement(side, align)} offset={sideOffset} crossOffset={alignOffset}>
        <div className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            AU
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Animate UI</p>
            <p className="text-muted-foreground">
              Animated drop-in primitives for Radix UI, Base UI and React Aria.
            </p>
            <p className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5" />
              Open source since 2024
            </p>
          </div>
        </div>
      </HoverCard>
    </HoverCardTrigger>
  )
}
