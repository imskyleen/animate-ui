"use client"

import { cn } from "cn"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CopyButton,
  CopyButtonIcon,
} from "@animate-ui/react/primitives/buttons/copy"
import { CodeBlock } from "@animate-ui/react/primitives/code-block"
import { useTheme } from "next-themes"

import { buttonVariants } from "@/components/ui/button"

const CODE = `'use client';

import * as React from 'react';

type MyComponentProps = {
  myProps: string;
} & React.ComponentProps<'div'>;

function MyComponent(props: MyComponentProps) {
  return (
    <div {...props}>
      <p>My Component</p>
    </div>
  );
}

export { MyComponent, type MyComponentProps };`

export const controls = {
  CodeBlock: {
    delay: { value: 0, min: 0, max: 3000, step: 100 },
    duration: { value: 10000, min: 0, max: 30000, step: 1000 },
    writing: { value: true },
    cursor: { value: true },
  },
}

export default function CodeBlockDemo({
  delay = 0,
  duration = 10000,
  writing = true,
  cursor = true,
}: {
  delay?: number
  duration?: number
  writing?: boolean
  /** A blinking caret at the end while it writes. */
  cursor?: boolean
}) {
  const { resolvedTheme } = useTheme()

  return (
    <div className="relative w-[420px] max-w-full">
      <div className="h-[372px] overflow-auto rounded-xl bg-accent p-4 text-sm">
        <CodeBlock
          key={`${delay}-${duration}-${writing}`}
          code={CODE}
          lang="tsx"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          writing={writing}
          delay={delay}
          duration={duration}
          className={cn(
            "[&_code]:text-[13px]! [&>pre,_&_code]:border-none [&>pre,_&_code]:bg-transparent!",
            cursor &&
              "data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:content-['|']"
          )}
        />
      </div>
      <CopyButton
        content={CODE}
        aria-label="Copy code"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "absolute top-2 right-2"
        )}
      >
        <CopyButtonIcon
          icon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />}
          copiedIcon={<HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />}
        />
      </CopyButton>
    </div>
  )
}
