import { expect, test } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
} from './animate-ui-entrance-helpers';

test.describe('animate-ui zoom', () => {
  test('scales up from 0.96, never from 0, then settles', async ({ page }) => {
    await open(page, 'zoom');
    const [first, , last] = await replayFirstFrame(page);
    expect(first!.scale).toBeGreaterThanOrEqual(0.96);
    expect(first!.scale).toBeLessThan(1);
    expect(last!.scale).toBeLessThanOrEqual(first!.scale);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.scale))
      .toEqual([1, 1, 1]);
  });

  test('reduced motion: no scale, a fade instead', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'zoom');
    const [first] = await replayFirstFrame(page);
    expect(first!.scale).toBe(1);
    expect(first!.opacity).toBeLessThan(0.9);
  });
});
