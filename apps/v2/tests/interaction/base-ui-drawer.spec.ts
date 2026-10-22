import { expect, test, type Page } from '../test';

import {
  DRAWER_CURVE,
  DRAWER_EXIT_CURVE,
  OVERLAY_CURVE,
  halfwayTimes,
  expectClearBeforeUnmount,
  expectDialogLikeOverlay,
  expectDrawerEntrance,
  expectDrawerExit,
  expectProgressiveOverlay,
  expectShadowLifts,
  expectSheetSettled,
  expectThrown,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';
import { expectCssCurve } from './spring-curves';

const DRAWER_FRAMEWORKS = [
  {
    name: 'base-ui',
    demo: '/tests/demos/base-ui/drawer',
    fixture: '/tests/fixtures/base-ui-drawer',
    popup: '[data-slot="drawer-popup"]',
    overlay: '[data-slot="drawer-overlay"]',
    handle: '[data-slot="drawer-swipe-handle"]',
    rest: { bg: 0.3, blur: 8 },
    shadow: 0.1 as number | null,
  },
  {
    // shadcn-vue's drawer: a darker overlay without blur, a popup without shadow.
    name: 'vue reka-ui',
    demo: '/tests/vue-demos/reka-ui/drawer',
    fixture: '/tests/vue-demos/fixtures/reka-ui-drawer',
    popup: '[data-slot="drawer-content"]',
    overlay: '[data-slot="drawer-overlay"]',
    handle: '[data-slot="drawer-content"] > [aria-hidden="true"][data-state]',
    rest: { bg: 0.8, blur: 0 },
    shadow: null as number | null,
  },
];

async function endingTiming(page: Page, selector: string) {
  const key = `__ending${selector.replace(/\W/g, '')}`;
  await page.locator(selector).evaluate((el, key) => {
    (window as unknown as Record<string, Promise<unknown>>)[key] = new Promise(
      (resolve) => {
        const observer = new MutationObserver(() => {
          if (!el.hasAttribute('data-ending-style')) return;
          observer.disconnect();
          const cs = getComputedStyle(el);
          resolve({
            duration: cs.transitionDuration.split(',')[0]!.trim(),
            easing: cs.transitionTimingFunction,
            swipe: el.hasAttribute('data-swipe-dismiss'),
          });
        });
        observer.observe(el, { attributes: true });
      },
    );
  }, key);
  return async () =>
    (await page.evaluate(
      (key) => (window as unknown as Record<string, Promise<unknown>>)[key],
      key,
    )) as { duration: string; easing: string; swipe: boolean };
}

const timing = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        duration: cs.transitionDuration.split(',')[0]!.trim(),
        easing: cs.transitionTimingFunction,
      };
    });

const state = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      return { x: m.m41, y: m.m42, opacity: Number(cs.opacity) };
    });

for (const fw of DRAWER_FRAMEWORKS) {
  const POPUP = fw.popup;
  const OVERLAY = fw.overlay;
  const HANDLE = fw.handle;
  const REST = fw.rest;
  const SHADOW = fw.shadow;

  const SIDES = [
    { side: 'right', query: '', axis: 'x', swipe: 'right' },
    { side: 'bottom', query: '?direction=bottom', axis: 'y', swipe: 'down' },
  ] as const;

  for (const { side, query, axis, swipe } of SIDES) {
    test.describe(`${fw.name} drawer demo, from the ${side}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${fw.demo}${query}`, {
          waitUntil: 'networkidle',
        });
      });

      const open = async (page: Page) => {
        await page.getByRole('button', { name: 'Open Drawer' }).click();
        await expectSheetSettled(page, POPUP, side);
        await page.waitForTimeout(400);
      };

      test(`slides in opaque from the ${side} edge with a hint of bounce, its backdrop tinting and blurring the page from 0 like a dialog's`, async ({
        page,
      }) => {
        const timeline = await recordTimeline(page, {
          content: POPUP,
          overlay: OVERLAY,
        });
        await open(page);
        const frames = await timeline.stop();
        await expect(page.locator(POPUP)).toHaveAttribute(
          'data-swipe-direction',
          swipe,
        );
        expectDrawerEntrance(frames, side);
        if (SHADOW !== null) expectShadowLifts(frames, SHADOW);

        const backdrop = present(frames, 'overlay');
        expect(backdrop[0]!.samples.overlay!.bg).toBeLessThan(REST.bg * 0.1);
        if (REST.blur > 0)
          expect(backdrop[0]!.samples.overlay!.backdrop).toBeLessThan(
            REST.blur * 0.1,
          );
        expectProgressiveOverlay(frames, REST);
        expectDialogLikeOverlay(frames, { rest: REST.bg });
        const halfway = halfwayTimes(frames, { axis, rest: REST.bg });
        expect(Math.abs(halfway.overlay - halfway.drawer)).toBeLessThan(60);
        const rest = await readState(page, OVERLAY);
        expect(rest.opacity).toBe(1);
        expect(rest.bg).toBeCloseTo(REST.bg, 3);
        expect(rest.backdrop).toBe(REST.blur);

        expectCssCurve(await timing(page, POPUP), DRAWER_CURVE);
        expectCssCurve(await timing(page, OVERLAY), OVERLAY_CURVE);
      });

      test("closes quicker than it came, speeding off its edge without crawling, opaque, its backdrop clearing ahead of it like a dialog's, then unmounts", async ({
        page,
      }) => {
        await open(page);
        const popupExit = await endingTiming(page, POPUP);
        const backdropExit = await endingTiming(page, OVERLAY);
        const timeline = await recordTimeline(page, {
          content: POPUP,
          overlay: OVERLAY,
        });
        await page.keyboard.press('Escape');
        expectCssCurve(await popupExit(), DRAWER_EXIT_CURVE);
        expectCssCurve(await backdropExit(), OVERLAY_CURVE);
        await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
        const frames = await timeline.stop();
        expectDrawerExit(frames, side);
        expectProgressiveOverlay(frames, REST);
        expectDialogLikeOverlay(frames, { rest: REST.bg, leaving: true, axis });
        expectClearBeforeUnmount(frames, REST);
        if (SHADOW !== null)
          expectShadowLifts(frames, SHADOW, { leaving: true });
      });

      test('reduced motion: fades in place', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const timeline = await recordTimeline(page, { content: POPUP });
        await open(page);
        const first = present(await timeline.stop(), 'content')[0]!.samples
          .content!;
        expect(Math.abs(first[axis])).toBeLessThan(0.002);
        expect(first.opacity).toBeLessThan(1);
      });
    });
  }

  test.describe(`${fw.name} drawer demo, on a phone`, () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
      await page.goto(fw.demo, {
        waitUntil: 'networkidle',
      });
      await page.getByRole('button', { name: 'Open Drawer' }).click();
      await expectSheetSettled(page, POPUP, 'bottom');
      await expect(page.locator(POPUP)).toHaveAttribute(
        'data-swipe-direction',
        'down',
      );
    });

    test('a drag follows the finger at once; a slow release springs back', async ({
      page,
    }) => {
      const box = (await page.locator(HANDLE).boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) {
        await page.mouse.move(x, y + i * 8);
        await page.waitForTimeout(32);
      }
      const dragged = await state(page, POPUP);
      expect(dragged.y).toBeGreaterThan(60);
      expect(dragged.y).toBeLessThan(100);
      expect(dragged.opacity).toBe(1);
      const swiped = await readState(page, OVERLAY);
      expect(swiped.opacity).toBe(1);
      expect(swiped.bg).toBeLessThan(REST.bg * 0.95);
      expect(swiped.bg).toBeGreaterThan(REST.bg * 0.3);
      if (REST.blur > 0)
        expect(
          Math.abs(swiped.backdrop / REST.blur - swiped.bg / REST.bg),
        ).toBeLessThan(0.1);

      await page.waitForTimeout(150);
      const timeline = await recordTimeline(page, { content: POPUP });
      await page.mouse.up();
      await expectSheetSettled(page, POPUP, 'bottom');
      const { height } = (await page.locator(POPUP).boundingBox())!;
      const back = present(await timeline.stop(), 'content').map(
        (frame) => frame.samples.content!.y * height,
      );
      expect(back.some((y) => y > 5 && y < dragged.y - 5)).toBe(true);
      await expect(page.locator(POPUP)).toHaveCount(1);
    });

    test("a flick throws it out at the finger's speed: linear, never stalling or crawling", async ({
      page,
    }) => {
      const { height } = (await page.locator(POPUP).boundingBox())!;
      const distance = Math.round(height * 0.4);
      const box = (await page.locator(HANDLE).boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      const exit = await endingTiming(page, POPUP);
      const timeline = await recordTimeline(page, { content: POPUP });
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y + 2);
      await page.mouse.move(x, y + 2 + distance / 2);
      await page.mouse.move(x, y + 2 + distance);
      await page.mouse.up();
      const timing = await exit();
      expect(timing.swipe).toBe(true);
      expect(timing.easing.split(', ')[0]).toBe('linear');
      expect(parseFloat(timing.duration)).toBeGreaterThan(0);
      expect(parseFloat(timing.duration)).toBeLessThanOrEqual(0.36);
      await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
      expectThrown(await timeline.stop(), 'bottom', (distance + 2) / height);
    });
  });

  test.describe(`${fw.name} drawer demo: confirming`, () => {
    test('a picked time is confirmed: the drawer slides out, then a toast', async ({
      page,
    }) => {
      await page.goto(fw.demo, {
        waitUntil: 'networkidle',
      });
      await page.getByRole('button', { name: 'Open Drawer' }).click();
      await expectSheetSettled(page, POPUP, 'right');
      await page.getByText('6:00 PM – 6:15 PM').click();
      await expect(page.getByRole('radio', { name: /6:00 PM/ })).toBeChecked();
      const timeline = await recordTimeline(page, { content: POPUP });
      await page.getByRole('button', { name: 'Confirm Delivery Time' }).click();
      await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 2500 });
      expectDrawerExit(await timeline.stop(), 'right');
      await expect(page.getByText('Delivery time confirmed')).toBeVisible();
    });
  });

  test.describe(`${fw.name} drawer API`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(fw.fixture, {
        waitUntil: 'networkidle',
      });
    });

    test('controlled open and onOpenChange; animates unstyled', async ({
      page,
    }) => {
      const popup = '[data-testid="bottom-popup"]';
      const timeline = await recordTimeline(page, { content: popup });
      await page.getByRole('button', { name: 'Open from outside' }).click();
      await expectSheetSettled(page, popup, 'bottom');
      expectDrawerEntrance(await timeline.stop(), 'bottom');
      await expect(page.getByTestId('controlled-state')).toHaveText('open');

      await page.getByRole('button', { name: 'Close bottom' }).click();
      await expect(page.getByTestId('controlled-state')).toHaveText('closed');
      await expect(page.getByTestId('controlled-changes')).toHaveText(
        'false:close-press',
      );
      await expect(page.locator(popup)).toHaveCount(0, { timeout: 2500 });
    });

    test('swipeDirection right, with custom transitions', async ({ page }) => {
      const popup = '[data-testid="right-popup"]';
      const timeline = await recordTimeline(page, { content: popup });
      await page.getByRole('button', { name: 'Open right drawer' }).click();
      await expectSheetSettled(page, popup, 'right');
      const first = present(await timeline.stop(), 'content')[0]!.samples
        .content!;
      expect(first.x).toBeGreaterThan(0.6);
      const timing = await page
        .locator(popup)
        .evaluate((el) => [
          getComputedStyle(el).transitionDuration.split(',')[0]!.trim(),
          getComputedStyle(el).transitionTimingFunction.split(', c')[0]!,
        ]);
      expect(timing).toEqual(['0.2s', 'cubic-bezier(0.4, 0, 0.2, 1)']);

      await page.keyboard.press('Escape');
      await expect(page.locator(popup)).toHaveCount(0, { timeout: 1000 });
    });

    test('a backdrop over an image fades its opacity instead', async ({
      page,
    }) => {
      const backdrop = '[data-testid="gradient-backdrop"]';
      const timeline = await recordTimeline(page, { overlay: backdrop });
      await page.getByRole('button', { name: 'Open gradient drawer' }).click();
      await expectSheetSettled(
        page,
        '[data-testid="gradient-popup"]',
        'bottom',
      );
      const frames = present(await timeline.stop(), 'overlay');
      expect(frames[0]!.samples.overlay!.opacity).toBeLessThan(0.3);
      expect(
        frames.some(
          (frame) =>
            frame.samples.overlay!.opacity > 0.2 &&
            frame.samples.overlay!.opacity < 0.8,
        ),
      ).toBe(true);
      await expect
        .poll(async () => (await readState(page, backdrop)).opacity)
        .toBe(1);
      await expect(page.locator(backdrop)).not.toHaveAttribute(
        'data-animate-ui-backdrop',
      );
    });
  });

  test(`${fw.name}: the backdrop follows the theme's color while open`, async ({
    page,
  }) => {
    await page.goto(fw.fixture, {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Open themed drawer' }).click();
    const backdrop = page.getByTestId('themed-backdrop');
    const color = () =>
      backdrop.evaluate((el) =>
        (el as HTMLElement).style.getPropertyValue(
          '--animate-ui-backdrop-color',
        ),
      );
    await expect.poll(color).toContain('/ 0.2');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect.poll(color).toContain('/ 0.3');
  });
}
