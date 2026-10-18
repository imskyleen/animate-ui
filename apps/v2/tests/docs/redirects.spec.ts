import v1Redirects from '../../v1-redirects.json' with { type: 'json' };
import { expect, test } from '../test';

const location = async (
  request: Parameters<Parameters<typeof test>[2]>[0]['request'],
  path: string,
) => {
  const response = await request.get(path, { maxRedirects: 0 });
  return { status: response.status(), location: response.headers().location };
};

test('old v1 doc URLs redirect to their v2 page, and every v2 page exists', async ({
  request,
}) => {
  test.setTimeout(120_000);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const pages = new Set(
    [...sitemap.matchAll(/<loc>https:\/\/animate-ui\.com([^<]*)<\/loc>/g)].map(
      (match) => match[1],
    ),
  );
  for (const { source, destination } of v1Redirects) {
    expect(pages, `${destination} is missing`).toContain(destination);
    const { status, location: target } = await location(request, source);
    expect(status, source).toBe(308);
    expect(target, source).toBe(destination);
  }
});

test('old v1 doc URLs without a v2 page go to the v1 site', async ({
  request,
}) => {
  for (const path of [
    '/docs/components/headless/dialog',
    '/docs/components/community/radial-menu',
    '/docs/primitives/headless/disclosure',
    '/docs/primitives/radix/files',
    '/docs/radix/accordion',
    '/docs/roadmap',
  ]) {
    const { status, location: target } = await location(request, path);
    expect(status, path).toBe(308);
    expect(target, path).toBe(`https://v1.animate-ui.com${path}`);
  }
});

test('the v1 icon usage pages lead to the icons guide', async ({ request }) => {
  const { status, location: target } = await location(
    request,
    '/docs/icons/usage/triggers',
  );
  expect(status).toBe(308);
  expect(target).toBe('/docs/icons/get-started');
});

test('v2 pages are not redirected', async ({ request }) => {
  for (const path of [
    '/docs/primitives/radix-ui/accordion',
    '/docs/backgrounds/hole',
    '/docs/primitives',
  ]) {
    const { status } = await location(request, path);
    expect(status, path).toBe(200);
  }
});
