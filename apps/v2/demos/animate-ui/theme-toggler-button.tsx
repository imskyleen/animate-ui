"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
  type Direction,
  type Resolved,
  type ThemeSelection,
} from "@animate-ui/react/primitives/buttons/theme-toggler"
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"

const themeTogglerButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
      },
      size: {
        default: "size-9",
        sm: "size-8",
        lg: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const controls = {
  ThemeTogglerButton: {
    variant: {
      value: "default",
      options: {
        default: "default",
        accent: "accent",
        outline: "outline",
        ghost: "ghost",
      },
    },
    size: {
      value: "default",
      options: { default: "default", sm: "sm", lg: "lg" },
    },
    direction: {
      value: "ltr",
      options: { btt: "btt", ttb: "ttb", ltr: "ltr", rtl: "rtl" },
    },
    system: { value: false },
  },
}

export default function ThemeTogglerButtonDemo({
  variant = "default",
  size = "default",
  direction = "ltr",
  system = false,
}: VariantProps<typeof themeTogglerButtonVariants> & {
  direction?: Direction
  system?: boolean | string
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  // Query strings (the test pages) pass booleans as text.
  const withSystem = system === true || system === "true"

  return (
    <ThemeTogglerButton
      theme={(theme ?? "system") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "light") as Resolved}
      setTheme={setTheme}
      direction={direction}
      modes={withSystem ? ["light", "dark", "system"] : ["light", "dark"]}
      aria-label="Toggle theme"
      className={cn(themeTogglerButtonVariants({ variant, size }))}
    >
      <ThemeTogglerButtonIcon
        light={<HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />}
        dark={<HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />}
        system={<HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />}
      />
    </ThemeTogglerButton>
  )
}
