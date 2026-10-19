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
    tone: "bg-sky-100 dark:bg-sky-950",
  },
  {
    title: "Docs",
    text: "Swap the import and your shadcn/ui components animate.",
    tone: "bg-amber-100 dark:bg-amber-950",
  },
  {
    title: "Blog",
    text: "Animate UI 2.0 is out, with a CLI and a skill.",
    tone: "bg-emerald-100 dark:bg-emerald-950",
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
    shared: { value: true },
    picker: { value: true },
  },
}

const EFFECTS = Object.keys(
  controls.PageTransition.effect.options,
) as PageTransitionEffect[]

export default function PageTransitionDemo({
  effect = "slide",
  shared = true,
  picker = true,
}: {
  effect?: PageTransitionEffect
  shared?: boolean
  picker?: boolean
}) {
  const [page, setPage] = React.useState(0)
  const [chosen, setChosen] = React.useState(effect)
  const [prop, setProp] = React.useState(effect)
  if (effect !== prop) {
    setProp(effect)
    setChosen(effect)
  }

  const go = (next: number) => {
    if (next === page) return
    React.startTransition(() => {
      React.addTransitionType(next > page ? "nav-forward" : "nav-back")
      setPage(next)
    })
  }

  const current = PAGES[page]!

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {picker && (
        <div
          role="radiogroup"
          aria-label="Effect"
          className="flex flex-wrap justify-center gap-1"
        >
          {EFFECTS.map((name) => (
            <button
              key={name}
              role="radio"
              aria-checked={chosen === name}
              onClick={() => setChosen(name)}
              className="rounded-md border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-checked:border-foreground aria-checked:bg-foreground aria-checked:text-background"
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="w-full overflow-hidden rounded-xl border bg-background">
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
        effect={chosen}
        pageKey={page}
        className={`relative flex h-64 flex-col justify-end gap-1.5 p-6 ${current.tone}`}
      >
        {shared && page < 2 && (
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
    </div>
  )
}
