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

  test.describe(`${framework.name} effect`, () => {
    test('combines fade, blur, slide and zoom, then settles', async ({
      page,
    }) => {
      await open(page, 'effect', framework);
      const [first] = await replayFirstFrame(page);
      expect(first!.opacity).toBeLessThan(0.9);
      expect(first!.blur).toBeGreaterThan(0);
      expect(first!.y).toBeGreaterThan(0);
      expect(first!.scale).toBeLessThan(1);
      await expect
        .poll(async () => await sampleCards(page))
        .toEqual(Array(3).fill({ opacity: 1, y: 0, scale: 1, blur: 0 }));
    });

    test('one spring for all: from 100px below and half size, with overshoot', async ({
      page,
    }) => {
      await open(page, 'effect', framework);
      const frames = await replayTimeline(page, 1000);
      const card = frames.map((f) => f.cards[0]!);
      const ys = card.map((c) => c.y);
      const scales = card.map((c) => c.scale);
      expect(Math.max(...ys)).toBeGreaterThan(50);
      expect(Math.min(...scales)).toBeLessThan(0.8);
      expect(Math.max(...card.map((c) => c.blur))).toBeGreaterThan(5);
      expect(Math.min(...ys)).toBeLessThan(-2);
      expect(Math.max(...scales)).toBeGreaterThan(1.01);
    });

    test('reduced motion: the fade and the blur remain, nothing moves', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, 'effect', framework);
      const [first] = await replayFirstFrame(page);
      expect(first!.opacity).toBeLessThan(0.9);
      expect(first!.blur).toBeGreaterThan(1);
      expect(first!.y).toBe(0);
      expect(first!.scale).toBe(1);
    });
  });
}
