"use client"

import {
  DisclosurePanel as CollapsibleContentPrimitive,
  Disclosure as CollapsiblePrimitive,
  Button as CollapsibleTriggerPrimitive,
  type ButtonProps,
  type DisclosurePanelProps,
  type DisclosureProps,
} from "@animate-ui/react/primitives/react-aria"

import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"

function Collapsible({ ...props }: DisclosureProps) {
  return <CollapsiblePrimitive data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: ButtonProps) {
  return (
    <CollapsibleTriggerPrimitive
      slot="trigger"
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({ ...props }: DisclosurePanelProps) {
  return (
    <CollapsibleContentPrimitive data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

const CHANGES = [
  "Drop-in primitives for Radix UI, Base UI and React Aria",
  "A CLI that animates your shadcn/ui components",
  "Shared motion tokens, tunable with one tempo",
  "Reduced motion support in every primitive",
]

export default function CollapsibleDemo() {
  return (
    <Collapsible className="flex w-full max-w-sm flex-col">
      <div className="flex items-center justify-between gap-4 pb-2 pl-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Animate UI 2.0</span>
          <span className="text-muted-foreground text-xs">
            {CHANGES.length} changes
          </span>
        </div>
        <CollapsibleTrigger
          aria-label="Show all changes"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon} strokeWidth={2}
            className="transition-transform duration-400 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-aria-expanded/button:rotate-180"
          />
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-3 py-2 text-sm">{CHANGES[0]}</div>
      <CollapsibleContent className="flex flex-col">
        {CHANGES.slice(1).map((change) => (
          <div key={change} className="mt-2 rounded-lg border px-3 py-2 text-sm">
            {change}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
