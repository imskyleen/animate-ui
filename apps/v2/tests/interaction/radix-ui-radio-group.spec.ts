import { expect, test } from '@playwright/test';

import { describeRadioGroupDemo, opacityOf } from './controls-helpers';
import { describeCheckedOnMount } from './indicator-mount';

describeRadioGroupDemo('radix-ui');

test.describe('radix-ui radio group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-radio-group', {
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

  test('the import * style, uncontrolled', async ({ page }) => {
    await expect(page.getByTestId('star-indicator-y')).toBeVisible();
    await page.getByRole('radio', { name: 'Star x', exact: true }).click();
    await expect(page.getByTestId('star-indicator-x')).toBeVisible();
    await expect(page.getByTestId('star-indicator-y')).toHaveCount(0, {
      timeout: 1000,
    });
  });

  test('forceMount keeps every indicator, unchecked dots hidden', async ({
    page,
  }) => {
    await expect(page.getByTestId('forced-indicator-2')).toHaveCount(1);
    expect(await opacityOf(page.getByTestId('forced-dot-2'))).toBe(0);
    // The selected dot popped in when the group mounted (v1): at rest once
    // its spring has settled.
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-1')), {
        timeout: 1500,
      })
      .toBe(1);
    await page.getByRole('radio', { name: 'Forced 2', exact: true }).click();
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-2')), {
        timeout: 1500,
      })
      .toBe(1);
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-1')), {
        timeout: 1200,
      })
      .toBe(0);
    await expect(page.getByTestId('forced-indicator-1')).toHaveCount(1);
  });
});

describeCheckedOnMount(
  'radix-ui radio-group checked on mount',
  '/tests/fixtures/radix-ui-radio-group',
  'radio',
);
