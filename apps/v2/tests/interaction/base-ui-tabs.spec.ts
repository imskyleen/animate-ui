import { expect, test } from '@playwright/test';

import { INDICATOR, PANEL, describeTabsDemo, gotoTabs } from './tabs-helpers';

// Base UI moves focus with the arrows (activateOnFocus is off), Enter selects.
describeTabsDemo('base-ui', { selectKeys: ['ArrowRight', 'Enter'] });

test.describe('base-ui tabs API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTabs(page, '/tests/fixtures/base-ui-tabs');
  });

  test('controlled value and onValueChange', async ({ page }) => {
    const section = page.getByTestId('controlled');
    await section.getByRole('tab', { name: 'Controlled b' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(section.getByText('Controlled panel b')).toBeVisible();
    await expect(section.getByText('Controlled panel a')).toHaveCount(0);
    await page.getByRole('button', { name: 'Select a' }).click();
    await expect(
      section.getByRole('tab', { name: 'Controlled a' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(section.getByText('Controlled panel a')).toBeVisible();
  });

  test('uncontrolled, the first tab by default', async ({ page }) => {
    const section = page.getByTestId('uncontrolled');
    await expect(section.getByText('Uncontrolled panel 0')).toBeVisible();
    await section.getByRole('tab', { name: 'Uncontrolled 1' }).click();
    await expect(section.getByText('Uncontrolled panel 1')).toBeVisible();
    await expect(section.getByText('Uncontrolled panel 0')).toHaveCount(0);
    await expect(section.locator(INDICATOR)).toHaveCount(1);
  });

  test('keepMounted keeps inactive panels mounted and hidden', async ({
    page,
  }) => {
    const section = page.getByTestId('keep-mounted');
    await expect(section.locator(PANEL)).toHaveCount(2);
    await expect(section.getByText('Kept panel 2')).toBeHidden();
    await section.getByRole('tab', { name: 'Kept 2' }).click();
    await expect(section.getByText('Kept panel 2')).toBeVisible();
    await expect(section.getByText('Kept panel 1')).toBeHidden();
    await expect(section.locator(PANEL)).toHaveCount(2);
    await page.waitForTimeout(650);
    expect(
      await section
        .getByTestId('kept-2')
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test("Base UI's own Indicator replaces the gliding one", async ({ page }) => {
    const section = page.getByTestId('own-indicator');
    await expect(section.getByTestId('base-indicator')).toHaveCount(1);
    await expect(section.locator(INDICATOR)).toHaveCount(0);
  });

  test('activateOnFocus selects on arrow keys', async ({ page }) => {
    const section = page.getByTestId('activate-on-focus');
    await section.getByRole('tab', { name: 'Focus 1' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: 'Focus 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(section.getByText('Focus panel 2')).toBeVisible();
  });
});
