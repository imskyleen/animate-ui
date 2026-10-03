import { expect, test } from '@playwright/test';

const PANEL_SLOT = { radix: 'accordion-content', base: 'accordion-panel' };

for (const lib of ['radix', 'base'] as const) {
  const PANEL = `[data-slot="${PANEL_SLOT[lib]}"]`;

  test.describe(`${lib} accordion`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/smoke/demo-components-${lib}-accordion`, {
        waitUntil: 'networkidle',
      });
    });

    test('opens within the 300ms budget', async ({ page }) => {
      const trigger = page.getByRole('button', {
        name: 'How is it different from other libraries?',
      });
      await trigger.click();
      const panel = page.locator(PANEL).last();
      await page.waitForTimeout(60);
      const mid = await panel.evaluate(
        (el) => el.getBoundingClientRect().height,
      );
      await page.waitForTimeout(360);
      const full = await panel.evaluate(
        (el) => el.getBoundingClientRect().height,
      );

      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(full);
      expect(await panel.evaluate((el) => getComputedStyle(el).opacity)).toBe(
        '1',
      );
    });

    test('reduced motion: height jumps, no slide', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page
        .getByRole('button', {
          name: 'How is it different from other libraries?',
        })
        .click();
      const panel = page.locator(PANEL).last();
      await page.waitForTimeout(40);
      const early = await panel.evaluate(
        (el) => el.getBoundingClientRect().height,
      );
      await page.waitForTimeout(300);
      const full = await panel.evaluate(
        (el) => el.getBoundingClientRect().height,
      );
      expect(early).toBeCloseTo(full, 0);
    });
  });
}
