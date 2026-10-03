import { expect, test } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
} from './animate-ui-entrance-helpers';

test.describe('animate-ui fade', () => {
  test('fades in with a stagger, then settles', async ({ page }) => {
    await open(page, 'fade');
    const [first, , last] = await replayFirstFrame(page);
    expect(first!.opacity).toBeLessThan(0.9);
    // holdDelay: the last card hasn't started yet.
    expect(last!.opacity).toBeLessThanOrEqual(first!.opacity);
    expect(last!.opacity).toBeLessThan(0.2);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.opacity))
      .toEqual([1, 1, 1]);
  });

  test('only opacity animates', async ({ page }) => {
    await open(page, 'fade');
    const [first] = await replayFirstFrame(page);
    expect(first!.y).toBe(0);
    expect(first!.scale).toBe(1);
    expect(first!.blur).toBe(0);
  });
});
