import { expect, test } from '@playwright/test';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT_SLOT = {
  radix: 'dialog-content',
  base: 'dialog-popup',
  headless: 'dialog-panel',
};

for (const lib of ['radix', 'base', 'headless'] as const) {
  const CONTENT = `[data-slot="${CONTENT_SLOT[lib]}"]`;

  test.describe(`${lib} dialog`, () => {
    test.beforeEach(async ({ page }) => {
      // networkidle: the smoke marker is server-rendered, wait for hydration.
      await page.goto(`/examples/smoke/demo-components-${lib}-dialog`, {
        waitUntil: 'networkidle',
      });
    });

    test('enters from 0.96 and settles', async ({ page }) => {
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: 'Open Dialog' }).click();
      const first = await probe.firstFrame();

      expect(first.scale).toBeGreaterThanOrEqual(0.95);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);

      await page.waitForTimeout(400);
      const settled = await sample(page, CONTENT);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 3);
    });

    test('exits faster than it enters', async ({ page }) => {
      await page.getByRole('button', { name: 'Open Dialog' }).click();
      await page.waitForTimeout(400);
      await page.keyboard.press('Escape');
      // modalExit is 200ms: gone well before the 300ms entrance duration.
      await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 280 });
    });

    test('reduced motion: no scaling, still fades', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: 'Open Dialog' }).click();
      const first = await probe.firstFrame();

      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });
  });
}
