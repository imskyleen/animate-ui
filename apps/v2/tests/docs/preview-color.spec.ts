import { expect, test } from '@playwright/test';

// Demos inherit the preview's color: the docs' prose text is 90% opaque, and
// icons drawn in it would show their crossing strokes.
test('the component preview gives its demo an opaque color', async ({
  page,
}) => {
  await page.goto('/docs/primitives/animate-ui/copy-button', {
    waitUntil: 'networkidle',
  });
  const color = await page
    .locator('.not-prose.rounded-xl.bg-accent')
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  expect(color).not.toMatch(/\/\s*0?\.\d+\)/);
});
