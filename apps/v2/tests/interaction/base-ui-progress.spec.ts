import { expect, test } from '@playwright/test';

import { describeProgressDemo, revealed } from './progress-helpers';

describeProgressDemo('base-ui');

test.describe('base-ui progress API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-progress', {
      waitUntil: 'networkidle',
    });
  });

  test('value, min/max, Value and data attributes stay Base UI', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Export' });
    await expect(bar).toHaveAttribute('aria-valuenow', '30');
    await expect(bar).toHaveAttribute('data-progressing', '');
    await expect(page.getByTestId('value')).toHaveText('50%');
    expect(await revealed(page, '[data-testid="main-indicator"]')).toBeCloseTo(
      0.5,
      2,
    );
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(bar).toHaveAttribute('data-complete', '');
    await page.waitForTimeout(700);
    expect(await revealed(page, '[data-testid="main-indicator"]')).toBeCloseTo(
      1,
      2,
    );
  });

  test('indeterminate: the indicator is left to the styles', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Loading' });
    await expect(bar).toHaveAttribute('data-indeterminate', '');
    const style = await page
      .getByTestId('indeterminate-indicator')
      .evaluate((el) => (el as HTMLElement).style.transform);
    expect(style).toBe('');
  });

  test('className and style functions still work', async ({ page }) => {
    const indicator = page.getByTestId('main-indicator');
    await expect(indicator).toHaveClass(/status-progressing/);
    await expect(indicator).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });
});
