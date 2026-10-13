import { expect, test } from '@playwright/test';

import { describeCheckboxDemo } from './controls-helpers';

describeCheckboxDemo('react-aria');

test.describe('react-aria checkbox API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-checkbox', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled isSelected, isIndeterminate and render props', async ({
    page,
  }) => {
    const section = page.getByTestId('controlled');
    const root = section.locator('label');
    const check = section.getByTestId('check');
    await expect(check).toHaveCount(0);
    await expect(root).toHaveClass(/is-unselected/);
    await root.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(root).toHaveClass(/is-selected/);
    await expect(check).toBeVisible();
    await root.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await expect(check).toHaveCount(0);
    await expect(
      section.locator('[data-slot="checkbox-indicator"] > *'),
    ).toHaveCount(0, {
      timeout: 1000,
    });
    await page
      .getByRole('button', { name: 'Set indeterminate', exact: true })
      .click();
    await expect(root).toHaveAttribute('data-indeterminate', 'true');
    await expect(root).toHaveCSS('outline-style', 'solid');
    await expect(check).toBeVisible();
  });

  test('a custom render keeps working', async ({ page }) => {
    const root = page.getByTestId('custom-render').locator('label');
    await expect(root).toHaveAttribute('data-custom', '');
    await expect(root).toHaveAttribute('data-selected', 'true');
    await root.click();
    await expect(root).not.toHaveAttribute('data-selected', 'true');
  });

  test('plain children', async ({ page }) => {
    const root = page.getByTestId('plain-children').locator('label');
    await expect(root).toHaveText('Plain children');
    await root.click();
    await expect(root.locator('input')).not.toBeChecked();
  });
});
