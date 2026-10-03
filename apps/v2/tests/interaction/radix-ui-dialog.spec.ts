import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dialog-content"]';
const OVERLAY = '[data-slot="dialog-overlay"]';
const SHEET = '[data-slot="sheet-content"]';

/** Translation as a share of the element's own size, and opacity. */
const offset = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      const box = el as HTMLElement;
      return {
        x: m.m41 / box.offsetWidth,
        y: m.m42 / box.offsetHeight,
        opacity: Number(cs.opacity),
      };
    });

test.describe('radix-ui dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('content enters from 0.95, centered, and settles', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);

    // Modals stay centered: the origin is the middle of the content.
    const centered = await page.locator(CONTENT).evaluate((el) => {
      const [x, y] = getComputedStyle(el).transformOrigin.split(' ');
      const box = el as HTMLElement;
      return (
        Math.abs(parseFloat(x!) - box.offsetWidth / 2) < 1 &&
        Math.abs(parseFloat(y!) - box.offsetHeight / 2) < 1
      );
    });
    expect(centered).toBe(true);

    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBeCloseTo(1, 3);
  });

  test('the overlay fades in', async ({ page }) => {
    const probe = await probeFirstFrame(page, OVERLAY);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBe(1);
    await page.waitForTimeout(650);
    expect((await sample(page, OVERLAY)).opacity).toBe(1);
  });

  test('exits faster than it enters, visibly, then unmounts', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    const mid = await sample(page, CONTENT);
    expect(mid.opacity).toBeLessThan(1);
    expect(mid.opacity).toBeGreaterThan(0);
    expect(mid.scale).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 400 });
    await expect(page.locator(OVERLAY)).toHaveCount(0);
  });

  test('keyboard: opens with Enter, traps focus, gives it back on close', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Edit profile' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    // Radix focuses the first field right away, while the entrance plays.
    await expect(
      page.getByRole('textbox', { name: 'Name', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 600 });
    await expect(trigger).toBeFocused();
  });

  test('reopening during the exit comes back fully', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Edit profile' });
    await trigger.click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await trigger.click({ force: true });
    await page.waitForTimeout(700);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBeCloseTo(1, 3);
    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('reduced motion: no scaling, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeCloseTo(1, 3);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui dialog: sheet demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dialog-sheet', {
      waitUntil: 'networkidle',
    });
  });

  const travel = {
    top: { axis: 'y', sign: -1 },
    right: { axis: 'x', sign: 1 },
    bottom: { axis: 'y', sign: 1 },
    left: { axis: 'x', sign: -1 },
  } as const;

  for (const [side, { axis, sign }] of Object.entries(travel)) {
    test(`slides in from the ${side} edge without fading`, async ({ page }) => {
      await page.getByRole('button', { name: side, exact: true }).click();
      await page.locator(SHEET).waitFor();
      await expect(page.locator(SHEET)).toHaveAttribute('data-side', side);
      const early = await offset(page, SHEET);
      expect(early[axis] * sign).toBeGreaterThan(0.1);
      expect(early.opacity).toBe(1);

      await page.waitForTimeout(650);
      const settled = await offset(page, SHEET);
      expect(Math.abs(settled[axis])).toBeLessThan(0.001);
    });
  }

  test('slides back out faster, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'right', exact: true }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    expect((await offset(page, SHEET)).x).toBeGreaterThan(0.05);
    await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 400 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'left', exact: true }).click();
    await page.locator(SHEET).waitFor();
    const early = await offset(page, SHEET);
    expect(Math.abs(early.x)).toBeLessThan(0.001);
    expect(early.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui dialog API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('defaultOpen, with the import * style', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Default open dialog' });
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close star' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 600 });
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    await page.getByRole('button', { name: 'Open from outside' }).click();
    const dialog = page.getByRole('dialog', { name: 'Controlled dialog' });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
    await expect(dialog).toHaveCount(0, { timeout: 500 });

    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-changes')).toHaveText(
      'false,true',
    );
  });

  test('forceMount keeps closed content mounted, hidden and inert', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/radix-ui-dialog-force-mount', {
      waitUntil: 'networkidle',
    });
    const content = page.getByTestId('kept-content');
    const overlay = page.getByTestId('kept-overlay');
    const state = () =>
      content.evaluate((el) => ({
        visibility: getComputedStyle(el).visibility,
        inert: (el as HTMLElement).inert,
        overlay: getComputedStyle(
          document.querySelector('[data-testid="kept-overlay"]')!,
        ).pointerEvents,
      }));
    await expect(content).toHaveCount(1);
    await expect(overlay).toHaveCount(1);
    expect(await state()).toEqual({
      visibility: 'hidden',
      inert: true,
      overlay: 'none',
    });

    // Radix hides the rest of the page from assistive tech while a modal
    // Content is mounted, even closed: find the trigger by its text.
    await page.getByText('Force mounted trigger').click();
    await expect(content).toBeVisible();
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="kept-content"]')).opacity).toBe(
      1,
    );
    expect((await state()).inert).toBe(false);

    await page.getByText('Close kept').click();
    await page.waitForTimeout(500);
    await expect(content).toHaveCount(1);
    expect(await state()).toEqual({
      visibility: 'hidden',
      inert: true,
      overlay: 'none',
    });
  });

  test('a Content without a Portal animates in and out', async ({ page }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    const probe = await probeFirstFrame(page, '[data-testid="inline-content"]');
    await page.getByRole('button', { name: 'Inline trigger' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Close inline' }).click();
    await expect(page.getByTestId('inline-content')).toHaveCount(0, {
      timeout: 500,
    });
  });

  test('alert dialog: focuses Cancel, ignores outside clicks, closes with Cancel', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    await page.getByRole('button', { name: 'Alert trigger' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Keep editing' }),
    ).toBeFocused();
    await page.waitForTimeout(650);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('alert-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByTestId('alert-state')).toHaveText('closed');
    await expect(dialog).toHaveCount(0, { timeout: 500 });
  });
});
