"use client"

import * as React from "react"
import {
  PinnedList,
  PinnedListItem,
  PinnedListItems,
  PinnedListLabel,
  PinnedListPinned,
  PinnedListTrigger,
  PinnedListUnpinned,
} from "@animate-ui/react/primitives/pinned-list"
import { PinIcon, PinOffIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const ITEMS = [
  { id: "inbox", name: "Inbox", pinned: false },
  { id: "drafts", name: "Drafts", pinned: true },
  { id: "projects", name: "Projects", pinned: true },
  { id: "archive", name: "Archive", pinned: false },
]

type Item = (typeof ITEMS)[number]

function Row({ item }: { item: Item }) {
  return (
    <PinnedListItem
      id={item.id}
      customTrigger
      className="flex h-12 items-center justify-between rounded-xl bg-accent px-4 text-sm select-none"
    >
      {item.name}
      <PinnedListTrigger
        aria-label={item.pinned ? `Unpin ${item.name}` : `Pin ${item.name}`}
        className="-mr-2 flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground"
      >
        <HugeiconsIcon icon={item.pinned ? PinOffIcon : PinIcon} strokeWidth={2} size={16} />
      </PinnedListTrigger>
    </PinnedListItem>
  )
}

export default function PinnedListDemo() {
  const [items, setItems] = React.useState(ITEMS)

  const pinned = items.filter((item) => item.pinned)
  const unpinned = items.filter((item) => !item.pinned)

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    )

  return (
    <PinnedList
      onPinnedChange={toggle}
      className="flex w-60 flex-col gap-6"
    >
      <PinnedListPinned>
        <PinnedListLabel
          hide={pinned.length === 0}
          className="mb-2 text-xs font-medium text-muted-foreground"
        >
          Pinned
        </PinnedListLabel>
        <PinnedListItems className="flex flex-col gap-2">
          {pinned.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </PinnedListItems>
      </PinnedListPinned>
      <PinnedListUnpinned>
        <PinnedListLabel
          hide={unpinned.length === 0}
          className="mb-2 text-xs font-medium text-muted-foreground"
        >
          All
        </PinnedListLabel>
        <PinnedListItems className="flex flex-col gap-2">
          {unpinned.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </PinnedListItems>
      </PinnedListUnpinned>
    </PinnedList>
  )
}
