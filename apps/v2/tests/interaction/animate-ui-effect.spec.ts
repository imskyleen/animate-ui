import { expect, test } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
} from './animate-ui-entrance-helpers';

test.describe('animate-ui effect', () => {
  test('combines fade, blur, slide and zoom, then settles', async ({
    page,
  }) => {
    await open(page, 'effect');
    const [first] = await replayFirstFrame(page);
    expect(first!.opacity).toBeLessThan(0.9);
    expect(first!.blur).toBeGreaterThan(0);
    expect(first!.y).toBeGreaterThan(0);
    expect(first!.scale).toBeLessThan(1);
    await expect
      .poll(async () => await sampleCards(page))
      .toEqual(Array(3).fill({ opacity: 1, y: 0, scale: 1, blur: 0 }));
  });

  test('reduced motion: only the fade remains', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'effect');
    const [first] = await replayFirstFrame(page);
    expect(first!.opacity).toBeLessThan(0.9);
    expect(first!.blur).toBe(0);
    expect(first!.y).toBe(0);
    expect(first!.scale).toBe(1);
  });
});
