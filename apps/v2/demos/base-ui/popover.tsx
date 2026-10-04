"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@animate-ui/react/primitives/base-ui/popover"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Link01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 flex flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 z-50 w-72 origin-(--transform-origin) outline-hidden",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}

export const controls = {
  PopoverContent: {
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
    alignOffset: { value: 0 },
  },
}

export default function PopoverDemo({
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
}: {
  side?: "top" | "right" | "bottom" | "left" | "inline-start" | "inline-end"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Share</PopoverTrigger>
      <PopoverContent
        className="w-80"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <PopoverHeader>
          <PopoverTitle>Share this document</PopoverTitle>
          <PopoverDescription>
            Anyone with the link can view the Q3 roadmap.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex items-center gap-2">
          <div className="bg-muted text-muted-foreground flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 text-sm">
            <HugeiconsIcon icon={Link01Icon} strokeWidth={2} className="size-4 shrink-0" />
            <span className="truncate">animate-ui.com/d/q3-roadmap</span>
          </div>
          <Button size="sm">Copy link</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
