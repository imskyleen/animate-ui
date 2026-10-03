"use client"

import { Highlight } from "@animate-ui/react/primitives/effects/highlight"

const TABS = [
  { value: "overview", title: "Overview" },
  { value: "activity", title: "Activity" },
  { value: "settings", title: "Settings" },
]

export default function HighlightDemo() {
  return (
    <div className="flex rounded-full border p-1">
      <Highlight
        defaultValue={TABS[0]?.value}
        className="inset-0 rounded-full bg-accent"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            data-value={tab.value}
            className="flex h-8 items-center justify-center rounded-full px-4 text-sm text-muted-foreground transition-colors data-[active=true]:font-medium data-[active=true]:text-foreground"
          >
            {tab.title}
          </button>
        ))}
      </Highlight>
    </div>
  )
}
