'use client';

import * as React from 'react';

import type { UseIsInViewOptions } from '../../../utils/use-is-in-view';
import { Button, type ButtonProps } from '../button';
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
} from '../../github-stars';

type GitHubStarsButtonProps = ButtonProps &
  UseIsInViewOptions & {
    /** Owner of the repository. */
    username?: string;
    /** Name of the repository. */
    repo?: string;
    /** A fixed star count: skips the request to the GitHub API. */
    value?: number;
    /**
     * Wait before fetching the stars, in milliseconds.
     * @default 0
     */
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
  ...props
}: GitHubStarsButtonProps) {
  return (
    // The button shows up once the stars are loaded.
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
      <Button data-slot="github-stars-button" {...props} />
    </GithubStars>
  );
}

// The GitHub stars parts, named after the button.
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
  type GitHubStarsButtonProps,
  type GitHubStarsButtonLogoProps,
  type GitHubStarsButtonNumberProps,
  type GitHubStarsButtonIconProps,
  type GitHubStarsButtonParticlesProps,
};
