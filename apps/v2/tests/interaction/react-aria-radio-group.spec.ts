import { expect, test } from '@playwright/test';

import { describeRadioGroupDemo } from './controls-helpers';

describeRadioGroupDemo('react-aria');

test.describe('react-aria radio group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-radio-group', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value, onChange and render props', async ({ page }) => {
    const section = page.getByTestId('controlled');
    await section.getByText('Controlled b').click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(section.getByTestId('dot-b')).toBeVisible();
    await expect(section.getByTestId('dot-a')).toHaveCount(0);
    await expect(
      section.locator('label', { hasText: 'Controlled b' }),
    ).toHaveClass(/is-selected/);
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('radio', { name: 'Controlled a', exact: true }),
    ).toBeChecked();
    await expect(section.getByTestId('dot-a')).toBeVisible();
    await expect(section.getByRole('radiogroup')).toHaveClass('flex gap-2');
  });

  test('a custom render on the group keeps working', async ({ page }) => {
    const group = page.getByTestId('custom-render').getByRole('radiogroup');
    await expect(group).toHaveAttribute('data-custom', '');
    await page.getByTestId('custom-render').getByText('Custom x').click();
    await expect(
      page.getByRole('radio', { name: 'Custom x', exact: true }),
    ).toBeChecked();
  });
});
