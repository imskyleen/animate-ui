import { gitConfig } from '@/lib/shared';

const HOUR = 60 * 60 * 1000;

let last: { stars: number; at: number } | undefined;

export async function getGitHubStars(): Promise<number | undefined> {
  if (last && Date.now() - last.at < HOUR) return last.stars;
  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(
      `https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok) return last?.stars;
    const data: { stargazers_count?: unknown } = await response.json();
    if (typeof data.stargazers_count !== 'number') return last?.stars;
    last = { stars: data.stargazers_count, at: Date.now() };
    return last.stars;
  } catch {
    return last?.stars;
  }
}
