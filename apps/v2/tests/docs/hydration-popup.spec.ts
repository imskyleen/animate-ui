import { expect, test } from '../test';

// Bug: a combobox opened before the search dialog hydrated marked it aria-hidden, and React reported a mismatch.
test('a combobox opened as the page hydrates leaves no hydration mismatch', async ({ page }) => {
  const mismatches: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('A tree hydrated but some attributes'))
      mismatches.push(message.text());
  });
  await page.goto('/docs/primitives/base-ui/combobox', { waitUntil: 'commit' });
  const input = page.locator('input[placeholder="Select a framework"]').first();
  await page.waitForFunction(
    () => {
      const el = document.querySelector('input[placeholder="Select a framework"]');
      return !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'));
    },
    null,
    { polling: 5 },
  );
  await input.click();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  expect(mismatches).toEqual([]);
});
