import {
  GitHubStarsButton,
  type GitHubStarsButtonProps,
} from '@/registry/components/buttons/github-stars';

interface GitHubStarsButtonDemoProps {
  variant: GitHubStarsButtonProps['variant'];
  size: GitHubStarsButtonProps['size'];
}

export default function GitHubStarsButtonDemo({
  variant,
  size,
}: GitHubStarsButtonDemoProps) {
  return (
    <GitHubStarsButton
      variant={variant}
      size={size}
      username="imskyleen"
      repo="animate-ui"
    />
  );
}
