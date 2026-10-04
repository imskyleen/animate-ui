import { expect, test } from '@playwright/test';
import {
  describeAnchoredOverlay,
  describeToolbarTooltips,
  expectEntranceOnLoad,
  gotoReady,
} from './anchored-overlay';

const PATH = '/tests/demos/base-ui/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';

describeAnchoredOverlay('base-ui tooltip demo', {
  path: PATH,
  selector: CONTENT,
  kind: 'tooltip',
  open: (page) => page.getByRole('button', { name: 'Bold' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
});

describeToolbarTooltips('base-ui toolbar tooltips', PATH, CONTENT);

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
    await expect(content).toHaveCount(0, { timeout: 1500 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('defaultOpen plays its entrance on page load (v1)', async ({ page }) => {
    await expectEntranceOnLoad(
      page,
      '/tests/fixtures/base-ui-tooltip',
      '[data-testid="default-open-content"]',
      'tooltip',
    );
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
