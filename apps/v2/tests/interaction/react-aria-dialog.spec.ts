import { expect, test } from '@playwright/test';

import {
  SHEET_TRAVEL,
  expectDialogEntrance,
  expectDialogExit,
  expectDialogSettled,
  DRAWER_CURVE,
  expectAnimationCurve,
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
const SHEET_OVERLAY = '[data-slot="sheet-overlay"]';

// React Aria renders the Modal inside the ModalOverlay: the overlay fades its
// own background (shadcn/ui's bg-black/10) rather than its opacity, so the
// modal keeps v1's motion.
const BACKGROUND = { overlayFade: 'bg', overlayRest: 0.1 } as const;

test.describe('react-aria dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('opens like v1: tipped back, small and blurred, upright on a spring after its overlay', async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await expectDialogSettled(page, CONTENT);
    const frames = await timeline.stop();
    expectDialogEntrance(frames, BACKGROUND);
    // The overlay itself never fades the modal it contains.
    for (const frame of present(frames, 'overlay'))
      expect(frame.samples.overlay!.opacity).toBe(1);

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
    expect((await readState(page, OVERLAY)).bg).toBeCloseTo(0.1, 3);
  });

  test('closes quicker than it came: tips back speeding away, ahead of its overlay, then unmounts', async ({
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
    const frames = await timeline.stop();
    expectDialogExit(frames, BACKGROUND);
    for (const frame of present(frames, 'overlay'))
      expect(frame.samples.overlay!.opacity).toBe(1);
  });

  test('keyboard: opens with Enter, traps focus, gives it back on close', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Edit profile' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    // React Aria focuses the dialog right away, while the entrance plays.
    await expect(page.getByRole('dialog')).toBeFocused();
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
    await expect
      .poll(async () => (await readState(page, OVERLAY)).bg)
      .toBeCloseTo(0.1, 3);
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

test.describe('react-aria dialog: sheet demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/dialog-sheet', {
      waitUntil: 'networkidle',
    });
  });

  for (const side of Object.keys(
    SHEET_TRAVEL,
  ) as (keyof typeof SHEET_TRAVEL)[]) {
    test(`slides and fades in from the ${side} edge on Vaul's curve`, async ({
      page,
    }) => {
      const timeline = await recordTimeline(page, {
        content: SHEET,
        overlay: SHEET_OVERLAY,
      });
      await page.getByRole('button', { name: side, exact: true }).click();
      await expect(page.locator(SHEET)).toHaveAttribute('data-side', side);
      await expectSheetSettled(page, SHEET, side);
      const frames = await timeline.stop();
      expectSheetEntrance(frames, side);
      // Vaul's curve, as Motion handed it to the browser.
      expectAnimationCurve(await timeline.timing('content'), DRAWER_CURVE);
      for (const frame of present(frames, 'overlay'))
        expect(frame.samples.overlay!.opacity).toBe(1);
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

test.describe('react-aria modal API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-modal', {
      waitUntil: 'networkidle',
    });
    // The defaultOpen modal comes first: close it.
    await page.getByRole('button', { name: 'Close default' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Default open modal' }),
    ).toHaveCount(0, { timeout: 2500 });
  });

  test('a standalone Modal animates in and out', async ({ page }) => {
    const modal = '[data-testid="standalone-modal"]';
    const timeline = await recordTimeline(page, { content: modal });
    await page.getByRole('button', { name: 'Standalone trigger' }).click();
    await expectDialogSettled(page, modal);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(first.tilt).toBeLessThan(-12);
    expect(first.scale).toBeLessThan(0.88);
    expect(first.opacity).toBeLessThan(0.3);
    await page.getByRole('button', { name: 'Close standalone' }).click();
    await page.waitForTimeout(80);
    await expect(page.getByTestId('standalone-modal')).toHaveAttribute(
      'data-exiting',
      'true',
    );
    await expect(page.getByTestId('standalone-modal')).toHaveCount(0, {
      timeout: 2500,
    });
    await expect(
      page.getByRole('button', { name: 'Standalone trigger' }),
    ).toBeFocused();
  });

  test('isDismissable: an outside click closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Standalone trigger' }).click();
    await page.waitForTimeout(800);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('standalone-modal')).toHaveCount(0, {
      timeout: 2500,
    });
  });

  test('controlled isOpen and onOpenChange, render-prop className and style, ref', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open controlled' }).click();
    const dialog = page.getByRole('dialog', { name: 'Controlled modal' });
    await expect(dialog).toBeVisible();
    const overlay = page.getByTestId('controlled-overlay');
    await expect(overlay).toHaveClass(/is-shown/);
    await page.getByRole('button', { name: 'Read ref' }).click();
    await expect(page.getByTestId('ref-tag')).toHaveText('div');
    // Its class's background, once faded in.
    await expect
      .poll(
        async () =>
          (await readState(page, '[data-testid="controlled-overlay"]')).bg,
      )
      .toBeCloseTo(0.2, 3);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
    // While it exits, the render props see isExiting.
    await expect(overlay).toHaveClass(/is-exiting/);
    expect(
      await overlay.evaluate((el) => (el as HTMLElement).style.outlineWidth),
    ).toBe('3px');
    await expect(overlay).toHaveCount(0, { timeout: 2500 });
  });

  test('closing from inside the dialog (close render prop)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open controlled' }).click();
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-overlay')).toHaveCount(0, {
      timeout: 2500,
    });
  });
});
