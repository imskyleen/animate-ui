import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, recordMotion, sample } from './motion-probe';
import {
  expectCloseWithoutHold,
  expectEscapeWithoutHold,
  expectPickHold,
} from './pick-hold';

const POPUP = '[data-slot="combobox-content"]';

test.describe('base-ui combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade from the input', async ({ page }) => {
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
    // It plays an exit, recorded in the page from before the click: a loaded
    // machine can deliver the click late, and miss it with a poll.
    await expectCloseWithoutHold(page, POPUP, () =>
      page.getByRole('option', { name: 'Astro' }).click(),
    );
    await expect(page.locator(POPUP)).toBeHidden();
    await expect(input).toHaveValue('Astro');
  });

  test('choosing an item holds the list while the check glides there', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    const open = async () => {
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
    };
    await open();
    await page.getByRole('option', { name: 'Next.js' }).click();
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
    await open();
    await expectPickHold(page, {
      popup: POPUP,
      item: 'Astro',
      check: ':scope > span:not([data-slot="item-highlight"])',
      pick: () => page.getByRole('option', { name: 'Astro' }).click(),
    });
    await expect(input).toHaveValue('Astro');
  });

  test('a first choice, with no check to glide, closes without waiting', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expectCloseWithoutHold(page, POPUP, () =>
      page.getByRole('option', { name: 'Astro' }).click(),
    );
  });

  test('Escape closes it without waiting', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expectEscapeWithoutHold(page, POPUP);
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
    const frames = recordMotion(
      page,
      { selector: '[data-slot="combobox-chip"]', text: 'Nuxt' },
      900,
    );
    await page.getByRole('option', { name: 'Nuxt' }).click();
    // Multiple selection: the list stays open.
    await expect(page.locator(POPUP)).toBeVisible();
    const recorded = await frames;
    // Fading in from transparent and from half its size, like v1's checkbox
    // check (its first frame can be read before Motion's first update).
    expect(Math.min(...recorded.map((f) => f.opacity))).toBeLessThan(0.5);
    expect(Math.min(...recorded.map((f) => f.scale))).toBeLessThan(0.9);
    expect(recorded.at(-1)!.opacity).toBe(1);
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
    // The ItemIndicator (the demo renders it as a span), not the highlight.
    const check = nuxt
      .locator(':scope > span:not([data-slot="item-highlight"])')
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

    // Recorded in the page from their first frame: a loaded machine can't
    // miss the fade.
    const chip = recordMotion(
      page,
      { selector: '[data-testid="chip-Grape"]' },
      900,
    );
    const check = recordMotion(
      page,
      { selector: '[data-testid="check-Grape"]' },
      900,
    );
    await page.getByRole('option', { name: 'Grape' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Apple,Grape');
    expect(Math.min(...(await chip).map((f) => f.opacity))).toBeLessThan(1);
    expect(Math.min(...(await check).map((f) => f.opacity))).toBeLessThan(1);

    const leaving = recordMotion(
      page,
      { selector: '[data-testid="check-Apple"]' },
      500,
    );
    await page.getByRole('option', { name: 'Apple' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Grape');
    // Deselected: the check shrinks back out and fades (kept mounted).
    const out = await leaving;
    expect(
      out.some((f) => f.scale < 0.95 && f.opacity > 0.03 && f.opacity < 0.95),
    ).toBe(true);
    expect(out.at(-1)!.opacity).toBe(0);
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
