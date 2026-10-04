import { expect, test } from '@playwright/test';

import { describeToggleGroupDemo } from './controls-helpers';

describeToggleGroupDemo('radix-ui', true);

test.describe('radix-ui toggle group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-toggle-group', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled single value and onValueChange', async ({ page }) => {
    await page
      .getByRole('radio', { name: 'Controlled b', exact: true })
      .click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(
      page.getByRole('radio', { name: 'Controlled b', exact: true }),
    ).toHaveAttribute('data-state', 'on');
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('radio', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('the import * style, multiple', async ({ page }) => {
    await page.getByRole('button', { name: 'Star y', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Star x', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Star y', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
