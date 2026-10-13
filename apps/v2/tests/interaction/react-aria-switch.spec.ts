import { expect, test } from '@playwright/test';

import { describeSwitchDemo } from './controls-helpers';

describeSwitchDemo('react-aria');

test.describe('react-aria switch API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-switch', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled, changed from both sides', async ({ page }) => {
    const sw = page.getByTestId('controlled').getByRole('switch');
    const root = page.getByTestId('controlled').locator('label');
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await root.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(sw).toBeChecked();
    await root.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Turn on', exact: true }).click();
    await expect(sw).toBeChecked();
  });

  test('className and style render props', async ({ page }) => {
    const root = page.getByTestId('controlled').locator('label');
    await expect(root).toHaveClass(/is-off/);
    await root.click();
    await expect(root).toHaveClass(/is-on/);
    await expect(root).toHaveCSS('color', 'rgb(0, 128, 0)');
  });

  test('isDisabled', async ({ page }) => {
    const root = page.getByTestId('disabled').locator('label');
    await root.click({ force: true });
    await expect(
      page.getByTestId('disabled').getByRole('switch'),
    ).not.toBeChecked();
  });
});
