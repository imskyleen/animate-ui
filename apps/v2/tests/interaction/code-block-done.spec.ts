import { expect, test } from '../test';

test('a static CodeBlock calls onDone once', async ({ page }) => {
  await page.goto('/tests/fixtures/code-block-done', {
    waitUntil: 'networkidle',
  });
  await expect(page.getByTestId('done')).toHaveText('1');
  await page.waitForTimeout(500);
  await expect(page.getByTestId('done')).toHaveText('1');
});
