import { expect, test } from '@playwright/test';

import { describeRadioGroupDemo, opacityOf } from './controls-helpers';
import { describeCheckedOnMount } from './indicator-mount';

describeRadioGroupDemo('base-ui');

test.describe('base-ui radio group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-radio-group', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await page
      .getByRole('radio', { name: 'Controlled b', exact: true })
      .click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(page.getByTestId('controlled-indicator-b')).toBeVisible();
    await expect(page.getByTestId('controlled-indicator-a')).toHaveCount(0, {
      timeout: 1000,
    });
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('radio', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('controlled-indicator-a')).toBeVisible();
  });

  test('keepMounted keeps every indicator, unchecked dots hidden', async ({
    page,
  }) => {
    await expect(page.getByTestId('kept-indicator-2')).toHaveCount(1);
    expect(await opacityOf(page.getByTestId('kept-dot-2'))).toBe(0);
    await page.getByRole('radio', { name: 'Kept 2', exact: true }).click();
    await expect
      .poll(() => opacityOf(page.getByTestId('kept-dot-2')), { timeout: 1500 })
      .toBe(1);
    await expect
      .poll(() => opacityOf(page.getByTestId('kept-dot-1')), { timeout: 1200 })
      .toBe(0);
    await expect(page.getByTestId('kept-indicator-1')).toHaveCount(1);
  });
});

describeCheckedOnMount(
  'base-ui radio-group checked on mount',
  '/tests/fixtures/base-ui-radio-group',
  'radio',
);
