import { expect, test } from '@playwright/test';

test('edge cases render without crashing or spinning', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = window.setTimeout;
    (window as unknown as { timers: number }).timers = 0;
    window.setTimeout = ((...args: Parameters<typeof original>) => {
      (window as unknown as { timers: number }).timers++;
      return original(...args);
    }) as typeof original;
  });
  await page.goto('/tests/fixtures/edge-cases', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('avatar-group').getByText('A')).toBeVisible();
  await expect(page.getByTestId('hole-1').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('hole-0').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('stars-ref')).toHaveText('DIV');
  await expect
    .poll(() =>
      page
        .getByTestId('gravity-stars')
        .locator('canvas')
        .evaluate(
          (canvas: HTMLCanvasElement) =>
            canvas.width ===
            Math.floor(canvas.clientWidth * window.devicePixelRatio),
        ),
    )
    .toBe(true);

  const start = await page.evaluate(
    () => (window as unknown as { timers: number }).timers,
  );
  await page.waitForTimeout(500);
  const end = await page.evaluate(
    () => (window as unknown as { timers: number }).timers,
  );
  expect(end - start).toBeLessThan(50);
  expect(errors).toEqual([]);
});
