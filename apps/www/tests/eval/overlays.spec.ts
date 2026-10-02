import { expect, test } from '@playwright/test';
import { probeFirstFrame, sample } from '../interaction/motion-probe';

// Grades agent-generated components against the animate-ui skill's rules.
const CASES = [
  {
    name: 'popover',
    trigger: 'Open popover',
    slot: 'popover-content',
    budget: 250,
  },
  {
    name: 'dropdown-menu',
    trigger: 'Open menu',
    slot: 'dropdown-menu-content',
    budget: 250,
  },
];

for (const c of CASES) {
  const CONTENT = `[data-slot="${c.slot}"]`;

  test.describe(`eval: ${c.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/eval/${c.name}`, { waitUntil: 'networkidle' });
    });

    test('rule 4: enters from 0.9–0.97 with opacity, never from 0', async ({
      page,
    }) => {
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: c.trigger }).click();
      const first = await probe.firstFrame();
      expect(first.scale).toBeGreaterThanOrEqual(0.9);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);
    });

    test('rule 5: grows from the trigger, not the center', async ({ page }) => {
      await page.getByRole('button', { name: c.trigger }).click();
      await page.locator(CONTENT).waitFor();
      const { origin } = await sample(page, CONTENT);
      expect(origin).not.toBe('50% 50%');
      const box = await page.locator(CONTENT).boundingBox();
      const [, oy] = origin.split(' ').map(parseFloat);
      // Content opens below the trigger: the origin sits on its top edge.
      expect(oy).toBeLessThan((box?.height ?? 100) / 2);
    });

    test('rule 9: settles within the duration budget', async ({ page }) => {
      await page.getByRole('button', { name: c.trigger }).click();
      await page.waitForTimeout(c.budget + 30);
      const settled = await sample(page, CONTENT);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 2);
    });

    test('rule 1: reduced motion keeps the fade, drops the scale', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, CONTENT);
      await page.getByRole('button', { name: c.trigger }).click();
      const first = await probe.firstFrame();
      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });

    test('exit animates, then unmounts', async ({ page }) => {
      await page.getByRole('button', { name: c.trigger }).click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(40);
      const leaving = await page.locator(CONTENT).count();
      expect(leaving).toBe(1);
      await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 400 });
    });
  });
}
