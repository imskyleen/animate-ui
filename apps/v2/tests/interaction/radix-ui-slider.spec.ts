import { expect, test } from '../test';

import { describeSliderDemo } from './slider-helpers';

describeSliderDemo('radix-ui');

test.describe('radix-ui slider API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-slider', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value, onValueChange and onValueCommit', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Controlled' });
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('value')).toHaveText('21');
    await expect(page.getByTestId('committed')).toHaveText('21');
    await page.getByRole('button', { name: 'Set 80' }).click();
    await expect(thumb).toHaveAttribute('aria-valuenow', '80');
  });

  test('the import * style, uncontrolled range', async ({ page }) => {
    const thumbs = page.getByTestId('star').getByRole('slider');
    await expect(thumbs).toHaveCount(2);
    await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '10');
    await thumbs.nth(1).focus();
    await page.keyboard.press('End');
    await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '100');
  });

  test('disabled: a press changes nothing', async ({ page }) => {
    const section = page.getByTestId('disabled');
    const box = (await section.locator('span').first().boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);
    await expect(
      page.getByRole('slider', { name: 'Disabled' }),
    ).toHaveAttribute('aria-valuenow', '50');
  });
});
