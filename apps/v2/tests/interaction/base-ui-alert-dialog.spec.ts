import { expect, test } from '@playwright/test';

import {
  expectDialogEntrance,
  expectDialogExit,
  expectDialogSettled,
  present,
  recordTimeline,
} from './modal-timeline';

const CONTENT = '[data-slot="alert-dialog-content"]';
const OVERLAY = '[data-slot="alert-dialog-overlay"]';

test.describe('base-ui alert dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/alert-dialog', {
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
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expectDialogSettled(page, CONTENT);
    expectDialogEntrance(await timeline.stop());
  });

  test('Cancel is focused at once; Escape closes it on the same spring, outlasting its overlay', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expectDialogSettled(page, CONTENT);
    const timeline = await recordTimeline(page, {
      content: CONTENT,
      overlay: OVERLAY,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 2500 });
    expectDialogExit(await timeline.stop());
    await expect(
      page.getByRole('button', { name: 'Delete project' }),
    ).toBeFocused();
  });

  test('an outside click does not dismiss it', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expectDialogSettled(page, CONTENT);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(450);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    // shadcn/ui's Base UI action is a plain button: close with Cancel.
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0, {
      timeout: 2500,
    });
  });

  test('reduced motion: no tilt or scale, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const timeline = await recordTimeline(page, { content: CONTENT });
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expectDialogSettled(page, CONTENT);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(Math.abs(first.tilt)).toBeLessThan(0.5);
    expect(first.scale).toBeCloseTo(1, 2);
    expect(first.opacity).toBeLessThan(0.5);
  });
});
