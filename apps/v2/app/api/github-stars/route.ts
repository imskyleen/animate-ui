import { getGitHubStars } from '@/lib/github-stars';

export const revalidate = 3600;

/** Shields.io endpoint badge for the README: https://shields.io/badges/endpoint-badge */
export async function GET() {
  const stars = await getGitHubStars();
  return Response.json({
    schemaVersion: 1,
    label: 'stars',
    message:
      stars === undefined
        ? 'GitHub'
        : new Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 1,
          })
            .format(stars)
            .toLowerCase(),
    color: 'blue',
    cacheSeconds: 3600,
  });
}
