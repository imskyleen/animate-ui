import { expect, test } from '@playwright/test';

import { describeSliderDemo } from './slider-helpers';

describeSliderDemo('base-ui');

test.describe('base-ui slider API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-slider', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value, onValueChange and onValueCommitted', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Controlled' });
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('value')).toHaveText('21');
    await expect(page.getByTestId('committed')).toHaveText('21');
    await expect(page.getByTestId('output')).toHaveText('21');
    await page.getByRole('button', { name: 'Set 80' }).click();
    await expect(thumb).toHaveAttribute('aria-valuenow', '80');
  });

  test('uncontrolled range', async ({ page }) => {
    const end = page.getByRole('slider', { name: 'End' });
    await expect(end).toHaveAttribute('aria-valuenow', '60');
    await end.focus();
    await page.keyboard.press('End');
    await expect(end).toHaveAttribute('aria-valuenow', '100');
  });

  test('className functions still work', async ({ page }) => {
    await expect(
      page.getByTestId('controlled').locator('.indicator-horizontal'),
    ).toHaveCount(1);
  });
});
