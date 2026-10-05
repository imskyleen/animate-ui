import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const POPOVER = '[data-slot="select-content"]';

test.describe('react-aria select demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/select', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPOVER);
    await page.locator('[data-slot="select-trigger"]').click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPOVER);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
    // Placed below the trigger: it grew from its top edge.
    expect(parseFloat(settled.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);
  });

  test('closes the same way, and the trigger shows the choice', async ({
    page,
  }) => {
    const trigger = page.locator('[data-slot="select-trigger"]');
    await trigger.click();
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Lora' }).click();

    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, POPOVER)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toContainText('Lora');
  });

  test('keyboard: arrows move the focused item instantly', async ({ page }) => {
    const trigger = page.locator('[data-slot="select-trigger"]');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(POPOVER)).toHaveCount(1);
    const geist = page.getByRole('option', { name: 'Geist', exact: true });
    await expect(geist).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Satoshi' })).toBeFocused({
      timeout: 50,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toContainText('Geist');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPOVER);
    await page.locator('[data-slot="select-trigger"]').click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('react-aria select API', () => {
  test.describe.configure({ timeout: 180_000 });
  test('controlled value and open, with the animated Popover', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/react-aria-select', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popover')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');

    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    // exitTransition reaches the Popover.
    await expect(page.getByTestId('controlled-popover')).toHaveCount(0, {
      timeout: 200,
    });
  });
});

test('react-aria select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/react-aria/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});

describeMenuHighlight('react-aria select highlight', {
  path: '/tests/demos/react-aria/select',
  open: async (page) => {
    await page.locator('[data-slot="select-trigger"]').click();
    await page.waitForTimeout(400);
  },
  // Geist is the value: React Aria focuses it as the list opens.
  first: (page) => page.getByRole('option', { name: 'Geist', exact: true }),
  second: (page) => page.getByRole('option', { name: 'Satoshi' }),
  keyboardNext: 'ArrowDown',
  highlightedOnOpen: true,
});
