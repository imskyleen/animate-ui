import { expect, test } from '@playwright/test';

import { disclosureDemoTests, gotoHydrated } from './disclosure-timeline';

disclosureDemoTests('radix-ui collapsible demo', {
  url: '/tests/demos/radix-ui/collapsible',
  panel: '[data-slot="collapsible-content"]',
  closed: {
    trigger: 'Show all changes',
    text: 'A CLI that animates your shadcn/ui components',
  },
  closedState: 'unmounted',
  // v1's Radix Collapsible has no mask reveal.
  mask: false,
});

test.describe('radix-ui collapsible API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/radix-ui-collapsible');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    await expect(
      page.getByText('Controlled content', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Controlled', exact: true }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('false');
    await expect(
      page.getByText('Controlled content', { exact: true }),
    ).toHaveCount(0, {
      timeout: 600,
    });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('true');
    await expect(
      page.getByText('Controlled content', { exact: true }),
    ).toBeVisible();
  });

  test('uncontrolled, with the import * style', async ({ page }) => {
    await expect(page.getByText('Uncontrolled content')).toBeVisible();
    await page.getByRole('button', { name: 'Uncontrolled' }).click();
    await expect(page.getByText('Uncontrolled content')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('forceMount keeps closed content out of reach', async ({ page }) => {
    const inert = () =>
      page
        .getByText('Hidden button')
        .evaluate((el) => el.closest('[inert]') !== null);
    expect(await inert()).toBe(true);
    await page.getByRole('button', { name: 'Force mounted' }).click();
    await expect(
      page.getByRole('button', { name: 'Hidden button' }),
    ).toBeVisible({ timeout: 800 });
    expect(await inert()).toBe(false);
    await page.getByRole('button', { name: 'Force mounted' }).click();
    await page.waitForTimeout(500);
    // Still mounted, collapsed and inert.
    await expect(page.getByText('Hidden button')).toHaveCount(1);
    expect(await inert()).toBe(true);
  });

  test('the Collapsible alias of Root, and disabled', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Disabled' });
    await expect(trigger).toBeDisabled();
    await expect(page.getByText('Disabled content')).toHaveCount(0);
  });
});
