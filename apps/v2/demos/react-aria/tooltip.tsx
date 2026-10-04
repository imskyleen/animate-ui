"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Focusable,
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@animate-ui/react/primitives/react-aria"
import { Button } from "@/components/ui/button"
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function TooltipTrigger({
  delay = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipTriggerPrimitive>) {
  const [trigger, tooltip] = React.Children.toArray(children)

  return (
    <TooltipTriggerPrimitive
      data-slot="tooltip-trigger"
      delay={delay}
      {...props}
    >
      <Focusable>
        {trigger as React.ComponentProps<typeof Focusable>["children"]}
      </Focusable>
      {tooltip}
    </TooltipTriggerPrimitive>
  )
}

function Tooltip({
  className,
  placement = "top",
  offset = 4,
  crossOffset = 0,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof TooltipPrimitive>,
  "children" | "className"
> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive
      data-slot="tooltip-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm z-50 w-fit max-w-xs origin-(--trigger-anchor-point) bg-foreground text-background",
        className
      )}
      {...props}
    >
      {children}
      <OverlayArrow
        className="size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] z-50 bg-foreground fill-foreground"
        style={({ placement, defaultStyle }) => ({
          ...defaultStyle,
          rotate: "0deg",
          translate: "0 0",
          transform:
            placement === "bottom"
              ? "translate(-50%, calc(50% + 2px)) rotate(45deg)"
              : placement === "top"
                ? "translate(-50%, calc(-50% - 2px)) rotate(45deg)"
                : placement === "left"
                  ? "translate(calc(-50% - 2px), -50%) rotate(45deg)"
                  : "translate(calc(50% + 2px), -50%) rotate(45deg)",
        })}
      />
    </TooltipPrimitive>
  )
}

export { Tooltip, TooltipTrigger }

const TOOLS = [
  { label: "Bold", shortcut: "⌘B", icon: TextBoldIcon },
  { label: "Italic", shortcut: "⌘I", icon: TextItalicIcon },
  { label: "Underline", shortcut: "⌘U", icon: TextUnderlineIcon },
]

export default function TooltipDemo() {
  return (
    <div className="flex items-center gap-1 rounded-xl border p-1">
      {TOOLS.map((tool) => (
        <TooltipTrigger key={tool.label}>
          <Button variant="ghost" size="icon" aria-label={tool.label}>
            <HugeiconsIcon icon={tool.icon} strokeWidth={2} />
          </Button>
          <Tooltip>
            {tool.label}
            <span className="opacity-60">{tool.shortcut}</span>
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  )
}
