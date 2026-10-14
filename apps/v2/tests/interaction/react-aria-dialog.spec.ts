import { expect, test } from '../test';

import {
  expectDialogEntrance,
  expectDialogExit,
  expectDialogSettled,
  DISMISS_CURVE,
  expectAnimationCurve,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';

const CONTENT = '[data-slot="dialog-content"]';
const OVERLAY = '[data-slot="dialog-overlay"]';

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
    await page.getByRole('button', { name: 'Open Dialog' }).click();
    await expectDialogSettled(page, CONTENT);
    const frames = await timeline.stop();
    expectDialogEntrance(frames, BACKGROUND);
    for (const frame of present(frames, 'overlay'))
      expect(frame.samples.overlay!.opacity).toBe(1);

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
    await page.getByRole('button', { name: 'Open Dialog' }).click();
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
    expectAnimationCurve(await timeline.timing('content'), DISMISS_CURVE);
    for (const frame of present(frames, 'overlay'))
      expect(frame.samples.overlay!.opacity).toBe(1);
  });

  test('keyboard: opens with Enter, traps focus, gives it back on close', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open Dialog' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 2500 });
    await expect(trigger).toBeFocused();
  });

  test('reopening during the exit comes back fully', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open Dialog' });
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
    await page.getByRole('button', { name: 'Open Dialog' }).click();
    await expectDialogSettled(page, CONTENT);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(Math.abs(first.tilt)).toBeLessThan(0.5);
    expect(first.scale).toBeCloseTo(1, 2);
    expect(first.opacity).toBeLessThan(0.5);
  });
});

test.describe('react-aria modal API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-modal', {
      waitUntil: 'networkidle',
    });
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
    await expect
      .poll(
        async () =>
          (await readState(page, '[data-testid="controlled-overlay"]')).bg,
      )
      .toBeCloseTo(0.2, 3);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
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
