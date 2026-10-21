import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Animate UI';
export const siteUrl = 'https://animate-ui.com';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

const isDev = process.env.NODE_ENV === 'development';

export const docsVersions = [
  {
    id: 'v2',
    label: 'v2.2',
    note: undefined,
    url:
      process.env.NEXT_PUBLIC_V2_URL ??
      (isDev ? 'http://localhost:3300' : 'https://animate-ui.com'),
  },
  {
    id: 'v1',
    label: 'v1.0.27',
    note: undefined,
    url:
      process.env.NEXT_PUBLIC_V1_URL ??
      (isDev ? 'http://localhost:3200' : 'https://v1.animate-ui.com'),
  },
] as const;

export const gitConfig = {
  user: 'imskyleen',
  repo: 'animate-ui',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
