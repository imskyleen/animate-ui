import { expect, test } from '../test';
test('the sidebar shows the Lucide logo in its text color only', async ({
  page,
}) => {
  await page.goto('/docs/icons/get-started', { waitUntil: 'networkidle' });
  const strokes = await page
    .locator('aside a[href="/docs/icons/lucide-icons"] svg path')
    .evaluateAll((paths) => paths.map((p) => p.getAttribute('stroke')));
  expect(strokes).toEqual(['currentColor', 'currentColor']);
});

test("the sidebar shows Hugeicons' logo in its text color, at a stroke of 2", async ({
  page,
}) => {
  await page.goto('/docs/icons/get-started', { waitUntil: 'networkidle' });
  const logo = page.locator('aside a[href="/docs/icons/hugeicons"] svg');
  await expect(logo).toHaveAttribute('stroke', 'currentColor');
  await expect(logo).toHaveAttribute('stroke-width', '2');
  await expect(logo.locator('path')).toHaveCount(3);
});
