import { expect, test } from '@playwright/test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

describeAnchoredOverlay('base-ui preview-card demo', {
  path: '/tests/demos/base-ui/hover-card',
  selector: '[data-slot="hover-card-content"]',
  open: (page) => page.getByRole('button', { name: 'Hover Here' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
  closeDelay: 100,
});

test.describe('base-ui preview-card API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/base-ui-preview-card');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('link', { name: 'Controlled link' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 1500 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('keepMounted keeps the closed popup mounted and hidden', async ({
    page,
  }) => {
    const content = page.getByTestId('keep-mounted-content');
    await expect(content).toHaveCount(1);
    await expect(content).toBeHidden();
    await page.getByRole('link', { name: 'Kept mounted link' }).hover();
    await expect(content).toBeVisible();
  });
});
