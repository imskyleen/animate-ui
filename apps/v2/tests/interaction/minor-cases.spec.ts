import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
    Object.defineProperty(crypto, 'randomUUID', { value: undefined });
  });
  await page.goto('/tests/fixtures/minor-cases', { waitUntil: 'networkidle' });
});

test('copy and click effects survive a page without secure context APIs', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('button', { name: 'Copy' }).click();
  await page.mouse.click(300, 300);
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});

test('a style on LiquidButton keeps its fill', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Liquid' });
  await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
  expect(await button.getAttribute('style')).toContain('linear-gradient');
});

test('a style on Shine stays on its container, not the shine', async ({
  page,
}) => {
  const overlay = page.getByTestId('shine').locator('> div').last();
  expect(
    await overlay.evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain('linear-gradient');
});
