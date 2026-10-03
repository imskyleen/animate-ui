import { expect, test, type Page } from '@playwright/test';

const THUMB = '[data-slot="switch-thumb"]';

const thumbBox = (page: Page) =>
  page
    .locator(THUMB)
    .first()
    .evaluate((el) => ({
      // getBoundingClientRect includes the layout transform (visual position);
      // offsetWidth is the CSS width, which must never be tweened.
      left: el.getBoundingClientRect().left,
      cssWidth: (el as HTMLElement).offsetWidth,
    }));

for (const lib of ['radix', 'base', 'headless'] as const) {
  test.describe(`${lib} switch`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/smoke/demo-components-${lib}-switch`, {
        waitUntil: 'networkidle',
      });
    });

    test('the thumb glides with a transform, never a width tween', async ({
      page,
    }) => {
      const start = await thumbBox(page);
      await page.getByRole('switch').first().click();
      const widths = new Set<number>();
      let movedMidway = false;
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(25);
        const box = await thumbBox(page);
        widths.add(box.cssWidth);
        if (box.left !== start.left) movedMidway = true;
      }
      await page.waitForTimeout(400);
      const end = await thumbBox(page);

      expect(movedMidway).toBe(true);
      expect(end.left).toBeGreaterThan(start.left);
      // Only the resting and pressed widths ever appear.
      for (const w of widths) expect([16, 19]).toContain(w);
    });

    test('press stretches the thumb', async ({ page }) => {
      const sw = page.getByRole('switch').first();
      const box = await sw.boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(60);
      expect((await thumbBox(page)).cssWidth).toBe(19);
      await page.mouse.up();
      await page.waitForTimeout(60);
      expect((await thumbBox(page)).cssWidth).toBe(16);
    });

    test('reduced motion: the thumb jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('switch').first().click();
      await page.waitForTimeout(30);
      const early = await thumbBox(page);
      await page.waitForTimeout(400);
      const settled = await thumbBox(page);
      expect(Math.abs(early.left - settled.left)).toBeLessThan(1);
    });
  });
}
