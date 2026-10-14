import { expect, test, type Locator, type Page } from '../test';

const HIGHLIGHT = '[data-slot="item-highlight"]';
const ITEMS =
  '[role="menu"] [role^="menuitem"], [role="listbox"] [role="option"]';

export type HighlightFrame = {
  t: number;
  copies: {
    top: number;
    left: number;
    width: number;
    opacity: number;
    painted: boolean;
    leaving: boolean;
    shownLeft: number;
    shownRight: number;
  }[];
  composited: boolean;
  lit: string[];
  presence: number;
};

export function recordHighlight(page: Page, duration: number) {
  return page.evaluate(
    ({ selector, items, duration }) =>
      new Promise<HighlightFrame[]>((resolve) => {
        const frames: HighlightFrame[] = [];
        const t0 = performance.now();
        const clipOf = (copy: HTMLElement) => {
          for (
            let el = copy.parentElement?.parentElement;
            el && el !== document.body;
            el = el.parentElement
          ) {
            const style = getComputedStyle(el);
            if (
              style.overflowX !== 'visible' ||
              style.overflowY !== 'visible'
            ) {
              const rect = el.getBoundingClientRect();
              return {
                left: rect.left + parseFloat(style.borderLeftWidth),
                right: rect.right - parseFloat(style.borderRightWidth),
                top: rect.top + parseFloat(style.borderTopWidth),
                bottom: rect.bottom - parseFloat(style.borderBottomWidth),
              };
            }
          }
          return null;
        };
        const shown = (copy: HTMLElement) => {
          const box = copy.getBoundingClientRect();
          const clip = clipOf(copy);
          if (!clip || !box.width || !box.height) return 1;
          const width =
            Math.min(box.right, clip.right) - Math.max(box.left, clip.left);
          const height =
            Math.min(box.bottom, clip.bottom) - Math.max(box.top, clip.top);
          return (
            (Math.max(0, width) * Math.max(0, height)) /
            (box.width * box.height)
          );
        };
        const tick = () => {
          const t = performance.now() - t0;
          const elements = [
            ...document.querySelectorAll<HTMLElement>(selector),
          ];
          frames.push({
            t,
            composited: elements.some((el) =>
              el
                .getAnimations()
                .some(
                  (animation) =>
                    animation.playState === 'running' &&
                    (animation.effect as KeyframeEffect | null)
                      ?.getKeyframes()
                      .some((keyframe) => 'transform' in keyframe),
                ),
            ),
            copies: elements.map((el) => {
              const box = el.getBoundingClientRect();
              const fill = getComputedStyle(el.firstElementChild ?? el);
              return {
                top: box.top,
                left: box.left,
                width: box.width,
                opacity: Number(fill.opacity),
                painted:
                  fill.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                  fill.backgroundImage !== 'none',
                leaving: el.hasAttribute('data-leaving'),
                shownLeft: Math.max(box.left, clipOf(el)?.left ?? -Infinity),
                shownRight: Math.min(box.right, clipOf(el)?.right ?? Infinity),
              };
            }),
            lit: [...document.querySelectorAll<HTMLElement>(items)]
              .filter((el) => {
                const own = getComputedStyle(el);
                return (
                  own.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                  own.backgroundImage !== 'none'
                );
              })
              .map((el) => el.textContent?.trim() ?? ''),
            presence: elements.reduce(
              (sum, el) =>
                sum + Number(getComputedStyle(el).opacity) * shown(el),
              0,
            ),
          });
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { selector: HIGHLIGHT, items: ITEMS, duration },
  );
}

export function ownBackground(item: Locator) {
  return item.evaluate((el) => getComputedStyle(el).backgroundColor);
}

export async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('No box');
  return box;
}

export async function pointAt(page: Page, locator: Locator, steps = 1) {
  const box = await boxOf(locator);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps,
  });
}

type MenuHighlightCase = {
  path: string;
  open: (page: Page) => Promise<void>;
  first: (page: Page) => Locator;
  second: (page: Page) => Locator;
  keyboardNext?: string;
  highlightedOnOpen?: boolean;
  submenuTrigger?: (page: Page) => Locator;
  submenuItem?: (page: Page) => Locator;
};

const allPainted = (frames: HighlightFrame[]) =>
  frames.every((f) => f.copies.every((copy) => copy.painted));

export function describeMenuHighlight(name: string, c: MenuHighlightCase) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle', timeout: 150_000 });
      await page.mouse.move(1, 1);
      await c.open(page);
    });

    test('fades in behind the first highlighted item', async ({ page }) => {
      test.skip(Boolean(c.highlightedOnOpen), 'Highlighted as it opens');
      const first = c.first(page);
      const frames = recordHighlight(page, 700);
      await pointAt(page, first);
      const recorded = await frames;
      const shown = recorded.filter((f) => f.copies.length > 0);
      expect(shown.length).toBeGreaterThan(0);
      expect(shown[0]!.copies[0]!.opacity).toBeLessThan(0.5);
      expect(shown.at(-1)!.copies[0]!.opacity).toBe(1);
      const box = await boxOf(first);
      expect(Math.abs(shown.at(-1)!.copies[0]!.top - box.y)).toBeLessThan(1);
      expect(await ownBackground(first)).toBe('rgba(0, 0, 0, 0)');
    });

    test("its fade in is gentle, on the color's curve", async ({ page }) => {
      test.skip(Boolean(c.highlightedOnOpen), 'Highlighted as it opens');
      const sampled = page.evaluate(
        () =>
          new Promise<{ fade: number; opacity: number }[]>((resolve) => {
            const seen: { fade: number; opacity: number }[] = [];
            const t0 = performance.now();
            const tick = () => {
              for (const el of document.querySelectorAll<HTMLElement>(
                '[data-slot="item-highlight"]',
              )) {
                const fade = el
                  .getAnimations()
                  .find((a) =>
                    (a.effect as KeyframeEffect | null)
                      ?.getKeyframes()
                      .some((k) => 'opacity' in k),
                  );
                if (fade?.playState === 'running')
                  seen.push({
                    fade: Number(fade.currentTime),
                    opacity: Number(getComputedStyle(el).opacity),
                  });
              }
              if (performance.now() - t0 < 500) requestAnimationFrame(tick);
              else resolve(seen);
            };
            requestAnimationFrame(tick);
          }),
      );
      await pointAt(page, c.first(page));
      const seen = await sampled;
      expect(seen.length).toBeGreaterThan(2);
      for (const { fade, opacity } of seen) {
        if (fade > 10 && fade <= 40)
          expect(opacity, `${fade}ms`).toBeLessThan(0.5);
        if (fade > 10 && fade <= 80)
          expect(opacity, `${fade}ms`).toBeLessThan(0.75);
      }
    });

    test('glides to the next item on a spring, handed over: one opaque copy', async ({
      page,
    }) => {
      const first = c.first(page);
      const second = c.second(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const from = (await boxOf(first)).y;
      const to = (await boxOf(second)).y;
      const frames = recordHighlight(page, 900);
      await pointAt(page, second);
      const recorded = await frames;
      const tops = recorded
        .map((f) => f.copies.at(-1)?.top)
        .filter((top): top is number => top !== undefined);
      const between = tops.filter(
        (top) => top > Math.min(from, to) + 1 && top < Math.max(from, to) - 1,
      );
      expect(between.length).toBeGreaterThan(3);
      expect(Math.abs(tops.at(-1)! - to)).toBeLessThan(1);
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      expect(recorded.some((f) => f.composited)).toBe(true);
      expect(
        recorded.every((f) => f.copies.every((copy) => copy.opacity > 0.99)),
      ).toBe(true);
      expect(allPainted(recorded)).toBe(true);
    });

    test('a quick sweep back and forth leaves no trail', async ({ page }) => {
      const first = c.first(page);
      const second = c.second(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const to = (await boxOf(second)).y;
      const frames = recordHighlight(page, 1400);
      for (const item of [second, first, second, first, second]) {
        await pointAt(page, item);
        await page.waitForTimeout(30);
      }
      const recorded = await frames;
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      expect(
        recorded.every((f) => f.copies.every((copy) => copy.opacity > 0.99)),
      ).toBe(true);
      expect(allPainted(recorded)).toBe(true);
      expect(Math.abs(recorded.at(-1)!.copies[0]!.top - to)).toBeLessThan(1);
    });

    test('a fast sweep on a busy main thread: no item lights up on its own', async ({
      page,
    }) => {
      const first = c.first(page);
      const list = first.locator(
        'xpath=ancestor::*[@role="menu" or @role="listbox"][1]',
      );
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const start = await boxOf(first);
      const bounds = await boxOf(list);
      const x = start.x + start.width / 2;
      const top = start.y + start.height / 2;
      const bottom = Math.min(
        bounds.y + bounds.height - 6,
        top + 8 * start.height,
      );
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const frames = recordHighlight(page, 1600);
      for (const y of [bottom, top, bottom, top])
        await page.mouse.move(x, y, { steps: 10 });
      const recorded = await frames;
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      expect(recorded.flatMap((f) => f.lit)).toEqual([]);
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      expect(allPainted(recorded)).toBe(true);
    });

    if (c.submenuTrigger) {
      test('reached quickly, a submenu trigger wears it all the way', async ({
        page,
      }) => {
        const first = c.first(page);
        const trigger = c.submenuTrigger!(page);
        await pointAt(page, first);
        await page.waitForTimeout(700);
        const frames = recordHighlight(page, 700);
        await pointAt(page, trigger, 4);
        const recorded = await frames;
        expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
        expect(allPainted(recorded)).toBe(true);
        const box = await boxOf(trigger);
        expect(Math.abs(recorded.at(-1)!.copies[0]!.top - box.y)).toBeLessThan(
          1,
        );
      });
    }

    if (c.submenuTrigger && c.submenuItem) {
      test('into its submenu and out, the highlight crosses as one', async ({
        page,
      }) => {
        const trigger = c.submenuTrigger!(page);
        const item = c.submenuItem!(page);
        await pointAt(page, trigger);
        await expect(item).toBeVisible();
        await page.waitForTimeout(500);

        let frames = recordHighlight(page, 700);
        await pointAt(page, item, 6);
        let recorded = await frames;
        const crossing = recorded.filter((f) => f.copies.length === 2);
        expect(crossing.length).toBeGreaterThan(3);
        for (const f of crossing) {
          const [a, b] = f.copies;
          expect(a!.leaving !== b!.leaving).toBe(true);
          expect(Math.abs(a!.left - b!.left)).toBeLessThan(2);
          expect(Math.abs(a!.top - b!.top)).toBeLessThan(2);
          expect(Math.abs(a!.width - b!.width)).toBeLessThan(2);
        }
        for (const f of crossing) {
          const parts = f.copies
            .filter((copy) => copy.shownRight - copy.shownLeft > 1)
            .sort((a, b) => a.shownLeft - b.shownLeft);
          if (parts.length === 2)
            expect(parts[1]!.shownLeft - parts[0]!.shownRight).toBeLessThan(1);
        }
        const entering = (f: HighlightFrame) =>
          f.copies.find((copy) => !copy.leaving)!;
        expect(entering(crossing[0]!).opacity).toBeLessThan(0.3);
        expect(Math.min(...recorded.map((f) => f.presence))).toBeGreaterThan(
          0.6,
        );
        let last = recorded.at(-1)!;
        expect(last.copies).toHaveLength(1);
        expect(last.copies[0]!.opacity).toBe(1);
        expect(
          Math.abs(last.copies[0]!.top - (await boxOf(item)).y),
        ).toBeLessThan(1);

        const target = c.first(page);
        frames = recordHighlight(page, 700);
        await pointAt(page, target, 6);
        recorded = await frames;
        expect(Math.min(...recorded.map((f) => f.presence))).toBeGreaterThan(
          0.4,
        );
        last = recorded.at(-1)!;
        expect(last.copies).toHaveLength(1);
        expect(
          Math.abs(last.copies[0]!.top - (await boxOf(target)).y),
        ).toBeLessThan(1);
      });
    }

    if (c.keyboardNext) {
      test('the keyboard moves it the same way', async ({ page }) => {
        const first = c.first(page);
        const second = c.second(page);
        await pointAt(page, first);
        await page.waitForTimeout(700);
        const from = (await boxOf(first)).y;
        const to = (await boxOf(second)).y;
        const frames = recordHighlight(page, 700);
        await page.keyboard.press(c.keyboardNext!);
        const tops = (await frames)
          .map((f) => f.copies.at(-1)?.top)
          .filter((top): top is number => top !== undefined);
        expect(
          tops.filter(
            (top) =>
              top > Math.min(from, to) + 1 && top < Math.max(from, to) - 1,
          ).length,
        ).toBeGreaterThan(3);
        expect(Math.abs(tops.at(-1)! - to)).toBeLessThan(1);
      });
    }

    test('stays on the last item when the pointer leaves', async ({ page }) => {
      const first = c.first(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      await page.mouse.move(2, 2, { steps: 4 });
      await page.waitForTimeout(500);
      const copies = page.locator(HIGHLIGHT);
      await expect(copies).toHaveCount(1);
      const box = await boxOf(first);
      expect(Math.abs((await boxOf(copies.first())).y - box.y)).toBeLessThan(1);
    });
  });
}
