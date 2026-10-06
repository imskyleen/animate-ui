import { expect, test } from '@playwright/test';
import {
  describeAnchoredOverlay,
  gotoReady,
  probeFirstFrameOf,
} from './anchored-overlay';

describeAnchoredOverlay('react-aria hover-card demo', {
  path: '/tests/demos/react-aria/hover-card',
  selector: '[data-slot="hover-card-content"]',
  open: (page) => page.getByRole('button', { name: 'Hover Here' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
  // The demo's closeDelay (shadcn/ui's).
  closeDelay: 100,
});

test.describe('react-aria hover-card API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/react-aria-hover-card');
  });

  test('controlled PreviewTrigger', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('link', { name: 'Controlled link' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 1500 });
  });

  test('swapping previews during the warmup skips the animations', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'First link' }).hover();
    await expect(page.getByText('First card')).toBeVisible();
    await page.waitForTimeout(650);
    const probe = await probeFirstFrameOf(
      page,
      '[data-testid="swap-content"]',
      'Second card',
    );
    await page.getByRole('link', { name: 'Second link' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBe(1);
    expect(first.scale).toBeCloseTo(1, 3);
  });
});
