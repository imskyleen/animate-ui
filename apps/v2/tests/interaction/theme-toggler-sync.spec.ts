import { expect, test } from '../test';

test('the render function follows a theme changed elsewhere', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/theme-toggler-sync', {
    waitUntil: 'networkidle',
  });
  await expect(page.getByTestId('effective')).toHaveText('light');
  await page.getByRole('button', { name: 'Set dark elsewhere' }).click();
  await expect(page.getByTestId('effective')).toHaveText('dark');
});
