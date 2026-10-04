"use client"

import { Highlight } from "@animate-ui/react/primitives/effects/highlight"

const TABS = [
  { value: "overview", title: "Overview" },
  { value: "activity", title: "Activity" },
  { value: "settings", title: "Settings" },
]

export const controls = {
  Highlight: {
    mode: {
      value: "children",
      options: { children: "children", parent: "parent" },
    },
    exitDelay: { value: 200, min: 0, max: 3000, step: 100 },
    hover: { value: false },
  },
}

export default function HighlightDemo({
  mode = "children",
  exitDelay = 200,
  hover = false,
}: {
  mode?: "children" | "parent"
  exitDelay?: number
  hover?: boolean
}) {
  const items = TABS.map((tab) => (
    <button
      key={tab.value}
      type="button"
      data-value={tab.value}
      className="flex h-8 items-center justify-center rounded-full px-4 text-sm text-muted-foreground transition-colors data-[active=true]:font-medium data-[active=true]:text-foreground"
    >
      {tab.title}
    </button>
  ))
  const props = {
    exitDelay,
    hover,
    defaultValue: TABS[0]?.value,
    className: "inset-0 rounded-full bg-accent",
  }

  return (
    <div className="flex rounded-full border p-1">
      {mode === "parent" ? (
        <Highlight mode="parent" containerClassName="flex" {...props}>
          {items}
        </Highlight>
      ) : (
        <Highlight {...props}>{items}</Highlight>
      )}
    </div>
  )
}
