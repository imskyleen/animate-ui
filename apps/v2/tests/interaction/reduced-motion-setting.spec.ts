import { expect, test } from '../test';

const open = (page: import('@playwright/test').Page) =>
  page.goto('/tests/fixtures/reduced-motion-setting', {
    waitUntil: 'networkidle',
  });

test('with the system asking for less motion, never keeps full motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await expect(page.getByTestId('user')).toHaveText('reduced');
  await expect(page.getByTestId('never')).toHaveText('full');
  await expect(page.getByTestId('always')).toHaveText('reduced');

  await page.getByRole('button', { name: 'Toggle' }).click();
  await page.waitForTimeout(60);
  const height = await page
    .getByTestId('never-panel')
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThan(0);
  expect(height).toBeLessThan(200);
});

test('without it, always still reduces', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  await expect(page.getByTestId('user')).toHaveText('full');
  await expect(page.getByTestId('never')).toHaveText('full');
  await expect(page.getByTestId('always')).toHaveText('reduced');
});
