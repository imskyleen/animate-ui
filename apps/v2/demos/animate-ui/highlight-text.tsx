"use client"

import * as React from "react"
import { HighlightText } from "@animate-ui/react/primitives/texts/highlight"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export default function HighlightTextDemo() {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <HighlightText
        key={run}
        className="rounded-md bg-linear-to-r from-blue-100 to-purple-100 px-1 text-4xl font-semibold dark:from-blue-500 dark:to-purple-500"
        text="Highlight Text"
      />
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
        Replay
      </Button>
    </div>
  )
}
