import { expect, test } from '@playwright/test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

describeAnchoredOverlay('radix-ui hover-card demo', {
  path: '/tests/demos/radix-ui/hover-card',
  selector: '[data-slot="hover-card-content"]',
  open: (page) => page.getByRole('link', { name: '@animate-ui' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
  closeDelay: 300,
});

test.describe('radix-ui hover-card API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/radix-ui-hover-card');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('link', { name: 'Controlled link' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 600 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('forceMount keeps closed content mounted, hidden and inert', async ({
    page,
  }) => {
    const content = page.getByTestId('force-mount-content');
    const state = () =>
      content.evaluate((el) => ({
        inert: el.closest('[inert]') !== null,
        visibility: getComputedStyle(el).visibility,
      }));
    expect(await state()).toEqual({ inert: true, visibility: 'hidden' });
    await page.getByRole('link', { name: 'Force mounted link' }).hover();
    await expect(content).toBeVisible();
    expect(await state()).toEqual({ inert: false, visibility: 'visible' });
  });

  test('the import * style', async ({ page }) => {
    await page.getByRole('link', { name: 'Star link' }).hover();
    await expect(page.getByTestId('star-content')).toBeVisible();
  });
});
