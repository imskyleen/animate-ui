import { expect, test } from '@playwright/test';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT_SLOT = { radix: 'tooltip-content', base: 'tooltip-popup' };

for (const lib of ['radix', 'base'] as const) {
  const CONTENT = `[data-slot="${CONTENT_SLOT[lib]}"]`;

  test.describe(`${lib} tooltip`, () => {
    test.beforeEach(async ({ page }) => {
      // networkidle: the smoke marker is server-rendered, wait for hydration.
      await page.goto(`/examples/smoke/demo-components-${lib}-tooltip`, {
        waitUntil: 'networkidle',
      });
      await page
        .locator('[data-smoke-status="rendered"]')
        .waitFor({ state: 'attached' });
    });

    test('enters from 0.96 with ease-out, anchored to the trigger', async ({
      page,
    }) => {
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: 'Hover' }).hover();
      const first = await probe.firstFrame();

      expect(first.scale).toBeGreaterThanOrEqual(0.95);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);
      // Origin follows the trigger (Radix sets it per side), not the center.
      expect(first.origin).not.toBe('50% 50%');

      await page.waitForTimeout(250);
      const settled = await sample(page, CONTENT);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 3);
    });

    test('reduced motion: no scaling, still fades', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: 'Hover' }).hover();
      const first = await probe.firstFrame();

      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });

    test('warm reopen appears without an entrance', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Hover' });
      await trigger.hover();
      await page.locator(CONTENT).waitFor();
      await page.mouse.move(5, 5, { steps: 8 });
      await page.locator(CONTENT).waitFor({ state: 'detached' });

      const probe = await probeFirstFrame(page, CONTENT);
      await trigger.hover();
      const first = await probe.firstFrame();

      expect(first.opacity).toBe(1);
      expect(first.scale).toBeCloseTo(1, 3);
    });
  });
}
