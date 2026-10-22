import { expect, test, type Page } from '../test';

import {
  open,
  replayFirstFrame,
  sampleCards,
  type EntranceSample,
} from './animate-ui-entrance-helpers';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
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

  const opacityAfter20 = (frames: Frame[], card: number) => {
    const start = frames.find(
      (f) => f.cards[card]!.opacity >= 0.2 && f.cards[card]!.opacity < 0.95,
    );
    const later = frames.find((f) => start && f.t >= start.t + 200);
    return later ? later.cards[card]!.opacity : 0;
  };

  test.describe(`${framework.name} fade`, () => {
    test('fades in with a stagger, then settles', async ({ page }) => {
      await open(page, 'fade', framework);
      const [first, , last] = await replayFirstFrame(page);
      expect(first!.opacity).toBeLessThan(0.9);
      expect(last!.opacity).toBeLessThanOrEqual(first!.opacity);
      expect(last!.opacity).toBeLessThan(0.2);
      await expect
        .poll(async () => (await sampleCards(page)).map((c) => c.opacity))
        .toEqual([1, 1, 1]);
    });

    test('fades in on a quick spring: about 250ms', async ({ page }) => {
      await open(page, 'fade', framework);
      const frames = await replayTimeline(page, 900);
      expect(opacityAfter20(frames, 0)).toBeGreaterThan(0.98);
    });

    test('only opacity animates', async ({ page }) => {
      await open(page, 'fade', framework);
      const [first] = await replayFirstFrame(page);
      expect(first!.y).toBe(0);
      expect(first!.scale).toBe(1);
      expect(first!.blur).toBe(0);
    });
  });
}
