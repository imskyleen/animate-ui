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

test.describe('base-ui dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dialog', {
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
    // Base UI focuses the first field right away, while the entrance plays.
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

test.describe('base-ui dialog: sheet demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dialog-sheet', {
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

test.describe('base-ui dialog API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and onOpenChange with its details', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open from outside' }).click();
    const dialog = page.getByRole('dialog', { name: 'Controlled dialog' });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-reasons')).toHaveText(
      'close-press',
    );
    await expect(dialog).toHaveCount(0, { timeout: 500 });

    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-reasons')).toHaveText(
      'close-press,trigger-press',
    );
  });

  test('eventDetails.cancel() keeps it open', async ({ page }) => {
    await page.getByRole('button', { name: 'Sticky trigger' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sticky dialog' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
    await page.getByRole('button', { name: 'Close sticky' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 500 });
  });

  test('a detached trigger opens it through a handle, with its payload', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Detached trigger' }).click();
    const dialog = page.getByRole('dialog', { name: 'Handle dialog' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Opened from the handle.');
    await page.getByRole('button', { name: 'Close handle' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 500 });
  });

  test('keepMounted: the exit plays, then the popup stays hidden', async ({
    page,
  }) => {
    const popup = page.getByTestId('kept-popup');
    await expect(popup).toHaveCount(1);
    await expect(popup).toBeHidden();
    await page.getByRole('button', { name: 'Kept trigger' }).click();
    await expect(popup).toBeVisible();
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="kept-popup"]')).opacity).toBe(1);

    await page.getByRole('button', { name: 'Close kept' }).click();
    await page.waitForTimeout(80);
    // Still visible while its exit plays…
    await expect(popup).toBeVisible();
    expect(
      (await sample(page, '[data-testid="kept-popup"]')).opacity,
    ).toBeLessThan(1);
    // …then hidden, but still mounted.
    await expect(popup).toBeHidden({ timeout: 500 });
    await expect(popup).toHaveCount(1);
  });

  test('alert dialog: ignores outside clicks, closes with Close', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Alert trigger' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(650);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('alert-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByTestId('alert-state')).toHaveText('closed');
    await expect(dialog).toHaveCount(0, { timeout: 500 });
  });
});
