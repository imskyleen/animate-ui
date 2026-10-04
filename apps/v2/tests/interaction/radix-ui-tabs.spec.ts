import { expect, test } from '@playwright/test';

import { INDICATOR, PANEL, describeTabsDemo, gotoTabs } from './tabs-helpers';

describeTabsDemo('radix-ui', { selectKeys: ['ArrowRight'] });

test.describe('radix-ui tabs API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTabs(page, '/tests/fixtures/radix-ui-tabs');
  });

  test('controlled value and onValueChange', async ({ page }) => {
    const section = page.getByTestId('controlled');
    await section.getByRole('tab', { name: 'Controlled b' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(section.getByText('Controlled panel b')).toBeVisible();
    await expect(section.getByText('Controlled panel a')).toHaveCount(0);
    // Changed from outside the tabs.
    await page.getByRole('button', { name: 'Select a' }).click();
    await expect(
      section.getByRole('tab', { name: 'Controlled a' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(section.getByText('Controlled panel a')).toBeVisible();
  });

  test('the import * style, uncontrolled', async ({ page }) => {
    const section = page.getByTestId('star');
    await expect(section.getByText('Star panel y')).toBeVisible();
    await section.getByRole('tab', { name: 'Star x' }).click();
    await expect(section.getByText('Star panel x')).toBeVisible();
    await expect(section.locator(INDICATOR)).toHaveCount(1);
  });

  test('forceMount keeps inactive panels mounted and hidden', async ({
    page,
  }) => {
    const section = page.getByTestId('force-mount');
    const panels = section.locator(PANEL);
    await expect(panels).toHaveCount(2);
    await expect(section.getByText('Forced panel 2')).toBeHidden();
    await section.getByRole('tab', { name: 'Forced 2' }).click();
    await expect(section.getByText('Forced panel 2')).toBeVisible();
    await expect(section.getByText('Forced panel 1')).toBeHidden();
    await expect(panels).toHaveCount(2);
    await page.waitForTimeout(650);
    expect(
      await section
        .getByTestId('forced-2')
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test('manual activation: arrows move focus only', async ({ page }) => {
    const section = page.getByTestId('manual');
    await section.getByRole('tab', { name: 'Manual 1' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: 'Manual 2' })).toBeFocused();
    await expect(
      section.getByRole('tab', { name: 'Manual 1' }),
    ).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(
      section.getByRole('tab', { name: 'Manual 2' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});
