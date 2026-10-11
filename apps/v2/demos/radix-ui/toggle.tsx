"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Toggle as TogglePrimitive } from "@animate-ui/react/primitives/radix-ui"
import { BookmarkIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"

const toggleVariants = cva(
  "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted gap-1 rounded-lg text-sm font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input hover:bg-muted border bg-transparent",
      },
      size: {
        default: "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

export const controls = {
  Toggle: {
    size: {
      value: "sm",
      options: { default: "default", sm: "sm", lg: "lg" },
    },
  },
}

export default function ToggleDemo({
  size = "sm",
}: {
  size?: "default" | "sm" | "lg"
}) {
  const [pressed, setPressed] = React.useState(false)
  const reduce = useReducedMotion()

  return (
    <Toggle
      aria-label="Toggle bookmark"
      size={size}
      variant="outline"
      pressed={pressed}
      onPressedChange={setPressed}
    >
      {/* The bookmark pops as it fills, and gives a little as it empties. */}
      <motion.span
        className="inline-flex"
        initial={false}
        animate={{
          scale: reduce ? 1 : pressed ? [1, 1.2, 1] : [1, 0.9, 1],
        }}
        transition={{
          duration: 0.35,
          times: [0, 0.4, 1],
          ease: ["easeOut", [0.34, 1.56, 0.64, 1]],
        }}
      >
        <HugeiconsIcon
          icon={BookmarkIcon}
          strokeWidth={2}
          className="fill-transparent transition-[fill] duration-200 ease-out group-data-[state=on]/toggle:fill-foreground"
        />
      </motion.span>
      Bookmark
    </Toggle>
  )
}
