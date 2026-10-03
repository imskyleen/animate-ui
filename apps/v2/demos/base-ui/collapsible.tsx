"use client"

import { Collapsible as CollapsiblePrimitive } from "@animate-ui/react/primitives/base-ui/collapsible"

import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
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
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Show all changes" />
          }
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="transition-transform duration-600 ease-out-strong group-aria-expanded/button:rotate-180"
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
