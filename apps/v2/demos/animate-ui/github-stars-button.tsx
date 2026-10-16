"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
  githubStarsButtonVariants,
} from "@/registry/buttons/github-stars"
import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
  return (
    <HugeiconsIcon
      icon={StarIcon}
      strokeWidth={2}
      {...props}
      className={cn("[&_path]:[stroke:inherit]", props.className)}
    />
  )
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
      value={3200}
      asChild
      variant={variant}
      size={size}
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
