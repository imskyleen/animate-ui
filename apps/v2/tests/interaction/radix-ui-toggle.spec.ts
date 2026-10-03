import { expect, test } from '@playwright/test';

import { describeToggleDemo } from './controls-helpers';

describeToggleDemo('radix-ui');

test.describe('radix-ui toggle API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-toggle', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled pressed and onPressedChange', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: 'Controlled',
      exact: true,
    });
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Press it', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('the import * style, uncontrolled', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Star', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('asChild renders your element', async ({ page }) => {
    const link = page.getByTestId('as-child').locator('a');
    await expect(link).toHaveAttribute('aria-pressed', 'false');
    await link.click();
    await expect(link).toHaveAttribute('aria-pressed', 'true');
  });
});
