import { expect, test } from '@playwright/test';

import { describeToggleDemo } from './controls-helpers';

describeToggleDemo('base-ui');

test.describe('base-ui toggle API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-toggle', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled pressed, onPressedChange, className function', async ({
    page,
  }) => {
    const toggle = page.getByRole('button', {
      name: 'Controlled',
      exact: true,
    });
    await expect(toggle).toHaveClass('is-off');
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(toggle).toHaveClass('is-on');
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Press it', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('uncontrolled', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: 'Uncontrolled',
      exact: true,
    });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});
