import { expect, test } from '@playwright/test';

import { describeToggleGroup } from './toggle-group-helpers';

describeToggleGroup('base-ui');

test.describe('base-ui toggle group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-toggle-group', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Controlled b', exact: true })
      .click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(
      page.getByRole('button', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('multiple', async ({ page }) => {
    await page.getByRole('button', { name: 'Multiple y', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Multiple x', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Multiple y', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
