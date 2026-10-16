'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Button,
  type ButtonProps,
} from '@animate-ui/react/primitives/buttons/button';
import {
  GithubStars,
  GithubStarsIcon,
  GithubStarsLogo,
  GithubStarsNumber,
  GithubStarsParticles,
  type GithubStarsIconProps,
  type GithubStarsLogoProps,
  type GithubStarsNumberProps,
  type GithubStarsParticlesProps,
} from '@animate-ui/react/primitives/github-stars';
import type { UseIsInViewOptions } from '@animate-ui/react/utils/use-is-in-view';
import { cn } from 'cn';

const githubStarsButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline:
          'bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type GitHubStarsButtonProps = ButtonProps &
  UseIsInViewOptions &
  VariantProps<typeof githubStarsButtonVariants> & {
    username?: string;
    repo?: string;
    value?: number;
    delay?: number;
  };

function GitHubStarsButton({
  ref,
  username,
  repo,
  value,
  delay,
  inView,
  inViewMargin,
  inViewOnce,
  variant,
  size,
  className,
  ...props
}: GitHubStarsButtonProps) {
  return (
    <GithubStars
      asChild
      ref={ref as React.Ref<HTMLDivElement>}
      username={username}
      repo={repo}
      value={value}
      delay={delay}
      inView={inView}
      inViewMargin={inViewMargin}
      inViewOnce={inViewOnce}
    >
      <Button
        data-slot="github-stars-button"
        className={cn(githubStarsButtonVariants({ variant, size }), className)}
        {...props}
      />
    </GithubStars>
  );
}

const GitHubStarsButtonLogo = GithubStarsLogo;
const GitHubStarsButtonNumber = GithubStarsNumber;
const GitHubStarsButtonIcon = GithubStarsIcon;
const GitHubStarsButtonParticles = GithubStarsParticles;

type GitHubStarsButtonLogoProps = GithubStarsLogoProps;
type GitHubStarsButtonNumberProps = GithubStarsNumberProps;
type GitHubStarsButtonIconProps<T extends React.ElementType> =
  GithubStarsIconProps<T>;
type GitHubStarsButtonParticlesProps = GithubStarsParticlesProps;

export {
  GitHubStarsButton,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonIcon,
  GitHubStarsButtonParticles,
  githubStarsButtonVariants,
  type GitHubStarsButtonProps,
  type GitHubStarsButtonLogoProps,
  type GitHubStarsButtonNumberProps,
  type GitHubStarsButtonIconProps,
  type GitHubStarsButtonParticlesProps,
};
