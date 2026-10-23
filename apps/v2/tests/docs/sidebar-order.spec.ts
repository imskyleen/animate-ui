import { expect, test } from '../test';

test('the sidebar lists Installation right after Introduction', async ({
  page,
}) => {
  await page.goto('/docs', { waitUntil: 'networkidle' });
  const links = await page
    .locator('aside a[href^="/docs"]:not([role="tab"])')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
  const intro = links.indexOf('/docs');
  expect(intro).toBeGreaterThanOrEqual(0);
  expect(links[intro + 1]).toBe('/docs/installation');
});
