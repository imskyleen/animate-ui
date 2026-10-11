'use client';

import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
} from '@animate-ui/react/primitives/buttons/github-stars';
import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

function Star(props: Omit<React.ComponentProps<typeof HugeiconsIcon>, 'icon'>) {
  return <HugeiconsIcon icon={StarIcon} strokeWidth={2} {...props} />;
}

// The demo without a fixed value: it fetches the count (mocked in tests).
export default function GitHubStarsButtonFixture() {
  return (
    <GitHubStarsButton
      username="imskyleen"
      repo="animate-ui"
      asChild
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
    >
      <a
        href="https://github.com/imskyleen/animate-ui"
        target="_blank"
        rel="noreferrer noopener"
      >
        <GitHubStarsButtonLogo className="size-4" />
        <GitHubStarsButtonNumber className="tabular-nums" />
        <GitHubStarsButtonParticles className="text-yellow-500">
          <GitHubStarsButtonIcon
            icon={Star}
            className="size-[18px] fill-neutral-700 stroke-neutral-700"
            color="var(--color-yellow-500)"
          />
        </GitHubStarsButtonParticles>
      </a>
    </GitHubStarsButton>
  );
}
