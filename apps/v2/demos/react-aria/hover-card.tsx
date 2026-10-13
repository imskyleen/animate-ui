"use client"

import { cn } from "cn"
import {
  Popover as PopoverPrimitive,
  PreviewTrigger as PreviewTriggerPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PreviewTriggerProps,
} from "@animate-ui/react/primitives/react-aria"
import { Button } from "@/components/ui/react-aria/button"

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
    <HoverCardTrigger delay={10} closeDelay={100}>
      <Button variant="link">Hover Here</Button>
      <HoverCard
        className="flex w-64 flex-col gap-0.5"
        placement={toPlacement(side, align)}
        offset={sideOffset}
        crossOffset={alignOffset}
      >
        <div className="font-semibold">@nextjs</div>
        <div>The React Framework – created and maintained by @vercel.</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Joined December 2021
        </div>
      </HoverCard>
    </HoverCardTrigger>
  )
}
