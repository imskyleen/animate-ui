import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const POPUP = '[data-slot="select-content"]';

test.describe('base-ui select demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/select', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a scale and a fade from the trigger, then settles', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: 'Font' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    expect(first.scale).toBeLessThan(1);
    // Below the trigger: it grows from its top edge (minus the side offset).
    expect(parseFloat(first.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes faster than it opens, then unmounts', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.click();
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Lora' }).click();

    await page.waitForTimeout(60);
    await expect(page.locator(POPUP)).toHaveCount(1);
    expect((await sample(page, POPUP)).opacity).toBeLessThan(1);
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
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
    await trigger.click();
    await page.waitForTimeout(16);
    expect((await sample(page, POPUP)).opacity).toBeGreaterThan(0.2);
    await page.waitForTimeout(650);
    await expect(page.locator(POPUP)).toHaveCount(1);
    expect((await sample(page, POPUP)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight instantly', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(POPUP)).toHaveCount(1);
    await page.waitForTimeout(650);
    const geist = page.getByRole('option', { name: 'Geist', exact: true });
    await expect(geist).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Satoshi' })).toHaveAttribute(
      'data-highlighted',
      '',
      { timeout: 50 },
    );
    await page.keyboard.press('Escape');
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(trigger).toHaveText('Geist');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: 'Font' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui select API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-select', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and value, callbacks and actionsRef', async ({
    page,
  }) => {
    await expect(page.getByTestId('actions')).toHaveText('actions');
    const trigger = page.getByRole('combobox', { name: 'Controlled' });
    await expect(trigger).toHaveText('Controlled Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popup')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    // Base UI skips it with an actionsRef: Animate UI calls it after the entrance.
    await expect(page.getByTestId('completed')).toHaveText('true', {
      timeout: 1000,
    });

    await page.getByRole('option', { name: 'Controlled Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-popup')).toBeHidden({
      timeout: 600,
    });
    await expect(page.getByTestId('completed')).toHaveText('true,false');
    await expect(trigger).toHaveText('Controlled Cherry');
  });

  test('align-with-trigger (the default) fades without scaling', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, '[data-testid="aligned-popup"]');
    await page.getByRole('combobox', { name: 'Aligned' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('aligned-popup')).toBeHidden({
      timeout: 600,
    });
  });

  test('multiple: the list stays open and checks animate in and out', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.waitForTimeout(650);
    // Already selected: shown at once, no entrance.
    expect((await sample(page, '[data-testid="check-apple"]')).opacity).toBe(1);

    await page.getByRole('option', { name: 'Multiple Cherry' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('apple,cherry');
    await page.waitForTimeout(40);
    const appearing = await sample(page, '[data-testid="check-cherry"]');
    expect(appearing.opacity).toBeLessThan(1);
    expect(appearing.scale).toBeLessThan(1);
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="check-cherry"]')).opacity).toBe(
      1,
    );

    await page.getByRole('option', { name: 'Multiple Apple' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('cherry');
    await page.waitForTimeout(500);
    expect((await sample(page, '[data-testid="check-apple"]')).opacity).toBe(0);
    await expect(page.getByTestId('multiple-popup')).toBeVisible();
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.waitForTimeout(50);
    expect((await sample(page, '[data-testid="instant-popup"]')).opacity).toBe(
      1,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('instant-popup')).toBeHidden({
      timeout: 150,
    });
  });
});

test('base-ui select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/base-ui/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});
