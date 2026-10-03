import { expect, test } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
} from './animate-ui-entrance-helpers';

test.describe('animate-ui slide', () => {
  test('slides up with a stagger, then settles in place', async ({ page }) => {
    await open(page, 'slide');
    const [first, , last] = await replayFirstFrame(page);
    // Starts below (offset 16px, direction up) and travels up.
    expect(first!.y).toBeGreaterThan(0);
    expect(first!.y).toBeLessThanOrEqual(16);
    expect(last!.y).toBeGreaterThanOrEqual(first!.y);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.y))
      .toEqual([0, 0, 0]);
  });

  test('reduced motion: no travel, a fade instead', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'slide');
    const [first] = await replayFirstFrame(page);
    expect(first!.y).toBe(0);
    expect(first!.opacity).toBeLessThan(0.9);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.opacity))
      .toEqual([1, 1, 1]);
  });
});
