import { GitHubStarsWheel } from '@/registry/components/animate/github-stars-wheel';

interface GitHubStarsWheelDemoProps {
  delay: number;
  direction: 'btt' | 'ttb';
}

export const GitHubStarsWheelDemo = ({
  delay,
  direction,
}: GitHubStarsWheelDemoProps) => {
  return (
    <div className="size-full flex items-center justify-center">
      <GitHubStarsWheel
        username="imskyleen"
        repo="animate-ui"
        delay={delay}
        direction={direction}
      />
    </div>
  );
};
