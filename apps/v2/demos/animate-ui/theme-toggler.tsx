"use client"

import {
  ThemeToggler,
  type Resolved,
  type ThemeSelection,
} from "@animate-ui/react/primitives/effects/theme-toggler"
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const NEXT: Record<ThemeSelection, ThemeSelection> = {
  light: "dark",
  dark: "system",
  system: "light",
}

const ICONS = { light: Sun03Icon, dark: Moon02Icon, system: ComputerIcon }

export default function ThemeTogglerDemo() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <ThemeToggler
      theme={(theme ?? "system") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "light") as Resolved}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, toggleTheme }) => (
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={`Theme: ${effective}. Switch to ${NEXT[effective]}`}
          onClick={() => toggleTheme(NEXT[effective])}
        >
          <HugeiconsIcon icon={ICONS[effective]} strokeWidth={2} />
        </Button>
      )}
    </ThemeToggler>
  )
}
