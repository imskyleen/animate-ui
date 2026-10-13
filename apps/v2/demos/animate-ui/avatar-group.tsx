"use client"

import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from "@animate-ui/react/primitives/avatar-group"
import { cn } from "cn"
import { motion } from "motion/react"

const PEOPLE = [
  { name: "Skyleen", initials: "SK", className: "bg-rose-500" },
  { name: "Shadcn", initials: "CN", className: "bg-amber-500" },
  { name: "Adam Wathan", initials: "AW", className: "bg-emerald-500" },
  { name: "Guillermo Rauch", initials: "GR", className: "bg-sky-500" },
  { name: "Jhey", initials: "JH", className: "bg-violet-500" },
  { name: "David Haz", initials: "DH", className: "bg-fuchsia-500" },
]

export default function AvatarGroupDemo() {
  return (
    <AvatarGroup className="h-12 -space-x-3" invertOverlap>
      {PEOPLE.map((person) => (
        <div
          key={person.name}
          role="img"
          aria-label={person.name}
          tabIndex={0}
          className={cn(
            "flex size-12 items-center justify-center rounded-full border-3 border-background text-sm font-medium text-white outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
            person.className
          )}
        >
          {person.initials}
          <AvatarGroupTooltip className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
            <AvatarGroupTooltipArrow className="size-2.5 fill-foreground" />
            <motion.p layout="preserve-aspect" className="whitespace-nowrap">
              {person.name}
            </motion.p>
          </AvatarGroupTooltip>
        </div>
      ))}
    </AvatarGroup>
  )
}
