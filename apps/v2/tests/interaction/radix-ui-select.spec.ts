import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const LIST = '[role="listbox"]';

test.describe('radix-ui select demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/select', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a scale and a fade from the trigger, then settles', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, LIST);
    await page.getByRole('combobox', { name: 'Font' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    expect(first.scale).toBeLessThan(1);
    // Popper below the trigger: it grows from its top edge.
    expect(first.origin.split(' ')[1]).toBe('0px');

    await page.waitForTimeout(650);
    const settled = await sample(page, LIST);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes faster than it opens, and the trigger keeps the label', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.click();
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Lora' }).click();

    // Still on screen for the exit, gone within the 400ms budget.
    await page.waitForTimeout(60);
    await expect(page.locator(LIST)).toHaveCount(1);
    expect((await sample(page, LIST)).opacity).toBeLessThan(1);
    await expect(page.locator(LIST)).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toHaveText('Lora');
  });

  test('reopening mid-exit retargets instead of restarting', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.click();
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    const closing = await sample(page, LIST);
    await trigger.click();
    await page.waitForTimeout(16);
    const reopened = await sample(page, LIST);
    // It continues from where the exit left it, not from the 0.95 start.
    expect(reopened.opacity).toBeGreaterThan(0.2);
    expect(reopened.scale).toBeGreaterThanOrEqual(closing.scale - 0.01);
    await expect(page.locator(LIST)).toHaveCount(1);
    await page.waitForTimeout(650);
    expect((await sample(page, LIST)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight instantly, Escape closes', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('option', { name: 'Geist', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('ArrowDown');
    // Radix moves focus in a timeout: no animation in between.
    await expect(page.getByRole('option', { name: 'Satoshi' })).toBeFocused({
      timeout: 50,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(LIST)).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText('Geist');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, LIST);
    await page.getByRole('combobox', { name: 'Font' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui select API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-select', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open, value and their callbacks', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Controlled' });
    await expect(trigger).toHaveText('Controlled Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-content')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');

    await page.getByRole('option', { name: 'Controlled Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-content')).toHaveCount(0, {
      timeout: 600,
    });
    await expect(trigger).toHaveText('Controlled Cherry');
  });

  test('item-aligned (the default, import * style) fades without scaling', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(
      page,
      '[data-testid="aligned-content"]',
    );
    await page.getByRole('combobox', { name: 'Aligned' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    // The selected item is lined up with the trigger, as in Radix.
    await expect(
      page.getByRole('option', { name: 'Aligned Cherry' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('aligned-content')).toHaveCount(0, {
      timeout: 600,
    });
    await expect(page.getByRole('combobox', { name: 'Aligned' })).toHaveText(
      'Aligned Cherry',
    );
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.waitForTimeout(50);
    const open = await sample(page, '[data-testid="instant-content"]');
    expect(open.opacity).toBe(1);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('instant-content')).toHaveCount(0, {
      timeout: 150,
    });
  });

  test('forceMount on the Portal keeps the closed list mounted, hidden and inert', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Mount forceMount' }).click();
    const content = page.getByTestId('forced-content');
    await expect(content).toHaveCount(1);
    await expect(content).toHaveAttribute('data-state', 'closed');
    await expect(content).toHaveAttribute('inert', '');
    expect((await sample(page, '[data-testid="forced-content"]')).opacity).toBe(
      0,
    );
  });
});

test('radix-ui select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/radix-ui/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});
