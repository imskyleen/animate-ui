import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const POPUP = '[data-slot="combobox-content"]';

test.describe('base-ui combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 200ms scale and fade from the input', async ({ page }) => {
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
    // Below the input: it grows from its top edge (minus the side offset).
    expect(parseFloat(first.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('filtering while typing is instant', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expect(page.getByRole('option')).toHaveCount(7);

    await input.pressSequentially('st');
    // No per-item exit: the list is filtered on the next frame.
    await expect(page.getByRole('option')).toHaveCount(3, { timeout: 100 });
    expect((await sample(page, '[role="option"]:first-child')).opacity).toBe(1);
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  test('picking an item closes it the same way', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Astro' }).click();

    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(input).toHaveValue('Astro');
  });

  test('keyboard: arrows move the highlight, Enter picks', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.keyboard.press('ArrowDown');
    const highlighted = page.locator('[role="option"][data-highlighted]');
    await expect(highlighted).toHaveCount(1);
    const name = await highlighted.textContent();
    await page.keyboard.press('Enter');
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(input).toHaveValue(name!.trim());
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui combobox chips demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/combobox-multiple', {
      waitUntil: 'networkidle',
    });
  });

  test('chips there on mount do not animate, added chips pop in', async ({
    page,
  }) => {
    const chip = (name: string) =>
      `[data-slot="combobox-chip"]:has-text("${name}")`;
    expect((await sample(page, chip('Astro'))).opacity).toBe(1);

    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt' }).click();
    // Multiple selection: the list stays open.
    await expect(page.locator(POPUP)).toBeVisible();
    await page.waitForTimeout(40);
    const entering = await sample(page, chip('Nuxt'));
    expect(entering.opacity).toBeLessThan(1);
    // From half its size, like v1's checkbox check.
    expect(entering.scale).toBeLessThan(0.9);
    await page.waitForTimeout(650);
    expect((await sample(page, chip('Nuxt'))).opacity).toBe(1);
  });

  test('checks pop in with the selection, Backspace removes instantly', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt' });
    await nuxt.click();
    await page.waitForTimeout(40);
    const check = nuxt
      .locator('[data-slot="combobox-item-indicator"], span')
      .last();
    const opacity = await check.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(1);

    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Frameworks' }).press('Backspace');
    await expect(
      page.locator('[data-slot="combobox-chip"]', { hasText: 'Nuxt' }),
    ).toHaveCount(0, { timeout: 50 });
  });
});

test.describe('base-ui combobox API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and value, with their callbacks', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Controlled' });
    await expect(input).toHaveValue('Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popup')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(page.getByTestId('completed')).toHaveText('true', {
      timeout: 1000,
    });

    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('Cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-popup')).toBeHidden({
      timeout: 600,
    });
    await expect(page.getByTestId('completed')).toHaveText('true,false');
    await expect(input).toHaveValue('Cherry');
  });

  test('multiple (barrel import): chips, checks and removal', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="check-Apple"]')).opacity).toBe(1);

    await page.getByRole('option', { name: 'Grape' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Apple,Grape');
    await page.waitForTimeout(40);
    expect(
      (await sample(page, '[data-testid="chip-Grape"]')).opacity,
    ).toBeLessThan(1);
    expect(
      (await sample(page, '[data-testid="check-Grape"]')).opacity,
    ).toBeLessThan(1);

    await page.getByRole('option', { name: 'Apple' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Grape');
    // Deselected: the check goes at once, like v1's checkbox items.
    await expect(page.getByTestId('check-Apple')).toHaveCount(0, {
      timeout: 150,
    });
    await expect(page.getByTestId('chip-Apple')).toHaveCount(0);
  });

  test('keepMounted keeps the closed popup in the DOM, hidden', async ({
    page,
  }) => {
    const popup = page.getByTestId('kept-popup');
    await expect(popup).toHaveCount(1);
    await expect(popup).toBeHidden();
    await page.getByRole('combobox', { name: 'Kept mounted' }).click();
    await page.keyboard.press('ArrowDown');
    await expect(popup).toBeVisible();
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden({ timeout: 600 });
    await expect(popup).toHaveCount(1);
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.keyboard.press('ArrowDown');
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

test('base-ui combobox docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/base-ui/combobox', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Combobox');
  expect(errors).toEqual([]);
});

describeMenuHighlight('base-ui combobox highlight', {
  path: '/tests/demos/base-ui/combobox',
  open: async (page) => {
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('option').nth(0),
  second: (page) => page.getByRole('option').nth(1),
});
