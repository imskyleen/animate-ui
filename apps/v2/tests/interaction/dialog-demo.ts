import { expect, test, type Page } from '../test';

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

export function describeDialogDemo(
  name: string,
  goto: (page: Page) => Promise<unknown>,
  /** The demo's overlay tint at rest. */
  overlayRest = 0.1,
) {
  test.describe(`${name} dialog demo`, () => {
    test.beforeEach(async ({ page }) => {
      await goto(page);
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
      expectDialogEntrance(await timeline.stop(), { overlayRest });

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
      expectDialogExit(await timeline.stop(), { overlayRest });
      expectAnimationCurve(await timeline.timing('content'), DISMISS_CURVE);
    });

    test('keyboard: opens with Enter, traps focus, gives it back on close', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'Open Dialog' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'Name', exact: true }),
      ).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 2500 });
      await expect(trigger).toBeFocused();
    });

    test('reopening during the exit comes back fully', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Open Dialog' });
      const box = (await trigger.boundingBox())!;
      await trigger.click();
      await expectDialogSettled(page, CONTENT);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(80);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
      await expectDialogSettled(page, CONTENT);
      await expect(page.locator(CONTENT)).toHaveCount(1);
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
}
