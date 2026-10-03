import { expect, test } from '@playwright/test';
import {
  describeAnchoredOverlay,
  describeWarmTooltips,
  gotoReady,
} from './anchored-overlay';

const PATH = '/tests/demos/base-ui/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';

describeAnchoredOverlay('base-ui tooltip demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: 'Bold' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
});

describeWarmTooltips('base-ui warm tooltips', PATH, CONTENT);

test.describe('base-ui tooltip API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/base-ui-tooltip');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 600 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('defaultOpen shows without an entrance', async ({ page }) => {
    const content = page.getByTestId('default-open-content');
    await expect(content).toBeVisible();
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test('keepMounted keeps the closed popup mounted and hidden', async ({
    page,
  }) => {
    const content = page.getByTestId('keep-mounted-content');
    await expect(content).toHaveCount(1);
    await expect(content).toBeHidden();
    await page.getByRole('button', { name: 'Kept mounted trigger' }).hover();
    await expect(content).toBeVisible();
  });
});
