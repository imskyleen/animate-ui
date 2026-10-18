import { expect, test } from '../test';

const meta = (html: string, key: string) =>
  html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`),
  )?.[1];

test('the home page has its own share image, canonical URL and structured data', async ({
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain(
    '<link rel="canonical" href="https://animate-ui.com"/>',
  );
  expect(meta(html, 'og:type')).toBe('website');
  expect(meta(html, 'og:title')).toBe(
    'Animate UI - Animated primitives for React',
  );
  expect(meta(html, 'og:description')).toBeTruthy();
  expect(meta(html, 'twitter:card')).toBe('summary_large_image');
  const image = meta(html, 'og:image')!;
  expect(image).toBe('https://animate-ui.com/og-image.png?v=2');
  expect(meta(html, 'twitter:image')).toBe(image);

  const response = await request.get(
    new URL(image).pathname + new URL(image).search,
  );
  expect(response.headers()['content-type']).toBe('image/png');
  const png = await response.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([
    Number(meta(html, 'og:image:width')),
    Number(meta(html, 'og:image:height')),
  ]);
  expect(meta(html, 'twitter:site')).toBe('@animate_ui');

  const jsonLd = JSON.parse(
    html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)![1]!,
  );
  expect(jsonLd).toMatchObject({
    '@type': 'SoftwareSourceCode',
    name: 'Animate UI',
    codeRepository: 'https://github.com/imskyleen/animate-ui',
  });
});

test('docs pages have a canonical URL and a share card', async ({
  request,
}) => {
  const html = await (await request.get('/docs/backgrounds/hole')).text();
  expect(html).toContain(
    '<link rel="canonical" href="https://animate-ui.com/docs/backgrounds/hole"/>',
  );
  expect(meta(html, 'og:type')).toBe('article');
  expect(meta(html, 'og:image')).toContain('/og/docs/backgrounds/hole/');
  expect(meta(html, 'twitter:card')).toBe('summary_large_image');
});

test('robots.txt keeps previews and test pages out and points to the sitemap', async ({
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /examples/');
  expect(robots).toContain('Disallow: /tests/');
  expect(robots).toContain('Sitemap: https://animate-ui.com/sitemap.xml');
});

test('the sitemap lists the home page and every docs page, nothing else', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  expect(urls).toContain('https://animate-ui.com');
  expect(urls).toContain('https://animate-ui.com/docs');
  expect(urls).toContain('https://animate-ui.com/docs/backgrounds/hole');
  expect(urls).toContain(
    'https://animate-ui.com/docs/primitives/radix-ui/accordion',
  );
  expect(urls.length).toBeGreaterThan(100);
  expect(urls.filter((url) => /\/(examples|tests|api)\//.test(url))).toEqual(
    [],
  );
});

test('the README stars badge reads its count from the site', async ({
  request,
}) => {
  const response = await request.get('/api/github-stars');
  expect(response.status()).toBe(200);
  const badge = await response.json();
  expect(badge).toMatchObject({ schemaVersion: 1, label: 'stars' });
  expect(badge.message).toMatch(/^(\d+(\.\d)?k?|GitHub)$/);
});
