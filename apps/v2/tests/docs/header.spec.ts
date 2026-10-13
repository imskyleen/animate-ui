import { expect, test } from '@playwright/test';

test('the header theme button switches the theme, turning its icon', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/docs', { waitUntil: 'networkidle' });
  const button = page
    .locator('[data-slot="theme-toggler-button"]')
    .filter({ visible: true })
    .first();
  await expect(button).toHaveAttribute('data-theme', 'light');
  await button.evaluate((el) => {
    const w = window as unknown as { __turn: number };
    w.__turn = 0;
    const tick = () => {
      for (const icon of el.querySelectorAll<HTMLElement>('[data-icon]')) {
        const { a, b } = new DOMMatrix(getComputedStyle(icon).transform);
        w.__turn = Math.max(
          w.__turn,
          Math.abs((Math.atan2(b, a) * 180) / Math.PI),
        );
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await button.click();
  await expect(button).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(() => (window as unknown as { __turn: number }).__turn),
  ).toBeGreaterThan(30);
});
