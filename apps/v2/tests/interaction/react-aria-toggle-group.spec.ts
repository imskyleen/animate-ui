import { expect, test } from '@playwright/test';

import { describeToggleGroupDemo } from './controls-helpers';

describeToggleGroupDemo('react-aria', true);

test.describe('react-aria toggle group API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-toggle-group', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled selectedKeys and onSelectionChange', async ({ page }) => {
    const section = page.getByTestId('controlled');
    await section.getByText('Controlled b').click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('a');
    await expect(section.getByText('Controlled a')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  test('multiple selection, without the sliding surface', async ({ page }) => {
    await page.getByRole('button', { name: 'Multiple y', exact: true }).click();
    // Several items pressed: no surface slides between them.
    expect(
      await page
        .getByRole('button', { name: 'Multiple y', exact: true })
        .evaluate((el) => el.closest('[data-animate-ui-highlight]') === null),
    ).toBe(true);
    await expect(
      page.getByRole('button', { name: 'Multiple x', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Multiple y', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
