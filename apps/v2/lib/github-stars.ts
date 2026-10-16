import { gitConfig } from '@/lib/shared';

export async function getGitHubStars(): Promise<number | undefined> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok) return undefined;
    const data: { stargazers_count?: unknown } = await response.json();
    return typeof data.stargazers_count === 'number'
      ? data.stargazers_count
      : undefined;
  } catch {
    return undefined;
  }
}
