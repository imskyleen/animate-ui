import { expect, test } from '@playwright/test';

import { describeCheckboxDemo, opacityOf } from './controls-helpers';

describeCheckboxDemo('radix-ui');

test.describe('radix-ui checkbox API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-checkbox', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled checked, indeterminate and onCheckedChange', async ({
    page,
  }) => {
    const box = page.getByRole('checkbox', { name: 'Controlled', exact: true });
    const indicator = page.getByTestId('controlled-indicator');
    await expect(indicator).toHaveCount(0);
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(indicator).toBeVisible();
    await page
      .getByRole('button', { name: 'Set indeterminate', exact: true })
      .click();
    await expect(box).toHaveAttribute('data-state', 'indeterminate');
    await expect(indicator).toHaveAttribute('data-state', 'indeterminate');
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await expect(indicator).toHaveCount(0, { timeout: 1000 });
  });

  test('the import * style, uncontrolled', async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Star', exact: true });
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('star-indicator')).toBeVisible();
    await box.click();
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('star-indicator')).toHaveCount(0, {
      timeout: 1000,
    });
  });

  test('forceMount keeps the indicator, its check hidden', async ({ page }) => {
    const check = page.getByTestId('forced-check');
    await expect(page.getByTestId('forced-indicator')).toHaveCount(1);
    expect(await opacityOf(check)).toBe(0);
    await page
      .getByRole('checkbox', { name: 'Force mounted', exact: true })
      .click();
    await expect.poll(() => opacityOf(check), { timeout: 1500 }).toBe(1);
    await page
      .getByRole('checkbox', { name: 'Force mounted', exact: true })
      .click();
    await expect.poll(() => opacityOf(check), { timeout: 1200 }).toBe(0);
    await expect(page.getByTestId('forced-indicator')).toHaveCount(1);
  });

  test('inside a form: the bubble input follows', async ({ page }) => {
    const form = page.getByTestId('form');
    await form.getByRole('checkbox').click();
    await expect(form.locator('input[name="newsletter"]')).toBeChecked();
  });
});
