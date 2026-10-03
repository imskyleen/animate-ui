import { expect, test } from '@playwright/test';
import {
  describeAnchoredOverlay,
  describeWarmTooltips,
  gotoReady,
} from './anchored-overlay';

const PATH = '/tests/demos/react-aria/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';

describeAnchoredOverlay('react-aria tooltip demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: 'Bold' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
});

describeWarmTooltips('react-aria warm tooltips', PATH, CONTENT);

test.describe('react-aria tooltip API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/react-aria-tooltip');
  });

  test('controlled TooltipTrigger, with isExiting', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await expect(content).toHaveClass(/is-open/);
    // Tooltip state on the Tooltip itself follows too.
    await expect(page.getByTestId('own-state-content')).toBeVisible();
    // The isExiting render prop shows up while the exit plays.
    const sawExiting = page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const observer = new MutationObserver(() => {
            const el = document.querySelector(
              '[data-testid="controlled-content"]',
            );
            if (el?.classList.contains('is-exiting')) {
              observer.disconnect();
              resolve(el.hasAttribute('data-exiting'));
            }
          });
          observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
          });
          setTimeout(() => resolve(false), 3000);
        }),
    );
    await page.mouse.move(5, 5, { steps: 4 });
    expect(await sawExiting).toBe(true);
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 600 });
    await expect(page.getByTestId('own-state-content')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('defaultOpen shows without an entrance', async ({ page }) => {
    const content = page.getByTestId('default-open-content');
    await expect(content).toBeVisible();
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test('keyboard focus opens it, Escape closes it', async ({ page }) => {
    // Fresh page, no pointer moves: keyboard modality from the start.
    await page.goto('/tests/fixtures/react-aria-tooltip', {
      waitUntil: 'networkidle',
      timeout: 150_000,
    });
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Controlled trigger' }),
    ).toBeFocused();
    await expect(page.getByTestId('controlled-content')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('controlled-content')).toHaveCount(0, {
      timeout: 600,
    });
  });
});
