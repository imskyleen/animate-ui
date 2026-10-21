import { expect, test } from '../test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

describeAnchoredOverlay('vue-reka-ui hover-card demo', {
  path: '/tests/vue-demos/reka-ui/hover-card',
  selector: '[data-slot="hover-card-content"]',
  open: (page) => page.getByRole('button', { name: '@nuxt' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
  closeDelay: 100,
});

test.describe('vue-reka-ui hover-card API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/vue-demos/fixtures/reka-ui-hover-card');
  });

  test('open and update:open', async ({ page }) => {
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

  test('force-mount keeps closed content mounted, hidden and inert', async ({
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

  test('a second root', async ({ page }) => {
    await page.getByRole('link', { name: 'Star link' }).hover();
    await expect(page.getByTestId('star-content')).toBeVisible();
  });
});
