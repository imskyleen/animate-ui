import { expect, test } from '@playwright/test';

import { describeSwitchDemo } from './controls-helpers';

describeSwitchDemo('base-ui');

test.describe('base-ui switch API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-switch', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled, changed from both sides', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Controlled', exact: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await sw.click({ force: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(sw).toBeChecked();
    await sw.click({ force: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Turn on', exact: true }).click();
    await expect(sw).toBeChecked();
  });

  test('uncontrolled, and the thumb className function', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Uncontrolled', exact: true });
    await expect(sw).toBeChecked();
    await sw.click();
    await expect(sw).not.toBeChecked();
    await page.getByRole('switch', { name: 'Controlled', exact: true }).click();
    await expect(page.getByTestId('controlled-thumb')).toHaveClass(/is-on/);
  });

  test('disabled', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Disabled', exact: true });
    await sw.click({ force: true });
    await expect(sw).not.toBeChecked();
  });
});
