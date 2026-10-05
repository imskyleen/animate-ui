import {
  GithubStars,
  GithubStarsIcon,
  GithubStarsLogo,
  GithubStarsNumber,
  GithubStarsParticles,
} from '@/registry/primitives/animate/github-stars';
import { StarIcon } from 'lucide-react';

export const GithubStarsDemo = () => {
  return (
    <GithubStars
      className="flex gap-2 items-center"
      username="imskyleen"
      repo="animate-ui"
    >
      <GithubStarsLogo className="text-muted-foreground size-6" />
      <div className="p-1 bg-muted flex items-center gap-1">
        <GithubStarsNumber className="text-muted-foreground font-medium" />
        <GithubStarsParticles>
          <GithubStarsIcon
            icon={StarIcon}
            className="fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700"
            activeClassName="text-muted-foreground"
            size={18}
          />
        </GithubStarsParticles>
      </div>
    </GithubStars>
  );
};
