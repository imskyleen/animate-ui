import { expect, test } from '../test';

for (const [name, url] of [
  ['react', '/tests/fixtures/code-block-done'],
  ['vue', '/tests/vue-demos/fixtures/code-block-done'],
] as const)
  test(`${name}: a static CodeBlock calls onDone once`, async ({ page }) => {
    await page.goto(url, {
      waitUntil: 'networkidle',
    });
    await expect(page.getByTestId('done')).toHaveText('1');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('done')).toHaveText('1');
  });
