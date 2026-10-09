import { expect, test } from '@playwright/test';

import { describeCheckboxDemo, opacityOf } from './controls-helpers';
import { describeCheckedOnMount } from './indicator-mount';

describeCheckboxDemo('base-ui');

test.describe('base-ui checkbox API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-checkbox', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled checked, indeterminate, className function', async ({
    page,
  }) => {
    const box = page.getByRole('checkbox', { name: 'Controlled', exact: true });
    const indicator = page.getByTestId('controlled-indicator');
    await expect(indicator).toHaveCount(0);
    await expect(box).toHaveClass(/is-unchecked/);
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(box).toHaveClass(/is-checked/);
    await expect(indicator).toBeVisible();
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await expect(indicator).toHaveCount(0, { timeout: 1000 });
    await page
      .getByRole('button', { name: 'Set indeterminate', exact: true })
      .click();
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    await expect(indicator).toBeVisible();
  });

  test('uncontrolled', async ({ page }) => {
    const box = page.getByRole('checkbox', {
      name: 'Uncontrolled',
      exact: true,
    });
    await expect(page.getByTestId('uncontrolled-indicator')).toBeVisible();
    await box.click();
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('uncontrolled-indicator')).toHaveCount(0, {
      timeout: 1000,
    });
  });

  test('keepMounted keeps the indicator, its check hidden', async ({
    page,
  }) => {
    const check = page.getByTestId('kept-check');
    await expect(page.getByTestId('kept-indicator')).toHaveCount(1);
    expect(await opacityOf(check)).toBe(0);
    const box = page.getByRole('checkbox', {
      name: 'Kept mounted',
      exact: true,
    });
    await box.click();
    await expect.poll(() => opacityOf(check), { timeout: 1500 }).toBe(1);
    await box.click();
    await expect.poll(() => opacityOf(check), { timeout: 1200 }).toBe(0);
    await expect(page.getByTestId('kept-indicator')).toHaveCount(1);
  });
});

describeCheckedOnMount(
  'base-ui checkbox checked on mount',
  '/tests/fixtures/base-ui-checkbox',
  'checkbox',
);
