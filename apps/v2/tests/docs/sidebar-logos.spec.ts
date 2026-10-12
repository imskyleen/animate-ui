import { expect, test } from '@playwright/test';
test('the sidebar shows the Lucide logo in its text color only', async ({
  page,
}) => {
  await page.goto('/docs/icons/get-started', { waitUntil: 'networkidle' });
  const strokes = await page
    .locator('aside a[href="/docs/icons/lucide-icons"] svg path')
    .evaluateAll((paths) => paths.map((p) => p.getAttribute('stroke')));
  expect(strokes).toEqual(['currentColor', 'currentColor']);
});
