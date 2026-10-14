import { expect, test } from '@playwright/test';

import {
  INDICATOR,
  PANEL,
  describeTabsDemo,
  describeTabsFrames,
  describeTabsHeights,
  describeTabsMounted,
  gotoTabs,
} from './tabs-helpers';

describeTabsDemo('react-aria', { selectKeys: ['ArrowRight'] });
describeTabsHeights('react-aria');
describeTabsFrames('react-aria');
describeTabsMounted('react-aria');

test.describe('react-aria tabs API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTabs(page, '/tests/fixtures/react-aria-tabs');
  });

  test("the indicator doesn't copy the selected tab's test id", async ({
    page,
  }) => {
    await expect(page.getByTestId('tab-one')).toHaveCount(1);
    await expect(page.getByTestId('tab-one')).toHaveAttribute('role', 'tab');
  });

  test('controlled selectedKey and onSelectionChange', async ({ page }) => {
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

  test('uncontrolled, disabled keys skipped', async ({ page }) => {
    const section = page.getByTestId('uncontrolled');
    await expect(section.getByText('Panel one')).toBeVisible();
    await section.getByRole('tab', { name: 'One' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: 'Three' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(section.getByText('Panel three')).toBeVisible();
    await expect(section.locator(INDICATOR)).toHaveCount(1);
  });

  test('shouldForceMount keeps inactive panels mounted', async ({ page }) => {
    const section = page.getByTestId('force-mount');
    await expect(section.locator(PANEL)).toHaveCount(1);
    await expect(section.getByTestId('forced-2')).toHaveAttribute('inert', '');
    await section.getByRole('tab', { name: 'Forced 2' }).click();
    await expect(section.getByTestId('forced-1')).toHaveAttribute('inert', '');
    await expect(section.getByTestId('forced-2')).not.toHaveAttribute('inert');
    await expect(section.locator(PANEL)).toHaveText('Forced panel 2');
  });

  test('manual keyboard activation: arrows move focus only', async ({
    page,
  }) => {
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

  test('className and style render props still work', async ({ page }) => {
    const section = page.getByTestId('render-props');
    await expect(section.getByRole('tab', { name: 'Props 1' })).toHaveClass(
      /is-selected/,
    );
    await expect(section.getByRole('tabpanel')).toHaveCSS(
      'outline-style',
      'dashed',
    );
  });
});
