"use client"

import {
  GithubStars,
  GithubStarsIcon,
  GithubStarsLogo,
  GithubStarsNumber,
  GithubStarsParticles,
} from "@animate-ui/react/primitives/github-stars"
import { cn } from "cn"
import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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

export default function GithubStarsDemo() {
  return (
    <GithubStars
      username="imskyleen"
      repo="animate-ui"
      value={3200}
      className="flex items-center gap-2"
    >
      <GithubStarsLogo className="size-6 text-muted-foreground" />
      <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
        <GithubStarsNumber className="font-medium text-muted-foreground tabular-nums" />
        <GithubStarsParticles className="text-yellow-500">
          <GithubStarsIcon
            icon={Star}
            className="size-[18px] fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700"
            color="var(--color-yellow-500)"
          />
        </GithubStarsParticles>
      </div>
    </GithubStars>
  )
}
