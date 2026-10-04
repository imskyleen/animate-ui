"use client"

import { ScrollFade } from "@animate-ui/react/primitives/effects/scroll-fade"

const RELEASES = [
  { version: "2.4.0", date: "Oct 2", title: "Scroll fade", tag: "New" },
  { version: "2.3.2", date: "Sep 28", title: "Tabs keyboard navigation" },
  { version: "2.3.1", date: "Sep 21", title: "Highlight follows scrolling" },
  { version: "2.3.0", date: "Sep 14", title: "Base UI drawer", tag: "New" },
  { version: "2.2.4", date: "Sep 7", title: "Faster tooltip warm-up" },
  { version: "2.2.3", date: "Aug 31", title: "Reduced motion everywhere" },
  { version: "2.2.2", date: "Aug 24", title: "React Aria select" },
  { version: "2.2.1", date: "Aug 17", title: "Tempo provider" },
  { version: "2.2.0", date: "Aug 10", title: "Accordion", tag: "New" },
  { version: "2.1.0", date: "Aug 3", title: "Motion 14" },
]

export default function ScrollFadeDemo() {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">Changelog</h3>
        <span className="text-xs text-muted-foreground">
          {RELEASES.length} releases
        </span>
      </div>
      <ScrollFade size={48} className="h-64">
        <ul className="flex flex-col p-2">
          {RELEASES.map((release) => (
            <li
              key={release.version}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5"
            >
              <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                {release.version}
              </span>
              <span className="flex-1 truncate text-sm">{release.title}</span>
              {release.tag ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {release.tag}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {release.date}
                </span>
              )}
            </li>
          ))}
        </ul>
      </ScrollFade>
    </div>
  )
}
