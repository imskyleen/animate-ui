import { expect, test } from '../test';
import {
  SETTLE_BUDGET,
  describeAnchoredOverlay,
  expectEntranceOnLoad,
  gotoReady,
  probeFirstFrameOf,
} from './anchored-overlay';

const PATH = '/tests/demos/react-aria/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';
const FIXTURE = '/tests/fixtures/react-aria-tooltip';
const TOOLBAR = '[data-testid="toolbar-content"]';

describeAnchoredOverlay('react-aria tooltip demo', {
  path: PATH,
  selector: CONTENT,
  kind: 'tooltip',
  open: (page) => page.getByRole('button', { name: 'Hover' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
  closeDelay: 500,
});

test.describe('react-aria tooltip warmup', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, FIXTURE);
  });

  test('the next tooltip along the toolbar swaps in at once', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Bold' }).hover();
    await expect(page.locator(TOOLBAR)).toBeVisible();
    await page.waitForTimeout(SETTLE_BUDGET);
    const probe = await probeFirstFrameOf(page, TOOLBAR, 'Italic');
    const box = (await page
      .getByRole('button', { name: 'Italic' })
      .boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 8,
    });
    const first = await probe.firstFrame();
    expect(first.opacity).toBe(1);
    expect(first.scale).toBeCloseTo(1, 3);
  });

  test('a cold tooltip plays its entrance', async ({ page }) => {
    const probe = await probeFirstFrameOf(page, TOOLBAR, 'Underline');
    await page.getByRole('button', { name: 'Underline' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(0.8);
  });
});

test.describe('react-aria tooltip API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, FIXTURE);
  });

  test('controlled TooltipTrigger, with isExiting', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await expect(content).toHaveClass(/is-open/);
    await expect(page.getByTestId('own-state-content')).toBeVisible();
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
    await expect(content).toHaveCount(0, { timeout: 1500 });
    await expect(page.getByTestId('own-state-content')).toHaveCount(0, {
      timeout: 1500,
    });
  });

  test('defaultOpen plays its entrance on page load (v1)', async ({ page }) => {
    await expectEntranceOnLoad(
      page,
      FIXTURE,
      '[data-testid="default-open-content"]',
      'tooltip',
    );
  });

  test('keyboard focus opens it, Escape closes it', async ({ page }) => {
    await page.goto(FIXTURE, {
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
      timeout: 1500,
    });
  });
});
