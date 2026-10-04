import { expect, test } from '@playwright/test';
import {
  describeAnchoredOverlay,
  describeToolbarTooltips,
  expectEntranceOnLoad,
  gotoReady,
} from './anchored-overlay';

const PATH = '/tests/demos/radix-ui/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';

describeAnchoredOverlay('radix-ui tooltip demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: 'Bold' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
});

describeToolbarTooltips('radix-ui toolbar tooltips', PATH, CONTENT);

test.describe('radix-ui tooltip API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/radix-ui-tooltip');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 1500 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('defaultOpen plays its entrance on page load (v1)', async ({ page }) => {
    await expectEntranceOnLoad(
      page,
      '/tests/fixtures/radix-ui-tooltip',
      '[data-testid="default-open-content"]',
      'popover',
    );
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
    await page.getByRole('button', { name: 'Force mounted trigger' }).hover();
    await expect(content).toBeVisible();
    expect(await state()).toEqual({ inert: false, visibility: 'visible' });
  });

  test('keyboard focus opens it, Escape closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Star trigger' }).focus();
    await expect(page.getByTestId('star-content')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('star-content')).toHaveCount(0, {
      timeout: 1500,
    });
  });
});
