import { expect, test } from '@playwright/test';

import {
  SHEET_TRAVEL,
  expectDialogEntrance,
  expectDialogExit,
  expectDialogSettled,
  expectSheetEntrance,
  expectSheetExit,
  expectSheetSettled,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';

const CONTENT = '[data-slot="dialog-content"]';
const OVERLAY = '[data-slot="dialog-overlay"]';
const SHEET = '[data-slot="sheet-content"]';

test.describe('base-ui dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('opens like v1: tipped back, small and blurred, upright on a spring after its backdrop', async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await expectDialogSettled(page, CONTENT);
    expectDialogEntrance(await timeline.stop());

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
    const overlay = await readState(page, OVERLAY);
    expect(overlay.opacity).toBe(1);
    expect(overlay.blur).toBe(0);
  });

  test('closes like v1: tips back on the same spring, outlasting its backdrop, then unmounts', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await expectDialogSettled(page, CONTENT);
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 2500 });
    await expect(page.locator(OVERLAY)).toHaveCount(0);
    expectDialogExit(await timeline.stop());
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
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 2500 });
    await expect(trigger).toBeFocused();
  });

  test('reopening during the exit comes back fully', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Edit profile' });
    await trigger.click();
    await expectDialogSettled(page, CONTENT);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await trigger.click({ force: true });
    await expectDialogSettled(page, CONTENT);
    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('reduced motion: no tilt or scale, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const timeline = await recordTimeline(page, { content: CONTENT });
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await expectDialogSettled(page, CONTENT);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(Math.abs(first.tilt)).toBeLessThan(0.5);
    expect(first.scale).toBeCloseTo(1, 2);
    expect(first.opacity).toBeLessThan(0.5);
  });
});

test.describe('base-ui dialog: sheet demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dialog-sheet', {
      waitUntil: 'networkidle',
    });
  });

  for (const side of Object.keys(
    SHEET_TRAVEL,
  ) as (keyof typeof SHEET_TRAVEL)[]) {
    test(`slides and fades in from the ${side} edge like v1's sheet`, async ({
      page,
    }) => {
      const timeline = await recordTimeline(page, { content: SHEET });
      await page.getByRole('button', { name: side, exact: true }).click();
      await expect(page.locator(SHEET)).toHaveAttribute('data-side', side);
      await expectSheetSettled(page, SHEET, side);
      expectSheetEntrance(await timeline.stop(), side);
    });
  }

  test('slides and fades back out, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'right', exact: true }).click();
    await expectSheetSettled(page, SHEET, 'right');
    const timeline = await recordTimeline(page, { content: SHEET });
    await page.keyboard.press('Escape');
    await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
    expectSheetExit(await timeline.stop(), 'right');
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const timeline = await recordTimeline(page, { content: SHEET });
    await page.getByRole('button', { name: 'left', exact: true }).click();
    await expectSheetSettled(page, SHEET, 'left');
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(Math.abs(first.x)).toBeLessThan(0.001);
    expect(first.opacity).toBeLessThan(1);
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
    await expect(dialog).toHaveCount(0, { timeout: 2500 });

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
    await page.waitForTimeout(900);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
    await page.getByRole('button', { name: 'Close sticky' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });

  test('a detached trigger opens it through a handle, with its payload', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Detached trigger' }).click();
    const dialog = page.getByRole('dialog', { name: 'Handle dialog' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Opened from the handle.');
    await page.getByRole('button', { name: 'Close handle' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });

  test('keepMounted: the exit plays, then the popup stays hidden', async ({
    page,
  }) => {
    const popup = page.getByTestId('kept-popup');
    await expect(popup).toHaveCount(1);
    await expect(popup).toBeHidden();
    await page.getByRole('button', { name: 'Kept trigger' }).click();
    await expect(popup).toBeVisible();
    await expectDialogSettled(page, '[data-testid="kept-popup"]');

    await page.getByRole('button', { name: 'Close kept' }).click();
    await page.waitForTimeout(80);
    // Still visible while its exit plays…
    await expect(popup).toBeVisible();
    expect(
      (await readState(page, '[data-testid="kept-popup"]')).opacity,
    ).toBeLessThan(1);
    // …then hidden, but still mounted.
    await expect(popup).toBeHidden({ timeout: 2500 });
    await expect(popup).toHaveCount(1);
  });

  test('alert dialog: ignores outside clicks, closes with Close', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Alert trigger' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(800);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('alert-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByTestId('alert-state')).toHaveText('closed');
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });
});
