"use client"

import { useTheme } from "next-themes"

import { CodeBlock } from "@/registry/components/code-block"

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
  cursor?: boolean
}) {
  const { resolvedTheme } = useTheme()

  return (
    <CodeBlock
      key={`${delay}-${duration}-${writing}`}
      code={CODE}
      lang="tsx"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      writing={writing}
      delay={delay}
      duration={duration}
      cursor={cursor}
      className="w-[420px] max-w-full"
      scrollClassName="h-[372px] max-h-none"
    />
  )
}
