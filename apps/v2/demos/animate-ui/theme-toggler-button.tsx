"use client"

import { type VariantProps } from "class-variance-authority"
import {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
  type Resolved,
  type ThemeSelection,
  themeTogglerButtonVariants,
} from "@/registry/buttons/theme-toggler"
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"

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
    system: { value: false },
  },
}

export default function ThemeTogglerButtonDemo({
  variant = "default",
  size = "default",
  system = false,
}: VariantProps<typeof themeTogglerButtonVariants> & {
  system?: boolean | string
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const withSystem = system === true || system === "true"

  return (
    <ThemeTogglerButton
      theme={(theme ?? "system") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "light") as Resolved}
      setTheme={setTheme}
      modes={withSystem ? ["light", "dark", "system"] : ["light", "dark"]}
      aria-label="Toggle theme"
      variant={variant}
      size={size}
    >
      <ThemeTogglerButtonIcon
        light={<HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />}
        dark={<HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />}
        system={<HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />}
      />
    </ThemeTogglerButton>
  )
}
