"use client"

import { PreviewCard as PreviewCardPrimitive } from "@animate-ui/react/primitives/base-ui/preview-card"
import { cn } from "cn"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<
    PreviewCardPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "ring-foreground/10 bg-popover text-popover-foreground w-64 rounded-lg p-2.5 text-sm shadow-md ring-1 z-50 origin-(--transform-origin) outline-hidden",
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

export const controls = {
  HoverCardContent: {
    side: {
      value: "bottom",
      options: {
        top: "top",
        bottom: "bottom",
        left: "left",
        right: "right",
        "inline-start": "inline-start",
        "inline-end": "inline-end",
      },
    },
    sideOffset: { value: 4 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 4 },
  },
}

export default function PreviewCardDemo({
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
}: {
  side?: "top" | "right" | "bottom" | "left" | "inline-start" | "inline-end"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://github.com/imskyleen/animate-ui" className="text-sm font-medium underline underline-offset-4">
        @animate-ui
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
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
      </HoverCardContent>
    </HoverCard>
  )
}
