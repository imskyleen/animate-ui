import { expect, test } from '../test';

import { describeSliderDemo } from './slider-helpers';

describeSliderDemo('react-aria');

test.describe('react-aria slider API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-slider', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value, onChange and onChangeEnd', async ({ page }) => {
    const thumb = page.getByTestId('controlled').getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('value')).toHaveText('21');
    await expect(page.getByTestId('committed')).toHaveText('21');
    await expect(page.getByTestId('output')).toHaveText('21');
    await page.getByRole('button', { name: 'Set 80' }).click();
    await expect(thumb).toHaveValue('80');
  });

  test('uncontrolled range', async ({ page }) => {
    const thumbs = page.getByTestId('uncontrolled').getByRole('slider');
    await expect(thumbs).toHaveCount(2);
    await thumbs.nth(1).focus();
    await page.keyboard.press('End');
    await expect(thumbs.nth(1)).toHaveValue('100');
  });

  test('render props reach the thumb, centering kept', async ({ page }) => {
    const thumb = page.getByTestId('controlled').locator('.thumb');
    const box = (await thumb.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(thumb).toHaveClass(/dragging/);
    await page.mouse.up();
    const track = (await page
      .getByTestId('controlled')
      .locator('.react-aria-SliderTrack')
      .boundingBox())!;
    const after = (await thumb.boundingBox())!;
    const center = after.x + after.width / 2;
    expect(Math.abs(center - (track.x + track.width * 0.2))).toBeLessThan(2);
  });
});
