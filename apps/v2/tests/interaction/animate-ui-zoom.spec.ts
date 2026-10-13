import { expect, test, type Page } from '@playwright/test';

import {
  open,
  replayFirstFrame,
  sampleCards,
  type EntranceSample,
} from './animate-ui-entrance-helpers';

type Frame = { t: number; cards: EntranceSample[] };

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

test.describe('animate-ui zoom', () => {
  test('scales up from 0.5 with a stagger, then settles', async ({ page }) => {
    await open(page, 'zoom');
    const [first, , last] = await replayFirstFrame(page);
    expect(first!.scale).toBeGreaterThanOrEqual(0.5);
    expect(first!.scale).toBeLessThan(0.8);
    expect(last!.scale).toBeLessThanOrEqual(first!.scale);
    await expect
      .poll(async () => (await sampleCards(page)).map((c) => c.scale))
      .toEqual([1, 1, 1]);
  });

  test('on a spring: it overshoots its size, then settles', async ({
    page,
  }) => {
    await open(page, 'zoom');
    const frames = await replayTimeline(page, 1000);
    const scales = frames.map((f) => f.cards[0]!.scale);
    expect(Math.min(...scales)).toBeLessThan(0.8);
    expect(Math.max(...scales)).toBeGreaterThan(1.01);
    expect(Math.max(...scales)).toBeLessThan(1.05);
  });

  test('reduced motion: no scale, a fade instead', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'zoom');
    const [first] = await replayFirstFrame(page);
    expect(first!.scale).toBe(1);
    expect(first!.opacity).toBeLessThan(0.9);
  });
});
