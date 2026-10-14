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

const pageFree = (page: Page) =>
  page.evaluate(() => ({
    scrollLocked: document.body.hasAttribute('data-scroll-locked'),
    pointerEvents: getComputedStyle(document.body).pointerEvents,
    hidden: document.querySelector('main')?.getAttribute('aria-hidden') ?? null,
  }));
const FREE = { scrollLocked: false, pointerEvents: 'auto', hidden: null };

test.describe('radix-ui dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dialog', {
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
    expectDialogEntrance(await timeline.stop());

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
    expectDialogExit(await timeline.stop());
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
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
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
    await expect(dialog).toHaveCount(0, { timeout: 2500 });

    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-changes')).toHaveText(
      'false,true',
    );
  });

  test('forceMount: closed content leaves, the page stays usable', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/radix-ui-dialog-force-mount', {
      waitUntil: 'networkidle',
    });
    const content = page.getByTestId('kept-content');
    await expect(content).toHaveCount(0);
    expect(await pageFree(page)).toEqual(FREE);

    await page.getByText('Force mounted trigger').click();
    await expect(content).toBeVisible();

    await page.getByText('Close kept').click();
    await expect(content).toHaveCount(0, { timeout: 2500 });
    await expect.poll(() => pageFree(page)).toEqual(FREE);
  });

  test('a Content without a Portal animates in and out', async ({ page }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    const inline = '[data-testid="inline-content"]';
    const timeline = await recordTimeline(page, { content: inline });
    await page.getByRole('button', { name: 'Inline trigger' }).click();
    await expectDialogSettled(page, inline);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(first.tilt).toBeLessThan(-12);
    expect(first.scale).toBeLessThan(0.88);
    expect(first.opacity).toBeLessThan(0.3);
    await page.getByRole('button', { name: 'Close inline' }).click();
    await expect(page.getByTestId('inline-content')).toHaveCount(0, {
      timeout: 2500,
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
    await page.waitForTimeout(800);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('alert-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByTestId('alert-state')).toHaveText('closed');
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });
});
