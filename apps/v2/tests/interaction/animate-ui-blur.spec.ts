import { expect, test } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
} from './animate-ui-entrance-helpers';

test.describe('animate-ui blur', () => {
  test('unblurs with a stagger, then settles sharp', async ({ page }) => {
    await open(page, 'blur');
    const [first, , last] = await replayFirstFrame(page);
    expect(first!.blur).toBeGreaterThan(0);
    expect(last!.blur).toBeGreaterThanOrEqual(first!.blur);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.blur))
      .toEqual([0, 0, 0]);
  });

  test('reduced motion: a fade instead of the blur', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'blur');
    const [first] = await replayFirstFrame(page);
    expect(first!.blur).toBe(0);
    expect(first!.opacity).toBeLessThan(0.9);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.opacity))
      .toEqual([1, 1, 1]);
  });
});
