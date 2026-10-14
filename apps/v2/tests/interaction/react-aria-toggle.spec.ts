import { expect, test } from '../test';

import { describeToggleDemo } from './controls-helpers';

describeToggleDemo('react-aria');

test.describe('react-aria toggle API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-toggle', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled isSelected, onChange and render props', async ({ page }) => {
    const toggle = page
      .getByTestId('controlled')
      .getByRole('button', { name: /^Controlled/ });
    await expect(toggle).toHaveText('Controlled off');
    await expect(toggle).toHaveClass('is-off');
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(toggle).toHaveText('Controlled on');
    await expect(toggle).toHaveClass('is-on');
    await page.getByRole('button', { name: 'Press it', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('a custom render keeps working', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: 'Custom render',
      exact: true,
    });
    await expect(toggle).toHaveAttribute('data-custom', '');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});
