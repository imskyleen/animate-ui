import { expect, test } from '@playwright/test';

import { describeProgressDemo, revealed } from './progress-helpers';

describeProgressDemo('radix-ui');

test.describe('radix-ui progress API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-progress', {
      waitUntil: 'networkidle',
    });
  });

  test('value, max and data attributes stay Radix', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Main' });
    await expect(bar).toHaveAttribute('aria-valuenow', '25');
    await expect(bar).toHaveAttribute('aria-valuemax', '50');
    await expect(bar).toHaveAttribute('data-state', 'loading');
    await expect(page.getByTestId('main-indicator')).toHaveAttribute(
      'data-value',
      '25',
    );
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(bar).toHaveAttribute('data-state', 'complete');
    await page.waitForTimeout(700);
    expect(await revealed(page, '[data-testid="main-indicator"]')).toBeCloseTo(
      1,
      2,
    );
  });

  test('indeterminate with the import * style', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Loading' });
    await expect(bar).toHaveAttribute('data-state', 'indeterminate');
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  test('a custom transition is used', async ({ page }) => {
    await page.getByRole('button', { name: 'Complete' }).click();
    // 1.5s linear tween: about a fifth of the way after 300ms.
    await page.waitForTimeout(300);
    const value = await revealed(page, '[data-testid="slow-indicator"]');
    expect(value).toBeGreaterThan(0.55);
    expect(value).toBeLessThan(0.75);
  });
});
