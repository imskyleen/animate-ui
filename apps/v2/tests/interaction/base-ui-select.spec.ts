import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const POPUP = '[data-slot="select-content"]';

test.describe('base-ui select demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/select', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: 'Font' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
    // Below the trigger: it grows from its top edge (minus the side offset).
    expect(parseFloat(first.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);

    await page.waitForTimeout(400);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    await trigger.click();
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Lora' }).click();

    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(trigger).toHaveText('Lora');
  });

  test('reopening mid-exit retargets instead of restarting', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Font' });
    // Measured first: an open select hides the page from assistive tech.
    const box = (await trigger.boundingBox())!;
    await trigger.click();
    await page.waitForTimeout(650);
    const element = await page.locator(POPUP).elementHandle();
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(0.95);
    // Straight back, without actionability waits: the exit takes 250ms.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(650);
    // The same element: it retargeted instead of remounting.
    expect(await element!.evaluate((el) => el.isConnected)).toBe(true);
    expect((await sample(page, POPUP)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight', async ({ page }) => {
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
  test.describe.configure({ timeout: 180_000 });
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

  test('multiple: the list stays open, checks pop in and go at once', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.waitForTimeout(650);
    // Already selected: its check popped in as the list opened.
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
    // Deselected: the check goes at once, like v1's checkbox items.
    await expect(page.getByTestId('check-apple')).toHaveCount(0, {
      timeout: 150,
    });
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

describeMenuHighlight('base-ui select highlight', {
  path: '/tests/demos/base-ui/select',
  open: async (page) => {
    await page.getByRole('combobox', { name: 'Font' }).click();
    await page.waitForTimeout(400);
  },
  // Geist is the value: Base UI highlights it as the list opens.
  first: (page) => page.getByRole('option', { name: 'Geist', exact: true }),
  second: (page) => page.getByRole('option', { name: 'Satoshi' }),
  keyboardNext: 'ArrowDown',
  highlightedOnOpen: true,
});
