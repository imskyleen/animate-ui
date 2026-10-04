"use client"

import {
  Link01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type TooltipProps,
} from "@animate-ui/react/primitives/tooltip"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"

const TOOLS = [
  { label: "Bold", shortcut: "⌘B", icon: TextBoldIcon },
  { label: "Italic", shortcut: "⌘I", icon: TextItalicIcon },
  { label: "Underline", shortcut: "⌘U", icon: TextUnderlineIcon },
  { label: "Strikethrough", shortcut: "⌘⇧X", icon: TextStrikethroughIcon },
  { label: "Insert link", shortcut: "⌘K", icon: Link01Icon },
]

export const controls = {
  TooltipProvider: {
    openDelay: { value: 300 },
    closeDelay: { value: 300 },
  },
  Tooltip: {
    side: {
      value: "top",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 6 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0 },
  },
  TooltipArrow: {
    withTransition: { value: true },
  },
}

export default function TooltipDemo({
  openDelay = 300,
  closeDelay = 300,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  withTransition = true,
}: {
  openDelay?: number
  closeDelay?: number
  side?: TooltipProps["side"]
  sideOffset?: number
  align?: TooltipProps["align"]
  alignOffset?: number
  withTransition?: boolean
}) {
  return (
    <TooltipProvider openDelay={openDelay} closeDelay={closeDelay}>
      <div className="flex items-center gap-1 rounded-xl border p-1">
        {TOOLS.map((tool) => (
          <Tooltip
            key={tool.label}
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={tool.label}>
                <HugeiconsIcon icon={tool.icon} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
              <TooltipArrow
                className="size-2.5 fill-foreground"
                withTransition={withTransition}
              />
              {/* Keeps the text from stretching while the popup resizes. */}
              <motion.p
                layout="preserve-aspect"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {tool.label}
                <span className="opacity-60">{tool.shortcut}</span>
              </motion.p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
