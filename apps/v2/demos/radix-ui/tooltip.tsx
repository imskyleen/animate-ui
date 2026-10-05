"use client"

import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "@animate-ui/react/primitives/radix-ui"
import { Button } from "@/components/ui/button"
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) bg-foreground text-background",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] z-50 translate-y-[calc(-50%_-_2px)] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }

const TOOLS = [
  { label: "Bold", shortcut: "⌘B", icon: TextBoldIcon },
  { label: "Italic", shortcut: "⌘I", icon: TextItalicIcon },
  { label: "Underline", shortcut: "⌘U", icon: TextUnderlineIcon },
]

export const controls = {
  Tooltip: {
    followCursor: {
      value: false,
      options: { false: false, true: true, x: "x", y: "y" },
    },
  },
  TooltipContent: {
    side: {
      value: "top",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 0 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0 },
  },
}

export default function TooltipDemo({
  followCursor = false,
  side = "top",
  sideOffset = 0,
  align = "center",
  alignOffset = 0,
}: {
  followCursor?: boolean | "x" | "y"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-xl border p-1">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.label} followCursor={followCursor}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={tool.label}>
                <HugeiconsIcon icon={tool.icon} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side={side}
              sideOffset={sideOffset}
              align={align}
              alignOffset={alignOffset}
            >
              {tool.label}
              <span className="opacity-60">{tool.shortcut}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
