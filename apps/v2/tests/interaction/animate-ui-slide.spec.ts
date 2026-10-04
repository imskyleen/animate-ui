import { expect, test, type Page } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
  type EntranceSample,
} from './animate-ui-entrance-helpers';

type Frame = { t: number; cards: EntranceSample[] };

/** Clicks Replay and samples the three cards on every frame for `ms`. */
const replayTimeline = (page: Page, ms: number) =>
  page.evaluate(async (ms) => {
    const read = (el: Element) => {
      const cs = getComputedStyle(el);
      const m = cs.transform.match(/matrix\(([^)]+)\)/);
      const v = m ? m[1]!.split(',').map(Number) : [1, 0, 0, 1, 0, 0];
      const blur = cs.filter.match(/blur\(([\d.]+)px\)/);
      return {
        opacity: Number(cs.opacity),
        y: v[5]!,
        scale: v[0]!,
        blur: blur ? Number(blur[1]) : 0,
      };
    };
    const cards = () =>
      ['Design', 'Build', 'Ship'].map(
        (label) =>
          [...document.querySelectorAll('div')].find(
            (d) => d.textContent === label && d.children.length === 0,
          )!.parentElement!,
      );
    [...document.querySelectorAll('button')]
      .find((b) => b.textContent?.trim() === 'Replay')!
      .click();
    const t0 = performance.now();
    const frames: Frame[] = [];
    while (performance.now() - t0 < ms) {
      await new Promise((r) => requestAnimationFrame(r));
      frames.push({ t: performance.now() - t0, cards: cards().map(read) });
    }
    return frames;
  }, ms);

test.describe('animate-ui slide', () => {
  test('slides up 100px with a stagger, then settles in place', async ({
    page,
  }) => {
    await open(page, 'slide');
    const [first, , last] = await replayFirstFrame(page);
    // Starts below (offset 100px, direction up) and travels up.
    expect(first!.y).toBeGreaterThan(50);
    expect(first!.y).toBeLessThanOrEqual(100);
    expect(last!.y).toBeGreaterThanOrEqual(first!.y);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.y))
      .toEqual([0, 0, 0]);
  });

  test('on a spring: it overshoots its place, then settles', async ({
    page,
  }) => {
    await open(page, 'slide');
    const frames = await replayTimeline(page, 1000);
    const ys = frames.map((f) => f.cards[0]!.y);
    // From ~100px below; the v1 spring (stiffness 200, damping 20) then goes
    // ~4px past its place.
    expect(Math.max(...ys)).toBeGreaterThan(50);
    expect(Math.min(...ys)).toBeLessThan(-2);
    expect(Math.min(...ys)).toBeGreaterThan(-8);
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
