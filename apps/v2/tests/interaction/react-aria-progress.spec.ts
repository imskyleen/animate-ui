import { expect, test } from '@playwright/test';

import { describeProgressDemo, revealed } from './progress-helpers';

describeProgressDemo('react-aria');

test.describe('react-aria progress API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-progress', {
      waitUntil: 'networkidle',
    });
  });

  test('value, range and render props stay React Aria', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Sync' });
    await expect(bar).toHaveAttribute('aria-valuenow', '30');
    await expect(page.getByTestId('value-text')).toHaveText('50%');
    await expect(bar).toHaveClass(/determinate/);
    expect(await revealed(page, '[data-testid="bar"]')).toBeCloseTo(0.5, 2);

    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(page.getByTestId('value-text')).toHaveText('100%');
    await page.waitForTimeout(700);
    expect(await revealed(page, '[data-testid="bar"]')).toBeCloseTo(1, 2);
    // Moved with a transform: the bar keeps the full width.
    const style = await page
      .getByTestId('bar')
      .evaluate((el) => (el as HTMLElement).style.width);
    expect(style).toBe('calc(100%)');
  });

  test('indeterminate', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Waiting' });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
    await expect(bar).toHaveClass(/indeterminate/);
  });
});
