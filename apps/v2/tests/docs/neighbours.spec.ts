import { expect, test } from '@playwright/test';

for (const [url, previous, next] of [
  ['/docs/backgrounds/hole', 'Hexagon Background', 'Stars Background'],
  ['/docs/icons/get-started', 'Icons', 'Lucide Icons'],
] as const)
  test(`${url} links to the pages around it`, async ({ request }) => {
    const html = await (await request.get(url)).text();
    expect(html).toContain(`aria-label="Previous: ${previous}"`);
    expect(html).toContain(`aria-label="Next: ${next}"`);
    expect(html).not.toContain('aria-label="Next: Introduction"');
  });
