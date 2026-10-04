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

/**
 * A card's blur 200ms after it got below 8px. Read mid-animation, so a slow
 * first frame doesn't skew it.
 */
const blurAfter8px = (frames: Frame[], card: number) => {
  const start = frames.find(
    (f) => f.cards[card]!.blur > 0 && f.cards[card]!.blur <= 8,
  );
  const later = frames.find((f) => start && f.t >= start.t + 200);
  return later ? later.cards[card]!.blur : Infinity;
};

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

  test('sharpens on a quick spring: about 250ms from 10px', async ({
    page,
  }) => {
    await open(page, 'blur');
    const frames = await replayTimeline(page, 900);
    // The v1 spring (stiffness 200, damping 20) goes from 8px to sharp in
    // ~180ms; a 600ms ease-out is still at ~0.9px 200ms later.
    expect(blurAfter8px(frames, 0)).toBeLessThan(0.5);
    // holdDelay 100: the last card is still blurred when the first is sharp.
    const firstSharp = frames.find(
      (f, i) => i > 2 && f.cards[0]!.blur < 0.1 && f.cards[2]!.blur > 0,
    );
    expect(firstSharp?.cards[2]!.blur).toBeGreaterThan(1);
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
