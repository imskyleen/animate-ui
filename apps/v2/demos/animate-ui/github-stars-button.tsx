"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
} from "@animate-ui/react/primitives/buttons/github-stars"
import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const githubStarsButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// The empty star: dark on the primary button, light on the others.
const starVariants = cva("size-[18px]", {
  variants: {
    variant: {
      default:
        "fill-neutral-700 stroke-neutral-700 dark:fill-neutral-300 dark:stroke-neutral-300",
      accent:
        "fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700",
      outline:
        "fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700",
      ghost:
        "fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Star(
  props: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">
) {
  return <HugeiconsIcon icon={StarIcon} strokeWidth={2} {...props} />
}

export const controls = {
  GitHubStarsButton: {
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
  },
}

export default function GitHubStarsButtonDemo({
  variant = "default",
  size = "default",
}: VariantProps<typeof githubStarsButtonVariants>) {
  return (
    <GitHubStarsButton
      username="imskyleen"
      repo="animate-ui"
      // A fixed count keeps the demo offline-friendly; drop `value` to fetch
      // the live count from the GitHub API.
      value={3200}
      asChild
      className={cn(githubStarsButtonVariants({ variant, size }))}
    >
      <a
        href="https://github.com/imskyleen/animate-ui"
        target="_blank"
        rel="noreferrer noopener"
      >
        <GitHubStarsButtonLogo />
        <GitHubStarsButtonNumber className="tabular-nums" />
        <GitHubStarsButtonParticles className="text-yellow-500">
          <GitHubStarsButtonIcon
            icon={Star}
            className={starVariants({ variant })}
            color="var(--color-yellow-500)"
          />
        </GitHubStarsButtonParticles>
      </a>
    </GitHubStarsButton>
  )
}
