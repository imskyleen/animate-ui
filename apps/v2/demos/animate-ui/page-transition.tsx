"use client"

import * as React from "react"

import {
  PageTransition,
  PageTransitionShared,
  type PageTransitionEffect,
} from "@/registry/components/page-transition"

const PAGES = [
  {
    title: "Home",
    text: "Animated primitives for Radix UI, Base UI and React Aria.",
  },
  {
    title: "Docs",
    text: "Swap the import and your shadcn/ui components animate.",
  },
  {
    title: "Blog",
    text: "Animate UI 2.0 is out, with a CLI and a skill.",
  },
]

export const controls = {
  PageTransition: {
    effect: {
      value: "slide",
      options: {
        fade: "fade",
        slide: "slide",
        push: "push",
        zoom: "zoom",
        iris: "iris",
        wipe: "wipe",
        bands: "bands",
        stack: "stack",
        flow: "flow",
        chop: "chop",
      },
    },
  },
}

export default function PageTransitionDemo({
  effect = "slide",
}: {
  effect?: PageTransitionEffect
}) {
  const [page, setPage] = React.useState(0)

  const go = (next: number) => {
    if (next === page) return
    React.startTransition(() => {
      React.addTransitionType(next > page ? "nav-forward" : "nav-back")
      setPage(next)
    })
  }

  const current = PAGES[page]!

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-background">
      <nav className="flex gap-1 border-b p-2">
        {PAGES.map((item, index) => (
          <button
            key={item.title}
            onClick={() => go(index)}
            aria-current={index === page ? "page" : undefined}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
          >
            {item.title}
          </button>
        ))}
      </nav>
      <PageTransition
        effect={effect}
        pageKey={page}
        className="relative flex h-64 flex-col justify-end gap-1.5 bg-background p-6"
      >
        {page < 2 && (
          <PageTransitionShared
            name="page-transition-demo-cover"
            className={
              page === 0
                ? "absolute top-6 right-6 size-16 rounded-xl bg-primary"
                : "absolute inset-x-6 top-6 h-20 rounded-lg bg-primary"
            }
          />
        )}
        <h2 className="text-2xl font-medium">{current.title}</h2>
        <p className="text-sm text-muted-foreground">{current.text}</p>
      </PageTransition>
    </div>
  )
}
