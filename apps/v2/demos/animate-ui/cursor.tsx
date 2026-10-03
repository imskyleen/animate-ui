"use client"

import {
  Cursor,
  CursorContainer,
  CursorFollow,
  CursorProvider,
} from "@animate-ui/react/primitives/cursor"

export default function CursorDemo() {
  return (
    <div
      className="flex h-72 w-full max-w-md items-center justify-center rounded-xl bg-accent"
    >
      <p className="font-medium text-muted-foreground italic">
        Move your pointer over this area
      </p>
      <CursorProvider>
        <CursorContainer>
          <Cursor>
            <svg
              className="size-6 text-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 40"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
              />
            </svg>
          </Cursor>
          <CursorFollow side="bottom" sideOffset={15} align="end" alignOffset={5}>
            <div className="rounded-md bg-foreground px-2 py-1 text-sm text-background">
              Designer
            </div>
          </CursorFollow>
        </CursorContainer>
      </CursorProvider>
    </div>
  )
}
