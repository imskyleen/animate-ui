import { expect, test } from '../test';

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

for (const width of [375, 320]) {
  test(`on a ${width}px phone the header keeps search, like v1, without overflowing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/docs', { waitUntil: 'networkidle' });
    const search = page.getByRole('button', { name: /search/i });
    await expect(search).toBeVisible();
    const box = (await search.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
    await search.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
}
