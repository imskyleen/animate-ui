import { expect, test, type Page } from '../test';

import {
  DISMISS_CURVE,
  SHEET_CURVE,
  SHEET_TRAVEL,
  expectAnimationCurve,
  expectClearBeforeUnmount,
  expectDialogLikeOverlay,
  expectProgressiveOverlay,
  expectSheetEntrance,
  expectSheetExit,
  expectSheetSettled,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';

const SHEET = '[data-slot="sheet-content"]';
const OVERLAY = '[data-slot="sheet-overlay"]';
const REST = { bg: 0.1, blur: 4 };

const SIDES = Object.keys(SHEET_TRAVEL) as (keyof typeof SHEET_TRAVEL)[];

async function importDiff(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page
    .getByRole('tablist', { name: 'Installation' })
    .getByRole('tab', { name: 'Manual' })
    .click();
  return page
    .locator('.has-diff')
    .first()
    .locator('.line')
    .evaluateAll((lines) =>
      lines.map(
        (line) =>
          `${line.classList.contains('remove') ? '-' : line.classList.contains('add') ? '+' : ' '}${line.textContent}`,
      ),
    );
}

export function sheetCases(
  library: 'radix-ui' | 'base-ui' | 'react-aria',
  install: string[],
) {
  const demo = (name: string) => `/tests/demos/${library}/${name}`;

  async function open(page: Page) {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await expectSheetSettled(page, SHEET, 'right');
  }

  test.describe(`${library} sheet demo`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(demo('sheet'), { waitUntil: 'networkidle' });
    });

    test('slides and fades in from the right edge on its curve, never past its rest, as the overlay fades in', async ({
      page,
    }) => {
      const timeline = await recordTimeline(page, {
        content: SHEET,
        overlay: OVERLAY,
      });
      await open(page);
      await expect(page.locator(SHEET)).toHaveAttribute('data-side', 'right');
      await expect
        .poll(async () => (await readState(page, OVERLAY)).bg)
        .toBeCloseTo(REST.bg, 3);
      const frames = await timeline.stop();
      expectSheetEntrance(frames, 'right');
      expectAnimationCurve(await timeline.timing('content'), SHEET_CURVE);
      expect(present(frames, 'overlay')[0]!.samples.overlay!.bg).toBeLessThan(
        REST.bg * 0.1,
      );
      expectProgressiveOverlay(frames, REST);
      expectDialogLikeOverlay(frames, { rest: REST.bg });
      const rest = await readState(page, OVERLAY);
      expect(rest.opacity).toBe(1);
      expect(rest.backdrop).toBe(REST.blur);
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('Escape: slides back out quicker, speeding off its edge, the overlay clearing behind it, then unmounts and gives focus back', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'Open', exact: true });
      await open(page);
      const timeline = await recordTimeline(page, {
        content: SHEET,
        overlay: OVERLAY,
      });
      await page.keyboard.press('Escape');
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
      await expect(page.locator(OVERLAY)).toHaveCount(0, { timeout: 2500 });
      const frames = await timeline.stop();
      expectSheetExit(frames, 'right');
      expectAnimationCurve(await timeline.timing('content'), DISMISS_CURVE);
      expectProgressiveOverlay(frames, REST);
      expectDialogLikeOverlay(frames, { rest: REST.bg, leaving: true });
      expectClearBeforeUnmount(frames, REST);
      const sheetGone = frames.find(
        (frame) => (frame.samples.content?.opacity ?? 0) < 0.02,
      )!.t;
      const overlayClear = frames.find(
        (frame) => (frame.samples.overlay?.bg ?? 0) < REST.bg * 0.02,
      )!.t;
      expect(overlayClear - sheetGone).toBeGreaterThan(100);
      await expect(trigger).toBeFocused();
    });

    test('a click on the overlay dismisses it the same way', async ({
      page,
    }) => {
      await open(page);
      const timeline = await recordTimeline(page, { content: SHEET });
      await page.mouse.click(5, 5);
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
      expectSheetExit(await timeline.stop(), 'right');
      expectAnimationCurve(await timeline.timing('content'), DISMISS_CURVE);
    });

    test('the close buttons dismiss it', async ({ page }) => {
      await open(page);
      await page
        .locator(SHEET)
        .getByRole('button', { name: 'Close', exact: true })
        .first()
        .click();
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
      await open(page);
      await page
        .locator(SHEET)
        .getByRole('button', { name: 'Close', exact: true })
        .last()
        .click();
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
    });

    test('reopened while it leaves, it slides back in from where it is', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'Open', exact: true });
      const box = (await trigger.boundingBox())!;
      await open(page);
      const timeline = await recordTimeline(page, { content: SHEET });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(80);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expectSheetSettled(page, SHEET, 'right');
      const frames = await timeline.stop();
      expect(present(frames, 'content')).toHaveLength(frames.length);
      const way = frames.map((frame) => frame.samples.content!.x);
      const furthest = Math.max(...way);
      expect(furthest).toBeGreaterThan(0.05);
      expect(furthest).toBeLessThan(0.9);
      const turn = way.indexOf(furthest);
      for (let i = turn + 1; i < way.length; i++)
        expect(way[i]!).toBeLessThanOrEqual(way[i - 1]! + 0.002);
      await expect(page.locator(SHEET)).toHaveCount(1);
      await expect
        .poll(async () => (await readState(page, OVERLAY)).bg)
        .toBeCloseTo(REST.bg, 3);
    });

    test('reduced motion: fades in and out in place, the overlay still fades', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const timeline = await recordTimeline(page, {
        content: SHEET,
        overlay: OVERLAY,
      });
      await open(page);
      const frames = await timeline.stop();
      const shown = present(frames, 'content');
      for (const frame of shown)
        expect(Math.abs(frame.samples.content!.x)).toBeLessThan(0.001);
      expect(shown[0]!.samples.content!.opacity).toBeLessThan(0.5);
      expect(
        shown.some(
          (frame) =>
            frame.samples.content!.opacity > 0.2 &&
            frame.samples.content!.opacity < 0.9,
        ),
      ).toBe(true);
      expectProgressiveOverlay(frames, REST);

      const exit = await recordTimeline(page, { content: SHEET });
      await page.keyboard.press('Escape');
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
      const leaving = present(await exit.stop(), 'content');
      for (const frame of leaving)
        expect(Math.abs(frame.samples.content!.x)).toBeLessThan(0.001);
      expect(leaving.at(-1)!.samples.content!.opacity).toBeLessThan(0.5);
    });
  });

  test.describe(`${library} sheet sides`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(demo('sheet-side'), { waitUntil: 'networkidle' });
    });

    for (const side of SIDES) {
      test(`slides in from the ${side} edge and back out to it`, async ({
        page,
      }) => {
        const timeline = await recordTimeline(page, { content: SHEET });
        await page
          .getByRole('button', { name: new RegExp(`^${side}$`, 'i') })
          .click();
        await expect(page.locator(SHEET)).toHaveAttribute('data-side', side);
        await expectSheetSettled(page, SHEET, side);
        expectSheetEntrance(await timeline.stop(), side);
        expectAnimationCurve(await timeline.timing('content'), SHEET_CURVE);

        const exit = await recordTimeline(page, { content: SHEET });
        await page
          .locator(SHEET)
          .getByRole('button', { name: 'Cancel' })
          .click();
        await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
        expectSheetExit(await exit.stop(), side);
        expectAnimationCurve(await exit.timing('content'), DISMISS_CURVE);
      });
    }
  });

  test.describe(`${library} sheet without a close button`, () => {
    test('has no close button; a click outside closes it', async ({ page }) => {
      await page.goto(demo('sheet-no-close-button'), {
        waitUntil: 'networkidle',
      });
      await page.getByRole('button', { name: 'Open Sheet' }).click();
      await expectSheetSettled(page, SHEET, 'right');
      await expect(
        page.locator(SHEET).getByRole('button', { name: 'Close' }),
      ).toHaveCount(0);
      const timeline = await recordTimeline(page, { content: SHEET });
      await page.mouse.click(5, 5);
      await expect(page.locator(SHEET)).toHaveCount(0, { timeout: 2500 });
      expectSheetExit(await timeline.stop(), 'right');
    });
  });

  test(`${library} sheet docs: installs shadcn/ui's sheet, swapping its Dialog import`, async ({
    page,
  }) => {
    const lines = await importDiff(page, `/docs/primitives/${library}/sheet`);
    expect(lines.filter((line) => !line.startsWith(' '))).toEqual(install);
    await page
      .getByRole('tablist', { name: 'Installation' })
      .getByRole('tab', { name: 'CLI' })
      .click();
    await expect(
      page.getByText(`animate-ui/cli@latest animate sheet`).first(),
    ).toBeAttached();
  });
}
